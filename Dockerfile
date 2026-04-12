FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
# Use npm install when package-lock.json may not exist in this repo
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
