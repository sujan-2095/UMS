# UMS --- Project Handover Document

**Project:** User Management System (UMS)\
**Version:** V1.0\
**Last Updated:** 24 September 2026\
**Repository:** `https://github.com/sujan-2095/UMS`

------------------------------------------------------------------------

## 1. Purpose of This Handover

This document is the handover reference for the complete UMS project.

It explains:

-   Current project status
-   Final architecture
-   Folder structure
-   Implemented features
-   Feature behavior
-   End-to-end workflows
-   Backend business logic
-   Authentication and RBAC
-   REST APIs
-   Database structure
-   Configuration
-   Local setup
-   Running the frontend and backend
-   Important implementation rules
-   Current verification status
-   Scope boundaries
-   Next phase: external testing

The application is intentionally kept as a focused V1 User Management
System. Testing is planned as a separate activity and is not embedded
into the application.

------------------------------------------------------------------------

# 2. Current Project Status

## Overall Status

**V1 application implementation and architectural cleanup are
complete.**

The project has been refactored from the earlier experimental hybrid
architecture into:

``` text
React Frontend
      |
      | REST / JSON
      v
Spring Boot Backend
      |
      | JPA / Hibernate
      v
MySQL
```

The legacy Node.js/Express backend and JSON persistence have been
removed.

## Current Stack

### Frontend

-   React 19
-   TypeScript
-   Vite
-   React Router
-   Tailwind CSS
-   React Context API

### Backend

-   Java
-   Spring Boot 3
-   Spring Security 6
-   Spring Data JPA
-   Hibernate
-   Maven
-   JWT
-   BCrypt

### Database

-   MySQL 8
-   Database: `ums_db`
-   Main table: `users`

------------------------------------------------------------------------

# 3. Major Refactoring Already Completed

## 3.1 Single Backend Architecture

The old Node.js/Express backend was removed.

The application now uses only:

``` text
React
  |
  v
Spring Boot
  |
  v
MySQL
```

There is no second application backend.

------------------------------------------------------------------------

## 3.2 JSON Persistence Removed

The previous file-based user persistence was removed.

There is no:

``` text
data/users.json
```

or equivalent JSON database.

MySQL is the only persistent source of user data.

------------------------------------------------------------------------

## 3.3 Admin Role Creation Removed

Administrators do not select a role when creating a new user.

When an ADMIN creates an account:

``` text
ADMIN creates user
        |
        v
Role = USER
```

The role is assigned by backend business logic.

The frontend cannot promote the newly created account to ADMIN.

------------------------------------------------------------------------

## 3.4 Password Rule Standardized

Password validation is:

``` text
Minimum 8 characters
```

This rule is applied in:

-   Registration frontend
-   Registration backend
-   Admin user creation frontend
-   Admin user creation backend

------------------------------------------------------------------------

## 3.5 Dashboard Simplified

The dashboard is intentionally simple.

It provides:

-   User greeting
-   Current role
-   Navigation to relevant functionality
-   Logout

Unnecessary analytics, testing dashboards, role comparison displays, and
mock metrics are not part of V1.

------------------------------------------------------------------------

## 3.6 Stable UI Selectors

Important UI elements have stable `id` and/or `data-testid` attributes.

These selectors are retained so external Selenium automation can be
written later.

No Selenium code is embedded inside the application.

------------------------------------------------------------------------

# 4. Final Folder Structure

The intended repository structure is:

