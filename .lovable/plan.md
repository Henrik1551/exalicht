

# WooCommerce CSV Product Import Plan

## Summary

I'll build a complete product import system that parses your WooCommerce CSV export (261 products) and stores them in the database. This will replace the current mock product data with your real products, including images from your existing WordPress site.

## CSV Data Analysis

Your export contains rich product data including:
- **Product types**: simple, variable (configurable), variation
- **Key fields**: ID, SKU (Artikelnummer), Name, Description, Price, Categories, Images
- **~260 products** with hierarchical categories like "Zubehör > elektrisch > Steuerung"
- **Multiple images** per product (comma-separated URLs)
- **German prices** with comma decimal separator (e.g., "489" or "86,4")

## Implementation Steps

### Step 1: Create Database Schema

Create a `products` table with all necessary fields:

```text
products
├── id (uuid, primary key)
├── woo_id (integer, original WooCommerce ID)
├── sku (text, Artikelnummer)
├── name (text)
├── short_description (text)
├── description (text)
├── price (decimal)
├── category (text, primary category)
├── category_path (text, full path like "Zubehör > elektrisch")
├── images (text[], array of image URLs)
├── in_stock (boolean)
├── product_type (text: simple, variable, variation)
├── parent_id (uuid, for variations)
├── weight_kg (decimal)
├── gtin (text)
├── is_featured (boolean)
├── created_at (timestamp)
├── updated_at (timestamp)
```

Create a `categories` table:

```text
categories
├── id (uuid, primary key)
├── slug (text, unique)
├── name (text)
├── name_en (text)
├── parent_slug (text)
├── product_count (integer)
├── image (text)
```

### Step 2: Build CSV Import Utility

Create an Edge Function `import-products` that:
1. Receives CSV data as text
2. Parses the German CSV format (comma decimals, semicolon or comma separators)
3. Extracts and maps fields to database schema
4. Handles category hierarchy extraction
5. Processes image URLs (keeps references to WordPress images)
6. Inserts products in batches

### Step 3: Create Admin Import Page

Build a simple admin page at `/admin/import` with:
- File upload dropzone for CSV
- Preview of parsed products before import
- Import progress indicator
- Success/error reporting

### Step 4: Update Product Display

Modify existing components to fetch from database:
- Update `useProducts` hook to query database
- Update filter categories dynamically from data
- Keep existing UI components working with new data source

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/[timestamp]_create_products.sql` | Create | Database schema for products and categories |
| `supabase/functions/import-products/index.ts` | Create | Edge function to parse and import CSV |
| `src/lib/csv-parser.ts` | Create | Client-side CSV parsing utilities |
| `src/pages/admin/Import.tsx` | Create | Admin page for CSV upload |
| `src/hooks/useProducts.ts` | Create | React Query hook for database products |
| `src/lib/products-data.ts` | Modify | Convert to use database queries |
| `src/pages/Products.tsx` | Modify | Use new useProducts hook |
| `src/App.tsx` | Modify | Add admin route |

## Technical Details

### CSV Field Mapping

| CSV Column (German) | Database Field |
|---------------------|----------------|
| ID | woo_id |
| Artikelnummer | sku |
| Name | name |
| Kurzbeschreibung | short_description |
| Beschreibung | description |
| Regulärer Preis | price |
| Kategorien | category_path |
| Bilder | images |
| Vorrätig? | in_stock |
| Typ | product_type |
| Gewicht (kg) | weight_kg |
| GTIN, UPC, EAN oder ISBN | gtin |
| Ist hervorgehoben? | is_featured |

### Price Parsing

German format uses comma for decimals:
- "489" → 489.00
- "86,4" → 86.40
- "1.234,56" → 1234.56

### Category Extraction

Split paths like "Zubehör > elektrisch > Steuerung":
- Primary category: "Steuerung"
- Parent: "elektrisch"
- Root: "Zubehör"

Build category tree automatically from product paths.

### Image Handling

Keep existing WordPress URLs as-is:
```
https://lichtkuppel-direkt.de/wp-content/uploads/2026/01/WSC-104C.jpg
```

These will continue to load from your current hosting. Later, you can optionally migrate images to Lovable Cloud storage.

## Security Considerations

- RLS policies will be set to allow public read access for products
- Import function will use service role key for write operations
- Admin import page should be protected (can add auth later)

## After Import

Once imported, the products page will:
- Display all ~260 real products with images
- Show actual prices from your shop
- Use real category hierarchy for filtering
- Support the existing sorting options

