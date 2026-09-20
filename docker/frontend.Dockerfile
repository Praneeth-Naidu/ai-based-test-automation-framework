# Builds the RealWorld React/Redux frontend from source and points it at our
# self-hosted backend instead of the (now-defunct) conduit.productionready.io.
#
# Why build from source instead of using a prebuilt image: the published
# realworldio/frontend-react-redux image bakes in the hosted API URL at
# build time (create-react-app inlines env vars), so it can't be repointed
# at runtime. Patching src/agent.js before the build is the only reliable fix.

FROM node:18 AS build
ARG API_ROOT=http://localhost:3000/api
RUN git clone --depth 1 https://github.com/gothinkster/react-redux-realworld-example-app.git /app
WORKDIR /app

# Repoint the API base URL at our own backend service.
RUN sed -i "s#https://conduit.productionready.io/api#${API_ROOT}#" src/agent.js

RUN npm install --legacy-peer-deps
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