``` text
UMS/
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       │
│       ├── api/
│       │   └── api.ts
│       │
│       ├── types/
│       │   └── index.ts
│       │
│       ├── context/
│       │   └── AuthContext.tsx
│       │
│       ├── components/
│       │   ├── Navbar.tsx
│       │   └── ProtectedRoute.tsx
│       │
│       └── pages/
│           ├── Login.tsx
│           ├── Register.tsx
│           ├── Dashboard.tsx
│           └── UsersList.tsx
│
├── backend/
│   ├── pom.xml
│   │
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/example/ums/
│           │       ├── UmsApplication.java
│           │       │
│           │       ├── config/
│           │       │   ├── CorsConfig.java
│           │       │   └── DataInitializer.java
│           │       │
│           │       ├── controller/
│           │       │   ├── AuthController.java
│           │       │   └── UserController.java
│           │       │
│           │       ├── service/
│           │       │   ├── AuthService.java
│           │       │   └── UserService.java
│           │       │
│           │       ├── security/
│           │       │   ├── SecurityConfig.java
│           │       │   ├── JwtService.java
│           │       │   ├── JwtAuthenticationFilter.java
│           │       │   └── CustomUserDetailsService.java
│           │       │
│           │       ├── repository/
│           │       │   └── UserRepository.java
│           │       │
│           │       ├── entity/
│           │       │   ├── User.java
│           │       │   └── Role.java
│           │       │
│           │       ├── dto/
│           │       │   ├── RegisterRequest.java
│           │       │   ├── LoginRequest.java
│           │       │   ├── LoginResponse.java
│           │       │   ├── CreateUserRequest.java
│           │       │   ├── UserResponse.java
│           │       │   └── ErrorResponse.java
│           │       │
│           │       └── exception/
│           │           ├── GlobalExceptionHandler.java
│           │           ├── ResourceNotFoundException.java
│           │           ├── DuplicateResourceException.java
│           │           └── UnauthorizedException.java
│           │
│           └── resources/
│               └── application.properties
│
├── .env.example
├── .gitignore
├── README.md
├── REPORT.md
└── metadata.json
```

Internal vector-memory artifacts such as `.vector_memory/` and
`query_memory.py` are not part of the application.

------------------------------------------------------------------------

# 5. Application Features

## 5.1 Public Registration

Route:

``` text
/register
```

Purpose:

Allow a new user to create an account.

Fields:

``` text
Name
Email
Password
Confirm Password
```

Validation includes:

-   Required fields
-   Valid email format
-   Password minimum 8 characters
-   Password confirmation must match

The backend validates the same important constraints.

Registration always creates:

``` text
role = USER
```

A client cannot register as ADMIN.

------------------------------------------------------------------------

# 6. Login

Route:

``` text
/login
```

The user provides:

``` text
Email
Password
```

The frontend sends:

``` http
POST /api/auth/login
```

The backend:

1.  Normalizes the email.
2.  Finds the user in MySQL.
3.  Compares the supplied password against the BCrypt hash.
4.  Rejects invalid credentials.
5.  Generates a signed JWT for valid credentials.
6.  Returns the token and sanitized user information.

Successful response contains:

``` json
{
  "token": "<JWT>",
  "user": {
    "id": 2,
    "name": "Sujan",
    "email": "sujan@example.com",
    "role": "USER"
  }
}
```

Passwords are never included in the response.

------------------------------------------------------------------------

# 7. Logout

Logout is a client-side session cleanup operation for V1.

When the user logs out:

1.  JWT is removed from browser storage.
2.  Stored user information is removed.
3.  React authentication state is reset.
4.  User is redirected to `/login`.

No server-side token blacklist or revocation mechanism is implemented.

------------------------------------------------------------------------

# 8. Dashboard

Route:

``` text
/dashboard
```

The dashboard is protected.

Unauthenticated users are redirected to:

``` text
/login
```

The dashboard displays:

-   User name
-   Current role
-   Relevant navigation actions
-   Logout

ADMIN receives ADMIN-specific navigation.

USER receives USER-level navigation.

------------------------------------------------------------------------

# 9. User Directory

Route:

``` text
/users
```

Both authenticated roles can view the user directory.

API:

``` http
GET /api/users
```

The backend retrieves users from MySQL and converts entities to
`UserResponse`.

The password field is never exposed.

The frontend displays the user information in a table.

------------------------------------------------------------------------

# 10. Admin User Creation

Only ADMIN can create users.

UI:

