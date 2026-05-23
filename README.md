<<<<<<< HEAD
# SplitSmart

SplitSmart is a Next.js + MongoDB application for tracking shared expenses across groups and automatically calculating who owes whom.

## Tech stack

- Next.js App Router
- TypeScript
- MongoDB with Mongoose
- Tailwind CSS
- Node.js API routes

## Features

- Register, login, and cookie-based protected routes
- Create groups and invite registered users by email
- Add expenses with payer, participants, amount, and date
- Automatic settlement calculation with per-member balances
- Search, filter, and sort expenses
- Graceful handling of slow, empty, duplicate, and failed API responses

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and update values:

```bash
cp .env.example .env.local
```

3. Start MongoDB locally or point `MONGODB_URI` to your cluster.

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Environment variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret used to sign the session cookie

## Architecture

- `app/`: App Router pages and API route handlers
- `components/`: Client-side UI shells and forms
- `lib/`: Auth helpers, DB connection, validation, serializers, and settlement logic
- `models/`: Mongoose schemas for users, groups, and expenses
- `middleware.ts`: Cookie-gated route protection for dashboard and group pages

### Request flow

1. Auth routes create or verify a user and store a signed HTTP-only cookie.
2. Protected API routes resolve the current user from the cookie.
3. MongoDB stores group membership and expense relationships.
4. Group detail responses compute settlements from current expenses on the server.
5. Client components handle retry, loading, empty, and duplicate-response cases.

### Settlement logic

- Each expense credits the payer with the full amount.
- Each participant is debited an equal share.
- The balance sheet is reduced into a minimal set of transfers between debtors and creditors.

## Deployment

- Deploy to Vercel
- Use MongoDB Atlas for the production database
- Add `MONGODB_URI` and `JWT_SECRET` in the deployment environment settings

## Deliverables checklist

- GitHub repository: ready after you commit and push this workspace
- Live deployment link: ready after Vercel deployment
- README: included
- Architecture explanation: included in this README
=======
# SplitSmart-repo
SplitSmart is a full-stack expense sharing app built with Next.js, MongoDB, Node.js, and Tailwind CSS. Users can create groups, add shared expenses, track balances, and calculate smart settlements dynamically. Includes authentication, search &amp; filters, responsive UI, and graceful handling of API failures, delays, duplicates, and empty states.
>>>>>>> 6d92ec0adcc0dc17cc928e7f4eb3e9808d0cf431
