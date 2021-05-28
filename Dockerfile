### STAGE 1
FROM node AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx tsc

### STAGE 2
FROM node
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY --from=build /usr/src/app/dist ./

EXPOSE 3000
CMD [ "node", "./server.js" ]
