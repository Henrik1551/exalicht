import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid3X3, LayoutList } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CategoryCard } from '@/components/products/CategoryCard';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductSort } from '@/components/products/ProductSort';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { categories, products, filterCategories } from '@/lib/products-data';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const Products = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(p => 
        p.category === selectedCategory || p.subcategory === selectedCategory
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.minPrice - a.minPrice);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result = result.filter(p => p.isNew).concat(result.filter(p => !p.isNew));
        break;
    }
    
    return result;
  }, [selectedCategory, sortBy]);

  const totalProducts = filterCategories.find(c => c.id === selectedCategory)?.count || products.length;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-muted/50 py-12 border-b border-border">
        <div className="container">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {language === 'de' ? 'Unsere Produktwelt' : 'Our Products'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {language === 'de' 
              ? 'Entdecken Sie unser umfangreiches Sortiment an Lichtkuppeln, RWA-Systemen und Zubehör.'
              : 'Discover our extensive range of skylights, RWA systems and accessories.'
            }
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 border-b border-border">
        <div className="container">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {language === 'de' ? 'Lichtkuppeln für jeden Bedarf' : 'Skylights for every need'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'de' 
              ? 'Flachdach-Lichtkuppeln in verschiedenen Formen und Ausführungen'
              : 'Flat roof skylights in various shapes and designs'
            }
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-10">
        <div className="container">
          <div className="flex lg:gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <ProductFilters 
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden gap-2">
                      <Filter className="h-4 w-4" />
                      {language === 'de' ? 'Filter' : 'Filters'}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] p-0">
                    <div className="p-4">
                      <ProductFilters 
                        selectedCategory={selectedCategory}
                        onCategoryChange={(cat) => {
                          handleCategoryChange(cat);
                          setMobileFiltersOpen(false);
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1" />
              </div>

              {/* Sort Bar */}
              <ProductSort 
                value={sortBy}
                onChange={setSortBy}
                totalProducts={totalProducts}
                currentRange={{ start: 1, end: Math.min(12, filteredProducts.length) }}
              />

              {/* Product Grid */}
              {filteredProducts.length > 0 ? (
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' 
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
                    : "grid-cols-1"
                )}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">
                    {language === 'de' 
                      ? 'Keine Produkte in dieser Kategorie gefunden.'
                      : 'No products found in this category.'
                    }
                  </p>
                </div>
              )}

              {/* Pagination placeholder */}
              <div className="mt-10 flex justify-center">
                <div className="flex gap-2">
                  {[1, 2, 3, '...', 8].map((page, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        "w-10 h-10 rounded-lg border border-border flex items-center justify-center text-sm font-medium transition-colors",
                        page === 1 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
