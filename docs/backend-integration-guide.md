# Backend Integration Guide

This document outlines the process for connecting frontend React components to the backend API server for the Barber Shop Management System.

## Architecture Overview

The application follows a client-server architecture:
- **Frontend**: React/TypeScript application using React Router for navigation
- **Backend**: REST API server with endpoints for all business operations
- **Data Flow**: API service modules → React hooks → React components

## Step 1: Understanding API Service Modules

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
  // Make sure to mark optional fields with ?
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

// Additional API functions for CRUD operations
```

## Step 2: Creating UI Data Types (if needed)

Create type definitions for UI components in `src/types/index.ts` if the API data structure needs transformation for the UI:

```typescript
// src/types/index.ts
export interface UIAppointment {
  id: string;
  customerId: string;
  customerName: string;
  // Define all UI-specific fields
  services: {
    serviceId: string;
    serviceName: string;
    price: number;
    duration: number;
  }[];
  // Additional UI-specific fields
}
```

## Step 3: Using the useApi Hook

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

## Step 4: Data Transformation

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

## Step 5: Handling API Changes

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

## Step 6: Error Handling

Always implement proper error handling:

```typescript
useEffect(() => {
  if (error) {
    toast({
      title: 'Error',
      description: `Failed to load data: ${error.message}`,
      variant: 'destructive',
    });
  }
}, [error, toast]);
```

## Step 7: Loading States

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

## Common API Endpoints

| Endpoint | Description | Service File |
|----------|-------------|-------------|
| `/appointments/admin-dashboard` | Gets all data for admin appointments page | `appointmentService.ts` |
| `/customers` | CRUD operations for customers | `customerService.ts` |
| `/services` | CRUD operations for services | `serviceService.ts` |
| `/staff` | CRUD operations for staff members | `staffService.ts` |
| `/auth` | Authentication operations | `authService.ts` |

## Authentication

All authenticated requests should include the JWT token in the Authorization header. The `apiClient.ts` handles this automatically:

```typescript
// src/api/apiClient.ts
import { getToken } from '@/utils/auth';

// Request interceptor to add auth token
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
});

instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

## Best Practices

1. **Single responsibility**: Each service module should handle one resource type
2. **Consistent naming**: Use consistent naming conventions for API and UI types
3. **Type safety**: Always define proper TypeScript interfaces for API responses
4. **Error boundaries**: Implement React error boundaries around API-dependent components
5. **Optimistic updates**: Consider implementing optimistic UI updates for better UX
6. **Data caching**: Use React Query or similar libraries for complex caching needs
7. **Defensive coding**: Always handle edge cases and provide fallbacks for missing data

## Troubleshooting

Common issues and solutions:

1. **"Cannot read properties of undefined"**: Check if your API response structure changed and update your type definitions
2. **Authentication errors**: Verify token expiration and refresh mechanism
3. **CORS issues**: Ensure backend has proper CORS configuration
4. **Performance issues**: Implement pagination, limit requested fields, or use virtualization for large data sets

## Example: Connecting a New Page

To connect a new page to the backend:

1. Create/identify the API service module
2. Define proper type interfaces
3. Use the `useApi` hook in your component
4. Transform data if needed
5. Implement loading and error states
6. Add proper error handling

Follow these steps for consistent backend integration across all pages of the application. 