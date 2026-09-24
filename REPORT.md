# User Management System (UMS) — Comprehensive Project Report

**Document Title:** Comprehensive Project Specification, Architecture, Behavior & API Report  
**Project Name:** User Management System (UMS)  
**Technology Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 | Spring Boot 3.2.4 + Spring Security 6 + Spring Data JPA | MySQL 8.0  
**Current Version:** 1.0.0 (Production-Ready V1 Monorepo)  
**Repository:** [github.com/sujan-2095/UMS](https://github.com/sujan-2095/UMS)  
**Last Updated:** 2026-09-24  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Recent Changes & Architectural Evolution](#2-recent-changes--architectural-evolution)
3. [System Architecture & Monorepo Structure](#3-system-architecture--monorepo-structure)
4. [Features & Functional Capabilities](#4-features--functional-capabilities)
5. [End-to-End System Workflows & Behavior](#5-end-to-end-system-workflows--behavior)
6. [Role-Based Access Control (RBAC) Matrix](#6-role-based-access-control-rbac-matrix)
7. [Comprehensive REST API Documentation](#7-comprehensive-rest-api-documentation)
8. [Global Error Handling & Status Code Mapping](#8-global-error-handling--status-code-mapping)
9. [Database Schema & Data Models](#9-database-schema--data-models)
10. [Configuration & Environment Variables](#10-configuration--environment-variables)
11. [Deterministic Test Selectors (Selenium & Postman)](#11-deterministic-test-selectors-selenium--postman)
12. [Build & Verification Status](#12-build--verification-status)
13. [Continuous Maintenance Log & Audit Trail](#13-continuous-maintenance-log--audit-trail)

---

## 1. Executive Summary

The **User Management System (UMS)** is an enterprise-grade full-stack identity and access management platform. It provides role-based authentication, user provisioning, access control, and directory management.

Key operational highlights:
- **Stateless Token-Based Authentication**: Implemented via HMAC-SHA256 signed JSON Web Tokens (JWT) with 24-hour expiration.
- **Robust Security**: BCrypt salted password hashing with work factor 10, automated route protection, and role-based request filtering.
- **Role-Based Access Control (RBAC)**: Segregated permissions between `ADMIN` (full provisioning and deletion capabilities) and `USER` (read-only self and directory visibility).
- **Hardened Guards**: Built-in protections against self-deletion for active administrators and hardcoded non-admin privilege assignment for admin-created accounts to eliminate accidental privilege escalation.
- **Automated Testing Ready**: Full coverage of deterministic `id` and `data-testid` HTML attributes across all interactive components for test suites built with Selenium WebDriver or Postman.

---

## 2. Recent Changes & Architectural Evolution

| Category | Description | Rationale & Impact |
|---|---|---|
| **Directory Reorganization** | Segregated codebase into `/backend` (Spring Boot) and `/frontend` (React + Vite). | Establishes a clean monorepo architecture, eliminating root-level file clutter. |
| **Node.js Server Removal** | Deleted legacy experimental Node.js/Express server (`server.ts`, `src/server/`), removed file-based `users.json`, and purged obsolete npm packages. | Establishes Spring Boot 3 + MySQL as the sole, authoritative backend engine. |
| **Admin Privilege Guard** | Restricted `UserService.createUser` so admin-created accounts are strictly assigned `Role.USER`. Removed role selector from `UsersList.tsx` modal. | Prevents accidental elevation of privileges or insecure admin account generation from UI. |
| **Self-Deletion Guard** | Integrated identity check in `UserService.deleteUser` that cross-references the targeted user's email with `Authentication.getName()`. | Prevents administrators from locking themselves out by deleting their active accounts. |
| **Password Validation Standard** | Harmonized password rules to require a minimum of 8 characters in both backend (`@Size(min = 8)`) and frontend forms (`Register.tsx`, `UsersList.tsx`). | Ensures consistent validation feedback and eliminates client-server validation discrepancies. |
| **Vite Development Proxy** | Configured `frontend/vite.config.ts` to host dev server on port `3000` and proxy `/api` calls directly to `http://localhost:8080`. | Solves CORS challenges during local development while supporting zero-config production builds. |
| **Git Repository Tracking** | Initialized git repository, created `main` branch, and published to remote origin `https://github.com/sujan-2095/UMS.git`. | Version control tracking and reproducible remote deployment source established. |

---

## 3. System Architecture & Monorepo Structure

### 3.1 Architectural Flow

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

### 3.2 Workspace File Hierarchy

```text
UMS/
├── .gitignore                             # Monorepo git ignore rules
├── metadata.json                          # Workspace metadata configuration
├── README.md                              # Public documentation & setup instructions
├── REPORT.md                              # Authoritative project & behavior report (This file)
│
├── backend/                               # Spring Boot 3 Java Service
│   ├── pom.xml                            # Maven dependencies & plugins
│   └── src/main/
│       ├── java/com/example/ums/
│       │   ├── config/
│       │   │   ├── CorsConfig.java        # CORS allowed origins & headers
│       │   │   └── DataInitializer.java   # Seeds initial admin (admin@test.com)
│       │   ├── controller/
│       │   │   ├── AuthController.java    # /api/auth/register and /api/auth/login
│       │   │   └── UserController.java    # /api/users endpoints
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

## 4. Features & Functional Capabilities

### 4.1 Authentication & Session Management
- **Public Registration**: Self-registration for new accounts. Automatically assigned `USER` role.
- **Secure Login**: Credential verification against salted BCrypt hashes. Issues signed JWT on success.
- **Stateless Persistence**: Tokens and basic profiles stored in browser `localStorage`. Hydrated on page reload.
- **Client Route Protection**: `ProtectedRoute` intercepts unauthenticated attempts to view `/dashboard` or `/users` and redirects to `/login`.
- **Instant Logout**: Flushes cached JWT tokens and resets client application state immediately.

### 4.2 User Management & Administration
- **Sanitized Directory Listing**: Both `ADMIN` and `USER` roles can view registered users. Sensitive fields (passwords) are scrubbed.
- **Admin User Provisioning**: Admins can provision new accounts from within the management view without logging out.
- **Account Removal**: Admins can delete users with double-confirmation dialogs.
- **Self-Deletion Safeguard**: An active administrator cannot delete their own account.
- **Real-Time Client Filtering**: Client-side instant search filter by name or email in the user directory table.

### 4.3 User Interface & Experience
- **Responsive Layout**: Designed with Tailwind CSS v4 and flexbox/grid components.
- **Role Indicators**: Color-coded badges (`ADMIN` in purple, `USER` in blue) displayed in navbar and user rows.
- **Contextual Actions**: Action buttons ("Add User", "Delete") are completely hidden from regular users in the UI, and reinforced by 403 Forbidden backend checks.

---

## 5. End-to-End System Workflows & Behavior

### Workflow 1: Public User Registration
1. Visitor navigates to `/register` and submits Name, Email, Password, and Confirm Password.
2. Frontend verifies non-empty inputs, valid email format, matching passwords, and length $\ge 8$ characters.
3. Client dispatches `POST /api/auth/register`.
4. Backend `RegisterRequest` validates constraints (`@NotBlank`, `@Email`, `@Size(min = 8)`).
5. `AuthService` normalizes email to lowercase and checks uniqueness via `UserRepository.existsByEmail()`.
6. If unique, password is encrypted via `BCryptPasswordEncoder` and role is explicitly set to `Role.USER`.
7. Entity saved to MySQL; `201 Created` returned with sanitized `UserResponse`.
8. User is redirected to `/login` with a success alert.

### Workflow 2: User Login & Session Initialization
1. User enters Email and Password on `/login` and clicks **Sign In**.
2. Client dispatches `POST /api/auth/login`.
3. Backend retrieves user by lowercase email; verifies raw password using `passwordEncoder.matches()`.
4. If valid, `JwtService.generateToken()` signs an HMAC-SHA256 JWT containing claims (`sub`, `userId`, `role`) with 24-hour validity.
5. Returns `200 OK` with payload `{ token, user }`.
6. Frontend `AuthContext` writes `ums_token` and `ums_user` to `localStorage` and updates authentication state.
7. User is routed to `/dashboard`.

### Workflow 3: Users Directory Fetch
1. Authenticated user navigates to `/users`.
2. Frontend dispatches `GET /api/users` with header `Authorization: Bearer <token>`.
3. `JwtAuthenticationFilter` intercepts the request, verifies token signature and expiration, loads user details, and populates `SecurityContextHolder`.
4. `SecurityConfig` verifies caller possesses `ROLE_ADMIN` or `ROLE_USER`.
5. `UserService.getAllUsers()` queries MySQL and maps records to `UserResponse` DTOs.
6. Returns `200 OK` JSON array. Frontend renders user table.

### Workflow 4: Administrator User Provisioning
1. Admin user clicks **Add New User** button on `/users`.
2. Admin inputs Name, Email, and temporary Password into modal and submits.
3. Frontend dispatches `POST /api/users` with bearer token.
4. `SecurityFilterChain` verifies caller has `ROLE_ADMIN`. If a regular user calls this, `403 Forbidden` is returned.
5. `UserService.createUser()` verifies email uniqueness, encodes password, sets `role = Role.USER`, and saves record.
6. Returns `201 Created`. Modal closes, success notification displays, and table refreshes.

### Workflow 5: Administrator User Deletion
1. Admin user clicks **Delete** button on a specific user row.
2. Confirmation modal appears displaying the targeted user's name and email.
3. Upon confirmation, client dispatches `DELETE /api/users/{id}` with bearer token.
4. `SecurityFilterChain` checks `ROLE_ADMIN`.
5. `UserService.deleteUser()` resolves user by ID. It compares the target user's email with `Authentication.getName()`.
   - If target email matches the current admin email: Throws `IllegalArgumentException("Cannot delete the currently authenticated administrator account")` returning `400 Bad Request`.
   - If target is another account: Executes `userRepository.deleteById(id)`.
6. Returns `200 OK` with `{ message, deletedUserId }`. Frontend removes user from the active table.

---

## 6. Role-Based Access Control (RBAC) Matrix

| Operation / Resource | HTTP Endpoint / Route | Method | Public / Unauth | Role: `USER` | Role: `ADMIN` |
|---|---|:---:|:---:|:---:|:---:|
| **Public Registration** | `/api/auth/register` | `POST` | Allowed | Allowed | Allowed |
| **Authentication / Login** | `/api/auth/login` | `POST` | Allowed | Allowed | Allowed |
| **Access Dashboard View** | `/dashboard` | UI Route | Blocked (Redirects) | Allowed | Allowed |
| **View Users Directory** | `/api/users` | `GET` | Blocked (`401`) | Allowed (`200`) | Allowed (`200`) |
| **Create User Account** | `/api/users` | `POST` | Blocked (`401`) | Forbidden (`403`) | Allowed (`201`) |
| **Delete Other User** | `/api/users/{id}` | `DELETE` | Blocked (`401`) | Forbidden (`403`) | Allowed (`200`) |
| **Delete Self (Admin Account)** | `/api/users/{id}` | `DELETE` | Blocked (`401`) | Forbidden (`403`) | Blocked (`400`) |

---

## 7. Comprehensive REST API Documentation

### 7.1 Register User
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Headers**: `Content-Type: application/json`

#### Request Payload
```json
{
  "name": "Sujan",
  "email": "sujan@example.com",
  "password": "Password@123"
}
```

#### Response (`201 Created`)
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "name": "Sujan",
    "email": "sujan@example.com",
    "role": "USER",
    "createdAt": "2026-09-24T18:00:00",
    "updatedAt": "2026-09-24T18:00:00"
  }
}
```

---

### 7.2 Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Headers**: `Content-Type: application/json`

#### Request Payload
```json
{
  "email": "sujan@example.com",
  "password": "Password@123"
}
```

#### Response (`200 OK`)
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

---

### 7.3 Get All Users
- **Endpoint**: `GET /api/users`
- **Access**: Authenticated (`ADMIN` or `USER`)
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
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
    "createdAt": "2026-09-24T18:00:00",
    "updatedAt": "2026-09-24T18:00:00"
  }
]
```

---

### 7.4 Add User (Admin Only)
- **Endpoint**: `POST /api/users`
- **Access**: Authenticated (`ADMIN` only)
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

#### Request Payload
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "TemporaryPassword@123"
}
```

#### Response (`201 Created`)
```json
{
  "id": 3,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "USER",
  "createdAt": "2026-09-24T18:05:00",
  "updatedAt": "2026-09-24T18:05:00"
}
```

---

### 7.5 Delete User (Admin Only)
- **Endpoint**: `DELETE /api/users/{id}`
- **Access**: Authenticated (`ADMIN` only)
- **Headers**: `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "message": "User deleted successfully",
  "deletedUserId": 3
}
```

---

## 8. Global Error Handling & Status Code Mapping

All exceptions thrown across the backend service are intercepted by `GlobalExceptionHandler` (`@RestControllerAdvice`) and converted into uniform JSON payloads:

```json
{
  "timestamp": "2026-09-24T18:15:30.123",
  "status": 409,
  "error": "Conflict",
  "message": "Email is already registered: sujan@example.com"
}
```

### Exception Status Code Mapping

| Exception Class | Trigger Condition | Status Code | Standard Response Message |
|---|---|:---:|---|
| `MethodArgumentNotValidException` | Input validation failure (`@NotBlank`, `@Email`, `@Size`) | `400 Bad Request` | List of field constraint error messages |
| `IllegalArgumentException` | Self-deletion attempt by current administrator | `400 Bad Request` | `"Cannot delete the currently authenticated administrator account"` |
| `BadCredentialsException` | Invalid email or password during login | `401 Unauthorized` | `"Invalid email or password"` |
| `UnauthorizedException` | Invalid or absent credentials | `401 Unauthorized` | Specific authentication error description |
| `AuthenticationEntryPoint` | Missing or expired JWT bearer token | `401 Unauthorized` | `"Full authentication is required to access this resource"` |
| `AccessDeniedException` | User role lacks permission (e.g. `USER` deleting a user) | `403 Forbidden` | `"Access denied: You do not have sufficient role permissions"` |
| `ResourceNotFoundException` | User ID not found in database | `404 Not Found` | `"User not found with id: <id>"` |
| `DuplicateResourceException` | Email address already exists | `409 Conflict` | `"Email is already registered: <email>"` |
| `Exception` (General) | Unexpected system failure | `500 Internal Error` | `"An unexpected internal server error occurred"` |

---

## 9. Database Schema & Data Models

### 9.1 Relational Schema (`ums_db.users`)

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

### 9.2 Entity Attributes
- `id`: Auto-incrementing 64-bit integer (`BIGINT`). Primary Key.
- `name`: Full name string (`VARCHAR(100)`).
- `email`: Normalized lowercase unique email address (`VARCHAR(150)`). Indexed uniquely.
- `password`: Salted BCrypt hash string (`VARCHAR(255)`).
- `role`: Enum value (`VARCHAR(20)`) storing either `ADMIN` or `USER`.
- `created_at`: Creation timestamp generated via `@PrePersist`.
- `updated_at`: Last modification timestamp refreshed via `@PreUpdate`.

---

## 10. Configuration & Environment Variables

All settings in `backend/src/main/resources/application.properties` provide production defaults while allowing system environment variable overrides:

| Configuration Key | Env Variable Override | Default Fallback | Purpose |
|---|---|---|---|
| `server.port` | `PORT` | `8080` | Spring Boot HTTP port |
| `spring.datasource.url` | `DB_URL` | `jdbc:mysql://localhost:3306/ums_db?...` | JDBC connection URL |
| `spring.datasource.username` | `DB_USERNAME` | `root` | Database username |
| `spring.datasource.password` | `DB_PASSWORD` | `root` | Database password |
| `ums.jwt.secret` | `JWT_SECRET` | `404E635266556...` | 256-bit secret for HMAC-SHA256 |
| `ums.jwt.expiration-ms` | `JWT_EXPIRATION_MS` | `86400000` | Token lifespan (24 hours in ms) |
| `ums.init.admin.email` | `INITIAL_ADMIN_EMAIL` | `admin@test.com` | Seed admin email address |
| `ums.init.admin.password` | `INITIAL_ADMIN_PASSWORD` | `Admin@123` | Seed admin default password |
| `ums.init.admin.name` | `INITIAL_ADMIN_NAME` | `System Administrator` | Seed admin display name |
| `ums.cors.allowed-origins` | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Permitted origins for web clients |

---

## 11. Deterministic Test Selectors (Selenium & Postman)

All key interactive components are tagged with permanent, deterministic `id` and `data-testid` attributes to support automated testing without brittle selectors:

| Element Description | HTML `id` | `data-testid` | Source Component File |
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

## 12. Build & Verification Status

| Component | Verification Command | Exit Code | Verification Details |
|---|---|:---:|---|
| **Spring Boot Backend** | `mvn clean compile` | `0` | Compiled 24 Java classes cleanly without errors. Java 17 and Spring Boot 3.2.4 validated. |
| **Frontend TypeScript Lint** | `npm run lint` (`tsc --noEmit`) | `0` | Zero type errors or syntax issues across React 19 codebase. |
| **Frontend Production Build** | `npm run build` (`vite build`) | `0` | Production distribution generated cleanly in `dist/` (assets, HTML, JS bundle). |

---

## 13. Continuous Maintenance Log & Audit Trail

| Date / Timestamp | Event / Request | Changes & Updates Documented |
|---|---|---|
| **2026-09-24T18:08:30+05:30** | README Documentation Synchronization | Fully updated [README.md](file:///c:/Users/SUJAN/Documents/Placements/Testing%20-%20Juspay/UMS/README.md) to document the current monorepo structure, updated environment variables, RBAC matrices, and build statuses. |
| **2026-09-24T18:15:20+05:30** | Git Initialization & Remote Push | Established remote repository tracking on branch `main` at `https://github.com/sujan-2095/UMS.git`. |
| **2026-09-24T18:18:00+05:30** | Dedicated Report Creation | Initialized [REPORT.md](file:///c:/Users/SUJAN/Documents/Placements/Testing%20-%20Juspay/UMS/REPORT.md) with comprehensive technical documentation, features, workflows, RBAC behavior, and full API specifications. Continuous updates configured. |
