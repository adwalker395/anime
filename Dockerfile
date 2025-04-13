FROM node:20 as builder

LABEL version="1.0.0"
LABEL description="Consumet API (fastify) Docker Image"

# Update packages
RUN apt-get update && apt-get upgrade -y && apt-get autoclean -y && apt-get autoremove -y

# Create non-root user
RUN groupadd -r nodejs && useradd -g nodejs -s /bin/bash -d /home/nodejs -m nodejs
USER nodejs

# Set up app directory
RUN mkdir -p /home/nodejs/app/node_modules && chown -R nodejs:nodejs /home/nodejs/app
WORKDIR /home/nodejs/app

# Environment variables
ARG NODE_ENV=PROD
ARG PORT=3000
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV REDIS_HOST=${REDIS_HOST}
ENV REDIS_PORT=${REDIS_PORT}
ENV REDIS_PASSWORD=${REDIS_PASSWORD}
ENV NPM_CONFIG_LOGLEVEL=warn

# Install dependencies
COPY --chown=nodejs:nodejs package*.json ./
RUN yarn install

# Copy source files
COPY --chown=nodejs:nodejs . .

# Build TypeScript
RUN yarn build

# Expose port
EXPOSE 3000

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s CMD yarn run healthcheck-manual

# Start server
CMD [ "yarn", "start" ]
