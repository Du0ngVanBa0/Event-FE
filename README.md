# 🎟️ Online Event Ticketing and Management System

This project is a web application that provides an all-in-one solution for managing and booking tickets for online and offline events. It supports event organizers in creating and managing events, ticket types, sales, and attendees — while enabling customers to browse, search, and book tickets with online payment and QR code verification.

---

## 📌 Features

### For Users
- 🔍 Search and explore upcoming events
- 🎫 Book tickets online
- 📱 Receive e-tickets via QR Code
- 💳 Secure online payment (VNPay integrated)

### For Event Organizers
- 🛠 Create and manage events
- 🎟 Create ticket types and set quantity & price
- 📊 Track ticket sales, attendees, and revenue
- ✅ Validate tickets at event entrance

### Admin & Account Management
- 👥 User authentication and role-based authorization
- 📂 Organizer and attendee account dashboards
- 🔐 Secure access with JWT tokens

---

## 🧱 Tech Stack

| Layer         | Technology          |
|---------------|---------------------|
| **Frontend**  | React + Bootstrap |
| **Backend**   | Spring Boot (Java)  |
| **Database**  | MySQL               |
| **Payment**   | VNPay Sandbox       |
| **Others**    | Git, Postman, IntelliJ, VSCode |

---

## 📐 System Architecture

- **Backend** follows MVC pattern with RESTful APIs.
- **Frontend** is decoupled, consuming APIs for dynamic rendering.
- **Authentication** is based on JWT for secure session handling.
- **Payment flow** uses VNPay redirect mechanism.
