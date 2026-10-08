# DeafSign — Система расписания и домашних заданий школы РЖЯ

![Status](https://img.shields.io/badge/status-active_development-8BA888?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=flat-square&logo=next.js)
![Runtime](https://img.shields.io/badge/Bun-1.1+-fbf0df?style=flat-square&logo=bun&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Database](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![ORM](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma&logoColor=white)

**DeafSign** — специализированная веб-платформа для школы Русского жестового языка (РЖЯ), автоматизирующая управление недельным интерактивным расписанием занятий, перенос и отмену уроков, а также работу с домашними заданиями с поддержкой медиа-материалов (видео и фото).

---

![Сетка расписания DeafSign](docs/screenshots/screenshot_1.png)

---

## Содержание

- [Технологии](#технологии)
- [Использование](#использование)
- [Разработка](#разработка)
   - [Требования](#требования)
   - [Установка зависимостей](#установка-зависимостей)
   - [Переменные окружения](#переменные-окружения)
   - [База данных и Prisma](#база-данных-и-prisma)
   - [Запуск Development сервера](#запуск-development-сервера)
   - [Проверка типов](#проверка-типов)
   - [Создание билда](#создание-билда)
- [Тестирование](#тестирование)
- [Архитектура проекта](#архитектура-проекта)
- [Deploy и CI/CD](#deploy-и-cicd)
- [Contributing](#contributing)
- [To do](#to-do)

---

## Технологии

- **Среда выполнения и пакетный менеджер:** [Bun](https://bun.sh/)
- **Фреймворк:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Язык программирования:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **База данных и ORM:** [Prisma ORM](https://www.prisma.io/) + [Neon Serverless PostgreSQL](https://neon.tech/)
- **Валидация контрактов (Single Source of Truth):** [Zod](https://zod.dev/)
- **Асинхронный стейт-менеджмент и кэширование:** [TanStack Query v5 (React Query)](https://tanstack.com/query/latest)
- **Клиентский стейт модалок и фильтров:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Стилизация:** [Tailwind CSS](https://tailwindcss.com/)
- **Хранилище медиа (ДЗ и вложения):** AWS S3 / Cloudflare R2 совместимое хранилище

---

## Использование

Для быстрого ознакомления с API сервиса расписания в проекте реализован типизированный слой запросов:

```typescript
import { scheduleApi } from '@/services/scheduleApi'

// Получение списка занятий на текущую неделю
const { lessons } = await scheduleApi.getLessons({
   startDate: '2026-10-05',
   endDate: '2026-10-11',
})

console.log(`Загружено занятий: ${lessons.length}`)
```

---

## Разработка

### Требования

- **Bun** версии `1.1.0` и выше (рекомендуется) или **Node.js** `v20+`
- База данных **PostgreSQL** (локальная или инстанс Neon)

### Установка зависимостей

```bash
bun install
```

### Переменные окружения

Создайте файл `.env` в корне проекта на основе примера:

```env
# Подключение к PostgreSQL (Neon pooler URL)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.region.neon.tech/neondb?sslmode=require"

# Прямое подключение для миграций Prisma (без PgBouncer)
DIRECT_URL="postgresql://user:password@ep-sample.region.neon.tech/neondb?sslmode=require"

# Секрет аутентификации JWT
JWT_SECRET="your-super-secret-jwt-key"

# Настройки объектного хранилища S3 (для видео и фото ДЗ)
S3_ENDPOINT="https://s3.storage.com"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="deafsign-media"
```

### База данных и Prisma

Генерация Prisma Client и синхронизация схемы с базой:

```bash
# Сгенерировать клиент Prisma
bun run prisma generate

# Применить изменения схемы к базе данных
bun run prisma db push

# Открыть веб-интерфейс управления базой
bun run prisma studio
```

### Запуск Development сервера

```bash
bun run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000).

### Проверка типов

Для проверки целостности контрактов и валидации типов без компиляции:

```bash
bun typecheck
```

_(эквивалент `tsc --noEmit`)_

### Создание билда

```bash
bun run build
```

Запуск production-сервера:

```bash
bun run start
```

---

## Архитектура проекта

- **Single Source of Truth:** Все DTO и типы данных выводятся напрямую из Zod-схем через `z.infer<typeof schema>`. Ручное дублирование TypeScript-интерфейсов для API исключено.
- **Проекция регулярных занятий:** Повторяющиеся уроки хранятся как мастер-записи с массивом `daysOfWeek: DayOfWeek[]`. Исключения, разовые переносы (`reschedules`) и отмены (`cancellations`) накладываются поверх мастер-записи по составному ключу `lessonId_date`.
- **Оптимистичный UI и Prefetching:** При навигации по неделям соседние периоды предзагружаются в фоне с помощью `usePrefetchWeeks`, обеспечивая мгновенное переключение без мерцания интерфейса.
- **Модульная структура расписания:**
   ```text
   components/schedule/
   ├── calendar/       # Сетка, колонки дней, временная шкала, заголовки
   ├── form/           # Формы создания и редактирования уроков
   ├── homework/       # Секция ДЗ, плеер видео, галерея фото и Lightbox
   └── modal/          # Диалоги удаления, переноса и подтверждения действий
   ```

## Contributing

1. Сделайте Fork репозитория.
2. Создайте функциональную ветку:
   ```bash
   git checkout -b feat/homework-attachments
   ```
3. Зафиксируйте изменения, придерживаясь спецификации [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat(homework): add image attachments and lightbox preview"
   ```
4. Убедитесь, что `bun typecheck` проходит без ошибок.
5. Отправьте Pull Request на ревью в ветку `main`.
