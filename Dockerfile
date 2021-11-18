FROM node:lts AS deps
RUN apt-get install -y python
WORKDIR /app
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:lts AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/tsconfig.json ./tsconfig.json
RUN yarn global add typescript
RUN yarn build



FROM node:lts AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist


USER node

EXPOSE 3030

CMD ["node", "./dist"]