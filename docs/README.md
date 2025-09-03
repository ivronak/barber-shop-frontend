# Barber Shop Management System Documentation

This directory contains comprehensive documentation for the Barber Shop Management System.

## Backend Integration

These documents explain how to connect frontend components to the backend API:

- [Backend Integration Guide](./backend-integration-guide.md) - Detailed guide on connecting frontend to backend
- [API Endpoints Reference](./api-endpoints-reference.md) - Complete list of all available API endpoints
- [Backend Integration Checklist](./backend-integration-checklist.md) - Step-by-step checklist for integrating new pages
- [Error Handling Guide](./error-handling-guide.md) - Best practices for handling API errors
- [Backend Server Reference](./backend-server-reference.md) - Information about the backend API server codebase

## Backend API Server

The backend API server code is located in a separate repository:

**Repository Path**: `barber-shop-api`

This repository contains the Node.js/Express server that powers all API endpoints. See the [Backend Server Reference](./backend-server-reference.md) for detailed information about:

- Server codebase structure
- Key files for API endpoints
- How to make backend changes
- Running the backend server locally
- Database models
- API response formats
- Authentication system
- Troubleshooting backend issues

## Architecture Diagrams

The project uses a layered architecture:

1. **API Layer** - Handles communication with the backend
2. **Service Layer** - Provides typed API functions for the application
3. **Hook Layer** - Custom hooks for data fetching and state management
4. **Component Layer** - React components for the UI

## Data Flow

Data flows through the application in the following way:

1. API request from service module
2. Response handling in useApi hook
3. Data transformation (if needed)
4. Component rendering with data
5. User interactions trigger new API requests

## Example Pages

The following pages serve as good examples of proper backend integration:

- **Admin Appointment Page** - Comprehensive example with filtering, data transformation, and error handling
- **Customer Management** - Example of CRUD operations with form validation
- **Service Management** - Another CRUD example with different data structure

## Best Practices Summary

1. Use typed API service modules for all backend communication
2. Transform API data to UI-friendly format when necessary
3. Implement proper loading states and error handling
4. Use defensive programming to handle API changes
5. Provide clear feedback to users during API operations

## Contributing to Documentation

When adding new features or pages that interact with the backend:

1. Update the API endpoints reference if new endpoints are added
2. Document any special handling or workarounds
3. Add examples of successful patterns
4. Update type definitions in the documentation 