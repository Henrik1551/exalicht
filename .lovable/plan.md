
# Admin Panel & Shop System with Cart and Checkout

## Overview

This plan outlines the implementation of a complete admin panel for managing products and orders, plus a customer-facing shop system with cart and checkout functionality. The checkout will be sandboxed (no payment processing) for now, with Stripe integration coming later.

---

## Phase 1: Database Schema

### New Tables Required

**1. orders** - Store customer orders
- `id` (uuid, primary key)
- `order_number` (text, unique) - Human-readable order number like "ORD-2026-0001"
- `customer_email` (text, required)
- `customer_name` (text, required)
- `customer_phone` (text, optional)
- `customer_company` (text, optional)
- `shipping_address` (jsonb) - Street, city, postal code, country
- `billing_address` (jsonb) - Same structure
- `status` (text) - pending, confirmed, processing, shipped, delivered, cancelled
- `subtotal` (numeric) - Sum of items before tax
- `tax_amount` (numeric) - VAT amount
- `shipping_cost` (numeric)
- `total` (numeric) - Final total
- `notes` (text) - Customer notes
- `created_at`, `updated_at` (timestamps)

**2. order_items** - Items within each order
- `id` (uuid, primary key)
- `order_id` (uuid, references orders)
- `product_id` (uuid, references products)
- `product_name` (text) - Snapshot of product name
- `product_sku` (text) - Snapshot of SKU
- `quantity` (integer)
- `unit_price` (numeric) - Price at time of order
- `total_price` (numeric)
- `created_at` (timestamp)

**3. user_roles** - Admin role management (as per security guidelines)
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `role` (app_role enum: admin, moderator, user)
- Unique constraint on (user_id, role)

**4. profiles** - Basic user profile data
- `id` (uuid, primary key, references auth.users)
- `email` (text)
- `full_name` (text)
- `company` (text, optional)
- `phone` (text, optional)
- `created_at`, `updated_at` (timestamps)

### RLS Policies
- **orders**: Admins can read/write all; customers can read their own orders (by email match or user_id)
- **order_items**: Same as orders (access via order relationship)
- **user_roles**: Admins can manage; users can read their own roles
- **profiles**: Users can read/update their own profile
- **products**: Add INSERT/UPDATE/DELETE for admins only

---

## Phase 2: Authentication System

### Components
- **Login Page** (`/login`) - Email/password sign in
- **Register Page** (`/register`) - Customer registration
- **Auth Context** - Track authentication state globally
- **Protected Routes** - Wrap admin pages

### Features
- Email verification enabled (not auto-confirm)
- Session persistence
- Automatic profile creation on signup via database trigger
- Admin role assignment via database (no UI self-assignment)

---

## Phase 3: Shopping Cart

### Cart Context (`src/contexts/CartContext.tsx`)
```text
State:
- items: Array of { productId, name, sku, price, quantity, image }
- Persisted to localStorage

Actions:
- addItem(product, quantity)
- removeItem(productId)
- updateQuantity(productId, quantity)
- clearCart()
- getTotal()
- getItemCount()
```

### Cart UI Components
- **CartIcon** - Header icon with badge showing item count
- **CartDrawer** - Slide-out drawer showing cart contents
- **CartItem** - Individual item row with quantity controls
- **CartSummary** - Subtotal, tax note, proceed to checkout button

### Integration Points
- Add "Add to Cart" button on ProductCard and ProductDetail
- Cart icon in Header (visible on all pages)
- Mini cart preview on hover/click

---

## Phase 4: Checkout Flow

### Checkout Page (`/checkout`)

**Step 1: Cart Review**
- List all cart items with quantities
- Allow quantity adjustments
- Show subtotal, note about VAT, estimated shipping

**Step 2: Customer Information**
- Email, Name, Phone, Company (optional)
- If logged in, pre-fill from profile

**Step 3: Shipping Address**
- Street, City, Postal Code, Country (default: Germany)
- Option to use same for billing

**Step 4: Billing Address**
- Same form as shipping
- Checkbox "Same as shipping address"

**Step 5: Order Review & Submit**
- Full order summary
- Terms acceptance checkbox
- "Place Order" button (sandboxed - creates order directly)
- Note: "Payment via invoice" or "Payment will be collected later"

### Order Confirmation Page (`/order-confirmation/:orderNumber`)
- Thank you message
- Order number and summary
- Email confirmation note
- Link to continue shopping

