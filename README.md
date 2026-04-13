# Name Classifier API

A backend API built with NestJS that integrates with the Genderize API to classify names by gender and return processed insights.

---

## Live API

Base URL:
https://name-classifier-api-production.up.railway.app

---

## Endpoint

### GET /api/classify

Classifies a given name using an external API and returns processed data.

---

## Query Parameters

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| name      | string | Yes      | Name to classify |

---

## Example Request

```
GET /api/classify?name=john
```

---

## Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-12T10:00:00Z"
  }
}
```

---

## Error Responses

### 400 Bad Request (Missing name)

```json
{
  "status": "error",
  "message": "Missing name parameter"
}
```

---

### 422 Unprocessable Entity (Invalid or no prediction)

```json
{
  "status": "error",
  "message": "No prediction available for the provided name"
}
```

---

### 502 Bad Gateway (External API failure)

```json
{
  "status": "error",
  "message": "Upstream or server failure"
}
```

---

## Processing Logic

* Extracts:

  * `gender`
  * `probability`
  * `count` → renamed to `sample_size`

* Computes:

```
is_confident = probability >= 0.7 AND sample_size >= 100
```

* Adds:

  * `processed_at` (UTC ISO 8601 timestamp generated per request)

---

## CORS

CORS is enabled for all origins:

```
Access-Control-Allow-Origin: *
```

---

## Tech Stack

* NestJS
* TypeScript
* Axios (HTTP client)
* External API: Genderize API

---

## Running Locally

```bash
npm install
npm run start:dev
```

App runs on:

```
http://localhost:3000
```

---

## Production Build

```bash
npm run build
npm run start
```

---

## Testing the API

Example:

```
http://localhost:3000/api/classify?name=wisdom
```

---

## Author
Wisdom Abasibom for
Backend Internship Stage 0 Task Submission
