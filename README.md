# Metrical Tracking

A metric tracking system for recording and visualizing **Distance** and **Temperature** measurements. Built with NestJS, PostgreSQL, and RabbitMQ.

## Features

- Record metric data with date, value, and unit
- Support for Distance units: Meter, Centimeter, Inch, Feet, Yard
- Support for Temperature units: Celsius (°C), Fahrenheit (°F), Kelvin (°K)
- On-the-fly unit conversion
- Chart visualization with daily aggregation
- Time period filtering (1 Month, 2 Months)

## Problem-Solving Approach

### 1. Add New Metric (`POST /metric-records`)

**Problem**: Handle potentially large batch inserts without blocking the API and ensure data consistency.

**Solution**:

- **Async Processing via RabbitMQ**: API immediately returns `true`, records are processed in batches of 3000 via message queue
- **Base Unit Normalization**: All values converted to base units on write:
  - Distance -> Meter
  - Temperature -> Celsius
- **Original Data Preservation**: Store original input (value, unit, date) in JSONB `source` column for display purposes

### 2. List All Metrics (`GET /metric-records`)

**Problem**: Efficiently paginate large datasets with stable ordering for infinite scroll.

**Solution**:

- **Cursor-based Pagination**: Uses `(recordedAt, id)` composite cursor instead of offset-based pagination
  - Offset pagination degrades to O(n) as page number increases
  - Cursor pagination maintains O(1) by using indexed columns for comparison

- **Cursor + Direction Combined Logic**:

  | Scenario | Direction | Query Condition | Result |
  |----------|-----------|-----------------|--------|
  | Initial load | (no cursor) | None | First N records (newest first) |
  | Load older records | `next` | `(recordedAt, id) < cursor` | Records older than cursor |
  | Load newer records | `previous` | `(recordedAt, id) > cursor` | Records newer than cursor |

- **Response includes next/previous cursors**:
  - `nextCursor`: ID of last record (for loading older)
  - `previousCursor`: ID of first record (for loading newer)

### 3. Get Chart Data (`GET /metric-records/chart`)

**Problem**: Aggregate daily data points and support on-the-fly unit conversion for visualization.

**Solution**:

- **Window Function for Daily Aggregation**: SQL uses `ROW_NUMBER() OVER (PARTITION BY DATE)` to get one record per day
- **On-the-fly Unit Conversion**: Converts from base unit to requested unit at read time using `UnitConverterService`
- **Time Interval Filtering**: Computes date range from `TimeInterval` enum (1 month / 2 months)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Docker** & **Docker Compose**

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

## Environment Configuration

Create a `.env` file in the project root with the following variables or base on `.env.example`:

```env
# App
APP_PORT=3005
APP_ALLOWED_ORIGINS=http://localhost:3000

# Database (PostgreSQL)
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5325
DATABASE_USERNAME=sa
DATABASE_PASSWORD=Admin@123
DATABASE_NAME=metrical
DATABASE_MAX_CONNECTIONS=100

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=metrical
RABBITMQ_PASSWORD=metrical2025
```

## Infrastructure Setup

The project includes a shell script to manage Docker containers for PostgreSQL and RabbitMQ.

### Start Infrastructure

```bash
./start-infrastructure.sh start
```

### Available Commands

| Command | Description |
|---------|-------------|
| `./start-infrastructure.sh start` | Start all infrastructure services |
| `./start-infrastructure.sh stop` | Stop all infrastructure services |
| `./start-infrastructure.sh restart` | Restart all infrastructure services |
| `./start-infrastructure.sh status` | Show status of all services |
| `./start-infrastructure.sh logs <service>` | View logs (postgresql, rabbit) |

### Service Connection Details

| Service | Port | Credentials |
|---------|------|-------------|
| PostgreSQL | 5325 | User: `sa`, Password: `Admin@123`, Database: `metrical` |
| RabbitMQ (AMQP) | 5672 | User: `metrical`, Password: `metrical2025` |
| RabbitMQ (Management UI) | 15672 | User: `metrical`, Password: `metrical2025` |

## Database Migrations

After starting the infrastructure, run database migrations:

```bash
# Run migrations
npm run migration:run

# Revert last migration (if needed)
npm run migration:revert
```

## Running the Application

```bash
# Development mode (watch mode)
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be available at `http://localhost:3005` (or the port specified in `APP_PORT`).

## API Documentation

Swagger UI is available at `/docs` when the application is running.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start infrastructure:
   ```bash
   ./start-infrastructure.sh start
   ```

3. Create `.env` file with the configuration above

4. Run migrations:
   ```bash
   npm run migration:run
   ```

5. Start the application:
   ```bash
   npm run start:dev
   ```

6. Open Swagger UI at `http://localhost:3005/docs`

## License

This project is private and unlicensed.
