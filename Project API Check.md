# Project API Check

This checklist covers combinations of API endpoint tryouts for Postman. It is aligned to the current code behavior.

Base URL
- http://localhost:5000

Suggested Postman variables
- baseUrl = http://localhost:5000
- contributorToken = (set after login)
- maintainerToken = (set after login)
- contributorId = (set after signup/login)
- maintainerId = (set after signup/login)
- issueId = (set after create issue)

Auth header format
- Preferred: Authorization: Bearer <token>
- Note: The server also accepts raw token without Bearer.

--------------------------------------------------------------------
AUTH: SIGNUP
--------------------------------------------------------------------
POST {{baseUrl}}/api/auth/signup

A1. Valid contributor signup (explicit role)
- Body:
  {
    "name": "Alice Contributor",
    "email": "alice@example.com",
    "password": "secret123",
    "role": "contributor"
  }
- Expected: 201, user data returned (no password)

A2. Valid maintainer signup (explicit role)
- Body:
  {
    "name": "Maya Maintainer",
    "email": "maya@example.com",
    "password": "secret123",
    "role": "maintainer"
  }
- Expected: 201

A3. Valid signup (role omitted, defaults to contributor)
- Body:
  {
    "name": "Default Role",
    "email": "default@example.com",
    "password": "secret123"
  }
- Expected: 201, role = contributor

A4. Missing name
- Body:
  { "email": "noname@example.com", "password": "secret123" }
- Expected: 400

A5. Missing email
- Body:
  { "name": "No Email", "password": "secret123" }
- Expected: 400

A6. Missing password
- Body:
  { "name": "No Password", "email": "nopass@example.com" }
- Expected: 400

A7. Invalid email format
- Body:
  { "name": "Bad Email", "email": "bad-email", "password": "secret123" }
- Expected: 400

A8. Password too short (< 6)
- Body:
  { "name": "Short Pass", "email": "short@example.com", "password": "123" }
- Expected: 400

A9. Invalid role
- Body:
  { "name": "Bad Role", "email": "badrole@example.com", "password": "secret123", "role": "admin" }
- Expected: 400

A10. Duplicate email
- Use an email already registered
- Expected: 409

--------------------------------------------------------------------
AUTH: LOGIN
--------------------------------------------------------------------
POST {{baseUrl}}/api/auth/login

B1. Valid contributor login
- Body:
  { "email": "alice@example.com", "password": "secret123" }
- Expected: 200, token + user
- Save token to contributorToken

B2. Valid maintainer login
- Body:
  { "email": "maya@example.com", "password": "secret123" }
- Expected: 200, token + user
- Save token to maintainerToken

B3. Wrong password
- Body:
  { "email": "alice@example.com", "password": "wrongpass" }
- Expected: 401

B4. Email not found
- Body:
  { "email": "missing@example.com", "password": "secret123" }
- Expected: 401

B5. Missing email
- Body:
  { "password": "secret123" }
- Expected: 400

B6. Missing password
- Body:
  { "email": "alice@example.com" }
- Expected: 400

--------------------------------------------------------------------
ISSUES: CREATE
--------------------------------------------------------------------
POST {{baseUrl}}/api/issues
Headers: Authorization: Bearer {{contributorToken}}

C1. Contributor creates issue (valid)
- Body:
  { "title": "Bug A", "description": "This description is at least 20 chars", "type": "bug" }
- Expected: 201, issue data with status = open
- Save id to issueId

C2. Maintainer creates issue (valid)
- Headers: Authorization: Bearer {{maintainerToken}}
- Body:
  { "title": "Feature A", "description": "This description is at least 20 chars", "type": "feature_request" }
- Expected: 201

C3. Missing token
- No Authorization header
- Expected: 401

C4. Title too long (> 150)
- Body: title length 151+
- Expected: 400

C5. Description too short (< 20)
- Body: short description
- Expected: 400

C6. Invalid type
- Body: type = "task"
- Expected: 400

C7. Missing required fields (title/type/description)
- Expected: 400

C8. Status in create body (ignored)
- Body includes status: "resolved"
- Expected: 201, status still open (status ignored in create)

--------------------------------------------------------------------
ISSUES: LIST (PUBLIC)
--------------------------------------------------------------------
GET {{baseUrl}}/api/issues

