# Experiment 01 — Baseline: No Index

## Goal

Measure the performance of finding all orders that belong to a specific user **without an index** on `Order.userId`.

This experiment will be used as the baseline for comparison with an indexed version.

## Dataset

- Users: 10,000
- Orders: 50,000
- Index on `Order.userId`: No
- Query condition: `userId = 5000`

## Query

    EXPLAIN (ANALYZE, BUFFERS)
    SELECT *
    FROM "Order"
    WHERE "userId" = 5000;

## Query Plan

    Seq Scan on "Order"
      Filter: ("userId" = 5000)
      Rows Removed by Filter: 49994
      Buffers: shared read=319

    Planning Time: 0.324 ms
    Execution Time: 3.199 ms

## Metrics

| Metric | Result |
|---|---:|
| Scan Type | Sequential Scan |
| Rows Returned | 6 |
| Rows Removed by Filter | 49,994 |
| Shared Buffers Read | 319 |
| Planning Time | 0.324 ms |
| Execution Time | 3.199 ms |

## What Happened?

PostgreSQL used a **Sequential Scan** because there is no index on `Order.userId`.

The `Order` table contains 50,000 rows. PostgreSQL scanned the table and checked each row to see whether:

    userId = 5000

Only 6 rows matched the condition, while 49,994 rows did not.

In other words:

    50,000 rows scanned
          ↓
       6 matched
          ↓
    49,994 filtered out

## Conclusion

Without an index, PostgreSQL had to scan the entire `Order` table to find the user's orders.

This result is our **baseline**.

Next, we will add an index on `Order.userId` and run the **exact same query against the same dataset**.

We will then compare:

- Scan type
- Rows examined
- Buffers
- Planning time
- Execution time