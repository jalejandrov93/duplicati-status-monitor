# GitHub Actions - CI/CD Pipeline

Este documento describe el flujo de CI/CD configurado para el proyecto Duplicati Backup Monitor.

## Workflow: Build and Publish Docker Image

### Archivo

`.github/workflows/docker-build-publish.yml`

### Descripción

Este workflow automatiza la construcción y publicación de la imagen Docker en GitHub Container Registry (GHCR) y el despliegue opcional en un servidor remoto.

## Triggers

El workflow se ejecuta automáticamente cuando:

- Se hace push a la rama `master`
- Se hace push a la rama `main`

## Jobs

### 1. build-and-push

Construye y publica la imagen Docker en GHCR.

**Pasos:**

1. **Checkout repository**: Descarga el código del repositorio
2. **Set up Docker Buildx**: Configura Docker Buildx para builds avanzados
3. **Log in to GHCR**: Autentica con GitHub Container Registry usando el token automático
4. **Extract metadata**: Genera tags y labels para la imagen Docker
5. **Build and push**: Construye y publica la imagen con cache optimizado

**Tags generados:**

- `latest`: Tag principal para la última versión
- `{branch}-{sha}`: Tag con el nombre de la rama y el SHA del commit
- `{branch}`: Tag con el nombre de la rama
- Versiones semánticas (si se usan tags)

**Imagen publicada:**

```
ghcr.io/{usuario}/backup-duplicati:latest
ghcr.io/{usuario}/backup-duplicati:{branch}-{sha}
```

### 2. deploy

Despliega la aplicación en un servidor remoto vía SSH (opcional).

**Requisitos:**

- Solo se ejecuta si el job `build-and-push` tiene éxito
- Solo se ejecuta en las ramas `master` o `main`

**Pasos:**

1. Conecta al servidor vía SSH
2. Navega al directorio del proyecto
3. Descarga las últimas imágenes
4. Inicia los servicios con Docker Compose
5. Limpia imágenes no utilizadas
6. Muestra el estado de los servicios
7. Ejecuta un health check

## Secretos Requeridos

### Para despliegue automático (opcional)

Si deseas habilitar el despliegue automático, configura los siguientes secretos en GitHub:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Agrega los siguientes secretos:

| Secreto           | Descripción                                       | Ejemplo                                |
| ----------------- | ------------------------------------------------- | -------------------------------------- |
| `SERVER_HOST`     | Dirección IP o dominio del servidor               | `192.168.1.100` o `server.example.com` |
| `SERVER_USER`     | Usuario SSH del servidor                          | `ubuntu`, `root`, etc.                 |
| `SSH_PRIVATE_KEY` | Clave privada SSH (todo el contenido del archivo) | Contenido de `~/.ssh/id_rsa`           |
| `SERVER_PORT`     | Puerto SSH (opcional, por defecto 22)             | `22`                                   |

### Cómo generar y obtener la clave SSH

Si no tienes una clave SSH:

```bash
# En tu máquina local
ssh-keygen -t ed25519 -C "github-actions@backup-duplicati"

# Copia la clave pública al servidor
ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@servidor

# Copia el contenido de la clave privada para agregarlo como secreto
cat ~/.ssh/id_ed25519
```

## Variables de Entorno

El proyecto utiliza las siguientes variables de entorno que deben configurarse en el servidor:

### En el servidor

Crea un archivo `.env` en el directorio del proyecto:

```bash
cd backup_duplicati
nano .env
```

Contenido del archivo `.env`:

```env
# MongoDB Atlas URI
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/duplicati-backups?retryWrites=true&w=majority

# Entorno (opcional)
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Uso de la Imagen Docker

### Desde GitHub Container Registry

Puedes usar la imagen publicada sin necesidad de construirla:

```bash
# En tu docker-compose.yml del servidor
services:
  duplicati-monitor:
    image: ghcr.io/jalejandrov93/backup-duplicati:latest
    container_name: duplicati-backup-monitor
    ports:
      - "8187:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped
```

Luego simplemente:

```bash
docker compose pull
docker compose up -d
```

### Autenticación para imágenes privadas

Si el repositorio es privado, necesitas autenticarte:

```bash
# Genera un Personal Access Token en GitHub con permisos 'read:packages'
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Luego puedes hacer pull de la imagen
docker compose pull
```

## Desactivar el Despliegue Automático

Si solo quieres construir la imagen pero no desplegarla automáticamente:

1. Elimina el job `deploy` del workflow, o
2. No configures los secretos SSH (el job fallará pero no afectará a la build)

## Monitoreo y Logs

### Ver el estado del workflow

1. Ve a tu repositorio en GitHub
2. Pestaña "Actions"
3. Selecciona el workflow "Build and Publish Docker Image"
4. Revisa los logs de cada ejecución

### Ver imágenes publicadas

1. Ve a tu perfil de GitHub
2. Pestaña "Packages"
3. Selecciona `backup-duplicati`
4. Verás todas las versiones publicadas

## Troubleshooting

### Error: "authentication required"

**Solución:** Verifica que el token `GITHUB_TOKEN` tenga permisos de escritura en packages. En Settings → Actions → General → Workflow permissions, selecciona "Read and write permissions".

### Error: "failed to connect to SSH server"

**Solución:**

- Verifica que los secretos SSH estén configurados correctamente
- Asegúrate de que el servidor permita conexiones SSH
- Verifica que el puerto sea el correcto

### La imagen se construye pero el despliegue falla

**Solución:**

- Verifica que el directorio `backup_duplicati` existe en el servidor
- Asegúrate de que Docker y Docker Compose están instalados en el servidor
- Revisa los logs del workflow para más detalles

### Problemas con la build

**Solución:**

- Verifica que el `Dockerfile` está en `docker/Dockerfile`
- Asegúrate de que todas las dependencias están en `package.json`
- Revisa los logs de build para errores específicos

## Mejoras Futuras

Posibles mejoras al workflow:

- [ ] Agregar tests automatizados antes del build
- [ ] Implementar escaneo de vulnerabilidades con Trivy
- [ ] Agregar notificaciones (Slack, Discord, Email)
- [ ] Implementar rollback automático en caso de falla
- [ ] Agregar múltiples ambientes (staging, production)
- [ ] Implementar versionado semántico automático

## Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [SSH Action](https://github.com/appleboy/ssh-action)
