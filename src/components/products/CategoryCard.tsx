import { Link } from 'react-router-dom';
import { ArrowRight, Sun } from 'lucide-react';
import { Category } from '@/lib/products-data';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { language } = useLanguage();
  
  const name = language === 'de' ? category.name : category.nameEn;
  const description = language === 'de' ? category.description : category.descriptionEn;

  return (
    <Link
      to={`/products?category=${category.id}`}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
    >
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-muted flex items-center justify-center relative overflow-hidden">
        <Sun className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
          {name}
        </h3>
        <button className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          Ausführung wählen
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </Link>
  );
}
