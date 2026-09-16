# Backup de la base de datos a Google Drive

Cada dia a las 08:00 UTC (02:00 hora de Mexico), un workflow de GitHub Actions
([`.github/workflows/db-backup.yml`](../../.github/workflows/db-backup.yml)) genera un
dump comprimido de la base de datos MySQL (la que usa el backend en Railway) y lo sube
a una carpeta de Google Drive. Se conservan los 14 backups mas recientes; los mas viejos
se borran automaticamente de Drive.

## Configuracion (una sola vez)

### 1. Crear la cuenta de servicio de Google

1. Entra a [Google Cloud Console](https://console.cloud.google.com/) con tu cuenta de Google
   (la misma donde esta el Drive donde queres guardar los backups) y crea un proyecto
   (o usa uno existente).
2. Habilita la **Google Drive API** para ese proyecto (menu "APIs y servicios" > "Biblioteca").
3. Ve a "APIs y servicios" > "Credenciales" > "Crear credenciales" > "Cuenta de servicio".
   Dale cualquier nombre (ej. `gym-backups`) y creala. No necesita roles adicionales.
4. Dentro de la cuenta de servicio creada, ve a la pestana "Claves" > "Agregar clave" >
   "Crear clave nueva" > tipo **JSON**. Se descarga un archivo `.json` a tu compu:
   **guardalo, es la unica vez que lo podes descargar**.
5. Copia el campo `client_email` del JSON (algo como
   `gym-backups@tu-proyecto.iam.gserviceaccount.com`).

### 2. Crear y compartir la carpeta de Drive

1. En tu Google Drive, crea una carpeta, por ejemplo `GYM Backups`.
2. Click derecho > "Compartir" > agrega el `client_email` de la cuenta de servicio
   (paso anterior) con permiso de **Editor**.
3. Abre la carpeta y copia el ID desde la URL:
   `https://drive.google.com/drive/folders/ESTE_ES_EL_ID`

### 3. Agregar los secrets en GitHub

En el repo [`Emicort17/GYM_register`](https://github.com/Emicort17/GYM_register) ve a
**Settings > Secrets and variables > Actions > New repository secret** y agrega:

| Secret | Valor |
|---|---|
| `DB_HOST` | host publico de la DB en Railway (pestana "Connect" de tu servicio MySQL) |
| `DB_PORT` | puerto publico de la DB en Railway |
| `DB_NAME` | nombre de la base de datos (ej. `personas_gestion`) |
| `DB_USER` | usuario de MySQL (Railway suele usar `root`) |
| `DB_PASSWORD` | password de MySQL |
| `GDRIVE_FOLDER_ID` | el ID de la carpeta de Drive (paso 2.3) |
| `GDRIVE_SA_KEY_JSON` | el contenido completo del archivo `.json` de la cuenta de servicio (pegalo tal cual, entre `{` y `}`) |

Los datos de conexion de Railway estan en el dashboard del servicio de MySQL, pestana
**"Connect"** o **"Variables"** (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`,
`MYSQLPASSWORD`).

### 4. Probar el workflow

En GitHub, ve a la pestana **Actions > Backup de la base de datos a Google Drive >
Run workflow** para dispararlo manualmente (no hace falta esperar al cron) y revisa los
logs. Si sale bien, deberia aparecer un archivo `gym_backup_<fecha>.sql.gz` en la carpeta
de Drive.

## Uso local (backup manual, restaurar, descargar)

Necesitas tener instalado `mysql-client` (para `mysqldump`/`mysql`) y, para los comandos
de Drive, Python 3 con las dependencias de `requirements.txt`:

```bash
pip install -r scripts/backup/requirements.txt
```

### Hacer un backup manual desde tu compu

```bash
export DB_HOST=... DB_PORT=... DB_NAME=... DB_USER=... DB_PASSWORD=...
./scripts/backup/backup_db.sh ./backups
```

Esto crea `./backups/gym_backup_<fecha>.sql.gz`.

### Ver los backups que hay en Drive

```bash
export GDRIVE_SA_KEY_JSON="$(cat ruta/a/tu-clave.json)"
export GDRIVE_FOLDER_ID=...
python scripts/backup/drive_sync.py list
```

### Descargar un backup a tu compu

```bash
# el mas reciente
python scripts/backup/drive_sync.py download --out ./backups/latest.sql.gz

# uno especifico por nombre
python scripts/backup/drive_sync.py download --name gym_backup_20260901_080000.sql.gz --out ./backups/ese_dia.sql.gz
```

Tambien podes bajarlo directamente desde la interfaz web de Google Drive, sin usar el
script.

### Restaurar un backup

**Cuidado:** esto sobrescribe los datos existentes en la base de destino.

```bash
export DB_HOST=... DB_PORT=... DB_NAME=... DB_USER=... DB_PASSWORD=...
./scripts/backup/restore_db.sh ./backups/gym_backup_20260901_080000.sql.gz
```

Podes apuntar las variables `DB_*` a Railway (para restaurar en produccion) o a tu MySQL
local de `docker-compose.yml` (para restaurar una copia en tu compu y revisarla sin
tocar produccion).
