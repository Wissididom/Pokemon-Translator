FROM ghcr.io/pnpm/pnpm:latest
RUN pnpm runtime set node lts
WORKDIR /app
RUN pnpm ci --prod
COPY . .
# EXPOSE 1337
CMD [ "pnpm", "start" ]
