# API Endpoints Reference

This document provides a comprehensive list of all backend API endpoints available in the Barber Shop Management System. Use this as a reference when connecting new frontend pages to the backend.

## Base URL

All API endpoints are prefixed with: `/api`

## Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/login` | User login | `{ email, password }` | `{ success, token, user }` |
| POST | `/auth/register` | Register new user | `{ name, email, password, phone }` | `{ success, message }` |
| GET | `/auth/me` | Get current user | - | `{ success, user }` |
| POST | `/auth/refresh-token` | Refresh JWT token | `{ refreshToken }` | `{ success, token }` |
| POST | `/auth/logout` | Log out user | - | `{ success, message }` |

## Appointment Endpoints

| Method | Endpoint | Description | Query Parameters | Response |
|--------|----------|-------------|-----------------|----------|
| GET | `/appointments` | Get appointments list | `page, limit, sort, date, staffId, customerId, status` | `{ success, appointments, totalCount, pages }` |
| GET | `/appointments/admin-dashboard` | Get all admin dashboard data | `page, limit, sort, date, staffId, customerId, status` | `{ success, appointments, staff, services, totalCount, pages }` |
| GET | `/appointments/:id` | Get appointment by ID | - | `{ success, appointment }` |
| POST | `/appointments` | Create new appointment | Appointment object | `{ success, appointment }` |
| PUT | `/appointments/:id` | Update appointment | Appointment object | `{ success, appointment }` |
| DELETE | `/appointments/:id` | Cancel appointment | - | `{ success, message }` |
| POST | `/appointments/:id/reschedule` | Reschedule appointment | `{ date, time }` | `{ success, appointment }` |
| GET | `/appointments/available-slots` | Get available time slots | `date, staffId, serviceId` | `{ success, slots }` |

## Customer Endpoints

| Method | Endpoint | Description | Query Parameters | Response |
|--------|----------|-------------|-----------------|----------|
| GET | `/customers` | Get customers list | `page, limit, search, sort` | `{ success, customers, totalCount, pages }` |
| GET | `/customers/:id` | Get customer by ID | - | `{ success, customer }` |
| GET | `/customers/lookup/:phone` | Find customer by phone | - | `{ success, customer }` |
| POST | `/customers` | Create new customer | Customer object | `{ success, customer }` |
| PUT | `/customers/:id` | Update customer | Customer object | `{ success, customer }` |
| DELETE | `/customers/:id` | Delete customer | - | `{ success, message }` |

## Service Endpoints

| Method | Endpoint | Description | Query Parameters | Response |
|--------|----------|-------------|-----------------|----------|
| GET | `/services` | Get services list | `page, limit, category` | `{ success, services, totalCount, pages }` |
| GET | `/services/:id` | Get service by ID | - | `{ success, service }` |
| POST | `/services` | Create new service | Service object | `{ success, service }` |
| PUT | `/services/:id` | Update service | Service object | `{ success, service }` |
| DELETE | `/services/:id` | Delete service | - | `{ success, message }` |
| GET | `/services/categories` | Get all service categories | - | `{ success, categories }` |

## Staff Endpoints

| Method | Endpoint | Description | Query Parameters | Response |
|--------|----------|-------------|-----------------|----------|
| GET | `/staff` | Get staff list | `page, limit, is_available` | `{ success, staff, totalCount, pages }` |
| GET | `/staff/:id` | Get staff by ID | - | `{ success, staffMember }` |
| POST | `/staff` | Create new staff member | Staff object | `{ success, staffMember }` |
| PUT | `/staff/:id` | Update staff member | Staff object | `{ success, staffMember }` |
| DELETE | `/staff/:id` | Delete staff member | - | `{ success, message }` |
| PUT | `/staff/:id/availability` | Update staff availability | `{ is_available }` | `{ success, staffMember }` |

## Dashboard Endpoints

| Method | Endpoint | Description | Query Parameters | Response |
|--------|----------|-------------|-----------------|----------|
| GET | `/dashboard/summary` | Get dashboard summary | `startDate, endDate` | `{ success, summary }` |
| GET | `/dashboard/revenue` | Get revenue stats | `startDate, endDate, groupBy` | `{ success, revenue }` |
| GET | `/dashboard/appointments` | Get appointment stats | `startDate, endDate, groupBy` | `{ success, appointments }` |
| GET | `/dashboard/top-services` | Get top services | `startDate, endDate, limit` | `{ success, services }` |
| GET | `/dashboard/top-staff` | Get top staff | `startDate, endDate, limit` | `{ success, staff }` |

## Settings Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/settings` | Get all settings | - | `{ success, settings }` |
| PUT | `/settings` | Update settings | Settings object | `{ success, settings }` |
| GET | `/settings/business-hours` | Get business hours | - | `{ success, businessHours }` |
| PUT | `/settings/business-hours` | Update business hours | Business hours object | `{ success, businessHours }` |

