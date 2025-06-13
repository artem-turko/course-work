# Базовий образ з Node.js
FROM node:18

# Робоча директорія в контейнері
WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо всі файли в контейнер
COPY . .

# Вказуємо порт (для документації)
EXPOSE 3000

# Команда запуску
CMD ["npm", "start"]
