FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci


FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Do NOT bake NEXT_PUBLIC_SOCKET_URL into the image: Next inlines it at build time,
# which would pin every environment to a single socket host. The client derives the
# socket URL from its own origin at runtime (lib/hooks/useSocket.ts), so one image
# works in staging and prod alike. The env var remains a local-dev override only.

RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
