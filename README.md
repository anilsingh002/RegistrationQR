# RegistrationQR — Smart Event Registration & Check-in System

A modern, responsive, and contactless Event Registration and Check-in web application with real-time QR code generation, attendee pass issuance, and organizer management tools.

🌐 **Live Production URL**: [https://registration-qr-phi.vercel.app](https://registration-qr-phi.vercel.app)

---

## 🌟 Key Features

1. **Attendee Registration Form**:
   - Captures **Full Name**, **Visit Date** (with quick shortcuts: *Today*, *Tomorrow*, *This Weekend*), and **Time Slot / Session**.
   - Captures essential logical fields: **Email**, **Phone / Mobile**, **Attendee Category** (General Visitor, VIP, Exhibitor, Student, Media), **Organization / Company**, **Number of Passes**, **Purpose of Visit**, **City**, and **Special Accessibility Needs**.
   - Built-in form validation and quick **"Fill Sample"** testing button.

2. **Personalized Attendee E-Badge / Digital Pass**:
   - Generates a unique Registration ID (e.g. `REG-2026-XXXX`).
   - Generates an attendee-specific check-in QR code containing ticket details.
   - Printable and mobile-friendly pass for quick entry scanning.

3. **QR Standee & Poster Studio**:
   - Live customizable **Event Standee / Table-tent Poster** ready for reception desks.
   - Customizable Event Name, Dates, Venue, and Target Link.
   - **Download QR as PNG**: High-resolution image export for posters and marketing collateral.
   - **Print Standee**: Dedicated `@media print` layout for crisp paper printing.

4. **Organizer Roster & Check-In Dashboard**:
   - View all registered attendees in a responsive table.
   - Real-time search across names, emails, phones, and organizations.
   - Filter by category and check-in status.
   - One-click check-in toggle (*Pending* / *Checked In*).
   - **Export to CSV**: Download complete visitor lists for Excel / CRM.
   - Client-side persistence using `localStorage`.

---

## 🚀 Getting Started

### Option 1: Open Directly in Browser
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Run with Local Server
```bash
node server.js
```
Then visit:
```
http://localhost:3000/
```

---

## 🛠️ Tech Stack

- **HTML5 & Vanilla CSS**: Glassmorphism aesthetic, dark/light theme toggle, responsive layout, print optimization.
- **JavaScript (ES6+)**: Zero external backend required, client-side data management and exports.
- **QRCode.js**: Standalone, offline-ready QR generation.
