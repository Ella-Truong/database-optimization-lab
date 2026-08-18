# Experiment 02 — Single-Column Index

## Goal

Measure the performance improvement from adding an index on `Order.userId`.

The query and dataset are identical to the baseline experiment.

## Dataset

- Users: 10,000
- Orders: 50,000
- Index: `Order.userId`
- Query condition: `userId = 5000`

## Index

    @@index([userId])

## Query

    EXPLAIN (ANALYZE, BUFFERS)
    SELECT *
    FROM "Order"
    WHERE "userId" = 5000;

## Query Plan

    Bitmap Heap Scan on "Order"
      Recheck Cond: ("userId" = 5000)
      Heap Blocks: exact=6
      Buffers: shared hit=6 read=2

      Bitmap Index Scan on "Order_userId_idx"
        Index Cond: ("userId" = 5000)
        Buffers: shared read=2

    Planning Time: 0.529 ms
    Execution Time: 0.177 ms

## Metrics

| Metric | Result |
|---|---:|
| Scan Type | Bitmap Index Scan + Bitmap Heap Scan |
| Rows Returned | 6 |
| Rows Filtered | 0 |
| Shared Buffers | 6 hit + 2 read |
| Planning Time | 0.529 ms |
| Execution Time | 0.177 ms |

## Comparison

| Metric | No Index | With Index |
|---|---:|---:|
| Scan | Sequential Scan | Bitmap Index + Heap Scan |
| Rows Returned | 6 | 6 |
| Rows Filtered | 49,994 | 0 |
| Planning Time | 0.324 ms | 0.529 ms |
| Execution Time | 3.199 ms | 0.177 ms |

## Observation

Without an index, PostgreSQL scanned all 50,000 rows in the `Order` table.

After adding the `userId` index, PostgreSQL used the index to locate the matching rows instead of scanning the entire table.

Execution time decreased from 3.199 ms to 0.177 ms for this execution.

The index also increased planning time slightly because PostgreSQL now has an additional access path to consider.

## Conclusion

For this query and dataset, the index on `Order.userId` significantly reduced query execution time.

The important principle is:

    No Index
        ↓
    Scan the table

    With Index
        ↓
    Locate matching rows through the index

The exact performance benefit depends on the dataset size, query, data distribution, and PostgreSQL's chosen execution plan.