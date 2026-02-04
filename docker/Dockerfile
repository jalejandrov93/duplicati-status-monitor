# Dockerfile optimizado para Next.js con modo standalone
FROM node:24-alpine AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate


# --- Dependencias ---
FROM base AS dependencies

# Copiar archivos de configuración del package manager
COPY package.json pnpm-lock.yaml ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN pnpm install --frozen-lockfile

# Stage 2: Build de la aplicación
FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría durante el build
ENV NEXT_TELEMETRY_DISABLED=1

# Build del proyecto
RUN pnpm build

# Stage 3: Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos públicos (Asegúrate de ejecutar el build desde la raíz para que esto funciones)
COPY --from=builder /app/public ./public

# Copiar salida standalone
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
