# Barber Shop Management System: Backend Integration Guide

This comprehensive guide explains how to connect frontend components to the backend API server in the Barber Shop Management System.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend API Server](#backend-api-server)
3. [Frontend Integration Process](#frontend-integration-process)
4. [API Service Modules](#api-service-modules)
5. [Data Transformation](#data-transformation)
6. [Error Handling](#error-handling)
7. [Loading States](#loading-states)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Integration Checklist](#integration-checklist)
10. [Common Issues & Solutions](#common-issues--solutions)
11. [AdminAppointment Example](#adminappointment-example)

## Architecture Overview

The application follows a client-server architecture:
- **Frontend**: React/TypeScript application using React Router for navigation
- **Backend**: REST API server (Node.js/Express) with endpoints for all business operations
- **Data Flow**: API service modules → React hooks → React components → UI

```
Frontend                       Backend (barber-shop-api)
┌─────────────────────┐        ┌─────────────────────┐
│                     │        │                     │
│  ┌─────────────┐    │        │  ┌─────────────┐    │
│  │ Components  │    │        │  │  Routes     │    │
│  └─────┬───────┘    │        │  └─────┬───────┘    │
│        │            │        │        │            │
│  ┌─────┴───────┐    │ HTTP   │  ┌─────┴───────┐    │
│  │   Hooks     ├────┼───────►│  │Controllers  │    │
│  └─────┬───────┘    │Request │  └─────┬───────┘    │
│        │            │        │        │            │
│  ┌─────┴───────┐    │ HTTP   │  ┌─────┴───────┐    │
│  │API Services ◄────┼───────┤  │   Models    │    │
│  └─────────────┘    │Response│  └─────────────┘    │
│                     │        │                     │
└─────────────────────┘        └─────────────────────┘
```

## Backend API Server

The backend API server code is located in a separate repository:

**Repository Path**: `barber-shop-api`

### Server Structure

```
barber-shop-api/
├── src/
│   ├── controllers/        # Request handlers for API endpoints
│   ├── models/             # Database models/schemas
│   ├── routes/             # API route definitions
│   ├── middleware/         # Custom middleware functions
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   └── app.js              # Express application setup
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── server.js               # Entry point
```

### Key Backend Files

When working with API integrations, you may need to check these backend files:

1. **Controller Files** - `src/controllers/appointmentController.js`, etc.
2. **Route Files** - `src/routes/appointmentRoutes.js`, etc.
3. **Model Files** - `src/models/Appointment.js`, etc.

## Frontend Integration Process

The typical process for connecting a frontend page to the backend:

1. **Create API Service Module** - Define types and API functions
2. **Implement Custom Hook** - Use the `useApi` hook for data fetching
3. **Transform Data** - Convert API response to UI-friendly format if needed
4. **Handle Errors & Loading** - Implement proper UX for all states
5. **Render Components** - Display data in the UI components

## API Service Modules

All API communication is encapsulated in service modules located in `src/api/services/`.

### Example: AppointmentService

```typescript
// src/api/services/appointmentService.ts
import { get, post, put, del } from '../apiClient';

// Type definitions for API data structures
export interface AppointmentService {
  service_id: string;
  service_name: string;
  price: number;
  duration: number;
  // Include any additional fields from API
}

export interface Appointment {
  id: string;
  customer_id: string;
  // Define all fields returned by the API
  services?: AppointmentService[];
  appointmentServices?: AppointmentService[];
  // Additional related entities
  customer?: Customer;
  staff?: StaffMember;
}

// Response interface definitions
export interface AdminAppointmentsResponse {
  success: boolean;
  appointments: Appointment[];
  staff: Staff[];
  services: Service[];
  totalCount: number;
  pages: number;
}

// API functions
export const getAdminAppointments = async (
  page = 1,
  limit = 100,
  sort = 'date_asc',
  date?: string,
  staffId?: string,
  customerId?: string,
  status?: string
): Promise<AdminAppointmentsResponse> => {
  let url = `/appointments/admin-dashboard?page=${page}&limit=${limit}&sort=${sort}`;
  
  if (date) url += `&date=${date}`;
  if (staffId) url += `&staffId=${staffId}`;
  if (customerId) url += `&customerId=${customerId}`;
  if (status) url += `&status=${status}`;
  
  return get<AdminAppointmentsResponse>(url);
};
```

## Using the useApi Hook

The application provides a custom hook `useApi` for handling API requests:

```typescript
// Example in a component
import { useApi } from '@/hooks/useApi';
import { getAdminAppointments } from '@/api/services/appointmentService';

const YourComponent = () => {
  const {
    data,           // The response data
    loading,        // Boolean indicating if request is in progress
    error,          // Error object if request failed
    execute         // Function to call the API
  } = useApi(getAdminAppointments);

  // Call the API with parameters
  useEffect(() => {
    execute(1, 100, 'date_asc', '2023-06-01');
  }, [execute]);

  // Handle loading state
  if (loading) return <LoadingSpinner />;

  // Handle error state
  if (error) return <ErrorMessage message={error.message} />;

  // Use the data
  return (
    <div>
      {data?.appointments.map(appointment => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
};
```

## Data Transformation

When API data structure differs from UI requirements, create transformation functions:

```typescript
const convertApiToUIAppointment = (apiAppointment: ApiAppointment): UIAppointment => {
  return {
    id: apiAppointment.id,
    customerId: apiAppointment.customer_id,
    customerName: apiAppointment.customer_name,
    // Transform other fields
    services: (apiAppointment.appointmentServices || apiAppointment.services || []).map(service => ({
      serviceId: service.service_id,
      serviceName: service.service_name,
      price: service.price,
      duration: service.duration
    })),
    // Transform other fields
  };
};
```

### Handling API Changes

The backend API may evolve over time. Follow these practices to handle changes:

1. **Defensive programming**: Always check for nulls and provide fallbacks
   ```typescript
   const services = apiAppointment.appointmentServices || apiAppointment.services || [];
   ```

2. **Type guards**: Use TypeScript type guards when necessary
   ```typescript
   if ('appointmentServices' in apiAppointment && apiAppointment.appointmentServices) {
     // Handle appointmentServices
   }
   ```

3. **Optional chaining**: Use ?. operator to safely access nested properties
   ```typescript
   const customerEmail = appointment.customer?.email || 'No email';
   ```

## Error Handling

The application implements a multi-layered approach to error handling:

### 1. API Client Layer

```typescript
// src/api/apiClient.ts
import axios, { AxiosError } from 'axios';

// Error handling in the base API client
const handleError = (error: AxiosError) => {
  if (error.response) {
    // The request was made and the server responded with an error status
    return Promise.reject({
      message: error.response.data.message || 'Server error',
      status: error.response.status,
      data: error.response.data
    });
  } else if (error.request) {
    // The request was made but no response was received
    return Promise.reject({
      message: 'No response from server. Please check your connection.',
      status: 0
    });
  } else {
    // Something happened in setting up the request
    return Promise.reject({
      message: error.message || 'Error setting up request',
      status: 0
    });
  }
};
```

### 2. Component Layer

Components handle user-facing error messages:

```typescript
useEffect(() => {
  if (apiError) {
    toast({
      title: 'Error',
      description: `Failed to load data: ${apiError.message}`,
      variant: 'destructive',
    });
  }
}, [apiError, toast]);
```

## Loading States

Implement loading states to improve user experience:

```tsx
{isLoading ? (
  <div className="flex justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
) : (
  <AppointmentList appointments={uiAppointments} />
)}
```

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | Register new user |
| GET | `/auth/me` | Get current user |
| POST | `/auth/refresh-token` | Refresh JWT token |

### Appointment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments` | Get appointments list |
| GET | `/appointments/admin-dashboard` | Get all admin dashboard data |
| GET | `/appointments/:id` | Get appointment by ID |
| POST | `/appointments` | Create new appointment |
| PUT | `/appointments/:id` | Update appointment |
| DELETE | `/appointments/:id` | Cancel appointment |
| POST | `/appointments/:id/reschedule` | Reschedule appointment |
| GET | `/appointments/available-slots` | Get available time slots |

### Customer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | Get customers list |
| GET | `/customers/:id` | Get customer by ID |
| GET | `/customers/lookup/:phone` | Find customer by phone |
| POST | `/customers` | Create new customer |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |

### Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | Get services list |
| GET | `/services/:id` | Get service by ID |
| POST | `/services` | Create new service |
| PUT | `/services/:id` | Update service |
| DELETE | `/services/:id` | Delete service |
| GET | `/services/categories` | Get all service categories |

### Staff Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/staff` | Get staff list |
| GET | `/staff/:id` | Get staff by ID |
| POST | `/staff` | Create new staff member |
| PUT | `/staff/:id` | Update staff member |
| DELETE | `/staff/:id` | Delete staff member |
| PUT | `/staff/:id/availability` | Update staff availability |

## Integration Checklist

Use this checklist when connecting a new frontend page to the backend API:

### Initial Setup

- [ ] Identify the API endpoints needed for the page
  - [ ] Check available endpoints in this guide
  - [ ] Verify parameters and response structure
  - [ ] Check backend implementation in `barber-shop-api` if needed

- [ ] Create/update API service module(s)
  - [ ] Define type interfaces for request/response data
  - [ ] Implement API functions for all required operations
  - [ ] Add proper error handling

### Backend Code Review (if needed)

- [ ] Check the backend implementation for relevant endpoints
  - [ ] Review the controller in `barber-shop-api/src/controllers/`
  - [ ] Examine the route definition in `barber-shop-api/src/routes/`
  - [ ] Check the database model in `barber-shop-api/src/models/`

### Component Implementation

- [ ] Create proper type definitions for UI components
- [ ] Implement API data fetching with the `useApi` hook
- [ ] Add loading states with appropriate UI feedback
- [ ] Implement proper error handling and user feedback
- [ ] Implement form validation (client-side and handle server errors)
- [ ] Test API integration thoroughly

### Defensive Programming

- [ ] Add null checking for all API responses
- [ ] Handle API structure changes gracefully
- [ ] Implement proper loading states

### Performance Considerations

- [ ] Minimize API calls (combine related calls where possible)
- [ ] Use pagination for large datasets
- [ ] Optimize rendering to avoid unnecessary re-renders

## Common Issues & Solutions

### 1. "Cannot read properties of undefined"

This usually occurs when you're trying to access a property of an object that doesn't exist. For example, trying to map over `services` when it's undefined.

**Solution**: Use defensive programming techniques:

```typescript
// Before (risky)
appointment.services.map(service => {...})

// After (safe)
(appointment.services || []).map(service => {...})

// Even better (handles API changes)
(appointment.appointmentServices || appointment.services || []).map(service => {...})
```

### 2. Type Conversion Issues

Backend may return numbers as strings or vice versa.

**Solution**: Explicitly convert types:

```typescript
price: parseFloat(service.price.toString()) || 0
```

### 3. API Structure Changes

The structure of API responses may change over time.

**Solution**: Design your code to handle multiple possible structures:

```typescript
// Check for both new and old field names
const appointmentServices = appointment.appointmentServices || appointment.services || [];
```

## AdminAppointment Example

The AdminAppointment page integration serves as a good reference:

### Frontend Files:
- `src/pages/AdminAppointment.tsx` - Main page component
- `src/api/services/appointmentService.ts` - API service module
- `src/features/appointments/NewAppointmentDialog.tsx` - New appointment form

### Backend Files:
- `barber-shop-api/src/controllers/appointmentController.js` - API logic
- `barber-shop-api/src/routes/appointmentRoutes.js` - Route definitions
- `barber-shop-api/src/models/Appointment.js` - Data model

### Key Implementation Features:

1. **Combined API Endpoint** - Uses `/appointments/admin-dashboard` to fetch all required data in a single request

2. **Data Transformation** - Converts API data to UI-friendly format:
   ```typescript
   const convertApiToUIAppointment = (apiAppointment: ApiAppointment): UIAppointment => {
     return {
       id: apiAppointment.id,
       // ... other fields
       services: (apiAppointment.appointmentServices || apiAppointment.services || []).map(service => ({
         serviceId: service.service_id,
         serviceName: service.service_name,
         price: service.price,
         duration: service.duration
       })),
     };
   };
   ```

3. **Defensive Programming** - Handles potential API changes:
   ```typescript
   const appointmentServices = appointment.appointmentServices || appointment.services || [];
   ```

4. **Loading States** - Shows spinner during API calls:
   ```tsx
   {isLoading ? (
     <div className="flex justify-center p-4">
       <Loader2 className="h-6 w-6 animate-spin text-primary" />
     </div>
   ) : (
     <AppointmentList appointments={uiAppointments} />
   )}
   ```

5. **Error Handling** - Displays error messages to users:
   ```typescript
   useEffect(() => {
     if (apiError) {
       toast({
         title: 'Error',
         description: `Failed to load data: ${apiError.message}`,
         variant: 'destructive',
       });
     }
   }, [apiError, toast]);
   ```

By following these patterns consistently, you can create robust and maintainable integrations between the frontend and backend components of the Barber Shop Management System. 