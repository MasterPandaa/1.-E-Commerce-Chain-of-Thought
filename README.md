# Secure E-Commerce API (Node.js + Express + MySQL)

A production-ready, secure E-Commerce REST API with JWT authentication, product management with image upload, cart, checkout (simulated payment), PDF invoice generation, email notifications, and an admin dashboard.

## Architecture Overview
- MVC + Service layer
  - Routes -> Controllers -> Services -> Models
  - Config: database pool, logger, mailer, env parsing
  - Middleware: auth (JWT), role guard, validation, upload, rate limiter, error handler
  - Utilities: JWT helper, PDF generator, response helpers, custom errors
- Security
  - All passwords are hashed with bcrypt
  - All queries use MySQL prepared statements (mysql2/promise)
  - Input validation and sanitization via express-validator
  - JWT with expiry and token blacklist for logout
  - Rate limiting via express-rate-limit
  - HTTPS recommended for production (via reverse proxy)

## Getting Started

1. Copy `.env.example` to `.env` and fill in values
2. Install dependencies
   - npm install
3. Create database and tables
   - Import `db/schema.sql` into MySQL
4. Run the server
   - Development: npm run dev
   - Production: npm start

Server will run on `http://localhost:3000` by default.

## Directory Structure
```
src/
  app.js
  server.js
  config/
    index.js
    database.js
    logger.js
    mailer.js
  middleware/
    auth.js
    errorHandler.js
    rateLimiter.js
    validation.js
  routes/
    index.js
    health.routes.js
  utils/
    errors.js
    jwt.js
    pdf.js
    response.js
uploads/
  (product images)
invoices/
  (generated invoices)
db/
  schema.sql
```

## API Surface (high-level)
- Auth: register, login, logout, request password reset, reset password
- Products: admin CRUD, browse with filters/pagination/search, upload images
- Cart: add/update/remove items, compute totals, persist cart
- Orders/Checkout: shipping address validation, payment simulation, invoice PDF, email confirmation
- Admin: sales stats, orders management, user management

Detailed route documentation will be expanded as features are implemented.

## API Endpoints

Base URL: `http://localhost:${PORT}/api/v1`

Auth
- POST `/auth/register` — body: `{ name, email, password }`
- POST `/auth/login` — body: `{ email, password }` → `{ token, user }`
- POST `/auth/logout` — header: `Authorization: Bearer <token>`
- POST `/auth/forgot-password` — body: `{ email }`
- POST `/auth/reset-password` — body: `{ token, newPassword }`

Products
- GET `/products` — query: `page, limit, category_id, min_price, max_price, q`
- GET `/products/:id`
- POST `/products` — admin only — body: `{ name, description?, price_cents, currency?, stock, category_id? }`
- PATCH `/products/:id` — admin only — body: partial fields
- DELETE `/products/:id` — admin only
- POST `/products/:id/images` — admin only — multipart field: `image`

Cart
- GET `/cart` — auth required
- POST `/cart/items` — body: `{ product_id, quantity }`
- PATCH `/cart/items/:product_id` — body: `{ quantity }` (0 to remove)
- DELETE `/cart/items/:product_id`

Orders
- POST `/orders/checkout` — auth required — body: shipping fields (`shipping_name`, `shipping_phone`, `shipping_address_line1`, `shipping_address_line2?`, `shipping_city`, `shipping_state`, `shipping_postal_code`, `shipping_country`)
- GET `/orders` — list my orders
- GET `/orders/:id` — get my order

Admin
- GET `/admin/stats` — admin only
- GET `/admin/orders` — query: `page, limit, status?` — admin only
- PATCH `/admin/orders/:id/status` — body: `{ status }` — admin only
- GET `/admin/users` — query: `page, limit` — admin only
- PATCH `/admin/users/:id/role` — body: `{ role }` — admin only

## Quick Test (cURL)

1. Register user
```
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com","password":"Str0ngPass!"}'
```

2. Login and capture token
```
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"Str0ngPass!"}' | jq -r .data.token)
```

3. List products
```
curl http://localhost:3000/api/v1/products
```

4. Admin create product (requires admin token)
```
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"T-Shirt","description":"Cotton tee","price_cents":1999,"stock":10}'
```

5. Add to cart
```
curl -X POST http://localhost:3000/api/v1/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"product_id":1,"quantity":2}'
```

6. Checkout
```
curl -X POST http://localhost:3000/api/v1/orders/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "shipping_name":"Alice",
    "shipping_phone":"+6212345678",
    "shipping_address_line1":"Jl. Contoh 123",
    "shipping_city":"Jakarta",
    "shipping_state":"DKI Jakarta",
    "shipping_postal_code":"10210",
    "shipping_country":"ID"
  }'
```

## Security Considerations
- Use strong `JWT_SECRET` and rotate periodically
- Store only hashed password (bcrypt), never plaintext
- Always validate inputs and sanitize user-provided content
- Use prepared statements for every DB query
- Employ rate limiting, especially for auth endpoints
- Run behind HTTPS in production
- Do not commit real credentials; use environment variables

## License
MIT
