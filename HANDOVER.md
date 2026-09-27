# UMS --- Project Handover Document

**Project:** User Management System (UMS)\
**Version:** V1.1\
**Last Updated:** 27 September 2026\
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
-   TypeScript 5+
-   Vite 8
-   React Router DOM 7
-   Tailwind CSS v4 (with `@layer base` custom design tokens)
-   Google Font Inter typography
-   Lucide React icons & Motion
-   React Context API (stateless auth provider)

### Backend

-   Java 17
-   Spring Boot 3.2.4
-   Spring Security 6
-   Spring Data JPA
-   Hibernate
-   Maven
-   JJWT (0.12.5)
-   BCrypt (work factor 10)

### Database

-   MySQL 8
-   Database: `ums_db`
-   Main table: `users`

------------------------------------------------------------------------

# 3. Major Refactoring and Recent Enhancements

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

Frontend also validates name format (letters and spaces only, 2-50 chars) and email format regex.

------------------------------------------------------------------------

## 3.5 Role-Differentiated Dashboard

The dashboard provides a tailored experience based on user role:

### For ADMIN:
-   Real-time aggregated counts queried directly from MySQL:
    -   *Total Users*
    -   *Administrators*
    -   *Standard Users*
-   Recent user registrations list (latest 5 registrations with role and timestamp)
-   Quick shortcuts to View Users or open the Add User modal directly (`/users?action=add`)
-   Logout

### For USER:
-   Streamlined Account Summary card displaying user name, email, active role, and read-only access indicator
-   Quick link to View Users
-   Logout

Unnecessary complex analytics, testing dashboards, and mock charts are omitted to keep V1 focused and clean.

------------------------------------------------------------------------

## 3.6 Design System & Responsive Navigation

The frontend design system has been overhauled using Tailwind CSS v4:
-   Centralized theme variables (`--bg-base: #0B1120`, `--surface: #111827`, `--primary: #4F46E5`, etc.) in `index.css`
-   Inter font typography with smoothed subpixel rendering
-   Slim custom scrollbars
-   Responsive mobile drawer menu in `Navbar.tsx` featuring hamburger trigger, active tab highlights, role badge, and sign-out button

------------------------------------------------------------------------

## 3.7 User Directory Search & Role Filtering

The Users view (`UsersList.tsx`) supports interactive client-side operations:
-   Live search input matching names or email addresses with clear button
-   Role filter buttons (`ALL`, `ADMIN`, `USER`) with live matching count badges
-   Read-only information banner for standard users explaining their permission tier

------------------------------------------------------------------------

## 3.8 Dual-Layer Self-Deletion Protection

To protect active administrators from deleting their own account:
1.  **Frontend**: The Delete button for the currently authenticated admin is visually disabled (`opacity-30 cursor-not-allowed`) with a tooltip explanation, and a "You" marker badge is rendered in the name column.
2.  **Backend**: `UserService.deleteUser()` validates that the targeted user email does not match `Authentication.getName()`. If a match occurs, it throws `IllegalArgumentException` returning `400 Bad Request`.

------------------------------------------------------------------------

## 3.9 Stable UI Selectors

Important UI elements have stable `id` and/or `data-testid` attributes.

These selectors are retained so external Selenium automation and API testing can be written cleanly.

No Selenium code is embedded inside the application.

------------------------------------------------------------------------

## 3.10 Clean Developer Experience & Logging Optimization

Backend logging and runtime flags are optimized for a quiet, high-signal developer terminal:
-   `logging.level.root=WARN` suppresses noisy framework startup output from Tomcat, Spring, Hibernate, and HikariCP.
-   `logging.level.com.example.ums=INFO` guarantees that application events (database initialization, security audits, admin seeding) remain prominently visible.
-   `spring.jpa.open-in-view=false` disables the Open EntityManager in View pattern and eliminates the default startup warning.
-   Removed redundant Hibernate dialect configuration in favor of Hibernate 6 automated dialect detection.
-   Configured `<jvmArguments>--enable-native-access=ALL-UNNAMED</jvmArguments>` in `spring-boot-maven-plugin` to eliminate Java 25 Tomcat JNI restricted access warnings automatically during `mvn spring-boot:run`.

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

