#!/usr/bin/env bash
# Genera un dump comprimido de la base de datos MySQL de la aplicacion.
#
# Variables de entorno requeridas: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
# Variable opcional: DB_PORT (default 3306)
#
# Uso: ./backup_db.sh [directorio_de_salida]
set -euo pipefail

: "${DB_HOST:?Falta DB_HOST}"
: "${DB_PORT:=3306}"
: "${DB_NAME:?Falta DB_NAME}"
: "${DB_USER:?Falta DB_USER}"
: "${DB_PASSWORD:?Falta DB_PASSWORD}"

OUT_DIR="${1:-./backups}"
mkdir -p "$OUT_DIR"

TIMESTAMP="$(date -u +%Y%m%d_%H%M%S)"
OUT_PATH="${OUT_DIR}/gym_backup_${TIMESTAMP}.sql.gz"

echo "Generando dump de '${DB_NAME}' en ${DB_HOST}:${DB_PORT} ..."
mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --set-gtid-purged=OFF \
  "$DB_NAME" | gzip -9 > "$OUT_PATH"

echo "Backup generado: ${OUT_PATH}"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "backup_path=${OUT_PATH}" >> "$GITHUB_OUTPUT"
fi
