# Despliegue con Docker

Esta guía explica cómo desplegar Duplicati Backup Monitor usando Docker.

## Requisitos Previos

- Docker y Docker Compose instalados
- Cuenta de MongoDB Atlas con una base de datos configurada
- Puerto 8187 disponible en tu servidor

## Configuración

### 1. Crear archivo de variables de entorno

Crea un archivo `.env` en la raíz del proyecto con tu URI de MongoDB:

```bash
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/LTSM?retryWrites=true&w=majority
```

Puedes usar `.env.example` como referencia:

```bash
cp .env.example .env
# Edita .env con tus credenciales
```

### 2. Construir y levantar el contenedor

```bash
# Construir la imagen
docker-compose build

# Levantar el servicio
docker-compose up -d
```

### 3. Verificar que está funcionando

```bash
# Ver logs
docker-compose logs -f duplicati-monitor

# Verificar estado del contenedor
docker-compose ps
```

La aplicación estará disponible en: `http://tu-servidor:8187`

## Comandos Útiles

```bash
# Detener el contenedor
docker-compose down

# Reiniciar el contenedor
docker-compose restart

# Ver logs en tiempo real
docker-compose logs -f

# Reconstruir tras cambios en el código
docker-compose up -d --build

# Eliminar contenedor e imagen
docker-compose down --rmi all
```

## Actualización de la Aplicación

Para actualizar a una nueva versión:

```bash
# Detener el contenedor actual
docker-compose down

# Actualizar el código (git pull si usas git)
git pull

# Reconstruir y levantar
docker-compose up -d --build
```

## Health Check

El contenedor incluye un health check que verifica el estado cada 30 segundos mediante el endpoint `/api/stats`.

Para ver el estado de salud:

```bash
docker inspect duplicati-backup-monitor --format='{{.State.Health.Status}}'
```

## Solución de Problemas

### El contenedor no inicia

1. Verifica los logs:
   ```bash
   docker-compose logs duplicati-monitor
   ```

2. Verifica que la URI de MongoDB es correcta en el archivo `.env`

3. Verifica que el puerto 8187 no está en uso:
   ```bash
   netstat -tulpn | grep 8187
   ```

### Error de conexión a MongoDB

- Asegúrate de que la IP de tu servidor está en la lista blanca de MongoDB Atlas
- Verifica que el usuario y contraseña son correctos
- Verifica que el nombre de la base de datos es `LTSM`

### Permisos en Linux

Si tienes problemas de permisos, asegúrate de que el usuario tiene permisos para ejecutar Docker:

```bash
sudo usermod -aG docker $USER
# Luego cierra sesión y vuelve a iniciarla
```

## Configuración del Webhook en Duplicati

Una vez que la aplicación esté corriendo, configura el webhook en tus clientes Duplicati:

**URL del Webhook:**
```
http://tu-servidor:8187/api/webhook/duplicati
```

**Método:** POST
**Formato:** JSON

## Seguridad

Para producción, se recomienda:

1. Usar HTTPS con un proxy inverso (nginx, Traefik, Caddy)
2. Configurar firewall para limitar acceso al puerto 8187
3. Usar variables de entorno seguras (Docker secrets, vault)
4. Mantener actualizado Docker y la imagen base de Node.js

## Recursos del Contenedor

El contenedor usa:
- **Imagen base:** node:20-alpine (ligera, ~120MB)
- **Usuario:** nextjs (no-root para seguridad)
- **Puerto interno:** 3000 (mapeado a 8187 externamente)
- **Reinicio:** unless-stopped (se reinicia automáticamente)

## Arquitectura Multi-stage

El Dockerfile usa 3 stages para optimizar la imagen final:

1. **deps**: Instala dependencias de producción
2. **builder**: Compila la aplicación Next.js
3. **runner**: Imagen final optimizada (~200MB)