The dashboard provides role-differentiated capabilities:

### ADMIN Dashboard
-   User greeting and role indicator badge
-   Real-time aggregated metrics queried directly from MySQL via `api.getUsers()`:
    -   **Total Users**: Count of all registered user records
    -   **Administrators**: Count of accounts with elevated write/delete privileges
    -   **Standard Users**: Count of accounts with read-only directory privileges
-   **Recent Users Table**: The 5 most recent registrations displaying Name, Email, Role badge, and Creation Date
-   Direct navigation buttons: "View Users", "Add User" (navigates to `/users?action=add`), and "Logout"

### USER Dashboard
-   Account Summary card displaying Profile Name, Email, Active Role (`USER`), and Access Level indicator ("Read-only Directory Access")
-   Direct action buttons: "View Users" and "Logout"

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

The frontend displays the user information in an interactive table with:
-   **Real-Time Client Search**: Instant filtering by name or email with quick clear button
-   **Role Filters**: Toggle between `ALL`, `ADMIN`, and `USER` with matching count badges
-   **Read-Only Banner**: Explains restricted permissions to standard users
-   **"You" Identifier**: Tags the currently authenticated user's row
-   **Proactive Protection**: Disables the Delete button for the current logged-in admin with a tooltip explanation
-   **Dismissible Feedback Alerts**: Success and error banners with auto-clear and manual close buttons

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
spring.jpa.open-in-view
logging.level.root
logging.level.com.example.ums
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

Or for a quiet development terminal without Maven build chatter:

