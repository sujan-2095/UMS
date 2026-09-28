# 🗺️ User Management System (UMS) — Project Roadmap & Task Tracker

> **Project:** User Management System (UMS)  
> **Status:** Active Tracking  
> **Target Audience:** Engineering Team, Project Presentation, Development Tracking  

## Phase-Wise Progress Summary

| Phase | Focus Area | Key Deliverables | Status |
| :--- | :--- | :--- | :---: |
| **Phase 1** | **Development of UMS** | React UI, Spring Boot API, MySQL Schema | `Completed` |
| **Phase 2** | **Local Configuration** | Config files, Datasource, E2E Connectivity | `Completed` |
| **Phase 3** | **Postman – API Testing** | Postman Collection, Status & Auth Validation | `Next Up` |
| **Phase 4** | **Automated Unit Testing** | JUnit 5 & Mockito test suites | `Pending` |
| **Phase 5** | **Automated Integration Testing** | Full flow & Spring Security integration tests | `Pending` |
| **Phase 6** | **GitHub Actions – CI/CD** | CI workflow yaml, automated build/test pipeline | `Pending` |

---

## Detailed Task Tracker

### Phase 1: Development of UMS (Completed)

*Core full-stack architecture design, entity modeling, service implementation, and user interface development.*

- [x] **React Frontend**
  - [x] Initialize frontend application structure & routing setup
  - [x] Implement user authentication views (Login, Registration)
  - [x] Build user management dashboard (User List, Create/Edit forms, View details)
  - [x] Implement client-side validation and responsive UI styling
  - [x] Configure centralized Axios/Fetch API client with auth interceptors
- [x] **Spring Boot Backend**
  - [x] Initialize project with Spring Web, Spring Data JPA, Spring Security, Validation
  - [x] Create domain entities (`User`, `Role`)
  - [x] Implement Repository layer with Spring Data JPA (`UserRepository`)
  - [x] Implement Service layer with business logic & exception handling (`UserService`, `AuthService`)
  - [x] Implement REST Controllers with input validation (`AuthController`, `UserController`)
  - [x] Configure Spring Security with JWT authentication and RBAC (`SecurityConfig`, `JwtService`)
- [x] **MySQL Database**
  - [x] Design relational schema (tables, foreign keys, unique constraints, indices)
  - [x] Configure schema initialization via JPA Hibernate (`ddl-auto=update`)
  - [x] Establish initial seed data (`DataInitializer` creates default admin `admin@test.com`)

---

### Phase 2: Local Configuration (Completed)

*Local environment provisioning, datasource parameterization, and connectivity validation.*

- [x] **Configure MySQL**
  - [x] Create local database instance & dedicated user credentials
  - [x] Configure character encoding (`utf8mb4`) and collation
  - [x] Verify local database service accessibility and privileges
- [x] **Configure Spring Boot Backend**
  - [x] Set up `application.yml` / `application.properties` with database connection string
  - [x] Configure HikariCP connection pooling parameters
  - [x] Configure JWT secrets, token expiration intervals, and CORS policies
  - [x] Verify backend boots cleanly without startup exceptions
- [x] **Configure React Frontend**
  - [x] Configure environment variables (`.env`, `VITE_API_BASE_URL` or `REACT_APP_API_BASE_URL`)
  - [x] Configure local dev proxy for seamless API requests
- [x] **Verify End-to-End Local Connectivity**
  - [x] Perform smoke test: Register user from React UI → Persist in MySQL via Spring Boot
  - [x] Perform smoke test: Authenticate user → Receive token → Access protected dashboard
  - [x] Verify full CRUD operations round-trip successfully

---

### Phase 3: Postman – API Testing

*Comprehensive functional API verification, schema validation, edge case analysis, and RBAC assertion.*

- [ ] **Test All REST APIs**
  - [ ] Auth endpoints (`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`)
  - [ ] User management endpoints (`GET /api/users`, `GET /api/users/{id}`)
  - [ ] Modification endpoints (`POST /api/users`, `PUT /api/users/{id}`, `DELETE /api/users/{id}`)
- [ ] **Validate Request and Response Data**
  - [ ] Assert JSON response schema structures and field types
  - [ ] Validate request body validations (e.g., missing email, weak password, invalid phone format)
  - [ ] Assert consistent error response format (`timestamp`, `status`, `error`, `message`, `path`)
