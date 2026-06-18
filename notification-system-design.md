# Notification System Design

## Stage 1

### Overview
The notification platform must expose a REST API and deliver campus notifications to authenticated students. The API should support listing notifications, filtering by type, paging results, and providing a priority inbox for the most important unread messages.

### API contracts
#### GET /notifications
Fetch notifications for the current student with optional filters.

Request headers:
- `Authorization: Bearer <token>`

Query parameters:
- `limit` (optional, default `10`)
- `page` (optional, default `1`)
- `notification_type` (optional; one of `Placement`, `Result`, `Event`)

Response:
```json
{
  "notifications": [
    {
      "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "type": "Result",
      "message": "mid-sem",
      "timestamp": "2026-04-22T17:51:30Z",
      "isRead": false,
      "priority": 8
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 42,
  "totalPages": 5,
  "unreadCount": 17
}
```

Schema:
- `notifications`: array of notification objects
- `page`: integer
- `limit`: integer
- `total`: integer
- `totalPages`: integer
- `unreadCount`: integer

Notification object:
- `id`: string
- `type`: `Placement` | `Result` | `Event`
- `message`: string
- `timestamp`: ISO 8601 string
- `isRead`: boolean
- `priority`: integer

#### POST /notifications/:id/read
Mark a notification as read.

Headers:
- `Authorization: Bearer <token>`

Path:
- `id`: notification ID

Response:
```json
{
  "notification": {
    "id": "...",
    "type": "Event",
    "message": "...",
    "timestamp": "...",
    "isRead": true,
    "priority": 3
  }
}
```

#### GET /notifications/top
Fetch the top priority unread notifications.

Headers:
- `Authorization: Bearer <token>`

Response:
```json
{
  "notifications": [
    {
      "id": "...",
      "type": "Placement",
      "message": "...",
      "timestamp": "...",
      "isRead": false,
      "priority": 10
    }
  ],
  "count": 10
}
```

### Real-time notification architecture
The architecture should use pub/sub and push updates to connected clients. A WebSocket or Server-Sent Events channel delivers new notification events and status changes. The backend produces events when notifications are created, updated, or marked read.

Event flow:
1. Client connects with bearer auth.
2. Backend validates student identity.
3. Notification events are published by backend services.
4. Connected clients receive real-time updates.
5. Clients update the unread count and notification list.

## Stage 2

### Storage recommendation
A relational database such as PostgreSQL is the preferred persistent store. It handles structured notification records, supports filtered queries, and works well with indexing strategies.