``` bash
mvn -q spring-boot:run
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

The following selectors are intentionally stable for future external Selenium automation and API verification.

| Component | Element Description | HTML `id` | `data-testid` | Source Component File |
|---|---|---|---|---|
| **Auth - Login** | Email Input | `login-email-input` | `login-email` | `Login.tsx` |
| **Auth - Login** | Password Input | `login-password-input` | `login-password` | `Login.tsx` |
| **Auth - Login** | Submit Button | `login-submit-btn` | `login-submit` | `Login.tsx` |
| **Auth - Login** | Error Banner Alert | `login-error-banner` | — | `Login.tsx` |
| **Auth - Register** | Full Name Input | `name-input` | `register-name` | `Register.tsx` |
| **Auth - Register** | Name Validation Error | `name-error` | — | `Register.tsx` |
| **Auth - Register** | Email Input | `email-input` | `register-email` | `Register.tsx` |
| **Auth - Register** | Email Validation Error | `email-error` | — | `Register.tsx` |
| **Auth - Register** | Password Input | `password-input` | `register-password` | `Register.tsx` |
| **Auth - Register** | Password Validation Error | `password-error` | — | `Register.tsx` |
| **Auth - Register** | Confirm Password Input | `confirm-password-input` | `register-confirm-password` | `Register.tsx` |
| **Auth - Register** | Confirm Password Error | `confirm-password-error` | — | `Register.tsx` |
| **Auth - Register** | Submit Button | `register-submit-btn` | `register-submit` | `Register.tsx` |
| **Auth - Register** | Server Error Banner | `register-error-banner` | — | `Register.tsx` |
| **Auth - Register** | Proceed to Login Button | `goto-login-btn` | — | `Register.tsx` |
| **Dashboard** | Username Greeting | `dashboard-username` | — | `Dashboard.tsx` |
| **Dashboard** | Role Indicator Badge | `dashboard-role-text` | `user-role-badge` | `Dashboard.tsx` |
| **Dashboard** | View Users Action Button | `dashboard-view-users-btn` | `dashboard-view-users` | `Dashboard.tsx` |
| **Dashboard** | Add User Action Button (Admin) | `dashboard-add-user-btn` | `dashboard-add-user` | `Dashboard.tsx` |
| **Dashboard** | Logout Button | `dashboard-logout-btn` | `logout-button` | `Dashboard.tsx` |
| **Users Directory** | Refresh Users Button | `refresh-users-btn` | — | `UsersList.tsx` |
| **Users Directory** | Add User Button (Admin) | `add-user-btn` | `add-user-button` | `UsersList.tsx` |
| **Users Directory** | Success Banner Alert | `success-banner` | — | `UsersList.tsx` |
| **Users Directory** | Error Banner Alert | `error-banner` | — | `UsersList.tsx` |
| **Users Directory** | Users Table Element | `user-table` | `user-table` | `UsersList.tsx` |
| **Users Directory** | User Row Item | `user-row-{id}` | `user-row-{id}` | `UsersList.tsx` |
| **Users Directory** | Delete User Action Button | `delete-user-{id}` | `delete-user-{id}` | `UsersList.tsx` |
| **Modal - Add User**| Modal User Name Input | `new-user-name` | `new-user-name` | `UsersList.tsx` |
| **Modal - Add User**| Modal User Email Input | `new-user-email` | `new-user-email` | `UsersList.tsx` |
| **Modal - Add User**| Modal User Password Input | `new-user-password` | `new-user-password` | `UsersList.tsx` |
| **Modal - Add User**| Modal Submit Button | `create-user-submit-btn` | `create-user-submit` | `UsersList.tsx` |
| **Modal - Add User**| Modal Cancel Button | `cancel-add-user-btn` | — | `UsersList.tsx` |
| **Modal - Delete**  | Confirm Deletion Button | `confirm-delete-btn` | `confirm-delete` | `UsersList.tsx` |
| **Modal - Delete**  | Cancel Deletion Button | `cancel-delete-btn` | `cancel-delete` | `UsersList.tsx` |
| **Navigation**      | Dashboard Nav Link | `nav-dashboard` | — | `Navbar.tsx` |
| **Navigation**      | Users Nav Link | `nav-users` | — | `Navbar.tsx` |
| **Navigation**      | User Display Name | `user-display-name` | — | `Navbar.tsx` |
| **Navigation**      | Current User Role Badge | `user-role-badge` | `user-role-badge` | `Navbar.tsx` |
| **Navigation**      | Sign Out Button | `logout-btn` | `logout-button` | `Navbar.tsx` |
| **Navigation**      | Sign In Nav Link (Public) | `nav-login` | — | `Navbar.tsx` |
| **Navigation**      | Register Nav Link (Public)| `nav-register` | — | `Navbar.tsx` |

These are selectors only. No testing framework is embedded in the
application codebase.

------------------------------------------------------------------------

# 30. Build Verification

The project has been verified across all components (latest verification: 27 September 2026):

### Backend Build

``` bash
mvn clean compile
```

Result:
``` text
BUILD SUCCESS (24 Java classes compiled with 0 errors)
```

### Frontend TypeScript Check

``` bash
npm run lint
```

The script executes `tsc --noEmit` and returns:
``` text
SUCCESS (0 type errors)
```

### Frontend Production Build

``` bash
npm run build
```

Result:
``` text
Production build succeeds (Clean distribution bundle generated in dist/ in 520ms)
```

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
JWT Authentication (HMAC-SHA256)
BCrypt Password Hashing (Work Factor 10)
USER / ADMIN RBAC
Role-Differentiated Dashboard (Live Metrics for Admin, Account Summary for User)
User Directory Listing
Directory Search (Name / Email) & Role Filters
ADMIN Add User (Modal + URL shortcut /users?action=add)
ADMIN Delete User (Confirmation Modal)
Dual-Layer Admin Self-Delete Protection (UI Disable + Backend Guard)
Input Validation & Inline Error Feedback
Duplicate Email Collision Protection
Centralized Error Handling (@RestControllerAdvice)
MySQL Persistence (Spring Data JPA / Hibernate)
Tailwind CSS v4 Design Tokens & Inter Typography
Responsive Mobile Navigation Drawer
Comprehensive Deterministic Test Selectors (Selenium & Postman)
```

The application is now ready to move from the **application-building
phase** into the **testing-learning phase**.

The next major work should be testing the existing application rather
than adding more application features.
