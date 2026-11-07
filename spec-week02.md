Books API Week 02 Spec
Version 1
Feature 1: Book CRUD Operations and Author References
Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

Data Model
Book documents will be stored in the books collection.

Required book fields:

id: string, required, custom id such as b1

authorId: string, required, references the id field of an author document

title: string, required

publicationDate: string, required

Books will continue to use custom string ids instead of MongoDB _id values for route parameters.

Relationship to Authors
Each book will identify its author with an authorId field. The value of authorId must match the custom id value of an existing author document.

When creating or updating a book, the API should reject the request with a 400 status code if the submitted authorId does not match an existing author.

Routes
GET /books
Purpose: Return all books.

Success:

Status code: 200

Response body: an array of book objects

Errors:

500 if an unexpected server or database error occurs

GET /books/:id
Purpose: Return one book by its custom id.

Success:

Status code: 200

Response body: the matching book object

Errors:

404 if no book exists with that id

500 if an unexpected server or database error occurs

POST /books
Purpose: Create a new book.

Request body:

{
"id": "b4",
"authorId": "a1",
"title": "Example Book Title",
"publicationDate": "2026-01-15"
}

Success:

Status code: 201

Response body: the newly created book object

Errors:

400 if a required field is missing

400 if the id already exists

400 if the authorId does not match an existing author

500 if an unexpected server or database error occurs

PUT /books/:id
Purpose: Update an existing book.

Request body:

{
"authorId": "a2",
"title": "Updated Book Title",
"publicationDate": "2026-02-20"
}

Success:

Status code: 200

Response body: the updated book object

Errors:

400 if a required field is missing

400 if the authorId does not match an existing author

404 if no book exists with that id

500 if an unexpected server or database error occurs

DELETE /books/:id
Purpose: Delete an existing book.

Success:

Status code: 204

Response body: none

Errors:

404 if no book exists with that id

500 if an unexpected server or database error occurs

Swagger Documentation
Swagger must document every book route.

Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at /api-docs must allow someone to test every book route from the browser.

Feature 2: Author CRUD Operations
Goal
Add a new authors collection and a complete CRUD API for it, so that book documents can reference real author records by authorId. Every author route must be documented and testable in Swagger.

Data Model
Author documents will be stored in the authors collection.

Required author fields:

id: string, required, custom id such as a1

name: string, required

birthYear: number, required (for example, 1775)

Authors will use custom string ids instead of MongoDB _id values for route parameters, matching the book API pattern.

Relationship to Books
Author documents do not store a list of books. The relationship is one-way: books.authorId points to authors.id. If the API needs to find the books for an author later, it can query the books collection by authorId.

Delete Rule
An author who is still referenced by one or more books must not be deleted. If a client sends DELETE /authors/:id for an author that still has books, the API must return 409 Conflict with a safe message and leave both the author and the referenced books untouched. This protects referential integrity and prevents books from pointing at author ids that no longer exist.

Routes
GET /authors
Purpose: Return all authors.

Success:

Status code: 200

Response body: an array of author objects

Errors:

500 if an unexpected server or database error occurs

GET /authors/:id
Purpose: Return one author by custom id.

Success:

Status code: 200

Response body: the matching author object

Errors:

404 if no author exists with that id

500 if an unexpected server or database error occurs

POST /authors
Purpose: Create a new author.

Request body:

{
"id": "a4",
"name": "Example Author",
"birthYear": 1980
}

Success:

Status code: 201

Response body: the newly created author object

Errors:

400 if a required field is missing or a field is invalid (for example, birthYear not a number)

400 if the id already exists

500 if an unexpected server or database error occurs

PUT /authors/:id
Purpose: Update an existing author.

Request body:

{
"name": "Updated Author",
"birthYear": 1981
}

Success:

Status code: 200

Response body: the updated author object

Errors:

400 if a required field is missing or a field is invalid

404 if no author exists with that id

500 if an unexpected server or database error occurs

DELETE /authors/:id
Purpose: Delete an existing author, provided no books still reference the author.

Success:

Status code: 204

Response body: none

Errors:

404 if no author exists with that id

409 if the author is still referenced by at least one book

500 if an unexpected server or database error occurs

Swagger Documentation
Swagger must document every author route, including the request body shape for POST and PUT and the 409 response on DELETE.

Deployment Expectations
After implementation, the author routes must work locally and from the deployed Render application. The deployed Swagger page at /api-docs must allow someone to test every author route from the browser.

Evaluation of Version 1
I reviewed both feature specs against the guided questions and identified the following issues.

