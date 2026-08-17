## database-optimization-lab
Experiments in database schema design, query optimization, indexing, and performance tradeoffs.


### Architecture

```text
database-optimization/
│
├── prisma/
│   ├── schema.prisma              # Database schema: tables, relationships, constraints
│   └── migrations/                # Version-controlled database schema changes
│
├── src/
│   │
│   ├── seed/
│   │   └── generate-data.ts       # Faker.js: generate large, realistic datasets
│   │
│   ├── database/
│   │   ├── queries/               # Reusable SQL/database queries
│   │   │
│   │   └── experiments/           # Database optimization experiments
│   │       ├── baseline.ts        # Measure performance before optimization
│   │       ├── single-index.ts    # Test single-column indexes
│   │       ├── composite-index.ts # Test composite indexes
│   │       └── covering-index.ts  # Test covering indexes
│   │
│   ├── benchmark/
│   │   └── runner.ts              # Run queries repeatedly and collect metrics
│   │
│   └── api/                       # Layer 2: application/API performance
│       ├── server.ts              # HTTP server entry point
│       └── routes/                # API endpoints
│
├── docker-compose.yml             # Run PostgreSQL in Docker
├── prisma.config.ts               # Prisma configuration and database connection
├── package.json                   # Dependencies and npm scripts
└── .env                           # Environment variables, e.g. DATABASE_URL
```

### Architecture Layers

                    DATABASE OPTIMIZATION LAB
                              │
             ┌────────────────┴────────────────┐
             │                                 │
             ▼                                 ▼
       LAYER 1: DATABASE                LAYER 2: API
       PERFORMANCE                      PERFORMANCE
             │                                 │
             │                                 ▼
             │                              HTTP
             │                                 │
             │                                 ▼
             │                              API
             │                                 │
             │                                 ▼
             └───────────────┬───────────── Prisma
                             │
                             ▼
                       PostgreSQL
                       (Docker)


`Layer 1 -  Database Performance`

Answer the question: WHY IS THE DATABASE QUERY SLOW?

```text
Schema
  ↓
Faker.js
  ↓
Large Dataset
  ↓
SQL Query
  ↓
PostgreSQL
  ↓
Benchmark + EXPLAIN ANALYZE
  ↓
Measure & Compare
```

*Main metrics* 
- Query execution time
- Planning time
- p50 / p95 / p99 latency
- Rows scanned
- Rows returned
- Buffer hits
- Disk reads
- Scan type
- Join strategy
- Query plan


`Layer 2 - API Performance`

Answer the question: WHY IS THE HTTP REQUEST SLOW?

```text
Client
  ↓
HTTP Request
  ↓
API Route
  ↓
Application Logic
  ↓
Prisma
  ↓
PostgreSQL
```
*Main metrics*
- HTTP latency
- p50 / p95 / p99
- Throughput
- Error rate
- Database query duration
- Application processing time

`Relationship between two layers`
Layer 2 is built on top of layer 1

```text
GET /orders
     │
     ├── API / Application
     ├── Prisma
     ├── PostgreSQL query  ← Layer 1
     └── Network / overhead
     
     ↓
Total HTTP latency       ← Layer 2
```