``` text
Users
  |
  +-- Add User
```

Fields:

``` text
Name
Email
Password
```

The frontend sends:

``` http
POST /api/users
```

The backend then:

1.  Confirms the requester is ADMIN through Spring Security.
2.  Validates the request.
3.  Checks whether the email already exists.
4.  Hashes the password with BCrypt.
5.  Forces:

``` text
role = USER
```

6.  Saves the user to MySQL.
7.  Returns the created user without the password.
8.  Frontend refreshes the user table.

A USER attempting this API receives:

``` text
403 Forbidden
```

------------------------------------------------------------------------

# 11. Admin User Deletion

Only ADMIN can delete users.

API:

``` http
DELETE /api/users/{id}
```

Workflow:

``` text
ADMIN
  |
  v
Click Delete
  |
  v
Confirmation modal
  |
  v
DELETE /api/users/{id}
  |
  v
Spring Security checks ADMIN
  |
  v
UserService checks target
  |
  +---- Current admin? ----> Block
  |
  +---- Other user --------> Delete
```

The current administrator cannot delete their own account.

Self-delete results in:

``` text
400 Bad Request
```

Deleting another user returns:

``` text
200 OK
```

------------------------------------------------------------------------

# 12. Role-Based Access Control

There are exactly two application roles:

``` text
ADMIN
USER
```

## USER

Can:

-   Login
-   Logout
-   View dashboard
-   View users

Cannot:

-   Add users
-   Delete users

## ADMIN

Can:

-   Login
-   Logout
-   View dashboard
-   View users
-   Add users
-   Delete other users

Cannot:

-   Delete their own active account

------------------------------------------------------------------------

# 13. RBAC Matrix

  Operation                 Public      USER     ADMIN
  ---------------------- --------- --------- ---------
  Register                 Allowed   Allowed   Allowed
  Login                    Allowed   Allowed   Allowed
  Dashboard                Blocked   Allowed   Allowed
  View Users               Blocked   Allowed   Allowed
  Add User                 Blocked       403   Allowed
  Delete User              Blocked       403   Allowed
  Delete Current Admin     Blocked       403       400

The frontend hides ADMIN-only controls from USERs, but this is only a UI
convenience.

The backend independently enforces authorization.

------------------------------------------------------------------------

# 14. Authentication Architecture

Authentication uses JWT.

Flow:

``` text
Login
  |
  v
AuthController
  |
  v
AuthService
  |
  v
UserRepository
  |
  v
MySQL
  |
  v
BCrypt password verification
  |
  v
JwtService
  |
  v
Signed JWT
  |
  v
React
```

The frontend stores the JWT in browser `localStorage`.

For authenticated API requests:

``` http
Authorization: Bearer <JWT>
```

is attached to the request.

------------------------------------------------------------------------

# 15. JWT

JWT is signed using HMAC-SHA256.

The token contains claims including:

``` text
sub
userId
role
issued time
expiration
```

Configured token validity:

``` text
24 hours
```

The backend validates:

-   Token presence
-   Token signature
-   Token expiration
-   Associated user

------------------------------------------------------------------------

# 16. Password Security

Passwords are never stored as plain text.

Flow:

``` text
Raw Password
     |
     v
BCryptPasswordEncoder
     |
     v
BCrypt Hash
     |
     v
MySQL
```

During login:

``` text
Entered Password
       |
       v
BCrypt.matches()
       |
       v
Stored BCrypt Hash
```

The password hash is never returned through normal API responses.

------------------------------------------------------------------------

# 17. Backend Layer Responsibilities

## Controller

Responsible for:

-   Receiving HTTP requests
-   Validating request DTOs
-   Calling services
-   Returning HTTP responses

Controllers:

``` text
AuthController
UserController
```

------------------------------------------------------------------------

## Service

Contains application/business logic.

### AuthService

Responsible for:

-   Registration
-   Email normalization
-   Duplicate email checking
-   BCrypt password hashing
-   Login
-   Password verification
-   JWT generation

