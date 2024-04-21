ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine as base

FROM base AS dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

FROM base AS builder
WORKDIR /app
ENV NEXT_PUBLIC_ENVIRONMENT dev
COPY --from=dependencies /app/node_modules ./node_modules
# RUN npm install sharp
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ARG NEXT_PUBLIC_APPWRITE_URL
ENV NEXT_PUBLIC_APPWRITE_URL=${NEXT_PUBLIC_APPWRITE_URL}
ARG NEXT_PUBLIC_APPWRITE_PROJECT_ID
ENV NEXT_PUBLIC_APPWRITE_PROJECT_ID=${NEXT_PUBLIC_APPWRITE_PROJECT_ID}
ARG NEXT_PUBLIC_API_KEY
ENV NEXT_PUBLIC_API_KEY=${NEXT_PUBLIC_API_KEY}
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
RUN apk add --no-cache nodejs
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/public /app/standalone/public
COPY --from=builder /app/.next/static /app/standalone/.next/static
RUN mkdir /app/standalone/.next/cache
RUN chown -R node:node /app/standalone/.next/cache
USER node
EXPOSE 3000
CMD node ./standalone/server.js