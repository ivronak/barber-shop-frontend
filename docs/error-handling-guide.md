# Error Handling Guide for API Integration

This document outlines the recommended approach for handling errors when integrating with the backend API in the Barber Shop Management System.

## Common Error Types

When working with the API, you'll encounter several types of errors:

1. **Network Errors**: Connection failures, timeouts, etc.
2. **API Errors**: 400, 404, 500 responses from the server
3. **Data Structure Errors**: Missing fields, unexpected data types
4. **Authentication Errors**: 401, 403 responses
5. **Validation Errors**: 422 responses with field-specific errors

## Error Handling Layers

The application implements a multi-layered approach to error handling:

### 1. API Client Layer

The `apiClient.ts` file handles low-level HTTP errors:

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

// Example of error handling in a GET request
export const get = async <T>(url: string): Promise<T> => {
  try {
    const response = await instance.get<T>(url);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
};
```

### 2. Service Layer

API service modules add domain-specific error handling:

```typescript
// src/api/services/appointmentService.ts
export const getAdminAppointments = async (
  page = 1,
  limit = 100,
  sort = 'date_asc',
  date?: string,
  staffId?: string,
  customerId?: string,
  status?: string
): Promise<AdminAppointmentsResponse> => {
  try {
    let url = `/appointments/admin-dashboard?page=${page}&limit=${limit}&sort=${sort}`;
    
    if (date) url += `&date=${date}`;
    if (staffId) url += `&staffId=${staffId}`;
    if (customerId) url += `&customerId=${customerId}`;
    if (status) url += `&status=${status}`;
    
    return get<AdminAppointmentsResponse>(url);
  } catch (error) {
    console.error('Error fetching admin appointments:', error);
    throw error; // Re-throw to be handled by the component
  }
};
```

### 3. Hook Layer

The `useApi` hook provides a standardized way to handle API errors:

```typescript
// src/hooks/useApi.ts
export const useApi = <T, P extends any[]>(
  apiFunction: (...args: P) => Promise<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute };
};
```

### 4. Component Layer

Components handle user-facing error messages:

```typescript
// Example in a component
const YourComponent = () => {
  const { toast } = useToast();
  const {
    data: adminData,
    loading: isLoading,
    error: apiError,
    execute: fetchAdminData
  } = useApi(getAdminAppointments);

  // Handle errors
  useEffect(() => {
    if (apiError) {
      toast({
        title: 'Error',
        description: `Failed to load data: ${apiError.message}`,
        variant: 'destructive',
      });
    }
  }, [apiError, toast]);

  // Conditional rendering based on error state
  if (apiError && !adminData) {
    return (
      <div className="p-4 border border-destructive rounded-md">
        <h3 className="text-destructive font-medium">Error loading appointments</h3>
        <p>{apiError.message}</p>
        <Button onClick={() => fetchAdminData()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  // Rest of component...
};
```

## Data Structure Error Handling

For handling API structure changes or missing data:

```typescript
// Safe data access with fallbacks
const convertApiToUIAppointment = (apiAppointment: ApiAppointment): UIAppointment => {
  return {
    id: apiAppointment.id,
    customerId: apiAppointment.customer_id,
    customerName: apiAppointment.customer_name || 'Unknown',
    // Handle potential structure changes by checking both fields
    services: (apiAppointment.appointmentServices || apiAppointment.services || []).map(service => ({
      serviceId: service.service_id,
      serviceName: service.service_name || 'Unknown Service',
      price: parseFloat(service.price.toString()) || 0,
      duration: service.duration || 30
    })),
    // Other fields...
  };
};
```

## Form Validation Errors

For handling validation errors in forms:

```typescript
const handleSubmit = async (formData) => {
  try {
    setSubmitting(true);
    const response = await createAppointment(formData);
    toast({
      title: "Success",
      description: "Appointment created successfully",
    });
    onSuccess(response.appointment);
  } catch (error) {
    // Check for validation errors
    if (error.status === 422 && error.data.errors) {
      // Map backend validation errors to form fields
      const fieldErrors = {};
      error.data.errors.forEach(err => {
        fieldErrors[err.field] = err.message;
      });
      setErrors(fieldErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted fields",
        variant: "destructive"
      });
    } else {
      // Handle other errors
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment",
        variant: "destructive"
      });
    }
  } finally {
    setSubmitting(false);
  }
};
```

## Authentication Errors

For handling authentication errors:

```typescript
// In apiClient.ts
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized errors
    if (error.response && error.response.status === 401) {
      // Redirect to login or try to refresh token
      logout(); // Clear current auth state
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Best Practices

1. **Never silently fail**: Always inform the user when errors occur
2. **Provide recovery options**: Allow users to retry operations when possible
3. **Use appropriate UI**: Show inline errors for form fields, toasts for operations
4. **Log errors**: Log errors to the console for debugging (and to a service in production)
5. **Handle offline scenarios**: Detect and handle network connectivity issues
6. **Defensive coding**: Always use fallbacks for potentially missing data
7. **Use type guards**: For safer type handling in TypeScript

## Error Boundary

Implement React Error Boundaries to catch rendering errors:

```jsx
// src/components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service here
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-destructive rounded-md">
          <h3 className="text-destructive font-medium">Something went wrong</h3>
          <p className="text-sm text-muted-foreground">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            className="mt-2 text-sm text-primary"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Wrap components that make API calls with the error boundary:

```jsx
<ErrorBoundary>
  <AdminAppointment />
</ErrorBoundary>
```

## Specific Examples from the Project

### Example 1: Handling API structure changes in the appointments page

```typescript
// Defensive approach to handle API structure changes
const appointmentServices = appointment.appointmentServices || appointment.services || [];
      
const isServiceMatch = serviceFilter === 'all' || 
  appointmentServices.some(service => service.service_id === serviceFilter);
```

### Example 2: Handling loading states in the UI

```jsx
{isLoading ? (
  <div className="flex justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
) : (
  <AppointmentList appointments={uiAppointments} />
)}
```

### Example 3: Providing user feedback on errors

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

By following these patterns consistently, the application can handle errors gracefully and provide a better user experience. 