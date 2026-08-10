# SE2025-1.1 — README 
Learn about OpenAPI and Swagger, and combine them with ReactJS or VueJS.

## 1. Introduction

### 1.1 Project Overview

This project presents the design and implementation of a full-stack cinema booking system developed using the Node.js ecosystem.  
The system provides core cinema functionalities including movie management, theater and room management, showtime scheduling, real-time seat reservation, and secure user authentication.

The project is conducted as a software engineering migration from an existing .NET-based cinema system, with the objective of re-engineering the system using modern JavaScript/TypeScript frameworks and scalable architectural patterns.

---

### 1.2 Goals and Objectives

#### Goals

The goal of this project is to design and implement a full-stack cinema booking system using the Node.js ecosystem in accordance with modern software engineering and system design principles.  
The system aims to achieve modularity, scalability, and maintainability while supporting real-time booking operations and maintaining functional equivalence with the original .NET-based system.

#### Objectives

To achieve the stated goal, the project defines the following objectives:

- To design a modular and layered backend architecture using NestJS with clear separation of concerns.
- To implement a relational database schema using MySQL and TypeORM that accurately models movies, theaters, rooms, showtimes, seats, and reservations.
- To develop RESTful APIs that support core cinema operations and conform to standard HTTP semantics.
- To ensure data consistency and concurrency control through Redis-based locking mechanisms for real-time seat reservations.
- To integrate background job processing using BullMQ for handling asynchronous and time-based tasks.
- To implement secure authentication and authorization mechanisms using JWT and Passport.
- To improve system performance and scalability through caching strategies.
- To promote code reuse and maintainability through shared CRUD abstractions provided by the SE2025_node base library.
- To validate system correctness and reliability through testing and structured error handling.

#### Business Objectives

- Seat selection response time: < 300 ms (average target)
- Movie list/details API response time: < 1s under average load
- Ticket booking success rate (first attempt): >= 99%
- Ability to recover deleted data: 100% within 30 days

---

## 2. System Architecture

### 2.1 Architectural Overview

The system follows a client–server architecture composed of the following components:

- Backend RESTful API implemented using NestJS.
- Frontend web application developed with Next.js.
- Relational database (MySQL) for persistent data storage.
- Redis for caching and distributed locking.
- BullMQ-based message queue for background job processing.

This architecture supports scalability, fault isolation, and ease of maintenance.

---

### 2.2 Technology Stack

#### Design
Figma

#### Backend
NestJS + TypeORM + TypeScript

#### Frontend
React + TypeScript + Vite

## 3. Main Use Cases

Description of the main use cases:

1. **Registration and Login:** Users can register and log in using their website account.

2. **User Interface:**
- **View the entire movie list:** Allows users to view all currently showing movies and sort all theaters.
- **Select Theater:** Allows users to select their desired theater, then choose the date and movie they want to watch.
- **Ticket Prices:** Allows users to view ticket prices depending on their chosen class.
- **Booking History:** Allows users to review previously booked tickets.
- **Search Movies:** Allows users to search based on the movie title they want to watch.

3. **Admin Interface:**
- **Booking History:** Allows administrators to search for successful bookings and issue tickets to users.
- **Add, edit, delete movies:** Allows administrators to add, edit, and delete displayed videos and their status.
- **Add, edit, delete references:** Allows administrators to add or delete references if they are not yet booked.
- **Book tickets at the counter:** Allows managers to book tickets on the spot and within the ticket for the buyer.
- **Revenue statistics:** Allows administrators to view revenue by day, month, theater, and movie.

## 4. Important environmental variables

- Backend (`backend/.env` từ `.env.example`): `DB_*`, `REDIS_*`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SMTP_*`, `VNPAY_*`, `CORS_ORIGIN`
- Frontend (`frontend/.env`): `VITE_API_URL` (ví dụ `http://localhost:5000`)

## 5. Error Severity Classification

- High: Errors causing data loss, authentication loss, or system downtime — address immediately.
- Medium: Affects core functionality but the system remains operational — address according to SLA.
- Low: Minor display/UX errors — address later.
