# ─── Étape 1 : build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances et installer
COPY package*.json ./
RUN npm ci

# Copier les sources et compiler TypeScript
COPY . .
RUN npm run build

# ─── Étape 2 : image de production ───────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copier uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copier les artefacts compilés depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "dist/main"]