- [ ] **Verify HTTP Status Codes**
  - [ ] Verify `200 OK` / `201 Created` on successful operations
  - [ ] Verify `400 Bad Request` on malformed inputs and validation failures
  - [ ] Verify `401 Unauthorized` on missing, malformed, or expired tokens
  - [ ] Verify `403 Forbidden` when attempting actions beyond assigned role
  - [ ] Verify `404 Not Found` for non-existent entities
  - [ ] Verify `409 Conflict` on duplicate resource creation (e.g., existing username/email)
- [ ] **Test Authentication and Authorization Scenarios**
  - [ ] Test public vs. protected route boundaries
  - [ ] Test token lifecycle (valid token, expired token, tampered token)
  - [ ] Test Role-Based Access Control (Admin vs. Standard User permission boundaries)
  - [ ] Export and commit Postman Collection & Environment JSON for team reference

---

### Phase 4: Automated Unit Testing

*Isolated testing of modular units and domain logic using Mockito test doubles and JUnit assertions.*

- [ ] **JUnit 5 Setup & Configuration**
  - [ ] Configure JUnit 5 test dependencies in `pom.xml` / `build.gradle`
  - [ ] Establish test naming conventions (e.g., `should_expectedBehavior_when_stateUnderTest`)
- [ ] **Mockito Framework Integration**
  - [ ] Utilize `@Mock`, `@InjectMocks`, `@Spy`, and `@Captor` annotations
  - [ ] Implement robust stubbing rules with `when(...).thenReturn(...)` / `doThrow(...)`
  - [ ] Verify method interactions using `verify(...)` and `times(...)`
- [ ] **Test Individual Components & Business Logic**
  - [ ] Unit test Service Layer (`UserService`, `AuthService`) logic in isolation
  - [ ] Unit test password hashing and token generation utilities
  - [ ] Unit test custom input validators and data transformation mappers
  - [ ] Unit test exception handling and custom domain exceptions

---

### Phase 5: Automated Integration Testing

*End-to-end integration validation across Spring Boot slices, database persistence, and security filters.*

- [ ] **Spring Boot Test Infrastructure**
  - [ ] Configure `@SpringBootTest` and `@AutoConfigureMockMvc` / `TestRestTemplate`
  - [ ] Configure test application profile (`application-test.yml`)
- [ ] **Test Controller → Service → Repository Flow**
  - [ ] Test full request lifecycle from HTTP dispatch to database persistence and back
  - [ ] Test DTO deserialization, Spring validation triggers, and response serialization
  - [ ] Test Global Exception Handler (`@ControllerAdvice`) under real HTTP calls
- [ ] **Verify Database Integration**
  - [ ] Set up isolated test database (Testcontainers with MySQL or H2 in MySQL compatibility mode)
  - [ ] Verify entity relationships, cascading rules, and database constraints
  - [ ] Verify test transactional boundaries (`@Transactional` test rollbacks)
- [ ] **Verify Authentication and Authorization**
  - [ ] Test security filter chain with real JWT tokens
  - [ ] Test `@WithMockUser` and `@WithUserDetails` across secured endpoints
  - [ ] Verify unauthorized (`401`) and forbidden (`403`) responses at the HTTP boundary

---

### Phase 6: GitHub Actions – CI/CD

*Continuous integration and delivery pipeline to automate builds, code quality checks, and deployments.*

- [ ] **Build the Project**
  - [ ] Create `.github/workflows/ci.yml` pipeline configuration
  - [ ] Configure workflow triggers (`on: [push, pull_request]` on `main` / `develop`)
  - [ ] Set up matrix/runners for Java (JDK 17/21) and Node.js
  - [ ] Compile Spring Boot backend and bundle React frontend
- [ ] **Run Automated Unit Tests**
  - [ ] Execute `mvn test` / `./gradlew test` in CI runner
  - [ ] Enforce pipeline failure on any failing unit test
- [ ] **Run Integration Tests**
  - [ ] Configure GitHub Actions service containers (e.g., MySQL container service)
  - [ ] Execute integration test suite (`mvn verify`)
- [ ] **Verify Build and Test Results**
  - [ ] Publish automated test summary reports and code coverage (e.g., JaCoCo)
  - [ ] Store build artifacts (JAR file, frontend build output)
- [ ] **Prepare Pipeline for Deployment**
  - [ ] Add Docker build step (containerize backend and frontend)
  - [ ] Set up environment secrets and CD deployment staging targets
  - [ ] Verify clean, reproducible pipeline execution from commit to artifact

---

## Definition of Done (DoD) Checklist

- [ ] All 6 phases completed in sequential order
- [ ] 0 failing unit and integration tests
- [ ] Code coverage threshold achieved (> 80% on business logic)
- [ ] Postman test suite passing 100% of functional & security tests
- [ ] CI/CD pipeline green on GitHub `main` branch
