# Gestion_persona

API REST desarrollada con Spring Boot para la gestión de personas y el control de sus pagos (membresías/cuotas), con autenticación basada en JWT, control de acceso por roles y una bitácora de auditoría de solo lectura.

## Descripción general

La aplicación permite administrar un padrón de personas y llevar el registro de los pagos que cada una realiza. A partir de la fecha del último pago, el sistema calcula automáticamente un estado tipo semáforo (VERDE, AMARILLO, ROJO) que indica qué tan próximo está el vencimiento.

El acceso a la API está protegido con Spring Security y JWT: los usuarios inician sesión con correo y contraseña, reciben un token y lo usan para autenticar el resto de las peticiones. Cada usuario tiene un rol asignado (por ejemplo, `ADMIN_ROLE`) que determina qué endpoints puede consumir.

Adicionalmente, las operaciones de creación, actualización y eliminación sobre personas, usuarios, roles y pagos quedan registradas automáticamente en una bitácora, para que un administrador pueda auditar los movimientos realizados por los empleados dentro del sistema.

## Tecnologías

- Java 21
- Spring Boot 3.4.3 (Web, Data JPA, Security)
- MySQL 8
- JWT (jjwt)
- Lombok
- Maven
- Docker / Docker Compose

## Modelo de datos

- **persona**: datos de la persona registrada (nombre, correo, teléfono, edad, fecha de registro).
- **registro**: pagos asociados a una persona. Cada pago tiene una fecha de pago, una fecha de vencimiento (un mes después) y una fecha de creación, usada para calcular el estado (semáforo) de la persona.
- **role**: roles del sistema (por ejemplo, `ADMIN_ROLE`), asignados a los usuarios.
- **usuario**: cuentas con las que se inicia sesión en el sistema (correo, contraseña, estado, bloqueo, rol).
- **bitacora**: historial de movimientos (alta, actualización, baja) realizados por los usuarios sobre las demás entidades. Es de solo lectura desde la API; se genera automáticamente en el backend.

## Seguridad y roles

- Autenticación mediante JWT (`Authorization: Bearer <token>`), obtenido al iniciar sesión.
- `/api/auth/**` es público, el resto de los endpoints requiere autenticación.
- `/api/personas/**` y las lecturas de `/api/bitacora/**` requieren el rol `ADMIN_ROLE`.

## Endpoints principales

### Autenticación

| Método | Endpoint | Descripción |
| --- | --- | --- |
| POST | `/api/auth/signin` | Inicia sesión y devuelve el token JWT |

### Personas

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/personas` | Lista todas las personas con su estado de pago |
| GET | `/api/personas/{id}` | Obtiene una persona por ID |
| POST | `/api/personas/crear` | Registra una nueva persona |
| PUT | `/api/personas/modificar/{id}` | Actualiza una persona existente |
| DELETE | `/api/personas/borrar/{id}` | Elimina una persona |

### Pagos (registro)

| Método | Endpoint | Descripción |
| --- | --- | --- |
| POST | `/api/personas/{personaId}/pagos` | Registra un nuevo pago para una persona |
| GET | `/api/personas/{personaId}/pagos` | Historial de pagos de una persona |

### Usuarios

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/usuarios` | Lista todos los usuarios |
| GET | `/api/usuarios/{id}` | Obtiene un usuario por ID |
| POST | `/api/usuarios/crear/{roleName}` | Crea un usuario con el rol indicado |
| PUT | `/api/usuarios/{id}` | Actualiza un usuario |
| DELETE | `/api/usuarios/{id}` | Elimina un usuario |

### Roles

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/roles` | Lista todos los roles |
| GET | `/api/roles/{id}` | Obtiene un rol por ID |
| POST | `/api/roles` | Crea un rol |
| PUT | `/api/roles/{id}` | Actualiza un rol |
| DELETE | `/api/roles/{id}` | Elimina un rol |

### Bitácora (solo lectura)

Pensada para que un administrador audite los movimientos realizados por los empleados. No expone operaciones de escritura: los registros se generan automáticamente cuando se crea, actualiza o elimina una persona, un usuario, un rol o un pago.

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/bitacora` | Historial completo de movimientos, del más reciente al más antiguo |
| GET | `/api/bitacora/usuario/{idUsuario}` | Historial de movimientos filtrado por un usuario en particular |

## Configuración

`src/main/resources/application.properties` contiene credenciales de base de datos y la llave JWT, por lo que **no se versiona** (está en `.gitignore`). En su lugar se incluye una plantilla sin datos sensibles: `src/main/resources/application.properties.example`.

Antes de ejecutar el proyecto, copia la plantilla y ajusta tus propios valores:

```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

```properties
spring.application.name=Gestion_persona
server.port=${SERVER_PORT:8000}

spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:personas_gestion}?useSSL=false&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASSWORD:}

spring.jpa.hibernate.ddl-auto=update

jwt.secret=${JWT_SECRET:CAMBIA_ESTA_LLAVE_POR_UNA_BASE64_DE_32_BYTES_MINIMO}
jwt.expiration=${JWT_EXPIRATION:604800}
```

Cada valor puede sobreescribirse con una variable de entorno del mismo nombre (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION`, `SERVER_PORT`), que es lo que usa `docker-compose.yml` para apuntar al contenedor de MySQL. Genera tu propio `jwt.secret` (por ejemplo con `openssl rand -base64 32`) antes de desplegar en un entorno real.

Al arrancar, la aplicación crea automáticamente el rol `ADMIN_ROLE` y un usuario administrador (`admin@example.com` / `admin`) si aún no existen.

## Ejecución local

Requisitos: JDK 21, MySQL 8 y Maven (o usar el wrapper incluido).

```bash
./mvnw spring-boot:run
```

La API quedará disponible en `http://localhost:8080`.

## Ejecución con Docker

```bash
docker-compose up --build
```

Esto levanta un contenedor de MySQL y la aplicación, dejando la API disponible en `http://localhost:8000`.

## Pruebas

```bash
./mvnw test
```
