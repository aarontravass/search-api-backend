FROM node:18-alpine
WORKDIR /app
COPY package*.json /app/
RUN npm i
RUN npm i -D typescript
RUN 