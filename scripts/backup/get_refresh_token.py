#!/usr/bin/env python3
"""
Script de configuracion, de un solo uso: obtiene un refresh token de OAuth
para que drive_sync.py pueda subir backups a TU Google Drive personal
(no requiere Google Workspace).

Antes de correrlo:
  1. Ve a https://console.cloud.google.com/ , crea (o reusa) un proyecto.
  2. Habilita la "Google Drive API" (menu "APIs y servicios" > "Biblioteca").
  3. Ve a "APIs y servicios" > "Pantalla de consentimiento OAuth", tipo
     "Externo", completa lo minimo (nombre de la app, tu correo) y agregate
     a vos mismo como "usuario de prueba".
  4. Ve a "APIs y servicios" > "Credenciales" > "Crear credenciales" >
     "ID de cliente de OAuth" > tipo de aplicacion "Aplicacion de escritorio".
  5. Descarga el JSON de esas credenciales y guardalo en esta carpeta como
     "client_secret.json" (NO lo subas a git, ya esta en .gitignore).

Uso:
  pip install google-auth-oauthlib
  python scripts/backup/get_refresh_token.py

Se abrira el navegador para que inicies sesion con tu cuenta de Google y
autorices el acceso (permiso "Ver y administrar solo los archivos de Drive
que crees con esta app"). Al terminar, el script imprime el CLIENT_ID, el
CLIENT_SECRET y el REFRESH_TOKEN que hay que guardar como secrets en GitHub.
"""
import json
import os
import sys

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/drive.file"]
CLIENT_SECRET_PATH = os.path.join(os.path.dirname(__file__), "client_secret.json")


def main():
    if not os.path.isfile(CLIENT_SECRET_PATH):
        sys.exit(
            f"No se encontro {CLIENT_SECRET_PATH}.\n"
            "Descarga el JSON del OAuth Client (tipo 'Aplicacion de escritorio') "
            "desde Google Cloud Console y guardalo con ese nombre en esta carpeta."
        )

    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_PATH, SCOPES)
    creds = flow.run_local_server(port=0)

    with open(CLIENT_SECRET_PATH, "r", encoding="utf-8") as f:
        client_info = json.load(f)
    client_id = client_info["installed"]["client_id"]
    client_secret = client_info["installed"]["client_secret"]

    print("\n¡Listo! Guarda estos 3 valores como secrets en GitHub:\n")
    print(f"GOOGLE_OAUTH_CLIENT_ID={client_id}")
    print(f"GOOGLE_OAUTH_CLIENT_SECRET={client_secret}")
    print(f"GOOGLE_OAUTH_REFRESH_TOKEN={creds.refresh_token}")


if __name__ == "__main__":
    main()
