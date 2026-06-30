# 🌸 SUMAN - Smart Beauty & Fashion E-Commerce Platform

> A full-stack e-commerce platform for beauty & fashion — built with React + Spring Boot + MySQL

---

## 🚀 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS      |
| Backend     | Spring Boot 3.2 + Spring Security   |
| Database    | MySQL 8                             |
| Auth        | JWT + BCrypt + Google OAuth2        |
| Payments    | Razorpay                            |
| Images      | Cloudinary                          |
| Real-time   | WebSocket (STOMP)                   |
| PDF Invoice | iText PDF                           |
| Charts      | Recharts                            |

---

## 📁 Project Structure

```
suman/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/   # Navbar, Footer, ProductCard...
│   │   ├── pages/        # Home, Products, Cart, Checkout...
│   │   │   └── admin/    # Admin Dashboard, Orders, Users...
│   │   ├── context/      # Auth Context
│   │   ├── services/     # Axios API services
│   │   └── App.jsx
│   └── package.json
│
├── backend/           # Spring Boot 3.2
│   ├── src/main/java/com/suman/
│   │   ├── config/       # Security, WebSocket, CORS
│   │   ├── controller/   # REST Controllers
│   │   ├── entity/       # JPA Entities
│   │   ├── repository/   # Spring Data Repos
│   │   ├── service/      # Business Logic
│   │   ├── security/     # JWT Filter + Util
│   │   └── dto/          # Request/Response DTOs
│   └── pom.xml
│
└── database/
    └── schema.sql        # Complete DB with seed data
```

---

## ⚡ Quick Setup

### 1. Database

```bash
# Login to MySQL
mysql -u root -p

# Run the schema
source /path/to/suman/database/schema.sql
```

### 2. Backend

```bash
cd suman/backend

# Update application.properties:
# - spring.datasource.password=YOUR_MYSQL_PASSWORD
# - spring.mail.username=YOUR_GMAIL
# - spring.mail.password=YOUR_APP_PASSWORD
# - cloudinary.cloud-name=YOUR_CLOUD_NAME
# - cloudinary.api-key=YOUR_API_KEY
# - cloudinary.api-secret=YOUR_API_SECRET
# - razorpay.key-id=YOUR_RAZORPAY_KEY
# - razorpay.key-secret=YOUR_RAZORPAY_SECRET

mvn spring-boot:run
# Server starts on http://localhost:8080
```

### 3. Frontend

```bash
cd suman/frontend

npm install
npm run dev
# App starts on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@suman.com      | Admin@123 |
| User  | priya@example.com    | Admin@123 |

---

## 🧩 Modules Implemented

### ✅ Core Modules
| Module | Features |
|--------|----------|
| 👤 Auth | Signup, Login, JWT, Role-based, Forgot Password OTP, Google OAuth2 |
| 🛍️ Products | Listing, Details, Categories, Brands, Multi-image, Variants |
| 🔍 Search | Full-text search, Auto-suggestions, Trending searches |
| 🛒 Cart | Add/Remove/Update, Persistent (DB), Coupon applied at cart |
| ❤️ Wishlist | Save products, Move to Cart |
| 📦 Orders | Place, Track, Cancel, Return (all statuses) |
| 💳 Payment | COD + Razorpay online, Webhook verification |
| ⭐ Reviews | Star rating, Verified purchase badge, Helpful votes |
| 🔔 Notifications | Real-time via WebSocket, Badge count |
| 🧑‍💼 Admin Panel | Full CRUD products, Manage orders/users, Update status |
| 📊 Analytics | Revenue charts, Category sales, User growth (Recharts) |
| 🧾 Invoice | PDF invoice generation (iText) |
| 📁 File Upload | Cloudinary integration for product images |
| 🛡️ Security | JWT auth, BCrypt, Role-based authorization |
| 📱 Responsive | Mobile-first Tailwind CSS UI |

### 🔥 Bonus Features
| Feature | Description |
|---------|-------------|
| 🤖 AI Recommendations | Based on user behavior (views, purchases, wishlist) |
| 🧠 Recently Viewed | Track & display recently viewed products |
| 🌐 Trending | Most searched and popular products |
| 🎯 Coupon System | Percentage & fixed discount, min order amount, expiry |

---

## 🔌 API Documentation

Swagger UI available at: `http://localhost:8080/api/swagger-ui.html`

### Key Endpoints

```
POST /api/auth/signup          # Register
POST /api/auth/login           # Login
POST /api/auth/forgot-password # Send OTP
POST /api/auth/reset-password  # Reset Password

GET  /api/products             # List with filters
GET  /api/products/{slug}      # Product detail
GET  /api/products/featured    # Featured products
GET  /api/products/trending    # Trending products
GET  /api/products/recommendations?userId={id}  # AI recommendations

GET  /api/cart                 # Get cart
POST /api/cart/add             # Add to cart
PUT  /api/cart/update/{id}     # Update quantity
DEL  /api/cart/remove/{id}     # Remove item

GET  /api/wishlist             # Get wishlist
POST /api/wishlist/add/{id}    # Add to wishlist
POST /api/wishlist/move-to-cart/{id}  # Move to cart

POST /api/orders/place         # Place order
GET  /api/orders               # My orders
GET  /api/orders/{number}      # Order detail
GET  /api/orders/{id}/invoice  # Download PDF invoice

POST /api/payments/create-order  # Create Razorpay order
POST /api/payments/verify        # Verify payment

GET  /api/search?q=lipstick    # Search
GET  /api/search/suggestions?q=li  # Autocomplete

GET  /api/admin/dashboard      # Admin stats (ADMIN only)
GET  /api/admin/analytics      # Analytics (ADMIN only)
```

---

## 🌐 WebSocket

Connect to: `ws://localhost:8080/api/ws`

Subscribe to user-specific notifications:
```js
client.subscribe('/user/queue/notifications', (msg) => {
  const notification = JSON.parse(msg.body)
  // Show toast / update badge
})
```

---

## 🎨 UI Features

- 💄 Beautiful pink-themed design
- 📱 Fully responsive (mobile-first)
- ✨ Skeleton loaders while fetching
- 🔥 Product cards with hover effects
- 🎯 Sticky navbar with cart badge
- 🌸 Smooth animations with Tailwind
- 📊 Admin charts with Recharts
- 🖼️ Multi-image product gallery

---

## 📦 Sample Coupon Codes

| Code       | Discount        | Min Order |
|------------|-----------------|-----------|
| WELCOME10  | 10% off         | ₹500      |
| SUMAN20    | 20% off         | ₹1000     |
| FLAT200    | ₹200 off        | ₹1500     |
| BEAUTY50   | ₹50 off         | ₹299      |
| NEWUSER    | 15% off         | Any       |

---

## 📌 Notes

1. **Email**: Configure Gmail App Password for OTP emails to work
2. **Razorpay**: Add test keys from Razorpay dashboard
3. **Cloudinary**: Free tier sufficient for development
4. **Google OAuth**: Configure Google Cloud Console Client ID

---

Made with ❤️ | Suman Beauty & Fashion © 2024
