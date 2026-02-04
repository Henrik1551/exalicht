
## Add "Bild folgt..." Text to Product Cards

### What I'll Do
Add a text label "Bild folgt..." (or "Image coming..." in English) underneath the placeholder icon in product cards that don't have an image yet.

### Changes

**File: `src/components/products/ProductCard.tsx`**

1. Update the image section to conditionally render either:
   - The actual product image (if `product.image` exists)
   - The placeholder icon with "Bild folgt..." text underneath

2. The text will be:
   - German: "Bild folgt..."
   - English: "Image coming..."

3. Styling:
   - Small, muted text (`text-xs text-muted-foreground`)
   - Positioned below the Package icon
   - Subtle italic style to indicate it's a placeholder message

### Code Change Preview

```tsx
{/* Image */}
<div className="aspect-square bg-muted flex flex-col items-center justify-center relative overflow-hidden">
  {product.image ? (
    <img 
      src={product.image} 
      alt={product.name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  ) : (
    <>
      <Package className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
      <span className="text-xs text-muted-foreground/50 mt-2 italic">
        {language === 'de' ? 'Bild folgt...' : 'Image coming...'}
      </span>
    </>
  )}
  
  {/* Badges remain unchanged... */}
</div>
```

This is a small, focused change that improves the user experience by clearly indicating that product images are pending.