Are there any bugs or short-sighted decisions in this specification?
The data models are broadly correct but under-specified. The books spec never says what happens to existing book documents from Week 01 that still store author as a string instead of authorId — those will break the new model. The spec should explicitly state that all existing books must be migrated to use authorId. Neither spec pins the format of publicationDate, which was a problem I already identified in Week 01. The DELETE /authors/:id rule is defined but the response body shape for the 409 case is not, so a client cannot reliably parse the error.

Are there any security considerations that are missing?
Neither spec addresses validation of field types beyond "required." A client could POST a birthYear as a string, or a title as a number, and the API has no stated rule to reject it, which could corrupt data over time. Neither spec mentions that raw database errors should never leak to clients — that was already a Week 01 standard and should be restated explicitly. Rate limiting and authentication are out of scope for Week 02, but the spec should say so, to make clear they are intentionally deferred rather than forgotten.

Are there any efficiency concerns with the current endpoint design?
The POST /books and PUT /books/:id routes need to verify that the submitted authorId exists before writing. Without an index on authors.id, that check is a collection scan every time. The same is true for the DELETE /authors/:id rule, which has to query books for any document whose authorId matches the author being deleted. Both checks are cheap at the current data size but should be noted as a future index requirement. The GET /books route also still returns the whole collection; pagination remains out of scope but should be restated.

Are any response examples or error behaviors unclear?
Yes. Neither feature has concrete JSON examples for success, not-found, conflict, or validation-error responses, so a client cannot see exactly what body shape to expect. The books spec says 400 for a missing required field but does not say whether the response should list which field is missing or return a single message. The author spec's 409 case has no example body. Version 2 should add concrete examples for every status code each route can return, and use a consistent { "message": "..." } shape for all errors.

Improvements to make in Version 2
Add a migration note: existing books must be updated to include authorId and drop author.

Pin publicationDate to ISO 8601 date format.

Add validation rules for field types (numbers vs strings).

Add a consistent { "message": "..." } error body shape for every non-2xx response.

Add concrete JSON examples for every route's success and error responses.

Note indexes to add later (authors.id, books.authorId) as an efficiency improvement for the future, without adding them in Week 02.

Make explicit that authentication, authorization, and rate limiting are out of scope.

Version 2
Feature 1: Book CRUD Operations and Author References (Final)
Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

Data Model
Book documents will be stored in the books collection in the cse341-books-db database.

Required book fields:

id: string, required, custom id such as b1 (unique within the collection)

authorId: string, required, must match the id field of an existing authors document

title: string, required

publicationDate: string, required, ISO 8601 date format such as "2021-08-17"

Books continue to use custom string ids instead of MongoDB _id values for route parameters.

Data Migration
All existing book documents from Week 01 must be updated so that:

author is removed

authorId is added and set to the id of an existing author

If an author does not yet exist for a given book, create the author first (as part of the author feature implementation) before migrating that book.

Relationship to Authors
Each book identifies its author with an authorId field. The value of authorId must match the custom id value of an existing author document.

When creating or updating a book, the API must reject the request with a 400 status code and a safe message if the submitted authorId does not match an existing author.

Validation Rules
All four fields (id, authorId, title, publicationDate) must be present on POST.

authorId, title, and publicationDate must be present on PUT.

title and publicationDate must be strings.

publicationDate must match the ISO 8601 date pattern.

id must be unique within the books collection.

authorId must exist in the authors collection.

Error Body Shape
Every non-2xx response returns JSON in this shape:

{
"message": "Human-readable description"
}

Raw database errors are never returned to the client.

Routes
GET /books
Purpose: Return all books.

Success (200):

text
[
  {
    "id": "b1",
    "authorId": "a1",
    "title": "Pride and Prejudice",
    "publicationDate": "1813-01-28"
  }
]
Error (500):

text
{ "message": "Internal server error" }
GET /books/:id
Purpose: Return one book by its custom id.

Success (200):

text
{
  "id": "b1",
  "authorId": "a1",
  "title": "Pride and Prejudice",
  "publicationDate": "1813-01-28"
}
Not found (404):

text
{ "message": "Book not found" }
Error (500):

text
{ "message": "Internal server error" }
POST /books
Purpose: Create a new book.

Request body:

text
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
Success (201): the newly created book object.

Validation failure (400):

text
{ "message": "id, authorId, title, and publicationDate are required" }
Duplicate id (400):

text
{ "message": "A book with this id already exists" }
Unknown author (400):

text
{ "message": "authorId does not match an existing author" }
Error (500):

text
{ "message": "Internal server error" }
PUT /books/:id
Purpose: Update an existing book.

Request body:

text
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}
Success (200): the updated book object.

Validation failure (400):