### Database schema
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  student_id INTEGER NOT NULL,
  type VARCHAR(16) NOT NULL CHECK (type IN ('Placement', 'Result', 'Event')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Upload and schema notes
- Use `student_id` as the partition key for student-scoped queries.
- Store `priority` separately to support top notification queries and ranking.
- Record `created_at` and `updated_at` for auditing.

### Potential scaling problems
- Large table scans when reading unread notifications.
- write amplification from notify-all operations.
- heavy sorting on timestamp or priority.
- stale counts when computing unread totals on demand.

### Queries
Fetch notifications by type and page:
```sql
SELECT id, type, message, timestamp, is_read, priority
FROM notifications
WHERE student_id = $1
  AND ($2::text IS NULL OR type = $2)
ORDER BY timestamp DESC
LIMIT $3 OFFSET $4;
```

Fetch unread notifications for a student:
```sql
SELECT id, type, message, timestamp, is_read, priority
FROM notifications
WHERE student_id = $1
  AND is_read = false
ORDER BY timestamp ASC
LIMIT 50;
```

Fetch top priority notifications:
```sql
SELECT id, type, message, timestamp, is_read, priority
FROM notifications
WHERE student_id = $1
ORDER BY priority DESC, timestamp DESC
LIMIT 10;
```

## Stage 3

### Query review
The original query:
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

Is it accurate?
- It returns unread notifications for a student.
- It lacks pagination.
- It may scan many rows and sort inefficiently.

Why is it slow?
- Without a composite index, the database must scan rows matching `studentID` and then filter by `isRead`.
- Sorting by `createdAt` is expensive if the index does not provide that order.

### Recommended change
```sql
SELECT id, type, message, timestamp, is_read, priority
FROM notifications
WHERE student_id = 1042
  AND is_read = false
ORDER BY timestamp ASC
LIMIT 100;
```

### Indexing advice
Create a composite index that matches the filter and sort keys:
```sql
CREATE INDEX idx_notifications_student_unread_timestamp
ON notifications(student_id, is_read, timestamp DESC);
```

### Is adding indexes on every column safe?
No. Each index slows inserts and updates because the DB must maintain additional structures. Add indexes only for queries that are frequent and performance-critical.

### Query for placement notifications in last 7 days
```sql
SELECT student_id
FROM notifications
WHERE notification_type = 'Placement'
  AND timestamp >= now() - interval '7 days'
GROUP BY student_id;
```

Required index:
```sql
CREATE INDEX idx_notifications_type_timestamp
ON notifications(notification_type, timestamp DESC);
```

## Stage 4

### Overloaded DB problem
Fetching notifications on every page load is harming DB performance. Use caching, pagination, and real-time updates to reduce load.

### Suggested solution
- Cache first-page results and unread counts.
- Use a lightweight notification list API with `limit`/`page`.
- Push new notifications to connected clients instead of polling constantly.

### Caching strategy
- Cache `GET /notifications?limit=10&page=1` for 15-30 seconds.
- Cache the unread count separately with a short TTL.
- Invalidate caches when a notification is created or marked read.

### Tradeoffs
- Cache staleness vs reduced load: acceptable for UI refresh intervals.
- Pagination complexity vs smaller result sets: deeper pages can still query SQL directly.
- Real-time push complexity vs user-perceived freshness: better UX for live colleges.

### Scale strategy
- Horizontal API server scaling behind a load balancer.
- Use Redis for caching and pub/sub.
- Use message queues for notify-all fanout.

## Stage 5

### Implementation flaws
The current pseudocode is synchronous and unsafe for 50k students. It performs sequential email and DB writes, making it slow and brittle when failures occur.

### Reliable architecture
Use an asynchronous queue and worker model:
- enqueue jobs for each student notification
- persist the notification in DB first
- push to the app and send email in retryable worker processes
- log failures with a dead-letter queue if retries fail

### Revised pseudocode
```python
function notify_all(student_ids, message):
  for student_id in student_ids:
    enqueue({
      student_id: student_id,
      message: message,
      channels: ["email", "app"]
    })
```

Worker:
```python
function processJob(job):
  try:
    save_to_db(job.student_id, job.message)
    push_to_app(job.student_id, job.message)
    send_email(job.student_id, job.message)
  except TransientError as error:
    retry(job)
  except PermanentError as error:
    move_to_dead_letter(job, error)
    log_error(error)
```
```

### Should DB save and email happen together?
No. Persist the notification separately from email delivery. This decoupling keeps the system reliable and ensures notifications remain available even when email fails.

### Queue and retry design
- Use a durable queue such as RabbitMQ, Kafka, or SQS.
- Retry transient failures with backoff.
- Capture permanent failures in a dead-letter queue.
- Keep duplicate handling idempotent.

## Stage 6

### Priority inbox design
A priority inbox must surface the top `n` important unread notifications by type, weight, and recency.

Priority scoring:
- `Placement`: base 10
- `Result`: base 7
- `Event`: base 4
- plus explicit `priority` weight
- plus recency boost for newer notifications

Score formula:
```ts
function score(notification) {
  const typeWeight = {
    Placement: 10,
    Result: 7,
    Event: 4,
  }[notification.type];
  const ageDays = Math.max(0, (Date.now() - new Date(notification.timestamp).getTime()) / 86400000);
  const recencyBonus = Math.max(0, 10 - ageDays);
  return notification.priority + typeWeight + recencyBonus;
}
```

Sorted result:
- highest score first
- newest timestamp among equal scores

### Efficient maintenance
For a single student, maintain top 10 results using a min-heap or a sorted database query:
```sql
SELECT id, type, message, timestamp, is_read, priority
FROM notifications
WHERE student_id = $1 AND is_read = false
ORDER BY (priority + CASE type WHEN 'Placement' THEN 10 WHEN 'Result' THEN 7 ELSE 4 END + GREATEST(0, 10 - EXTRACT(EPOCH FROM (now() - timestamp))/86400)) DESC,
         timestamp DESC
LIMIT 10;
```

### Complexity analysis
- Page fetch: O(log N + L) with indexes, where `N` is total notifications and `L` is limit.
- Priority sort in-memory: O(k log k), with `k` as the unread set.
- Top `n` by heap: O(k log n).
- Cache hit: O(1).
- Real-time push: O(1) per client after subscription.

### Summary
The design addresses REST API contracts, JSON schemas, real-time architecture, database schema, indexing, scale/caching, queue-based retry handling, and the priority inbox algorithm. It matches the repository requirements for a production-ready notification platform.
