# Backend Server Reference

This document provides information about the backend API server codebase for the Barber Shop Management System.

## Server Code Repository

The backend API server code is located in a separate repository:

**Repository Path**: `barber-shop-api`

To access the backend code for review or modifications, clone the backend repository alongside your frontend project:

```bash
git clone https://github.com/your-organization/barber-shop-api.git
```

## Backend Codebase Structure

The backend API server follows a typical Node.js/Express structure:

```
barber-shop-api/
├── src/
│   ├── controllers/        # Request handlers for API endpoints
│   │   ├── authController.js
│   │   ├── appointmentController.js
│   │   ├── customerController.js
│   │   ├── serviceController.js
│   │   ├── staffController.js
│   │   └── ...
│   ├── models/             # Database models/schemas
│   │   ├── Appointment.js
│   │   ├── Customer.js
│   │   ├── Service.js
│   │   ├── Staff.js
│   │   ├── User.js
│   │   └── ...
│   ├── routes/             # API route definitions
│   │   ├── authRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── staffRoutes.js
│   │   └── ...
│   ├── middleware/         # Custom middleware functions
│   │   ├── auth.js         # Authentication middleware
│   │   ├── validation.js   # Input validation middleware
│   │   └── ...
│   ├── services/           # Business logic services
│   │   ├── appointmentService.js
│   │   ├── emailService.js
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   ├── database.js     # Database connection
│   │   ├── logger.js       # Logging utility
│   │   └── ...
│   ├── config/             # Configuration files
│   │   ├── config.js       # Main configuration
│   │   └── ...
│   └── app.js              # Express application setup
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── server.js               # Entry point
```

## Key Files for API Endpoints

When modifying frontend API integrations, you may need to check these backend files:

1. **Controller Files** - Contain the logic for handling API requests
   - `src/controllers/appointmentController.js` - Appointment endpoints
   - `src/controllers/customerController.js` - Customer endpoints
   - `src/controllers/serviceController.js` - Service endpoints
   - `src/controllers/staffController.js` - Staff endpoints

2. **Route Files** - Define the API routes and connect them to controllers
   - `src/routes/appointmentRoutes.js` - Appointment routes
   - `src/routes/customerRoutes.js` - Customer routes
   - `src/routes/serviceRoutes.js` - Service routes
   - `src/routes/staffRoutes.js` - Staff routes

3. **Model Files** - Define the data structure
   - `src/models/Appointment.js` - Appointment data structure
   - `src/models/Customer.js` - Customer data structure
   - `src/models/Service.js` - Service data structure
   - `src/models/Staff.js` - Staff data structure

## Making Backend Changes

If you need to modify the backend API:

1. **For field changes**:
   - Update the corresponding model file
   - Update validation in controllers/middleware
   - Update frontend type definitions

2. **For new endpoints**:
   - Add route definition in the appropriate route file
   - Implement controller function
   - Add validation if needed
   - Update frontend service modules

3. **For query parameter changes**:
   - Modify controller logic for the endpoint
   - Update frontend API calls

## Admin Dashboard Endpoint Example

The `/appointments/admin-dashboard` endpoint used by the AdminAppointment page is defined in:

- **Route**: `src/routes/appointmentRoutes.js`
- **Controller**: `src/controllers/appointmentController.js` (likely in a function like `getAdminDashboard`)
- **Service Logic**: May be in `src/services/appointmentService.js`

## Running the Backend Server

To run the backend server locally:

1. Navigate to the backend repository
   ```bash
   cd barber-shop-api
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

The server typically runs on `http://localhost:3000` by default.

## Database Models

Understanding the database models is crucial when working with API responses. Key models include:

### Appointment Model

```javascript
// Simplified example of src/models/Appointment.js
const appointmentSchema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  staff_id: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  end_time: { type: String },
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  total_amount: { type: Number, required: true },
  notes: { type: String },
  // Additional fields
});
```

### AppointmentService Model (for appointment services)

```javascript
// Simplified example of src/models/AppointmentService.js
const appointmentServiceSchema = new Schema({
  appointment_id: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  service_id: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  service_name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }
});
```

## API Response Format

The backend consistently returns responses in this format:

```javascript
// Success response
{
  success: true,
  data_property: data_value, // e.g., appointments, customers, etc.
  // Additional metadata (if applicable)
  totalCount: 10,
  pages: 2
}

// Error response
{
  success: false,
  message: "Error message",
  error: {
    code: "ERROR_CODE",
    details: {} // Optional additional details
  }
}
```

## Authentication

The API uses JWT (JSON Web Token) authentication:

- Tokens are issued at `/auth/login`
- Protected routes check the `Authorization: Bearer <token>` header
- Token validation is handled in `src/middleware/auth.js`

## Troubleshooting Backend Issues

If you encounter issues with API responses:

1. Check the backend logs for errors
2. Verify the request is properly formatted
3. Check the corresponding controller for validation rules
4. Examine the database model for required fields
5. Test the endpoint directly using a tool like Postman

By understanding both the frontend and backend codebases, you can more effectively develop and troubleshoot the application. 