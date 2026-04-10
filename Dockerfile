# ============================================================
# ArenaSense AI — Simple Dockerfile
# ============================================================
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "start"]
