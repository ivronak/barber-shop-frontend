# Barber Shop API Integration

This document provides information about the integration with the Barber Shop Management API.

## Overview

The frontend now integrates with a RESTful API backend to manage data persistence and business logic. The implementation:

- Uses JWT authentication for secure API access
- Provides TypeScript interfaces for all data models
- Implements proper error handling and loading states
- Includes a flexible API client that supports all HTTP methods

## API Integration Components

### Core API Client

- `src/api/apiClient.ts` - Core API client with authentication and error handling
- `src/api/auth.ts` - Authentication service for token management

### API Services

The following API services have been implemented:

- Staff Management (`src/api/services/staffService.ts`)
- Services Management (`src/api/services/serviceService.ts`)
- Customer Management (`src/api/services/customerService.ts`)
- Appointment Management (`src/api/services/appointmentService.ts`)
- Invoice Management (`src/api/services/invoiceService.ts`) 
- Business Settings (`src/api/services/settingsService.ts`)
- Reports & Analytics (`src/api/services/reportService.ts`)
- Public Website API (`src/api/services/publicService.ts`)

### Helper Hooks

- `src/hooks/useApi.ts` - Custom hook for API calls with loading/error states
- `src/hooks/useApiConfig.ts` - Configuration hook for API base URL management

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Usage Examples

### Authentication

```tsx
import { useAuth } from '@/lib/auth';

function LoginForm() {
  const { login, isAuthenticated } = useAuth();
  
  const handleSubmit = async (email, password) => {
    try {
      await login(email, password);
      // Successful login
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    // Login form
  );
}
```

### Fetching Data

```tsx
import { useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { getAllStaff } from '@/api';

function StaffList() {
  const { data, loading, error, execute } = useApi(getAllStaff);
  
  useEffect(() => {
    execute();
  }, [execute]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.staff.map(staff => (
        <div key={staff.id}>{staff.name}</div>
      ))}
    </div>
  );
}
```

### Creating or Updating Data

```tsx
import { createStaff } from '@/api';

async function addStaffMember(staffData) {
  try {
    const response = await createStaff(staffData);
    // Handle success
    return response.staff;
  } catch (error) {
    // Handle error
  }
}
```

## Error Handling

The API integration includes comprehensive error handling:

- Authentication errors (401) automatically redirect to login
- Network errors are properly caught and can be displayed to users
- Loading states are tracked to show appropriate UI feedback

## Mocking Strategy

During development, when the API is not available, you can:

1. Use the existing mock data (still available in `src/mocks/`)
2. Create a local mock server using tools like MSW (Mock Service Worker)
3. Fall back to mock data when API calls fail (for demo purposes) 