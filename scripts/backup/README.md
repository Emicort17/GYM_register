# Backup de la base de datos a Google Drive

Cada dia a las 08:00 UTC (02:00 hora de Mexico), un workflow de GitHub Actions
([`.github/workflows/db-backup.yml`](../../.github/workflows/db-backup.yml)) genera un
dump comprimido de la base de datos MySQL (la que usa el backend en Railway) y lo sube
a una carpeta de Google Drive. Se conservan los 14 backups mas recientes; los mas viejos
se borran automaticamente de Drive.

## Configuracion (una sola vez)

> Nota: la primera version de este backup usaba una "cuenta de servicio" de Google,
> pero estas no tienen cuota de almacenamiento propia en Drive fuera de Google
> Workspace (error `Service Accounts do not have storage quota`). Por eso el script
> se autentica como tu propia cuenta de Google via OAuth: los backups se guardan en
> tu Drive normal, con tu cuota normal.

### 1. Crear las credenciales OAuth en Google Cloud

1. Entra a [Google Cloud Console](https://console.cloud.google.com/) con tu cuenta de
   Google (la misma donde esta el Drive donde queres guardar los backups) y crea un
   proyecto (o usa uno existente).
2. Habilita la **Google Drive API** (menu "APIs y servicios" > "Biblioteca").
3. Ve a "APIs y servicios" > "Pantalla de consentimiento OAuth": tipo **Externo**,
   completa el nombre de la app y tu correo, y agregate a vos mismo en
   "Usuarios de prueba" (mientras la app este en modo prueba, solo esos usuarios
   pueden autorizarla, lo cual esta bien para este uso).
4. Ve a "APIs y servicios" > "Credenciales" > "Crear credenciales" > "ID de cliente
   de OAuth" > tipo de aplicacion **Aplicacion de escritorio**. Dale cualquier nombre
   y creala.
5. Descarga el JSON de esas credenciales, guardalo como
   `scripts/backup/client_secret.json` (ya esta en `.gitignore`, no se sube a git).

### 2. Generar el refresh token (una sola vez, desde tu compu)

```bash
pip install -r scripts/backup/requirements.txt
python scripts/backup/get_refresh_token.py
```

Se abre el navegador: inicia sesion con tu cuenta de Google y autoriza el permiso
("Ver y administrar solo los archivos de Drive que crees con esta app"). Al terminar,
la terminal imprime tres valores (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`,
`GOOGLE_OAUTH_REFRESH_TOKEN`) que vas a usar en el siguiente paso.

### 3. Crear la carpeta de Drive

En tu Google Drive, crea una carpeta, por ejemplo `GYM Backups`, y copia el ID desde
la URL: `https://drive.google.com/drive/folders/ESTE_ES_EL_ID`. No hace falta
compartirla con nadie, ya que el script va a entrar con tu propia cuenta.

### 4. Agregar los secrets en GitHub

En el repo [`Emicort17/GYM_register`](https://github.com/Emicort17/GYM_register) ve a
**Settings > Secrets and variables > Actions > New repository secret** y agrega:

| Secret | Valor |
|---|---|
| `DB_HOST` | host publico de la DB en Railway (pestana "Connect" de tu servicio MySQL) |
| `DB_PORT` | puerto publico de la DB en Railway |
| `DB_NAME` | nombre de la base de datos (`railway` en el plugin de MySQL de Railway) |
| `DB_USER` | usuario de MySQL (Railway suele usar `root`) |
| `DB_PASSWORD` | password de MySQL |
| `GDRIVE_FOLDER_ID` | el ID de la carpeta de Drive (paso 3) |
| `GOOGLE_OAUTH_CLIENT_ID` | impreso por `get_refresh_token.py` (paso 2) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | impreso por `get_refresh_token.py` (paso 2) |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | impreso por `get_refresh_token.py` (paso 2) |

Los datos de conexion de Railway estan en el dashboard del servicio de MySQL, pestana
**"Connect"** o **"Variables"** (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`,
`MYSQLPASSWORD`).

### 5. Probar el workflow

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
export GOOGLE_OAUTH_CLIENT_ID=...
export GOOGLE_OAUTH_CLIENT_SECRET=...
export GOOGLE_OAUTH_REFRESH_TOKEN=...
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
