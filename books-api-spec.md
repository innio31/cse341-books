Books API Spec
Version 1
Purpose
Create a basic read-only web service that stores book data in MongoDB and returns it as JSON so a client application can display a full book list and detailed information for a single book.

Data Model
A book record contains these fields:

id: string

author: string

title: string

publicationDate: string

Endpoints
1. GET /books

Returns all books.

Response status: 200 on success.

2. GET /books/:id

Returns one book with the matching id.

Response status: 200 on success.

If no match is found: 404.

Initial Assumptions
Book data is stored in a MongoDB collection named books.

The API returns JSON responses.

Only read operations are in scope for this feature.

Evaluation of Version 1
I reviewed Version 1 against the guided questions and identified the following weaknesses.

Are there any bugs or short-sighted decisions?
The publicationDate field has no defined format, so clients cannot reliably parse it. The list endpoint has no defined field set or ordering, which makes responses unpredictable. No error status codes are documented beyond a simple 404.

Are there any security concerns that are missing?
The spec does not say what happens when MongoDB or the server throws an error. Without guidance, a developer might return raw error details (including database internals) to the client, which leaks implementation details.

Are any parts of the route design slow?
No pagination is defined for GET /books. For a small seed dataset this is fine, but on a large collection returning every document in one response would be slow. I noted this as a future concern but left it out of scope for Week 1 because the dataset is small.

Are any response examples or error behaviors unclear?
Yes. There are no concrete JSON examples for success or not-found cases, so a developer cannot know the exact shape of a response. The 500 case is not documented at all.

Improvements to make in Version 2:

Pin publicationDate to ISO 8601 format.

Add concrete JSON examples for success, not-found, and server-error responses.

Document error handling so raw database details are never returned.

Add implementation notes (collection name, environment variables, seeding).

Add an out-of-scope section for clarity.

Version 2
Purpose
Build a read-only Books API in Express with MongoDB storage. The API returns JSON for a full book list and for a single book retrieved by id. This spec is the source of truth for the Week 1 implementation and the basis for the GitHub issues.

Data Model
MongoDB database: cse341-books-db

MongoDB collection: books

Field	Type	Required	Notes
id	string	yes	Custom identifier, e.g. "b1"
author	string	yes	
title	string	yes	
publicationDate	string	yes	ISO 8601 date format, e.g. "2021-08-17"
Example book document:

json
{
  "id": "b1",
  "author": "Maya Rivera",
  "title": "Patterns of Light",
  "publicationDate": "2021-08-17"
}
Endpoints
1. GET /books
Description: Return all books.

Success status: 200
Error status: 500

Success response example:

json
[
  {
    "id": "b1",
    "author": "Maya Rivera",
    "title": "Patterns of Light",
    "publicationDate": "2021-08-17"
  },
  {
    "id": "b2",
    "author": "Daniel Okafor",
    "title": "The Quiet Compass",
    "publicationDate": "2019-03-04"
  }
]
Error response example:

json
{
  "message": "Internal server error"
}
2. GET /books/:id
Description: Return one book whose id matches the route parameter.

Success status: 200
Not found status: 404
Error status: 500

Success response example:

json
{
  "id": "b1",
  "author": "Maya Rivera",
  "title": "Patterns of Light",
  "publicationDate": "2021-08-17"
}
Not found response example:

json
{
  "message": "Book not found"
}
Error response example:

json
{
  "message": "Internal server error"
}
Error Handling
Do not return stack traces or raw MongoDB error details to clients.

Log useful error details on the server for debugging.

Return safe, consistent JSON messages using the { "message": "..." } shape for all error responses.

Distinguish between client errors (404 when a resource does not exist) and server errors (500 when something unexpected fails).

Implementation Notes
Use the MongoDB collection named books inside the database cse341-books-db.

Seed the collection with at least 3 documents for testing (ids b1, b2, b3).

Store the MongoDB connection string and database name in environment variables (MONGODB_URI, MONGODB_DB_NAME). Do not commit secrets.

Connect to MongoDB at startup before the server begins listening for requests.

Follow course coding standards: ESM import/export, arrow functions with explicit return on responses, async/await with try/catch, const by default, and consistent JSON error shapes.

Out of Scope for Week 1
POST, PUT, PATCH, and DELETE routes

Authentication and authorization

Pagination, filtering, and sorting

Using MongoDB _id (ObjectId) for lookups — Week 1 uses a custom id field for simplicity