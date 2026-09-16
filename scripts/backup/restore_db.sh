#!/usr/bin/env bash
# Restaura un dump (.sql o .sql.gz) en la base de datos MySQL indicada por las
# variables de entorno. Pide confirmacion antes de sobrescribir datos.
#
# Variables de entorno requeridas: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
# Variable opcional: DB_PORT (default 3306)
#
# Uso: ./restore_db.sh archivo.sql.gz
set -euo pipefail

: "${DB_HOST:?Falta DB_HOST}"
: "${DB_PORT:=3306}"
: "${DB_NAME:?Falta DB_NAME}"
: "${DB_USER:?Falta DB_USER}"
: "${DB_PASSWORD:?Falta DB_PASSWORD}"

FILE="${1:?Uso: restore_db.sh <archivo.sql|archivo.sql.gz>}"

if [[ ! -f "$FILE" ]]; then
  echo "No existe el archivo: $FILE" >&2
  exit 1
fi

echo "Vas a restaurar '${FILE}' sobre la base de datos '${DB_NAME}' en ${DB_HOST}:${DB_PORT}."
read -r -p "Esto SOBRESCRIBE los datos existentes. Escribi 'si' para continuar: " CONFIRM
if [[ "$CONFIRM" != "si" ]]; then
  echo "Cancelado."
  exit 1
fi

if [[ "$FILE" == *.gz ]]; then
  gunzip -c "$FILE"
else
  cat "$FILE"
fi | mysql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASSWORD" \
  "$DB_NAME"

echo "Restauracion completa."