D1. List all (no filters)
- Expected: 200, array

D2. Filter by type
- GET /api/issues?type=bug
- Expected: 200

D3. Filter by status
- GET /api/issues?status=open
- Expected: 200

D4. Sort newest
- GET /api/issues?sort=newest
- Expected: 200

D5. Sort oldest
- GET /api/issues?sort=oldest
- Expected: 200

D6. Invalid type filter
- GET /api/issues?type=task
- Expected: 400

D7. Invalid status filter
- GET /api/issues?status=closed
- Expected: 400

D8. Invalid sort value
- GET /api/issues?sort=latest
- Expected: 400

--------------------------------------------------------------------
ISSUES: GET SINGLE (PUBLIC)
--------------------------------------------------------------------
GET {{baseUrl}}/api/issues/{{issueId}}

E1. Valid issue id
- Expected: 200, issue detail

E2. Non-numeric id
- GET /api/issues/abc
- Expected: 400

E3. Not found id
- GET /api/issues/999999
- Expected: 404

--------------------------------------------------------------------
ISSUES: UPDATE
--------------------------------------------------------------------
PATCH {{baseUrl}}/api/issues/{{issueId}}
Headers: Authorization: Bearer {{contributorToken}} or {{maintainerToken}}

F1. Contributor updates own open issue (title/description/type)
- Headers: contributorToken (creator)
- Body:
  { "title": "Bug A updated" }
- Expected: 200

F2. Contributor updates own open issue (type)
- Body: { "type": "feature_request" }
- Expected: 200

F3. Contributor tries to change status
- Body: { "status": "resolved" }
- Expected: 403 (Only maintainers can change issue status)

F4. Contributor updates issue they do NOT own
- Use issue created by maintainer
- Expected: 403

F5. Contributor updates own issue when status is not open
- First, as maintainer, set issue status to in_progress
- Then, contributor tries to update
- Expected: 403

F6. Maintainer updates any issue (title/description/type)
- Headers: maintainerToken
- Body: { "title": "Maintainer update" }
- Expected: 200

F7. Maintainer updates status
- Body: { "status": "in_progress" }
- Expected: 200

F8. Invalid issue type
- Body: { "type": "task" }
- Expected: 400

F9. Invalid issue status
- Body: { "status": "closed" }
- Expected: 400

F10. Title too long (> 150)
- Body: title length 151+
- Expected: 400

F11. Description too short (< 20)
- Body: short description
- Expected: 400

F12. No valid fields to update
- Body: {}
- Expected: 400

F13. Missing token
- No Authorization header
- Expected: 401

F14. Non-numeric id
- PATCH /api/issues/abc
- Expected: 400

F15. Not found id
- PATCH /api/issues/999999
- Expected: 404

--------------------------------------------------------------------
ISSUES: DELETE
--------------------------------------------------------------------
DELETE {{baseUrl}}/api/issues/{{issueId}}

G1. Maintainer deletes any issue
- Headers: Authorization: Bearer {{maintainerToken}}
- Expected: 200

G2. Contributor tries to delete
- Headers: Authorization: Bearer {{contributorToken}}
- Expected: 403

G3. Missing token
- Expected: 401

G4. Non-numeric id
- DELETE /api/issues/abc
- Expected: 400

G5. Not found id
- DELETE /api/issues/999999
- Expected: 404

--------------------------------------------------------------------
METRICS (MAINTAINER ONLY)
--------------------------------------------------------------------
GET {{baseUrl}}/api/metrics

H1. Maintainer access
- Headers: Authorization: Bearer {{maintainerToken}}
- Expected: 200

H2. Contributor access
- Headers: Authorization: Bearer {{contributorToken}}
- Expected: 403

H3. Missing token
- Expected: 401

--------------------------------------------------------------------
AUTH HEADER EDGE CASES
--------------------------------------------------------------------
I1. Token without Bearer prefix
- Authorization: {{contributorToken}}
- Expected: 200 on protected endpoints

I2. Invalid token
- Authorization: Bearer invalidtoken
- Expected: 401

--------------------------------------------------------------------
NOTES
--------------------------------------------------------------------
- Use unique emails for signup tests.
- The create issue endpoint ignores any status field; status is always open on create.
- If you see any unexpected errors, confirm the database is reachable and migrations were applied.
