# API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication endpoints

### POST `/auth/signup`

- Authentication: Not required
- Role: Creates a `faculty` account only; any role sent in the request is ignored
- Request body:
  ```json
  {
    "name": "Faculty Member",
    "email": "faculty@college.edu",
    "department": "Computer Science",
    "password": "SecurePass123"
  }
  ```
- Response: `201` with the safe user profile and an httpOnly authentication cookie
- Errors: `400` for invalid input, `409` for duplicate email

### POST `/auth/login`

- Authentication: Not required
- Role: Any user
- Request body:
  ```json
  {
    "email": "admin@college.edu",
    "password": "Admin@123"
  }
  ```
- Response:
  ```json
  {
    "message": "Login successful.",
    "token": "jwt-token",
    "user": {
      "_id": "...",
      "name": "Department Administrator",
      "email": "admin@college.edu",
      "role": "admin"
    }
  }
  ```
- Errors: `400`, `401`

### POST `/auth/logout`

- Authentication: Required
- Role: Any user
- Response:
  ```json
  {
    "message": "Logged out successfully."
  }
  ```

### GET `/auth/me`

- Authentication: Required
- Role: Any user
- Response: current user object

## User endpoints

### GET `/users`

- Authentication: Required
- Role: `admin`, `lab_assistant`
- Query: `page`, `limit`, `search`, `role`

### POST `/users`

- Authentication: Required
- Role: `admin`
- Request body:
  ```json
  {
    "name": "Lab Assistant",
    "email": "assistant@college.edu",
    "password": "SecurePass123",
    "role": "lab_assistant",
    "department": "Electronics"
  }
  ```

### PUT `/users/:id`

- Authentication: Required
- Role: `admin`
- Request body: updated user fields

### DELETE `/users/:id`

- Authentication: Required
- Role: `admin`
- Response: deactivates the user without deleting historical references

## Equipment endpoints

### GET `/equipment`

- Authentication: Required
- Role: Any authenticated user
- Query: `search`, `category`, `lab`, `condition`, `page`, `limit`

### POST `/equipment`

- Authentication: Required
- Role: `admin`, `lab_assistant`
- Request body:
  ```json
  {
    "assetCode": "EQ-1001",
    "name": "Oscilloscope",
    "category": "Electronics",
    "laboratory": "labObjectId",
    "totalQuantity": 5,
    "availableQuantity": 5,
    "condition": "good",
    "minStockThreshold": 1
  }
  ```

### GET `/equipment/:id`

- Authentication: Required
- Role: Any authenticated user

### PUT `/equipment/:id`

- Authentication: Required
- Role: `admin`, `lab_assistant`

### DELETE `/equipment/:id`

- Authentication: Required
- Role: `admin`, `lab_assistant`
- Prevents deletion when active transactions exist; archives instead

## Laboratory endpoints

### GET `/laboratories`

- Authentication: Required
- Role: Any authenticated user

### POST `/laboratories`

- Authentication: Required
- Role: `admin`, `lab_assistant`
- Request body:
  ```json
  {
    "name": "Embedded Systems Lab",
    "code": "ESL-101",
    "department": "Electronics",
    "building": "Science Block",
    "roomNumber": "A-12",
    "capacity": 24,
    "description": "Robotics and embedded systems lab"
  }
  ```

### PUT `/laboratories/:id`

- Authentication: Required
- Role: `admin`, `lab_assistant`

### DELETE `/laboratories/:id`

- Authentication: Required
- Role: `admin`, `lab_assistant`
- Rejects deletion if equipment remains assigned to the lab

## Transaction endpoints

### GET `/transactions`

- Authentication: Required
- Role: Any authenticated user

### POST `/transactions`

- Authentication: Required
- Role: Any authenticated user
- Request body:
  ```json
  {
    "equipment": "equipmentObjectId",
    "borrowerName": "Faculty Person",
    "borrowerEmail": "faculty.person@college.edu",
    "borrowerRole": "faculty",
    "quantity": 2,
    "expectedReturnDate": "2026-12-10T00:00:00.000Z",
    "notes": "Testing lab work"
  }
  ```

### PATCH `/transactions/:id/approve`

- Authentication: Required
- Role: `admin`, `lab_assistant`

### PATCH `/transactions/:id/issue`

- Authentication: Required
- Role: `admin`, `lab_assistant`
- Decrements `availableQuantity` and marks the transaction as `issued`

### PATCH `/transactions/:id/return`

- Authentication: Required
- Role: `admin`, `lab_assistant`
- Increments `availableQuantity` and marks the transaction as `returned`

## Maintenance endpoints

### GET `/maintenance`

- Authentication: Required
- Role: Any authenticated user

### POST `/maintenance`

- Authentication: Required
- Role: `admin`, `lab_assistant`, `faculty`
- Request body:
  ```json
  {
    "equipment": "equipmentObjectId",
    "issueType": "damaged",
    "description": "Display flickering",
    "reportedBy": "Lab Assistant",
    "priority": "high",
    "status": "reported"
  }
  ```

### PATCH `/maintenance/:id/resolve`

- Authentication: Required
- Role: `admin`, `lab_assistant`
- Body: `resolutionNotes`

## Dashboard and reports

### GET `/dashboard/stats`

- Authentication: Required
- Role: Any authenticated user
- Returns summary metrics and recent activity
  (faculty recent activity is limited to their own transactions)

### GET `/reports`

- Authentication: Required
- Role: `admin`, `lab_assistant`
- Returns report aggregates for inventory and overdue work

### GET `/reports/csv?type=inventory`

- Authentication: Required
- Role: `admin`, `lab_assistant`
- Returns CSV export with escaped values to reduce spreadsheet formula injection risk
