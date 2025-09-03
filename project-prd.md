# 🧩 Barber Shop Management System – Combined Product Requirements Document (PRD)

**Phase:** UI + Frontend Logic (Dummy Data)  
**Goal:** Deliver both an Admin Panel and a Public-Facing Website prototype—fully interactive, responsive, and driven by mock data—with a shared design system and booking flow.

---


## 1. Objectives

### Admin Panel
- Enable administrators to manage staff, appointments, services, commissions, POS/invoicing, and settings via a professional dashboard.

### Public Website
- Showcase the brand, services, and team to customers, and drive bookings using the same booking logic from the admin system.

---

## 2. User Roles & Audiences

- **Admin**: Full access to settings, dashboard, staff, POS, logs.
- **Staff**: View schedule, manage check-ins, view commissions and notes.
- **Customer**: Book appointments, explore services, view staff, contact shop.

---

## 3. Shared Design & Theme

- **Light Mode Only**  
- **Color Tokens (theme/theme.ts)**:
```ts
export const colors = {
  primary:   '#000000',
  background:'#FFFFFF',
  card:      '#FFFFFF',
  text:      '#111111',
  muted:     '#555555',
  border:    '#E5E5E5',
  accent:    '#1E1E1E',
  success:   '#059669',
  warning:   '#D97706',
  error:     '#DC2626',
};
````

* Typography, spacing, border-radius, shadows – all managed in `theme.ts`
* UI Components: Built with **ShadCN/UI** + **Tailwind CSS**
* Optional: **Framer Motion** for smooth animations
* Responsive: Supports mobile, tablet, and desktop

---

## 4. Suggested Folder Structure

```
/app               # Routing (Next.js or similar)
/components        # Shared reusable components
/features          # Feature modules (dashboard, booking, pos)
/mocks             # Mock data (JSON)
/pages             # Public-facing pages (if using alongside app)
/services          # Utility logic (invoice, logs)
/theme/theme.ts    # Centralized design tokens
/utils             # Helpers and formatters
/public            # Static assets (images/icons)
```

---

## 5. Admin Panel Modules

### A. Dashboard

* Daily/weekly/monthly revenue snapshot
* Recharts-based graphs: sales, performance
* Upcoming appointment widget

### B. Staff Management

* Add/Edit/Delete barbers
* Set working hours, days off
* Assign services
* Flat % commission (global setting only)

### C. Slot Configuration

* Opening/closing hours
* Slot durations (15/30/60 min)
* Breaks (lunch, tea)
* Weekly availability

### D. Reports & Analytics

* Top staff
* Most booked services
* Sales trends (mock data)

### E. Appointment System

* Multi-step booking (Service → Barber → Slot → Summary → Confirm)
* Cancel/reschedule (modal + reason)
* Mock confirmation email
* Auto-reminder simulation

### F. POS & Invoicing

* Build invoice (services, discounts, taxes, tips)
* View invoice history (filter by name/date/staff)
* Export/send invoice (mock)
* POS settings:

  * Tax %
  * Toggle tip & discount
  * Auto-send toggle

### G. Auto Logs

* Simulated activity logs:

  * Example: “Ravi added a 10% discount to Invoice #1023”

### H. Admin Settings

* Business Info
* Working Hours Config
* Services Management
* Commission Settings (flat % only)
* POS/Invoice Settings
* User Management

---

## 6. Public-Facing Website Pages

### 1. Home / Hero

* Banner, intro text, CTA (“Book Now”)

### 2. About Us

* Story, mission
* Staff profiles (mocked staff)
* Image carousel

### 3. Services

* Dynamic list:

  * Service name
  * Duration
  * Price
  * “Book” CTA

### 4. Booking

* Shared booking flow:

  * Step 1: Select service
  * Step 2: Choose barber (optional)
  * Step 3: Pick slot
  * Step 4: Confirm (mock confirmation)

### 5. Gallery / Portfolio

* Before/after shots
* Shop interiors
* Lightbox gallery

### 6. Testimonials

* Static quotes + star ratings (mocked)

### 7. Location & Contact

* Address, phone, email (mocked)
* Embedded map
* Social links

### 8. Footer

* Newsletter signup (mocked)
* Navigation links
* Copyright

---

## 7. Mock Data Sources

* `/mocks/business.json` – business info
* `/mocks/services.json` – services list
* `/mocks/staff.json` – barber/staff profiles
* `/mocks/availability.json` – hours, breaks

---

## 8. Deliverables

* **Admin Panel**: Fully interactive React/Tailwind/ShadCN dashboard
* **Public Website**: Modern customer-facing single-page site with embedded booking
* Shared `theme.ts` for both UI systems
* Figma or Sketch high-fidelity designs
* Static build-ready prototype (no backend)

---

## 9. Approval Criteria

* All user flows functional using mock data
* UI is clean, consistent, responsive
* theme.ts fully manages design tokens
* Modular, scalable file structure
* Booking component reused across Admin and Public UI
