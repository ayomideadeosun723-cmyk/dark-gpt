FROM node:22-alpine AS base
RUN npm install -g pnpm@10
WORKDIR /app

# Install dependencies
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/dark-gpt/package.json ./artifacts/dark-gpt/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/
COPY scripts/package.json ./scripts/

RUN pnpm install --frozen-lockfile

# Copy all source
COPY . .

# Build frontend
RUN pnpm --filter @workspace/dark-gpt run build

# Copy frontend build into api-server public folder
RUN mkdir -p artifacts/api-server/public && \
    cp -r artifacts/dark-gpt/dist/public/. artifacts/api-server/public/

# Build backend
RUN pnpm --filter @workspace/api-server run build

# Final stage
FROM node:22-alpine AS runner
RUN npm install -g pnpm@10
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/
COPY scripts/package.json ./scripts/

RUN pnpm install --frozen-lockfile --prod

COPY --from=base /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=base /app/artifacts/api-server/public ./artifacts/api-server/public
COPY --from=base /app/artifacts/dark-gpt/system-prompt.js ./artifacts/dark-gpt/system-prompt.js

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
