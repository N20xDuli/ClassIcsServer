FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "preview", "--", "--port", "3000", "--host"]
