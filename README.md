# PhotoSphere Scalable Edition

This is an upgraded version of the original PhotoSphere coursework project. It keeps the same product features—creator uploads, consumer browsing, comments, and ratings—but the deployment has been redesigned to be much more scalable.

## Architecture used

This project now uses a **containerized n-tier scalable web architecture** with a **reverse proxy + stateless API replicas** pattern.

### Service layout

- **Gateway (NGINX)**
  - single public entry point on `http://localhost:8080`
  - reverse proxies browser traffic
  - routes `/` to the frontend and `/api` to the backend API
- **Frontend (React + Vite + NGINX)**
  - static SPA build
  - served behind the gateway
- **API tier (Node.js + Express)**
  - stateless backend service
  - can run multiple replicas with Docker Compose scaling
- **Redis**
  - caches hot read endpoints such as post lists and post details
- **MinIO object storage**
  - stores uploaded images outside the API container filesystem
  - makes uploads safer for horizontal scaling
- **MongoDB**
  - persistent application database

## Why this version is more scalable

The original version had a single backend container and local file uploads bound into one container path. That design works for demos, but it becomes fragile when you add more backend instances.

This updated version improves scalability by:

1. moving uploaded images to **object storage (MinIO)** instead of local container disk
2. making the API tier **stateless**, so you can run multiple replicas
3. adding **NGINX gateway** as the single entry point
4. adding **Redis caching** for common read-heavy endpoints
5. separating concerns into dedicated services

## High-level architecture

```text
Browser
  |
  v
NGINX Gateway
  |---------------------------> React Frontend
  |
  v
Node.js / Express API replicas
  |-------------> Redis cache
  |-------------> MinIO object storage
  |
  v
MongoDB
```


## New registration options

The register page now supports two account types:

- **Register as Consumer**: browse photos, search posts, comment, and rate.
- **Register as Creator**: upload photos and manage your own posts in Creator Studio.

After registering as a creator, the app automatically redirects the user to `/creator`.

## Post persistence after reload

Posts are stored in **MongoDB** and uploaded images are stored in **MinIO object storage**. Docker named volumes are already configured:

- `mongo_data` keeps old post records.
- `minio_data` keeps uploaded image files.
- `redis_data` keeps Redis cache data.

So, when you refresh the browser or stop/start normally with `docker compose down` and `docker compose up --build`, old posts will load again.

Do **not** use this command if you want to keep old posts:

```bash
docker compose down -v
```

The `-v` option deletes Docker volumes, so it deletes MongoDB/MinIO saved data.

## How to run

From the project root:

```bash
docker compose up --build --scale api=3
```

Open:

- App: `http://localhost:8080`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

MinIO credentials:

- username: `minioadmin`
- password: `minioadmin123`

## Default seeded accounts

- Creator: `creator@photosphere.local` / `password123`
- Consumer: `consumer@photosphere.local` / `password123`

## Why the architecture name is not “microservices”

Although the deployment now has several infrastructure services, the business logic is still inside a single Node.js API service. So the most accurate name is:

**containerized n-tier architecture with reverse proxy, stateless API replicas, cache, object storage, and database services**

It is more scalable than the original 3-tier version, but it is not a full microservices decomposition.