---

## Phase 5: Admin Panel

### Admin Layout
- Separate sidebar navigation for admin pages
- Admin-only route protection

### Admin Dashboard (`/admin`)
- Overview cards: Total orders, pending orders, revenue today, total products
- Recent orders list
- Quick actions (view products, view orders)

### Product Management (`/admin/products`)
- Table with all products (existing ProductCard UI)
- Search and filter by category, stock status
- Bulk actions (delete, update stock)
- **Add Product** button -> modal or separate page
- **Edit Product** -> inline or modal
- Image upload to storage bucket
- Keep existing Import page at `/admin/import`

### Order Management (`/admin/orders`)
- Table with all orders
- Filter by status, date range
- Click to view order details
- Update order status (pending -> confirmed -> processing -> shipped -> delivered)
- View customer info, shipping address, items

### Order Detail View (`/admin/orders/:id`)
- Full order information
- Customer details
- Items list with product links
- Status change dropdown
- Add internal notes

---

## File Structure

```text
src/
├── contexts/
│   ├── CartContext.tsx        (NEW)
│   └── AuthContext.tsx        (NEW)
├── hooks/
│   ├── useCart.ts             (NEW)
│   ├── useAuth.ts             (NEW)
│   └── useOrders.ts           (NEW)
├── components/
│   ├── cart/
│   │   ├── CartDrawer.tsx     (NEW)
│   │   ├── CartIcon.tsx       (NEW)
│   │   ├── CartItem.tsx       (NEW)
│   │   └── CartSummary.tsx    (NEW)
│   ├── checkout/
│   │   ├── CheckoutForm.tsx   (NEW)
│   │   ├── AddressForm.tsx    (NEW)
│   │   └── OrderSummary.tsx   (NEW)
│   ├── admin/
│   │   ├── AdminLayout.tsx    (NEW)
│   │   ├── AdminSidebar.tsx   (NEW)
│   │   ├── OrdersTable.tsx    (NEW)
│   │   ├── ProductsTable.tsx  (NEW)
│   │   ├── StatsCards.tsx     (NEW)
│   │   └── ProductForm.tsx    (NEW)
│   └── auth/
│       ├── LoginForm.tsx      (NEW)
│       ├── RegisterForm.tsx   (NEW)
│       └── ProtectedRoute.tsx (NEW)
├── pages/
│   ├── auth/
│   │   ├── Login.tsx          (NEW)
│   │   └── Register.tsx       (NEW)
│   ├── admin/
│   │   ├── Dashboard.tsx      (NEW)
│   │   ├── Products.tsx       (NEW)
│   │   ├── Orders.tsx         (NEW)
│   │   ├── OrderDetail.tsx    (NEW)
│   │   └── Import.tsx         (EXISTS)
│   ├── Cart.tsx               (NEW)
│   ├── Checkout.tsx           (NEW)
│   └── OrderConfirmation.tsx  (NEW)
└── lib/
    └── order-utils.ts         (NEW) - Order number generation, calculations
```

---

## Implementation Order

1. **Database Setup** - Create tables, RLS policies, triggers
2. **Authentication** - Auth context, login/register pages, protected routes
3. **Cart System** - Cart context, cart components, integration with products
4. **Checkout Flow** - Checkout page, order creation, confirmation
5. **Admin Dashboard** - Basic dashboard with stats
6. **Admin Orders** - Order list and detail views
7. **Admin Products** - Product management (CRUD), enhance existing import

---

## Technical Details

### Order Number Generation
```text
Format: ORD-YYYY-NNNN
Example: ORD-2026-0001

Generated via database function to ensure uniqueness
```

### Tax Calculation
```text
All prices are net (zzgl. MwSt.)
VAT Rate: 19% for Germany
Display: "Netto + 19% MwSt."
```

### Cart Persistence
- Stored in localStorage for guest users
- Key: `lichtkuppel-cart`
- Synced to server when user logs in (future enhancement)

### Admin Access
- First admin created manually in database
- Admin role checked via `has_role()` function
- Server-side validation in RLS policies

---

## UI/UX Considerations

- Maintain existing design language (Tailwind, shadcn/ui components)
- German as primary language with English translations
- Responsive design for all new pages
- Loading states and error handling throughout
- Toast notifications for actions (add to cart, order placed, etc.)
