

# Lichtkuppel-direkt.de Website Rebuild Plan

## 🎨 Design Direction
**Premium & Technical** look with your existing brand colors:
- Primary: **Orange/Amber** (#E67E22 tones)
- Background: **Clean white** with subtle grays
- Text: **Dark charcoal** for readability
- Accents: Technical icons, clean typography, professional imagery

---

## Phase 1: Complete Website (Frontend)

### 1. **Homepage**
- Modern hero section with fullscreen product imagery
- Animated benefits grid (Große Auswahl, Geprüfte Qualität, etc.)
- Featured product categories with hover effects
- 5-step process visual guide
- Company introduction section
- Contact form with validation

### 2. **Product Pages**
- Category overview (Lichtkuppeln, Zubehör, RWA Systems)
- Individual product cards with key specs
- **Product Configurator**: Step-by-step configuration (shape → size → material → options)
- **Product Comparison Tool**: Side-by-side comparison of up to 3 products
- Technical specifications tables

### 3. **Quote Request System**
- Multi-step quote form
- Product selection from configurator
- File upload for project drawings
- Automatic confirmation emails

### 4. **Download Center**
- Categorized document library (Datasheets, Installation Guides, Certifications)
- Filterable by product type
- PDF preview and download

### 5. **About / Company Page**
- EXA Sicherheitstechnik story
- Team/founder section
- Certifications and quality standards

### 6. **Contact Page**
- Contact form with validation
- Business hours and location
- Phone and email quick links

### 7. **Multilingual Support**
- Language switcher (DE/EN)
- All content translatable

---

## Phase 2: Backend & Admin Panel

### Database (Lovable Cloud)
- Products with variants, pricing, and specs
- Categories and product relationships
- Quote requests and status tracking
- Customers database
- Documents/downloads library
- User roles (Admin, Customer)

### Admin Dashboard
- **Product Management**: Add/edit/delete products, variants, pricing
- **Quote Management**: View, respond to, and track quote requests
- **Document Management**: Upload/organize PDFs and datasheets
- **Customer Management**: View customer data and inquiry history
- **Analytics Dashboard**: Basic metrics overview

---

## Phase 3: Shop & Payments

### Stripe Integration
- Shopping cart functionality
- Secure checkout with Stripe
- Product with variants and pricing
- Order confirmation and tracking
- Customer account with order history

---

## Technical Foundation
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Lovable Cloud (Supabase)
- **Payments**: Stripe (custom integration)
- **Authentication**: Email/password for admin and customers
- **Responsive**: Mobile-first design

