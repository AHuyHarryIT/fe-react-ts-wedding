# Wedding Planner Backend API

This is the NestJS backend for the Wedding Planner application, providing CRUD APIs for managing wedding-related data.

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **Prisma** - Modern ORM for database access
- **PostgreSQL** - Database (configurable via DATABASE_URL)
- **TypeScript** - Type-safe development

## Prisma Schema

The backend includes the following models:

- **User** - User accounts with authentication
- **Wedding** - Wedding events with bride, groom, date, venue, and budget information
- **Guest** - Wedding guests with RSVP status and dietary restrictions
- **Vendor** - Wedding vendors (catering, photography, etc.) with contact and payment info
- **Task** - Wedding planning tasks with priority and due dates

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure database connection in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/wedding_db?schema=public"
```

3. Generate Prisma Client:
```bash
npx prisma generate
```

4. Run database migrations (when ready):
```bash
npx prisma migrate dev
```

## Development

Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

All endpoints follow REST conventions:

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Weddings
- `GET /weddings` - Get all weddings
- `GET /weddings/:id` - Get wedding by ID
- `POST /weddings` - Create new wedding
- `PATCH /weddings/:id` - Update wedding
- `DELETE /weddings/:id` - Delete wedding

### Guests
- `GET /guests` - Get all guests
- `GET /guests/:id` - Get guest by ID
- `POST /guests` - Create new guest
- `PATCH /guests/:id` - Update guest
- `DELETE /guests/:id` - Delete guest

### Vendors
- `GET /vendors` - Get all vendors
- `GET /vendors/:id` - Get vendor by ID
- `POST /vendors` - Create new vendor
- `PATCH /vendors/:id` - Update vendor
- `DELETE /vendors/:id` - Delete vendor

### Tasks
- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create new task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

## Build

Build for production:
```bash
npm run build
```

## Test

Run tests:
```bash
npm run test
```

## Prisma Commands

- `npx prisma generate` - Generate Prisma Client
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma studio` - Open Prisma Studio GUI
- `npx prisma db seed` - Seed the database (if seed file exists)
