# Prowider Mini Lead Distribution System

This is a premium, high-concurrency lead distribution system built with **Next.js (App Router)**, **PostgreSQL**, **Prisma ORM**, and **TailwindCSS**. 

The system distributes leads instantly to exactly 3 eligible providers based on custom mandatory lists and fair round-robin pools while ensuring strict transaction safety and webhook idempotency.

---

## 🚀 Key Features

1. **Concurrency-Safe Allocations**: Employs Prisma interactive transactions combined with explicit row-level locking (`SELECT ... FOR UPDATE` in PostgreSQL) to prevent race conditions during simultaneous lead submissions.
2. **Predictable Round-Robin Pools**: Selects providers sequentially from a pool, filtering out those with depleted quotas, and updates allocation tracking status atomically before committing.
3. **Guaranteed Webhook Idempotency**: Prevents double-processing of payment resets using a database-level unique constraint on `idempotencyKey` inside `ProcessedWebhook`.
4. **Real-Time Polling Dashboard**: Built with `SWR` polling client-side every 2 seconds to reflect system-wide data updates, provider remaining quotas, and lead assignment histories in real-time.
5. **Interactive Developer Test Suite**: Stress-tests concurrent transactions using `Promise.all()` (generating 10 parallel lead submissions) and tests the quota-reset webhook with unique and duplicate keys.

---

## ⚡ Concurrency & Allocation Architecture

### 1. Database Schema
Our Prisma models ensure structural integrity at the database layer:
* **`Provider`**: Holds the provider credentials and remaining lead quota (`quota` default 10).
* **`Service`**: Holds the service IDs and names.
* **`Lead`**: Employs a composite uniqueness constraint `@@unique([phone, serviceId])` to strictly block duplicate submissions at the DB level.
* **`LeadAssignment`**: Represents the explicit many-to-many join table between `Lead` and `Provider` with cascading deletes.
* **`RoundRobinTracker`**: Persists the `lastProviderId` sequentially assigned per `serviceId`.
* **`ProcessedWebhook`**: Maintains unique `idempotencyKey` entries to protect against redelivery of quota-reset triggers.

### 2. Concurrency-Safe Transaction Flow
When a lead is submitted, the backend server action executes all database operations inside a single `prisma.$transaction`. We apply the following sequence:

1. **Attempt Lead Creation**:
   * We insert the `Lead` into the database first. If a duplicate phone and service is submitted, PostgreSQL throws a unique key violation (`P2002`). This is intercepted immediately, returning a user-friendly duplicate alert and rolling back the transaction.
2. **Acquire PostgreSQL Row-Level Locks (`FOR UPDATE`)**:
   * We lock the affected providers using:
     ```sql
     SELECT id, name, quota FROM "Provider" WHERE id IN (...) FOR UPDATE;
     ```
   * We lock the service's round-robin tracker using:
     ```sql
     SELECT id, "serviceId", "lastProviderId" FROM "RoundRobinTracker" WHERE "serviceId" = ... FOR UPDATE;
     ```
   * *Why?* This blocks any other concurrent transaction from modifying or reading these rows until the active transaction completes, guaranteeing that no provider has their quota double-deducted or receives a lead in error.
3. **In-Memory Round-Robin Allocation**:
   * **Mandatory Providers**: Added to the selection list immediately. (Service 1: P1, Service 2: P5, Service 3: P1 & P4).
   * **Round-Robin selection**: We read the last assigned provider from the locked tracker, calculate the next index in the service's pool, and iterate. Any provider with a quota of `0` is skipped.
   * **Failure checks**: If any mandatory provider has a depleted quota, or we cannot find enough pool providers, the transaction throws an error, causing an automatic **rollback** (reverting the created lead and all changes).
4. **Update Quotas & Trackers**:
   * Quotas for all 3 chosen providers are decremented by 1.
   * `LeadAssignment` links are generated.
   * `RoundRobinTracker` is updated with the last assigned pool provider ID.

---

## 🛡️ Webhook Idempotency

When simulating the payment gateway webhook to reset quotas:
1. The route parses the `idempotencyKey`.
2. It attempts to insert a record in `ProcessedWebhook`.
3. If the insert fails due to a unique key constraint violation on `idempotencyKey`, the database throws a duplicate key error. The API intercepts this and returns `200 OK` early, skipping quota resets.
4. If the insert succeeds, the API proceeds to reset all providers' quotas to 10 and returns a success response.

---

## 🛠️ Getting Started

### 1. Configure the Environment
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:hi@localhost:5432/prowider_db?schema=public"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Apply Migrations & Seed
Apply database migrations to sync your PostgreSQL instance and seed the initial data (3 services, 8 providers, and round-robin trackers):
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view:
* **`/request-service`**: Client submission form.
* **`/dashboard`**: Live SWR polling dashboard.
* **`/test-tools`**: Concurrency stress tester and webhook panel.
