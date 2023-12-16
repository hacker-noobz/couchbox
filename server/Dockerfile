FROM node:alpine
 
# Create app directory
WORKDIR /server
 
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
