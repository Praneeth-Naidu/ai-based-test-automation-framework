# The upstream repo's own Dockerfile expects a pre-built dist/api directory
# that its current source doesn't actually produce, so `context: <git-url>`
# (which uses that Dockerfile automatically) fails. This Dockerfile just
# clones the source and runs it directly via `npm start` instead.

FROM node:18
RUN git clone --depth 1 https://github.com/gothinkster/node-express-realworld-example-app.git /app
WORKDIR /app
RUN npm install
EXPOSE 3000
# Migrations need a live DB connection, which only exists once the container
# is running (not at build time) — so generate/migrate happens in the start
# command, not as a separate RUN step.
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm start"]
