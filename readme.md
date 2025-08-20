Effervescence Fest Management System (Effe App)

Effervescence is a full-stack fest management system built using the MERN stack. It provides role-based dashboards, real-time communication, event management, resource allocation, and payment support for a cultural festival.

🚀 Features
🔐 Authentication & Security

JWT authentication with role-based route protection

Dynamic registration flows for Core, Non-Core, and Attendee users

Secure volunteer onboarding with admin-provided credentials

📊 Dashboards

Core Dashboard: Manage teams, finances, events, merchandise, reports, and communication

Non-Core Dashboard: Task assignment, volunteer management, event creation, and resource requests

Volunteer Dashboard: View assigned tasks, receive resources, notifications, and upload records

Attendee Dashboard: Event browsing, ticketing, and participation

📝 Task & Resource Management

Assign and track tasks with deadlines

Volunteers can request additional resources from executives

Upload important records (bills, permissions) stored securely in Google Cloud Storage

🎉 Event Management

Event creation restricted to management roles (not volunteers)

Real-time event broadcasts across dashboards

Scheduling & details with More Info modal

Full CRUD operations for events

🔔 Real-Time Notifications

Socket.io integration for:

Task updates

Event broadcasts

Resource requests sent directly to task assigners

Real-time notification counts per user

💳 Payments

Razorpay integration for secure fee collection & donations

🛒 Merchandise Management

Track stock, sales, and orders from Core dashboard

Overview tab for quick financial insights

🎥 Meetings

Coordinators can schedule video meetings with selected volunteers

At scheduled time, participants receive a Google Meet–style notification for joining

☁️ Cloud Storage

Integrated Google Cloud Storage (GCS) for all document uploads

File URLs stored in MongoDB, ensuring long-term accessibility

🛠 Tech Stack

Frontend: React, React Router, TailwindCSS, shadcn/ui, Zustand

Backend: Node.js, Express.js, JWT, Multer, Socket.io

Database: MongoDB (with optimized queries & indexing)

Cloud: Google Cloud Storage

Payments: Razorpay


