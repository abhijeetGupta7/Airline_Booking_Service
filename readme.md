# ✈️ Airline Booking Service API Documentation

## Overview

The Airline Booking Service provides RESTful APIs for managing flight bookings, including creating bookings and processing payments with idempotency support.
Built using **Node.js**, **Express**, and **Sequelize**, this service ensures robust and consistent booking operations.

---

## Base URL

```
/api/v1
```

---

## Endpoints

### 1. Health Check

**GET** `/api/v1/info`

Checks if the API is live.

#### Response

* **Status 200 OK**

```json
{
  "message": "API is live"
}
```

---

### 2. Create Booking

**POST** `/api/v1/bookings/`

Creates a new booking for a specified flight.

#### Request Body

```json
{
  "flightId": 123,
  "noOfSeats": 2,
  "userId": 456
}
```

#### Response

* **Status 201 Created**

```json
{
  "success": true,
  "message": "Successfully created the Booking",
  "data": {
    "id": 1,
    "flightId": 123,
    "userId": 456,
    "status": "initiated",
    "noOfSeats": 2,
    "totalCost": 1000,
    "updatedAt": "2024-08-27T07:39:21.000Z",
    "createdAt": "2024-08-27T07:39:21.000Z"
  },
  "error": {}
}
```

#### Error Response (e.g., Not enough seats)

* **Status 400 Bad Request**

```json
{
  "success": false,
  "message": "Something went wrong while creating Booking",
  "data": {},
  "error": {
    "statusCode": 400,
    "details": "Required number of seats not available"
  }
}
```

---

### 3. Make Payment

**POST** `/api/v1/bookings/payments`

Processes payment for a booking. This endpoint is **idempotent** and requires a unique `x-idempotencykey` header.

#### Headers

```
x-idempotencykey: <unique-string>
Content-Type: application/json
```

#### Request Body

```json
{
  "bookingId": 1,
  "totalCost": 1000,
  "userId": 456
}
```

#### Response

* **Status 201 Created**

```json
{
  "success": true,
  "message": "Successfully Booked the Booking",
  "data": true,
  "error": {}
}
```

#### Error Responses

* **Missing Idempotency Key**

```json
{
  "success": false,
  "message": "Something went wrong while making payment",
  "data": {},
  "error": {
    "details": "Idempotency key not found"
  }
}
```

* **Payment Already Done**

```json
{
  "success": false,
  "message": "Something went wrong while making payment",
  "data": {},
  "error": {
    "details": "Payment already done"
  }
}
```

* **Booking Expired or Cancelled**

```json
{
  "success": false,
  "message": "Something went wrong while making Payment",
  "data": {},
  "error": {
    "details": "The booking has been expired"
  }
}
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "<error message>",
  "data": {},
  "error": {
    "details": "<detailed error info>"
  }
}
```

---

## Idempotency Support

* The `/bookings/payments` endpoint enforces **idempotency** using the `x-idempotencykey` header.
* Reusing the same key will prevent duplicate payment processing and return an appropriate error if already processed.

---

## Running the Service

### 1. Install dependencies:

```sh
npm install
```

### 2. Set environment variables in `.env`:

```
PORT=3000
FLIGHT_SEARCH_SERVICE_URL=http://localhost:3002
```

### 3. Start the server:

```sh
npm start
```

---

## Notes

* The service integrates with a flight search service via the URL specified in `FLIGHT_SEARCH_SERVICE_URL`.
* Notification events are pushed to a **RabbitMQ** queue (`noti-queue`) for asynchronous processing.

---

## Folder Structure

Refer to the [project structure](#) for more details.


