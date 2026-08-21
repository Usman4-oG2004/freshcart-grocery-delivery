# 🛒 FreshCart — Professional Grocery Delivery App

![FreshCart Banner](https://img.shields.io/badge/FreshCart-Grocery%20Delivery-brightgreen?style=for-the-badge&logo=react)
![React Native](https://img.shields.io/badge/React%20Native-0.73-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=flat-square&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-Live%20Tracking-black?style=flat-square&logo=socketdotio)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

> A production-ready, full-stack **Grocery Delivery App** with **real-time GPS driver tracking**, push notifications, and a driver companion app — built with React Native, Node.js, MongoDB, and Socket.io.

---

## ✨ Features

### 👤 Customer App
- 🔐 Secure JWT Authentication (Login / Register)
- 🏠 Home feed with categories & featured products
- 🔍 Product search with filters (category, price, rating)
- 🛒 Cart management with quantity control
- 💳 Checkout with saved delivery addresses
- 📍 **Live GPS order tracking on interactive map**
- 📦 Real-time order status updates via Socket.io
- 🔔 Push notifications (FCM) for order milestones
- 📜 Full order history
- 👤 User profile management

### 🚗 Driver App
- 📲 Driver login & availability toggle
- 📋 Incoming delivery requests
- 🗺️ Navigation to store & customer
- 📡 Continuous GPS location broadcasting
- ✅ Order pickup & delivery confirmation

### 🖥️ Backend (REST API + WebSocket)
- RESTful API with Express.js
- Real-time bi-directional communication via Socket.io
- MongoDB database with Mongoose ODM
- JWT + bcrypt authentication
- Role-based access control (customer / driver / admin)
- Image upload support
- Rate limiting & security middleware

---

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/WS    ┌─────────────────┐
│   Customer App  │◄─────────────►│                 │
│  (React Native) │               │   Node.js API   │
└─────────────────┘               │   + Socket.io   │
                                   │                 │
┌─────────────────┐    HTTP/WS    │                 │
│   Driver App    │◄─────────────►│                 │
│  (React Native) │               └────────┬────────┘
└─────────────────┘                        │
                                   ┌────────▼────────┐
                                   │    MongoDB      │
                                   │   (Database)    │
                                   └─────────────────┘
```

---

## 📁 Project Structure

```
freshcart-grocery-delivery/
├── 📂 backend/                    # Node.js + Express API
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   └── Driver.js
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── socket/
│   │   └── trackingSocket.js      # Live GPS tracking
│   └── server.js
├── 📂 frontend/                   # React Native Customer App
├── 📂 driver-app/                 # React Native Driver App
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- React Native CLI
- Android Studio / Xcode

### 1. Clone the repo
```bash
git clone https://github.com/Usman4-oG2004/freshcart-grocery-delivery.git
cd freshcart-grocery-delivery
```

### 2. Setup Backend
```bash
cd backend
npm install
cp ../.env.example .env
npm run dev
```

### 3. Setup Customer App
```bash
cd frontend
npm install
npx react-native run-android
```

### 4. Setup Driver App
```bash
cd driver-app
npm install
npx react-native run-android
```

---

## 📡 Socket.io Live Tracking Events

```javascript
// Driver broadcasts location
socket.emit('driver:update-location', { orderId, lat, lng })

// Customer receives live updates
socket.on('driver:location-update', ({ lat, lng, eta }))
socket.on('order:status-changed', ({ status, message }))
```

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native 0.73 |
| Navigation | React Navigation 6 |
| State | Context API + useReducer |
| HTTP | Axios |
| Real-time | Socket.io |
| Maps | React Native Maps |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Notifications | Firebase FCM |

---

## 📄 License

MIT License — Built with ❤️ by **Usman** [@Usman4-oG2004](https://github.com/Usman4-oG2004)
