FROM public.ecr.aws/bitnami/node:16-prod

ARG NODE_ENV
ARG DEBUG_LEVEL

ENV NODE_ENV=$NODE_ENV
ENV DEBUG_LEVEL=$DEBUG_LEVEL

# Bundle app source
COPY node_modules node_modules
COPY build build

EXPOSE 8080

CMD [ "node", "build/index.js" ]
