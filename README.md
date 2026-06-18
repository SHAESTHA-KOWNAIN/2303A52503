# Campus Evaluation Full Stack Application

## Overview

This repository contains a full-stack notification management system consisting of:

* **Logging Middleware** – reusable TypeScript logging package
* **Backend Service** – REST API for notifications
* **Frontend Application** – React + TypeScript notification dashboard
* **System Design Document** – architecture and scalability design

## Repository Structure

```text
.
├── logging-middleware/
├── notification-app-be/
├── notification-app-fe/
├── notification-system-design.md
└── README.md
```

## Features

### Logging Middleware

* Reusable logging package
* Supports:

  * debug
  * info
  * warn
  * error
  * fatal
* Centralized log API integration
* TypeScript support

### Backend

* Express.js + TypeScript
* Notification APIs
* Pagination support
* Notification filtering
* Priority notification endpoint
* Logging middleware integration

### Frontend

* React + TypeScript
* Material UI
* Notification listing
* Notification filtering
* Priority notifications view
* Responsive UI

## API Endpoints

### Get Notifications

```http
GET /notifications
```

Query Parameters:

* limit
* page
* notification_type

### Get Priority Notifications

```http
GET /notifications/top
```

### Mark Notification as Read

```http
POST /notifications/:id/read
```

## Installation

### Backend

```bash
cd notification-app-be
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

### Frontend

```bash
cd notification-app-fe
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Build

Backend:

```bash
cd notification-app-be
npm run build
```

Frontend:

```bash
cd notification-app-fe
npm run build
```

## System Design

Detailed architecture, API contracts, database design, scaling strategies, indexing, caching, and priority inbox implementation are documented in:

```text
notification-system-design.md
```

## Technology Stack

### Frontend

* React
* TypeScript
* Material UI
* Vite

### Backend

* Node.js
* Express
* TypeScript

### Logging

* Custom reusable TypeScript middleware

## License

GPL-3.0
