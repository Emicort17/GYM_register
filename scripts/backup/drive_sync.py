#!/usr/bin/env python3
"""
Sube, lista y descarga backups de la base de datos en una carpeta de Google
Drive de una cuenta personal, autenticado como esa misma cuenta via OAuth
(refresh token), y aplica retencion (borra los backups mas viejos cuando hay
mas de RETENTION_COUNT).

Nota: no se usa una cuenta de servicio (Service Account) porque estas no
tienen cuota de almacenamiento propia en Drive fuera de Google Workspace
(error tipico: "Service Accounts do not have storage quota"). En su lugar,
la app se autentica como el usuario dueno del Drive; el refresh token se
genera una sola vez con get_refresh_token.py (ver README de esta carpeta).

Variables de entorno requeridas:
  GOOGLE_OAUTH_CLIENT_ID       Client ID de la app OAuth (tipo "Desktop app")
  GOOGLE_OAUTH_CLIENT_SECRET   Client Secret de esa misma app OAuth
  GOOGLE_OAUTH_REFRESH_TOKEN   refresh token generado con get_refresh_token.py
  GDRIVE_FOLDER_ID             ID de la carpeta de Drive donde viven los backups

Variable opcional:
  RETENTION_COUNT     cuantos backups conservar (default 14). Solo aplica en 'upload'.

Uso:
  python drive_sync.py upload <archivo>
  python drive_sync.py list
  python drive_sync.py download [--name NOMBRE] [--out RUTA]
"""
import argparse
import io
import os
import sys

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload

SCOPES = ["https://www.googleapis.com/auth/drive.file"]
BACKUP_PREFIX = "gym_backup_"
TOKEN_URI = "https://oauth2.googleapis.com/token"


def get_service():
    client_id = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
    refresh_token = os.environ.get("GOOGLE_OAUTH_REFRESH_TOKEN")
    if not client_id or not client_secret or not refresh_token:
        sys.exit(
            "Faltan variables de entorno GOOGLE_OAUTH_CLIENT_ID / "
            "GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REFRESH_TOKEN"
        )
    creds = Credentials(
        None,
        refresh_token=refresh_token,
        client_id=client_id,
        client_secret=client_secret,
        token_uri=TOKEN_URI,
        scopes=SCOPES,
    )
    return build("drive", "v3", credentials=creds)


def get_folder_id():
    folder_id = os.environ.get("GDRIVE_FOLDER_ID")
    if not folder_id:
        sys.exit("Falta la variable de entorno GDRIVE_FOLDER_ID")
    return folder_id


def list_backups(service, folder_id):
    files = []
    page_token = None
    while True:
        resp = service.files().list(
            q=f"'{folder_id}' in parents and trashed = false and name contains '{BACKUP_PREFIX}'",
            spaces="drive",
            fields="nextPageToken, files(id, name, createdTime, size)",
            orderBy="createdTime desc",
            pageToken=page_token,
        ).execute()
        files.extend(resp.get("files", []))
        page_token = resp.get("nextPageToken")
        if not page_token:
            break
    return files


def cmd_upload(args):
    service = get_service()
    folder_id = get_folder_id()
    filepath = args.filepath
    if not os.path.isfile(filepath):
        sys.exit(f"No existe el archivo: {filepath}")

    filename = os.path.basename(filepath)
    metadata = {"name": filename, "parents": [folder_id]}
    media = MediaFileUpload(filepath, mimetype="application/gzip", resumable=True)
    uploaded = service.files().create(body=metadata, media_body=media, fields="id, name").execute()
    print(f"Subido: {uploaded['name']} (id={uploaded['id']})")

    retention = int(os.environ.get("RETENTION_COUNT", "14"))
    backups = list_backups(service, folder_id)
    if len(backups) > retention:
        for old in backups[retention:]:
            service.files().delete(fileId=old["id"]).execute()
            print(f"Eliminado backup viejo: {old['name']}")


def cmd_list(args):
    service = get_service()
    folder_id = get_folder_id()
    backups = list_backups(service, folder_id)
    if not backups:
        print("No hay backups en la carpeta.")
        return
    for b in backups:
        size_mb = int(b.get("size", 0)) / 1024 / 1024
        print(f"{b['createdTime']}  {b['name']}  ({size_mb:.2f} MB)")


def _download(service, file_id, out_path):
    request = service.files().get_media(fileId=file_id)
    fh = io.FileIO(out_path, "wb")
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    fh.close()


def cmd_download(args):
    service = get_service()
    folder_id = get_folder_id()
    backups = list_backups(service, folder_id)
    if not backups:
        sys.exit("No hay backups en la carpeta.")

    if args.name:
        matches = [b for b in backups if b["name"] == args.name]
        if not matches:
            sys.exit(f"No se encontro un backup llamado {args.name}")
        target = matches[0]
    else:
        target = backups[0]  # el mas reciente

    out_path = args.out or target["name"]
    _download(service, target["id"], out_path)
    print(f"Descargado: {target['name']} -> {out_path}")


def main():
    parser = argparse.ArgumentParser(description="Backups de la DB en Google Drive")
    sub = parser.add_subparsers(dest="command", required=True)

    p_upload = sub.add_parser("upload", help="Sube un archivo y aplica retencion")
    p_upload.add_argument("filepath")
    p_upload.set_defaults(func=cmd_upload)

    p_list = sub.add_parser("list", help="Lista los backups disponibles, del mas reciente al mas viejo")
    p_list.set_defaults(func=cmd_list)

    p_download = sub.add_parser("download", help="Descarga un backup (el mas reciente por defecto)")
    p_download.add_argument("--name", help="Nombre exacto del archivo en Drive")
    p_download.add_argument("--out", help="Ruta de salida local")
    p_download.set_defaults(func=cmd_download)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
