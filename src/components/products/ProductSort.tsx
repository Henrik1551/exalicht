import { sortOptions } from '@/lib/products-data';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductSortProps {
  value: string;
  onChange: (value: string) => void;
  totalProducts: number;
  currentRange: { start: number; end: number };
}

export function ProductSort({ value, onChange, totalProducts, currentRange }: ProductSortProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <p className="text-sm text-muted-foreground">
        {language === 'de' 
          ? `${currentRange.start}–${currentRange.end} von ${totalProducts} Ergebnissen werden angezeigt`
          : `Showing ${currentRange.start}–${currentRange.end} of ${totalProducts} results`
        }
      </p>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full sm:w-[220px] bg-background">
          <SelectValue placeholder={language === 'de' ? 'Sortierung' : 'Sort by'} />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border z-50">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {language === 'de' ? option.label : option.labelEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
