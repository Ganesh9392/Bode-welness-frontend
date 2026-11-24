# BODE Wellness Spa — Branch Manager Portal

A comprehensive, operational, and responsive Branch Manager Portal engineered for **BODE Wellness Spa**. Built for front desk managers to manage spa clients, schedule walk-ins and web bookings, supervise concurrent treatments, dynamically append services mid-visit, apply service-wise discounts, generate tax invoices, dispatch digital invoices directly through WhatsApp, and record multi-channel payments.

---

## 🌿 Brand Identity & Design System

- **Forest Green:** `#073F32`
- **Emerald Green:** `#105C47`
- **Warm Ivory:** `#F8F5E9`
- **Champagne Gold:** `#C2A253`
- **White:** `#FFFFFF`
- **Dark Charcoal:** `#25332C`
- **Headings Font:** Playfair Display & Cormorant Garamond
- **Body & UI Font:** Inter & Manrope

---

## 🚀 Key Functional Modules

1. **Manager Authentication & Branch Scoping**
   - Pre-assigned branch model with zero branch-switching dropdowns.
   - Demo accounts:
     - **Priya Sharma** (`priya.sharma` / `password123`) — AMR Planet Mall (ECIL / A.S. Rao Nagar)
     - **Rahul Reddy** (`rahul.reddy` / `password123`) — SVM Grand Hotel (Nagole)
   - Quick one-click autofill pills on login screen.

2. **Branch Operational Dashboard**
   - Real-time KPIs: Today's Appointments, Today's Guests, Active Services, Completed Services, Pending Invoices, Outstanding Dues.
   - Live therapy room tracking & schedule overview.

3. **Create New Service (4-Step Guided Wizard)**
   - **Step 1:** Guest identification with real-time phone number lookup (detects returning customers and pre-fills history) or new guest onboarding. "Same as mobile" WhatsApp toggle.
   - **Step 2:** Branch service catalogue with category filters, dynamic duration options, and live tariff previews.
   - **Step 3:** Walk-in (commences immediately, no advance fee) vs Scheduled Future Appointment (with therapist availability conflict prevention).
   - **Step 4:** Review summary and `CREATE SERVICE` authorization.

4. **Appointment Management**
   - Calendar / Timeline and Table views with filters (Date, Source, Status, Search).
   - Website booking verification: clearly highlights prepaid **₹99 advance deposit**, ensures it is credited exactly once and never recharged.

5. **Active Service Monitoring & Mid-Visit Additions**
   - Real-time monitoring of in-session guests.
   - Independent treatment status tracking (e.g. *Swedish Massage: Completed*, *Classic Facial: In Progress*).
   - **"Add Another Service"**: Seamlessly appends additional treatments into an active visit session without generating duplicate visits.

6. **Service-Wise Discount Management**
   - Individual treatment discounts (Fixed ₹ off or Percentage % off).
   - Live discount calculations and manager audit records.

7. **Consolidated Final Invoicing**
   - Itemized breakdown table, 18% GST (9% CGST + 9% SGST), advance deductions, and outstanding balance.
   - Print-ready and PDF download support.

8. **WhatsApp Invoice Transmission**
   - 5 interactive demonstration states: *Ready to Send*, *Sending*, *Delivered & Confirmed*, *Failed to Send*, *Retry*.
   - Direct WhatsApp Web/App launcher (`api.whatsapp.com/send`) + simulated Meta WhatsApp Business API confirmation.
   - Clear distinction between "Link Opened" vs "Delivered & Confirmed".

9. **Payment Collection**
   - Cash, UPI (with UTR reference), and Card POS (with approval code).
   - Partial payment and full settlement handling.
   - Digital receipt generation with instant WhatsApp receipt sharing.

---

## 💻 Running the Portal Locally

```bash
cd bode-portal
npm run dev
```

Visit `http://localhost:5173` in your browser.
