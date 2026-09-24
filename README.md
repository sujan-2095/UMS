# User Management System (UMS)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![RBAC](https://img.shields.io/badge/Security-RBAC%20%7C%20JWT-red.svg)](#role-based-access-control-rbac)
[![Build Status](https://img.shields.io/badge/Build-Passing-success.svg)](#build--verification-status)

A production-grade, full-stack **User Management System (UMS)** built with **Spring Boot 3**, **React 19**, **TypeScript**, and **MySQL 8**. The system delivers secure identity management featuring stateless JSON Web Token (JWT) authentication, salted BCrypt password hashing, and strict Role-Based Access Control (**ADMIN** vs. **USER**).

---

## Table of Contents

- [Current State & Recent Updates](#current-state--recent-updates)
- [System Architecture](#system-architecture)
- [Project Directory Structure](#project-directory-structure)
- [Prerequisites & Requirements](#prerequisites--requirements)
- [Database Setup](#database-setup)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Quick Start Guide](#quick-start-guide)
  - [1. Backend Setup](#1-backend-setup-spring-boot)
  - [2. Frontend Setup](#2-frontend-setup-react--vite)
- [Default Seed Administrator](#default-seed-administrator)
- [Role-Based Access Control (RBAC) Matrix](#role-based-access-control-rbac-matrix)
- [REST API Documentation](#rest-api-documentation)
- [Global Error Handling](#global-error-handling)
- [Automated Testing Compatibility (Selenium & Postman)](#automated-testing-compatibility-selenium--postman)
- [Build & Verification Status](#build--verification-status)

---

## Current State & Recent Updates

The project has transitioned from a dual-stack experimental prototype into a clean, unified production monorepo:

1. **Clean Directory Separation**:
   - The workspace is cleanly split into two dedicated directories: `backend/` (Spring Boot 3) and `frontend/` (React 19 + TypeScript + Vite).
   - Removed all legacy in-root frontend configurations and obsolete duplicate scripts.

2. **Single Unified Backend & Database**:
   - Fully eliminated the experimental Node.js/Express server and the file-based `users.json` mock database.
   - All persistence is centralized in MySQL (`ums_db`) through Spring Data JPA / Hibernate.

3. **RBAC Hardening & Privilege Escalation Prevention**:
   - User creation by administrators (`POST /api/users`) strictly assigns `Role.USER`, preventing accidental administrative privilege elevation.
   - Self-deletion guard in `UserService.java` protects currently authenticated administrators from deleting their own accounts.
   - Non-admin users are restricted to read-only access on the user directory.

4. **Standardized Input Validation**:
   - Enforced a uniform minimum 8-character password constraint across both the backend (`@Size(min = 8)` in Jakarta Bean Validation) and frontend forms (`Register.tsx`, `UsersList.tsx`).

5. **Flexible Environment Configuration**:
   - `application.properties` supports external environment variable overrides (`PORT`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION_MS`, `INITIAL_ADMIN_*`, and `CORS_ALLOWED_ORIGINS`).

6. **Modern Frontend Integration**:
   - Powered by React 19, TypeScript, Tailwind CSS v4, Lucide React icons, and Framer Motion transitions.
   - Development server on port `3000` with an automatic reverse proxy for `/api` routing to `http://localhost:8080`.

---

## System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│    (TypeScript, Vite, React Router DOM v7, Context)    │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON Requests
                           │ Authorization: Bearer <JWT>
                           ▼
┌────────────────────────────────────────────────────────┐
│             Spring Boot 3.2.4 Backend (Port 8080)       │
│                                                        │
│  [Security Layer]                                      │
│    ├── JwtAuthenticationFilter (Extracts/verifies JWT) │
│    └── SecurityFilterChain (Role authorizations)       │
│                                                        │
│  [Controller Layer]                                    │
│    ├── AuthController (/api/auth/register, login)      │
│    └── UserController (/api/users, GET/POST/DELETE)    │
│                                                        │
│  [Service Layer]                                       │
│    ├── AuthService (Register, login, BCrypt hashing)   │
│    ├── UserService (Listing, creation, self-delete guard)
│    └── JwtService (HMAC-SHA256 token generation/claims)│
│                                                        │
│  [Persistence Layer]                                   │
│    └── UserRepository (Spring Data JPA / Hibernate)    │
└──────────────────────────┬─────────────────────────────┘
                           │ JDBC / MySQL Dialect
                           ▼
┌────────────────────────────────────────────────────────┐
│                 MySQL 8.0+ Database                    │
│                 Database: ums_db                       │
│                 Table: users                           │
└────────────────────────────────────────────────────────┘
```

---

## Project Directory Structure

```text
UMS/
├── .gitignore
├── metadata.json
├── README.md
│
├── backend/                               # Spring Boot 3 REST API
│   ├── pom.xml                            # Maven dependencies & build configuration
│   └── src/main/
│       ├── java/com/example/ums/
│       │   ├── config/
│       │   │   ├── CorsConfig.java        # Cross-Origin Resource Sharing configuration
│       │   │   └── DataInitializer.java   # Auto-seeds default ADMIN on first startup
│       │   ├── controller/
│       │   │   ├── AuthController.java    # /api/auth endpoints (register, login)
│       │   │   └── UserController.java    # /api/users endpoints (list, create, delete)
│       │   ├── dto/
│       │   │   ├── CreateUserRequest.java # Admin user creation payload
│       │   │   ├── ErrorResponse.java     # Standardized JSON error response
│       │   │   ├── LoginRequest.java      # Login payload
│       │   │   ├── LoginResponse.java     # Login response payload with JWT
│       │   │   ├── RegisterRequest.java   # Registration payload
│       │   │   └── UserResponse.java      # Sanitized user response (no password hash)
│       │   ├── entity/
│       │   │   ├── Role.java              # ADMIN and USER enum
│       │   │   └── User.java              # JPA Entity mapped to MySQL `users` table
│       │   ├── exception/
│       │   │   ├── DuplicateResourceException.java
│       │   │   ├── GlobalExceptionHandler.java # Centralized @RestControllerAdvice
│       │   │   ├── ResourceNotFoundException.java
│       │   │   └── UnauthorizedException.java
│       │   ├── repository/
│       │   │   └── UserRepository.java    # Spring Data JPA repository
│       │   ├── security/
│       │   │   ├── CustomUserDetailsService.java
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   ├── JwtService.java        # HMAC-SHA256 JWT generator & validator
│       │   │   └── SecurityConfig.java    # Stateless security filter chain
│       │   ├── service/
│       │   │   ├── AuthService.java       # User registration & authentication logic
│       │   │   └── UserService.java       # User management & self-deletion guard logic
│       │   └── UmsApplication.java        # Spring Boot main entry point
│       └── resources/
│           └── application.properties     # Database, JWT, seed, & CORS configuration
│
└── frontend/                              # React 19 Single Page Application
    ├── index.html                         # SPA entry HTML
    ├── package.json                       # Dependencies & build scripts
    ├── tsconfig.json                      # TypeScript configuration
    ├── vite.config.ts                     # Vite config with dev proxy (port 3000 -> 8080)
    └── src/
        ├── api/
        │   └── api.ts                     # Fetch client with JWT injection & error parsing
        ├── components/
        │   ├── Navbar.tsx                 # Navigation bar with user badge & logout
        │   └── ProtectedRoute.tsx         # Route guard redirecting unauthenticated users
        ├── context/
        │   └── AuthContext.tsx            # React authentication state provider
        ├── pages/
        │   ├── Dashboard.tsx              # Welcome dashboard & quick navigation
        │   ├── Login.tsx                  # Login form with client validation
        │   ├── Register.tsx               # Registration form with 8+ char password check
        │   └── UsersList.tsx              # Users table with Admin Add/Delete modals
        ├── types/
        │   └── index.ts                   # TypeScript interfaces (User, Role, ApiError)
        ├── App.tsx                        # React Router routing setup
        ├── index.css                      # Tailwind CSS v4 directives
        └── main.tsx                       # React application bootstrap
```

---

## Prerequisites & Requirements

- **Java**: OpenJDK 17 or higher
- **Maven**: 3.8 or higher
- **Node.js**: v18+ or v20+ (LTS recommended)
- **npm**: v9 or higher
- **MySQL**: 8.0 or higher

---

## Database Setup

### 1. Create the Database

Connect to your MySQL server (via CLI, MySQL Workbench, or your preferred client):

```sql
CREATE DATABASE IF NOT EXISTS ums_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Table Schema (`users`)

Spring Data JPA / Hibernate automatically verifies and creates the table schema on startup (`spring.jpa.hibernate.ddl-auto=update`):

```sql
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

---

## Configuration & Environment Variables

The backend configuration is managed in `backend/src/main/resources/application.properties`. Every parameter has a default fallback and can be overridden via system environment variables:

| Property Name | Environment Variable | Default Value | Description |
|---|---|---|---|
| `server.port` | `PORT` | `8080` | Spring Boot server port |
| `spring.datasource.url` | `DB_URL` | `jdbc:mysql://localhost:3306/ums_db?...` | MySQL JDBC connection string |
| `spring.datasource.username` | `DB_USERNAME` | `root` | MySQL username |
| `spring.datasource.password` | `DB_PASSWORD` | `root` | MySQL password |
| `ums.jwt.secret` | `JWT_SECRET` | `404E635266556...` | 256-bit secret key for HMAC-SHA256 |
| `ums.jwt.expiration-ms` | `JWT_EXPIRATION_MS` | `86400000` | JWT token validity in ms (24 hours) |
| `ums.init.admin.email` | `INITIAL_ADMIN_EMAIL` | `admin@test.com` | Seed administrator email |
| `ums.init.admin.password` | `INITIAL_ADMIN_PASSWORD`| `Admin@123` | Seed administrator initial password |
| `ums.init.admin.name` | `INITIAL_ADMIN_NAME` | `System Administrator` | Seed administrator display name |
| `ums.cors.allowed-origins`| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed origins for cross-domain calls |

---

## Quick Start Guide

### 1. Backend Setup (Spring Boot)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Verify that your MySQL instance is running and reachable on port `3306`.
3. Compile and start the backend service:
   ```bash
   mvn clean spring-boot:run
   ```
4. The Spring Boot API will start on **`http://localhost:8080`**.

### 2. Frontend Setup (React + Vite)

1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at **`http://localhost:3000`**. Requests to `/api` are automatically proxied to `http://localhost:8080`.

---

## Default Seed Administrator

Upon application startup, `DataInitializer.java` checks whether the initial administrator account exists in MySQL. If absent, it automatically seeds:

- **Email**: `admin@test.com`
- **Password**: `Admin@123`
- **Role**: `ADMIN`

---

## Role-Based Access Control (RBAC) Matrix

| Feature / Action | Route / Endpoint | HTTP Method | Public | Role: USER | Role: ADMIN |
|---|---|---|:---:|:---:|:---:|
| User Registration | `/api/auth/register` | `POST` | Allowed | Allowed | Allowed |
| User Login | `/api/auth/login` | `POST` | Allowed | Allowed | Allowed |
| Access Dashboard | `/dashboard` | UI Route | Blocked | Allowed | Allowed |
| View Users List | `/api/users` | `GET` | Blocked (`401`) | Allowed (`200`) | Allowed (`200`) |
| Add New User | `/api/users` | `POST` | Blocked (`401`) | Forbidden (`403`) | Allowed (`201`) |
| Delete User | `/api/users/{id}` | `DELETE` | Blocked (`401`) | Forbidden (`403`) | Allowed (`200`) |
| Delete Current Admin Account | `/api/users/{id}` | `DELETE` | Blocked (`401`) | Forbidden (`403`) | Blocked (`400`) |

---

## REST API Documentation

### 1. Register User

```http
POST /api/auth/register
```

- **Authentication**: None (Public)
- **Role**: Any (Assigned `USER` role automatically)

#### Request Body
```json
{
  "name": "Sujan",
  "email": "sujan@example.com",
  "password": "Password@123"
}
```

#### Response: `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "name": "Sujan",
    "email": "sujan@example.com",
    "role": "USER",
    "createdAt": "2026-09-24T10:00:00",
    "updatedAt": "2026-09-24T10:00:00"
  }
}
```

#### Status Codes:
- `201 Created`: Registration successful
- `400 Bad Request`: Validation failure (empty field, invalid email, password < 8 characters)
- `409 Conflict`: Email already exists

---

### 2. Login

```http
POST /api/auth/login
```

- **Authentication**: None (Public)

#### Request Body
```json
{
  "email": "sujan@example.com",
  "password": "Password@123"
}
```

#### Response: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Sujan",
    "email": "sujan@example.com",
    "role": "USER"
  }
}
```

#### Status Codes:
- `200 OK`: Login successful
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials

---

### 3. Get All Users

```http
GET /api/users
```

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Role**: `ADMIN` or `USER`

#### Response: `200 OK`
```json
[
  {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@test.com",
    "role": "ADMIN",
    "createdAt": "2026-09-24T06:00:00",
    "updatedAt": "2026-09-24T06:00:00"
  },
  {
    "id": 2,
    "name": "Sujan",
    "email": "sujan@example.com",
    "role": "USER",
    "createdAt": "2026-09-24T10:00:00",
    "updatedAt": "2026-09-24T10:00:00"
  }
]
```

#### Status Codes:
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Missing or invalid JWT

---

### 4. Add User (Admin Only)

```http
POST /api/users
```

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Role**: `ADMIN` only

#### Request Body
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword@123"
}
```

#### Response: `201 Created`
```json
{
  "id": 3,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "USER",
  "createdAt": "2026-09-24T11:00:00",
  "updatedAt": "2026-09-24T11:00:00"
}
```

#### Status Codes:
- `201 Created`: User created successfully
- `400 Bad Request`: Validation failure (e.g., password < 8 characters)
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: Authenticated user lacks `ADMIN` role
- `409 Conflict`: Email already exists

---

### 5. Delete User (Admin Only)

```http
DELETE /api/users/{id}
```

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Role**: `ADMIN` only
- **Self-Deletion Guard**: Returns `400 Bad Request` if an administrator attempts to delete their own account.

#### Response: `200 OK`
```json
{
  "message": "User deleted successfully",
  "deletedUserId": 3
}
```

#### Status Codes:
- `200 OK`: User deleted successfully
- `400 Bad Request`: Invalid ID or attempted self-deletion
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: Authenticated user lacks `ADMIN` role
- `404 Not Found`: User does not exist

---

## Global Error Handling

All backend exceptions are intercepted by `GlobalExceptionHandler` and returned as a standard JSON object:

```json
{
  "timestamp": "2026-09-24T10:15:30.123",
  "status": 409,
  "error": "Conflict",
  "message": "Email is already registered: user@example.com"
}
```

### Exception to Status Code Mapping

| Exception | HTTP Status Code | Description |
|---|:---:|---|
| `MethodArgumentNotValidException` | `400 Bad Request` | Form field constraint failure (`@NotBlank`, `@Size`, `@Email`) |
| `IllegalArgumentException` | `400 Bad Request` | Business rule violation (e.g. self-deletion attempt) |
| `BadCredentialsException` / `UnauthorizedException` | `401 Unauthorized` | Invalid login credentials |
| `AccessDeniedException` | `403 Forbidden` | Insufficient role permissions |
| `ResourceNotFoundException` | `404 Not Found` | Requested user ID does not exist |
| `DuplicateResourceException` | `409 Conflict` | Unique email collision in database |
| `Exception` (Unhandled) | `500 Internal Server Error` | Unexpected server exception |

---

## Automated Testing Compatibility (Selenium & Postman)

All key interactive components are tagged with permanent, deterministic `id` and `data-testid` attributes to support automated testing without brittle selectors:

| Element Description | HTML `id` | `data-testid` | Source File |
|---|---|---|---|
| Register Name Input | `name-input` | `register-name` | `Register.tsx` |
| Register Email Input | `email-input` | `register-email` | `Register.tsx` |
| Register Password Input | `password-input` | `register-password` | `Register.tsx` |
| Register Confirm Password Input | `confirm-password-input` | `register-confirm-password` | `Register.tsx` |
| Register Submit Button | `register-submit-btn` | `register-submit` | `Register.tsx` |
| Login Email Input | `login-email-input` | `login-email` | `Login.tsx` |
| Login Password Input | `login-password-input` | `login-password` | `Login.tsx` |
| Login Submit Button | `login-submit-btn` | `login-submit` | `Login.tsx` |
| Users Table Element | `user-table` | `user-table` | `UsersList.tsx` |
| User Row Item | `user-row-{id}` | `user-row-{id}` | `UsersList.tsx` |
| Add User Button | `add-user-btn` | `add-user-button` | `UsersList.tsx` |
| Modal New User Name Input | `new-user-name` | `new-user-name` | `UsersList.tsx` |
| Modal New User Email Input | `new-user-email` | `new-user-email` | `UsersList.tsx` |
| Modal New User Password Input | `new-user-password` | `new-user-password` | `UsersList.tsx` |
| Modal Create User Submit Button | `create-user-submit-btn` | `create-user-submit` | `UsersList.tsx` |
| Table Delete User Button | `delete-user-{id}` | `delete-user-{id}` | `UsersList.tsx` |
| Modal Confirm Delete Button | `confirm-delete-btn` | `confirm-delete` | `UsersList.tsx` |
| Modal Cancel Delete Button | `cancel-delete-btn` | `cancel-delete` | `UsersList.tsx` |
| Navigation / Header Logout Button | `logout-btn` | `logout-button` | `Navbar.tsx` |
| Current User Role Badge | `user-role-badge` | `user-role-badge` | `Navbar.tsx` & `Dashboard.tsx` |

---

## Build & Verification Status

Both frontend and backend modules have been verified and compile cleanly:

### Backend Build
```bash
cd backend
mvn clean compile
```
- **Status**: **BUILD SUCCESS** (Java 17, Spring Boot 3.2.4, 24 source classes compiled with 0 errors).

### Frontend Build & Lint
```bash
cd frontend
npm run lint    # runs tsc --noEmit
npm run build   # runs vite build
```
- **TypeScript Linting**: **SUCCESS** (0 type errors).
- **Vite Production Build**: **SUCCESS** (Clean distribution bundle generated in `dist/`).
