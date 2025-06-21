FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости и очищаем кэш npm для уменьшения размера образа
RUN npm install --production && npm cache clean --force

# Копируем остальной код приложения
COPY . .

# Указываем порт, который будет использоваться
EXPOSE 3000

# Запускаем приложение от имени пользователя node (для безопасности)
USER node

# Запускаем приложение
CMD ["npm", "start"]