## Request and Response Examples

### Example: Creating a new appointment

**Request:**
```json
POST /api/appointments
{
  "customer_id": "77a0cf8e-9e66-4b24-9ecc-476806166f59",
  "staff_id": "e5558c69-4af3-4490-b1a0-af83f19ce59a",
  "date": "2025-06-08",
  "time": "13:00:00",
  "status": "scheduled",
  "notes": "",
  "services": [
    {
      "service_id": "322d430e-5c95-4c75-a3c4-dd40397c88ad"
    },
    {
      "service_id": "3093855b-2f4f-40c4-b366-fd6bbe8d5d44"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "appointment": {
    "id": "904cff6a-e684-4d66-8a5b-da4a64da6c79",
    "customer_id": "77a0cf8e-9e66-4b24-9ecc-476806166f59",
    "staff_id": "e5558c69-4af3-4490-b1a0-af83f19ce59a",
    "date": "2025-06-08",
    "time": "13:00:00",
    "end_time": "14:00:00",
    "status": "scheduled",
    "total_amount": "60.00",
    "notes": "",
    "customer_name": "krish",
    "customer_phone": "9974617442",
    "customer_email": null,
    "staff_name": "Test Staff Member",
    "created_at": "2025-06-08T12:58:25.000Z",
    "updated_at": "2025-06-08T12:58:25.000Z",
    "appointmentServices": [
      {
        "id": "5f5d5c98-1294-43e1-a192-8f4a13668021",
        "appointment_id": "904cff6a-e684-4d66-8a5b-da4a64da6c79",
        "service_id": "322d430e-5c95-4c75-a3c4-dd40397c88ad",
        "service_name": "Test Haircut Updated",
        "price": "30.00",
        "duration": 30
      },
      {
        "id": "708c65cf-6923-4a3c-9750-17dd5a4824c1",
        "appointment_id": "904cff6a-e684-4d66-8a5b-da4a64da6c79",
        "service_id": "3093855b-2f4f-40c4-b366-fd6bbe8d5d44",
        "service_name": "Test Haircut Updated",
        "price": "30.00",
        "duration": 30
      }
    ]
  }
}
```

### Example: Admin Dashboard Response

```json
{
  "success": true,
  "appointments": [
    {
      "id": "904cff6a-e684-4d66-8a5b-da4a64da6c79",
      "customer_id": "77a0cf8e-9e66-4b24-9ecc-476806166f59",
      "staff_id": "e5558c69-4af3-4490-b1a0-af83f19ce59a",
      "date": "2025-06-08",
      "time": "13:00:00",
      "end_time": "14:00:00",
      "status": "scheduled",
      "total_amount": "60.00",
      "notes": "",
      "customer_name": "krish",
      "customer_phone": "9974617442",
      "customer_email": null,
      "staff_name": "Test Staff Member",
      "created_at": "2025-06-08T12:58:25.000Z",
      "updated_at": "2025-06-08T12:58:25.000Z",
      "customer": {
        "id": "77a0cf8e-9e66-4b24-9ecc-476806166f59",
        "name": "krish",
        "email": null,
        "phone": "9974617442"
      },
      "staff": {
        "id": "e5558c69-4af3-4490-b1a0-af83f19ce59a",
        "position": "Test Barber"
      },
      "appointmentServices": [
        {
          "id": "5f5d5c98-1294-43e1-a192-8f4a13668021",
          "appointment_id": "904cff6a-e684-4d66-8a5b-da4a64da6c79",
          "service_id": "322d430e-5c95-4c75-a3c4-dd40397c88ad",
          "service_name": "Test Haircut Updated",
          "price": "30.00",
          "duration": 30
        }
      ]
    }
  ],
  "staff": [
    {
      "id": "e5558c69-4af3-4490-b1a0-af83f19ce59a",
      "name": "Test Staff Member",
      "email": "teststaff@example.com",
      "phone": "",
      "position": "Test Barber",
      "avatar": null
    }
  ],
  "services": [
    {
      "id": "3093855b-2f4f-40c4-b366-fd6bbe8d5d44",
      "name": "Test Haircut Updated",
      "price": "30.00",
      "duration": 30,
      "description": "A test haircut service"
    }
  ],
  "totalCount": 1,
  "pages": 1
}
```

## Error Handling

All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "message": "Error message explaining what went wrong",
  "error": {
    "code": "ERROR_CODE",
    "details": {}  // Optional additional error details
  }
}
```

Common error codes:
- `INVALID_INPUT`: Invalid request parameters or body
- `NOT_FOUND`: Requested resource not found
- `UNAUTHORIZED`: Authentication required or failed
- `FORBIDDEN`: Insufficient permissions
- `CONFLICT`: Resource conflict (e.g., duplicate entry)
- `SERVER_ERROR`: Internal server error

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication.

Authentication is performed using JWT tokens sent in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
``` 