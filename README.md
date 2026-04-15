# Promo Codes API

REST API для системы промокодов на `NestJS + TypeScript + Prisma 7 + PostgreSQL`.

Реализовано:

- CRUD промокодов
- активация промокода по `code + email`
- запрет повторной активации одного промокода одним email
- запрет активации сверх лимита
- запрет активации просроченного промокода
- транзакционная активация с блокировкой строки промокода в PostgreSQL

## Стек

- Node.js
- NestJS
- TypeScript
- Prisma 7
- @prisma/adapter-pg
- PostgreSQL

## Запуск

### 1. Установить зависимости

```bash
npm install
```

### 2. Поднять PostgreSQL

Если Docker доступен:

```bash
docker compose up -d
```

### 3. Создать `.env`

Скопировать `.env.example` в `.env`.

Базовое значение:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/promo_codes?schema=public"
PORT=3000
```

### 4. Применить миграции

```bash
npm run prisma:deploy
```

### 5. Запустить приложение

```bash
npm run start:dev
```

Приложение будет доступно на `http://localhost:3000`.

## API

### Создать промокод

`POST /promo-codes`

```json
{
  "code": "SPRING25",
  "discountPercent": 25,
  "activationLimit": 3,
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

### Получить список промокодов

`GET /promo-codes`

### Получить промокод по id

`GET /promo-codes/:id`

### Обновить промокод

`PATCH /promo-codes/:id`

```json
{
  "discountPercent": 30,
  "activationLimit": 5
}
```

### Удалить промокод

`DELETE /promo-codes/:id`

### Активировать промокод

`POST /activations`

```json
{
  "code": "SPRING25",
  "email": "user@example.com"
}
```

## Примеры `curl`

Создание:

```bash
curl -X POST http://localhost:3000/promo-codes \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"SPRING25\",\"discountPercent\":25,\"activationLimit\":3,\"expiresAt\":\"2026-12-31T23:59:59.000Z\"}"
```

Активация:

```bash
curl -X POST http://localhost:3000/activations \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"SPRING25\",\"email\":\"user@example.com\"}"
```

## Что важно в реализации

- код промокода сохраняется в верхнем регистре
- email сохраняется в нижнем регистре
- повторная активация защищена уникальным индексом `promoCodeId + email`
- лимит активаций защищён транзакцией и `SELECT ... FOR UPDATE`
- нельзя уменьшить `activationLimit` ниже уже выполненных активаций
- Prisma настроена через `prisma.config.ts` и adapter-based подключение

## Полезные команды

```bash
npm run build
npm run prisma:generate
npm run prisma:deploy
```