### UserService

Responsible for:

-   Listing users
-   Admin user creation
-   Forcing created role to USER
-   Duplicate email checking
-   User deletion
-   Admin self-delete protection

------------------------------------------------------------------------

## Repository

`UserRepository` handles database access using Spring Data JPA.

Important operations include:

``` text
findByEmail()
existsByEmail()
save()
deleteById()
```

------------------------------------------------------------------------

## Entity

`User` maps to:

``` text
users
```

in MySQL.

`Role` contains:

``` text
ADMIN
USER
```

------------------------------------------------------------------------

## DTO

DTOs prevent internal entities from being exposed directly.

Main DTOs:

``` text
RegisterRequest
LoginRequest
LoginResponse
CreateUserRequest
UserResponse
ErrorResponse
```

`UserResponse` deliberately excludes the password.

------------------------------------------------------------------------

## Security

Security package contains:

``` text
SecurityConfig
JwtService
JwtAuthenticationFilter
CustomUserDetailsService
```

Responsibilities:

-   Stateless authentication
-   JWT validation
-   Security context population
-   URL authorization
-   ADMIN/USER authorization
-   401 handling
-   403 handling

------------------------------------------------------------------------

# 18. Error Handling

The backend uses centralized exception handling through:

``` text
GlobalExceptionHandler
```

Errors are converted into structured JSON.

Example:

``` json
{
  "timestamp": "2026-09-24T18:15:30",
  "status": 409,
  "error": "Conflict",
  "message": "Email is already registered"
}
```

## Status Codes

  Status   Meaning
  -------- -------------------------------------------
  200      Successful operation
  201      Resource created
  400      Invalid request/business rule violation
  401      Authentication required/invalid
  403      Authenticated but insufficient permission
  404      User/resource not found
  409      Duplicate resource
  500      Unexpected server error

------------------------------------------------------------------------

# 19. REST API

## Register

``` http
POST /api/auth/register
```

Public.

Request:

``` json
{
  "name": "Sujan",
  "email": "sujan@example.com",
  "password": "Password@123"
}
```

Creates a USER.

------------------------------------------------------------------------

## Login

``` http
POST /api/auth/login
```

Public.

Request:

``` json
{
  "email": "sujan@example.com",
  "password": "Password@123"
}
```

Returns JWT and user information.

------------------------------------------------------------------------

## Get Users

``` http
GET /api/users
```

Requires:

``` text
ADMIN or USER
```

------------------------------------------------------------------------

## Add User

``` http
POST /api/users
```

Requires:

``` text
ADMIN
```

Created role:

``` text
USER
```

------------------------------------------------------------------------

## Delete User

``` http
DELETE /api/users/{id}
```

Requires:

``` text
ADMIN
```

Current administrator cannot delete themselves.

------------------------------------------------------------------------

# 20. Database

Database:

``` text
ums_db
```

Table:

``` text
users
```

Schema:

``` sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

## Fields

  Field        Purpose
  ------------ -------------------------
  id           Primary key
  name         User name
  email        Unique login identifier
  password     BCrypt hash
  role         ADMIN or USER
  created_at   Creation timestamp
  updated_at   Last update timestamp

------------------------------------------------------------------------

# 21. Initial Administrator

The application contains a startup initializer that checks whether the
configured administrator exists.

Default development configuration documented by the project:

``` text
Email: admin@test.com
Password: Admin@123
Role: ADMIN
```

The values are configurable through environment variables.

For any real deployment, the default password must be changed and
secrets must not be committed to source control.

------------------------------------------------------------------------

# 22. Configuration

Backend configuration is located at:

``` text
backend/src/main/resources/application.properties
```

Important configuration areas:

``` text
server.port
spring.datasource.url
spring.datasource.username
spring.datasource.password
ums.jwt.secret
ums.jwt.expiration-ms
ums.init.admin.email
ums.init.admin.password
ums.init.admin.name
ums.cors.allowed-origins
```

Environment overrides include:

``` text
PORT
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION_MS
INITIAL_ADMIN_EMAIL
INITIAL_ADMIN_PASSWORD
INITIAL_ADMIN_NAME
CORS_ALLOWED_ORIGINS
```

------------------------------------------------------------------------

# 23. Local Setup Requirements

Before starting the application, install:

### Required

``` text
Java
Maven
Node.js
npm
MySQL
Git
```

Recommended development environment:

``` text
Java 17+
Node.js LTS
MySQL 8+
```

The exact Java version should match the backend Maven/Spring Boot
configuration currently in the repository.

------------------------------------------------------------------------

# 24. Database Setup

Start MySQL.

Create the database:

``` sql
CREATE DATABASE ums_db;
```

The configured database user must have permission to access `ums_db`.

Update backend configuration/environment values:

``` text
DB_URL
DB_USERNAME
DB_PASSWORD
```

The application uses JPA/Hibernate to map the `User` entity to the
database.

------------------------------------------------------------------------

# 25. Backend Setup

Open a terminal:

``` bash
cd UMS/backend
```

Build/compile:

``` bash
mvn clean compile
```

Run:

``` bash
mvn spring-boot:run
```

Backend runs on:

``` text
http://localhost:8080
```

------------------------------------------------------------------------

# 26. Frontend Setup

Open another terminal:

``` bash
cd UMS/frontend
```

Install dependencies:

``` bash
npm install
```

Start development server:

``` bash
npm run dev
```

Frontend runs on:

``` text
http://localhost:3000
```

The Vite development proxy forwards:

``` text
/api/*
```

to:

``` text
http://localhost:8080
```

Therefore browser requests can use the backend API without requiring a
separate frontend API server.

------------------------------------------------------------------------

# 27. Startup Order

Recommended startup sequence:

``` text
1. Start MySQL
       |
       v
2. Start Spring Boot
       |
       v
3. Spring Boot connects to ums_db
       |
       v
4. DataInitializer checks/seeds admin
       |
       v
5. Start React/Vite
       |
       v
6. Open http://localhost:3000
```

------------------------------------------------------------------------

# 28. Application Navigation

Public routes:

``` text
/login
/register
```

Protected routes:

``` text
/dashboard
/users
```

If a user is not authenticated and attempts:

``` text
/dashboard
/users
```

the frontend redirects to:

``` text
/login
```

------------------------------------------------------------------------

# 29. Stable UI Selectors

The following selectors are intentionally stable for future external
Selenium automation.

  -----------------------------------------------------------------------
  Element                             `id` / `data-testid`
  ----------------------------------- -----------------------------------
  Register name                       `name-input` / `register-name`

  Register email                      `email-input` / `register-email`

  Register password                   `password-input` /
                                      `register-password`

  Confirm password                    `confirm-password-input` /
                                      `register-confirm-password`

  Register submit                     `register-submit-btn` /
                                      `register-submit`

  Login email                         `login-email-input` / `login-email`

  Login password                      `login-password-input` /
                                      `login-password`

  Login submit                        `login-submit-btn` / `login-submit`

  Users table                         `user-table`

  User row                            `user-row-{id}`

  Add user                            `add-user-btn` / `add-user-button`

  New user name                       `new-user-name`

  New user email                      `new-user-email`

  New user password                   `new-user-password`

  Create user                         `create-user-submit-btn` /
                                      `create-user-submit`

  Delete user                         `delete-user-{id}`

  Confirm delete                      `confirm-delete-btn` /
                                      `confirm-delete`

  Cancel delete                       `cancel-delete-btn` /
                                      `cancel-delete`

  Logout                              `logout-btn` / `logout-button`

  Role badge                          `user-role-badge`
  -----------------------------------------------------------------------

These are selectors only. No testing framework is embedded in the
application.

------------------------------------------------------------------------

# 30. Build Verification

The project has previously been verified with:

### Backend

``` bash
mvn clean compile
```

Expected:

``` text
BUILD SUCCESS
```

### Frontend TypeScript

``` bash
npm run lint
```

The current project uses this script for TypeScript checking
(`tsc --noEmit`), so it should be understood as a type-check command
rather than a full ESLint run.

### Frontend production build

``` bash
npm run build
```

Expected:

``` text
Production build succeeds
```

The handover should be updated if later verification changes these
results.

------------------------------------------------------------------------

# 31. Important Current Scope Boundaries

The following are intentionally NOT implemented in V1:

``` text
Password reset
Email verification
2FA
OAuth/social login
Profile management
Profile pictures
Notifications
Chat
File upload
Advanced permissions
Multiple admin levels
Audit logging
Analytics
Pagination
Sorting
Bulk operations
Advanced search/filtering
Refresh-token infrastructure
Server-side token revocation
Microservices
API Gateway
Redis
Kafka
Kubernetes
```

Do not add these unless the V1 requirements are explicitly changed.

------------------------------------------------------------------------

# 32. Testing Strategy --- Future Phase

Testing is intentionally separate from the application.

The intended learning/testing progression is:

``` text
UMS Application
       |
       v
Manual Testing
       |
       v
API Testing with Postman
       |
       v
JUnit + Mockito Unit Testing
       |
       v
Spring Boot Integration Testing
       |
       v
Selenium + Java UI/System Testing
       |
       v
Regression Testing
```

The application itself should remain free of testing-specific UI and
testing infrastructure.

------------------------------------------------------------------------

# 33. Suggested First Manual Testing Areas

When testing begins, start with:

### Authentication

``` text
Valid registration
Invalid email
Empty fields
Password < 8 characters
Password mismatch
Duplicate email
Valid login
Invalid password
Invalid email
Logout
Protected route access
```

### RBAC

``` text
USER can view users
USER cannot add user
USER cannot delete user
ADMIN can add user
ADMIN can delete another user
ADMIN cannot delete self
```

### API security

``` text
No JWT → 401
Invalid JWT → 401
Expired JWT → 401
USER token → ADMIN endpoint → 403
ADMIN token → ADMIN endpoint → allowed
```

### Data behavior

``` text
Duplicate email
Password not returned
New user saved to MySQL
Deleted user removed from MySQL
Created role always USER
```

These are future testing activities, not current application features.

------------------------------------------------------------------------

# 34. Important Development Rules

When continuing development:

1.  Keep Spring Boot as the only backend.
2.  Keep MySQL as the only persistent database.
3.  Do not reintroduce JSON persistence.
4.  Do not add a Node/Express API server.
5.  Keep RBAC enforced on the backend.
6.  Never trust the role sent by the frontend.
7.  Never return password hashes.
8.  Keep public registration restricted to USER.
9.  Keep admin-created accounts restricted to USER.
10. Keep admin self-delete protection.
11. Preserve stable UI selectors.
12. Avoid adding unnecessary V1 features.
13. Keep testing external to the application until the testing phase
    begins.

------------------------------------------------------------------------

# 35. Handover Summary

The UMS is currently a focused V1 full-stack application.

Final architecture:

``` text
React 19
   |
   | REST / JSON
   v
Spring Boot 3
   |
   +-- Spring Security
   +-- JWT
   +-- BCrypt
   +-- Service Layer
   +-- Repository Layer
   +-- JPA/Hibernate
   |
   v
MySQL 8
```

Implemented business capabilities:

``` text
Registration
Login
Logout
Protected Routes
JWT Authentication
BCrypt Password Hashing
USER / ADMIN RBAC
View Users
ADMIN Add User
ADMIN Delete User
Admin Self-Delete Protection
Input Validation
Duplicate Email Protection
Centralized Error Handling
MySQL Persistence
Stable UI Selectors
```

The application is now ready to move from the **application-building
phase** into the **testing-learning phase**.

The next major work should be testing the existing application rather
than adding more application features.
