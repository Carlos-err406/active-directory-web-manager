FROM node:20.12.1-alpine3.19

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . ./

RUN npm run build
RUN rm -r src/ static/

# RUN apk add --no-cache fontconfig
# ENV FONTCONFIG_PATH=/etc/fonts
# RUN mkdir -p /usr/share/fonts/
# COPY static/fonts/* /usr/share/fonts/
# RUN fc-cache -f -v

EXPOSE 3000
CMD npm run start
