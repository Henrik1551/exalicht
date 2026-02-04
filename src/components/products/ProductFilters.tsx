import { filterCategories as defaultFilterCategories } from '@/lib/products-data';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface FilterCategory {
  id: string;
  name: string;
  nameEn: string;
  count: number;
}

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories?: FilterCategory[];
}

export function ProductFilters({ selectedCategory, onCategoryChange, categories }: ProductFiltersProps) {
  const { language } = useLanguage();
  const filterCategories = categories || defaultFilterCategories;

  return (
    <div className="bg-card border border-border rounded-xl p-6 sticky top-20">
      <h3 className="font-semibold text-lg text-foreground mb-4">
        {language === 'de' ? 'Produkte filtern' : 'Filter products'}
      </h3>
      
      <div className="space-y-1">
        {filterCategories.map((category) => {
          const name = language === 'de' ? category.name : category.nameEn;
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full border-2 transition-colors",
                    isSelected 
                      ? "bg-primary-foreground border-primary-foreground" 
                      : "border-muted-foreground"
                  )}
                />
                <span className="text-sm font-medium">{name}</span>
              </div>
              <span 
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  isSelected 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {category.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Shape Filter */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-medium text-foreground mb-3">
          {language === 'de' ? 'Form' : 'Shape'}
        </h4>
        <div className="space-y-2">
          {['round', 'square', 'rectangular'].map((shape) => (
            <label key={shape} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-input" />
              <span className="text-sm text-muted-foreground capitalize">
                {language === 'de' 
                  ? shape === 'round' ? 'Rund' : shape === 'square' ? 'Quadratisch' : 'Rechteckig'
                  : shape.charAt(0).toUpperCase() + shape.slice(1)
                }
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-medium text-foreground mb-3">
          {language === 'de' ? 'Preisspanne' : 'Price Range'}
        </h4>
        <div className="flex gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background"
          />
          <span className="text-muted-foreground self-center">–</span>
          <input 
            type="number" 
            placeholder="Max" 
            className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background"
          />
        </div>
      </div>

      {/* In Stock */}
      <div className="mt-6 pt-6 border-t border-border">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded border-input" defaultChecked />
          <span className="text-sm text-foreground">
            {language === 'de' ? 'Nur verfügbare Artikel' : 'In stock only'}
          </span>
        </label>
      </div>
    </div>
  );
}