text
{ "message": "authorId, title, and publicationDate are required" }
Unknown author (400):

text
{ "message": "authorId does not match an existing author" }
Not found (404):

text
{ "message": "Book not found" }
Error (500):

text
{ "message": "Internal server error" }
DELETE /books/:id
Purpose: Delete an existing book.

Success (204): no response body.

Not found (404):

text
{ "message": "Book not found" }
Error (500):

text
{ "message": "Internal server error" }
Swagger Documentation
Every book route must be documented in Swagger, including:

The path and HTTP method

Path parameters (id)

The request body shape for POST and PUT, with an example JSON body

Every possible response status code and its description

Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at /api-docs must allow someone to test every book route from the browser.

Feature 2: Author CRUD Operations (Final)
Goal
Add a new authors collection and a complete CRUD API for it, so that book documents can reference real author records by authorId. Every author route must be documented and testable in Swagger.

Data Model
Author documents will be stored in the authors collection in the cse341-books-db database.

Required author fields:

id: string, required, custom id such as a1 (unique within the collection)

name: string, required

birthYear: number, required (for example, 1775)

Authors use custom string ids instead of MongoDB _id values, matching the book API pattern.

Relationship to Books
Author documents do not store a list of books. The relationship is one-way: books.authorId points to authors.id. To find the books for an author, query the books collection by authorId.

Delete Rule
An author still referenced by at least one book must not be deleted. If a client sends DELETE /authors/:id for an author that still has books, the API returns 409 Conflict with a safe message and leaves both the author and the referenced books untouched.

Validation Rules
All three fields (id, name, birthYear) must be present on POST.

name and birthYear must be present on PUT.

name must be a string.

birthYear must be a number.

id must be unique within the authors collection.

Error Body Shape
Every non-2xx response returns JSON in this shape:

{
"message": "Human-readable description"
}

Routes
GET /authors
Purpose: Return all authors.

Success (200):

text
[
  {
    "id": "a1",
    "name": "Jane Austen",
    "birthYear": 1775
  }
]
Error (500):

text
{ "message": "Internal server error" }
GET /authors/:id
Purpose: Return one author by custom id.

Success (200):

text
{
  "id": "a1",
  "name": "Jane Austen",
  "birthYear": 1775
}
Not found (404):

text
{ "message": "Author not found" }
Error (500):

text
{ "message": "Internal server error" }
POST /authors
Purpose: Create a new author.

Request body:

text
{
  "id": "a4",
  "name": "Example Author",
  "birthYear": 1980
}
Success (201): the newly created author object.

Validation failure (400):

text
{ "message": "id, name, and birthYear are required and birthYear must be a number" }
Duplicate id (400):

text
{ "message": "An author with this id already exists" }
Error (500):

text
{ "message": "Internal server error" }
PUT /authors/:id
Purpose: Update an existing author.

Request body:

text
{
  "name": "Updated Author",
  "birthYear": 1981
}
Success (200): the updated author object.

Validation failure (400):

text
{ "message": "name and birthYear are required and birthYear must be a number" }
Not found (404):

text
{ "message": "Author not found" }
Error (500):

text
{ "message": "Internal server error" }
DELETE /authors/:id
Purpose: Delete an existing author, provided no books still reference the author.

Success (204): no response body.

Not found (404):

text
{ "message": "Author not found" }
Conflict (409):

text
{ "message": "Cannot delete author while books reference this author" }
Error (500):

text
{ "message": "Internal server error" }
Swagger Documentation
Every author route must be documented in Swagger, including:

The path and HTTP method

Path parameters (id)

The request body shape for POST and PUT, with an example JSON body

Every possible response status code and its description, including 409 on DELETE

Deployment Expectations
After implementation, the author routes must work locally and from the deployed Render application. The deployed Swagger page at /api-docs must allow someone to test every author route from the browser.

Out of Scope for Week 02
Authentication and authorization

Rate limiting

Pagination, filtering, and sorting on list routes

Indexes on authors.id and books.authorId (noted above as a future efficiency improvement)

Cascading deletes for books when an author is deleted (the spec instead blocks the author deletion)

Implementation Notes
Use the same database and connection from Week 01 (cse341-books-db, src/db/connect.js).

Follow the MVC pattern already in place: models in src/models/, controllers in src/controllers/, routes in src/router.js.

Use ESM import/export, arrow functions with explicit return on responses, async/await with try/catch, and const by default.

Never return raw database errors; log details on the server, return safe messages to clients.

Generate swagger.json with npm run swagger and commit it so Render can serve /api-docs.

Migrate existing Week 01 book documents before or during book API implementation.