# NextSheet

**NextSheet** is a real-time collaborative spreadsheet application built to explore the engineering challenges behind stateful, multi-user web applications.

It supports real-time cell synchronization, presence awareness, spreadsheet formulas, role-based access control, authentication, and persistent storage.

## ✨ Features

* ⚡ Real-time multi-user spreadsheet editing
* 🔄 CRDT-based synchronization using Yjs
* 👥 Live collaborator presence and active-cell indicators
* 🧮 Formula engine with cell references, ranges, `SUM()`, and circular dependency detection
* 🔐 Authentication using access and refresh tokens
* 🛡️ Role-based authorization with Owner, Editor, and Viewer permissions
* 🤝 Invite, remove, and manage collaborators
* 📋 Copy, cut, and paste support
* ⌨️ Keyboard navigation
* 🖱️ Multi-cell and drag selection
* 💾 Debounced auto-save and persistent spreadsheet state
* 🚀 Deployed frontend and real-time Socket.IO server

## 🛠️ Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Redux Toolkit

### Real-Time Collaboration

* Yjs
* Yjs Awareness Protocol
* Socket.IO
* CRDT-based state synchronization

### Backend & Database

* Next.js API Routes
* Node.js
* Express
* MongoDB
* Mongoose
* Zod

### Deployment

* Vercel — Frontend
* Railway — Real-time Socket.IO server
* MongoDB Atlas — Database

## 🧠 Engineering Challenges

### Real-Time Collaboration with CRDTs

NextSheet uses **Yjs** to represent spreadsheet cells as shared CRDT data structures.

Instead of sending the complete spreadsheet state after every edit, clients exchange incremental Yjs updates through Socket.IO rooms.

This allows multiple users to edit the same spreadsheet concurrently while keeping their local document states synchronized.

### Presence and Awareness

Collaborator presence is implemented using the **Yjs Awareness Protocol**.

Each connected user publishes transient state such as:

* User identity
* Assigned collaborator color
* Currently selected cell

Awareness updates are synchronized through the Socket.IO server and rendered as collaborator indicators inside the spreadsheet.

### Persistent CRDT State

The Yjs document state is encoded using `Y.encodeStateAsUpdate()` and stored in MongoDB.

When a spreadsheet is opened, the saved CRDT state is loaded and applied to the local Yjs document before real-time synchronization begins.

This allows collaborative spreadsheet state to survive server restarts and disconnected sessions.

### Authentication and Token Lifecycle

NextSheet uses short-lived access tokens and refresh tokens for authentication.

The authentication flow handles:

* Access token expiration
* Refresh token rotation
* Concurrent refresh requests
* Failed refresh requests
* Request retries after successful token renewal

This prevents multiple simultaneous API requests from triggering duplicate refresh operations.

### Role-Based Access Control

Each spreadsheet supports three permission levels:

**Owner**

Full control over the spreadsheet and collaborator management.

**Editor**

Can modify spreadsheet content.

**Viewer**

Can access the spreadsheet in read-only mode.

Authorization checks are enforced on the server rather than relying only on frontend restrictions.

### Formula Engine

NextSheet includes a custom formula evaluation system supporting:

* Cell references
* Range references
* `SUM()`,`AVG()`,`MIN()`,`MAX`,`COUNT` formulas
* Dependency tracking
* Circular dependency detection
* Recursive formula evaluation

## 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │      Next.js UI      │
                         │ Spreadsheet Interface│
                         └──────────┬───────────┘
                                    │
                   ┌────────────────┴────────────────┐
                   │                                 │
                   ▼                                 ▼
          ┌─────────────────┐              ┌─────────────────┐
          │      Y.Doc      │              │   Redux Store   │
          │ Shared CRDT Data│              │ UI / Selection  │
          └────────┬────────┘              │ / Auth State    │
                   │                       └─────────────────┘
                   │ Yjs Updates
                   ▼
          ┌─────────────────┐
          │    Socket.IO    │
          │ Real-Time Server│
          └────────┬────────┘
                   │
                   │ Rooms / Update Broadcasting
                   ▼
          ┌─────────────────┐
          │ Other Connected │
          │     Clients     │
          └─────────────────┘

                   │
                   │ Persistence / API Requests
                   ▼
          ┌─────────────────┐
          │ Next.js API     │
          │     Routes      │
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │     MongoDB     │
          │ Users / Sheets  │
          │   Yjs State     │
          └─────────────────┘
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/shivamdnngsp-hub/NextSheet
cd nextsheet
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file and configure the required environment variables.

```env
MONGODB_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
NEXT_PUBLIC_SOCKET_URL=
```

Do not commit your environment variables or secret keys to the repository.

### 4. Start the Next.js Application

```bash
pnpm dev
```

### 5. Start the Socket.IO Server

Run the real-time server using the appropriate workspace or server command configured in the repository.

## 📁 Project Structure

```text
nextsheet/
├── app/
│   ├── api/
│   ├── auth/
│   ├── dashboard/
│   └── sheet/
├── components/
├── lib/
├── redux/
├── models/
├── yjs/
├── server/
└── public/
```

## 🎯 Project Goals

The goal of NextSheet is to gain practical experience building distributed, collaborative applications and understanding:

* CRDT-based synchronization
* Real-time communication
* Multi-user presence systems
* Authentication lifecycle management
* Authorization and permission systems
* Persistent collaborative state
* Spreadsheet dependency graphs
* Frontend performance optimization


This project is intended for educational and portfolio purposes.

