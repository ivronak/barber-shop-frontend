# Multi-Staff Family Invoice Design (Option A)

## Problem Statement
Walk-in family groups often require services from *different* barbers but want **one consolidated invoice**.  The current data model enforces a single `staff_id` on the `invoices` table, preventing this workflow and skewing staff-level reporting.

## Selected Approach – Option A
Embed the barber information **per line item** (service or product) instead of at the invoice header.  Each `invoice_services` / `invoice_products` row will carry its own `staff_id` and `staff_name`.  Commissions are therefore calculated and stored per line.

```
Invoice ──┐
          ├─ InvoiceService (service 1 – Staff A)
          ├─ InvoiceService (service 2 – Staff B)
          ├─ InvoiceProduct (product X – Staff A)
          └─ …
```

## Change Checklist
The list below is exhaustive; every ❗️ item is **mandatory** for minimum viable functionality.

### 1  Database / Migrations
❗️ invoice_services
* add `staff_id` (STRING-36, FK → staff)
* add `staff_name` (STRING-100)
* (optional) `commission_rate`, `commission_amount` are already present – keep them.
* composite index `(invoice_id, staff_id)`

❗️ invoice_products – same additions.

❗️ invoices
* `staff_id`, `staff_name` become **nullable** (legacy only).

### 2  Sequelize Models
* `models/InvoiceService.js` & `InvoiceProduct.js`
  * extend `init` with the two new fields.
  * `belongsTo(models.Staff, { foreignKey: 'staff_id', as: 'staff' })`.
  * `beforeCreate` no longer pulls staff data from parent invoice.
* `models/Invoice.js`
  * mark staff columns `allowNull: true` and make hook conditional.

### 3  Controller Logic
#### invoices.controller
* **createInvoice** – accept `staff_id` & `staff_name` inside every `services[]` / `products[]` item and persist them.
* List / filter endpoints: replace `where.staff_id = …` on Invoice with joins on `invoice_services` / `invoice_products`.
* Same adjustments for **updateInvoice**, **sendInvoice**.

#### appointments.controller
* When auto-generating invoice lines, copy appointment’s `staff_id`/`staff_name` to each service item.

#### reports.controller & dashboard.controller
* All revenue / commission / staff metrics now aggregate over `InvoiceService.staff_id` (and `InvoiceProduct.staff_id`), not invoice header.

### 4  Utilities
* Hooks in `InvoiceService` / utils reading `invoice.staff_id` must be reworked.

### 5  Front-End (summary)
* New invoice UI: staff selector per line item.
* Update API types, queries, filters.

### 6  Tests / Seeders
* Update JSON payloads in integration tests.
* Seeders inserting line items must include staff columns.

### 7  Documentation & API Specs
* Update `API-ENDPOINTS.md`, Postman collections, and admin guide once implementation is complete.

## Backwards Compatibility
* Legacy clients sending only invoice-level `staff_id` will be supported by copying that value into each line **if** per-line staff fields are missing.
* Historical data remains valid; reports can fall back to invoice header when line-level staff is NULL.

---

**Next step:** build the migration scripts and modify the models listed above. 