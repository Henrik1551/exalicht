import { Link } from 'react-router-dom';
import { ArrowRight, Sun, Wind, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function CategoriesSection() {
  const { t } = useLanguage();

  const categories = [
    {
      icon: Sun,
      title: t('categories.skylights'),
      description: t('categories.skylights.desc'),
      href: '/products/skylights',
      image: 'skylight',
    },
    {
      icon: Wind,
      title: t('categories.rwa'),
      description: t('categories.rwa.desc'),
      href: '/products/rwa',
      image: 'rwa',
    },
    {
      icon: Settings,
      title: t('categories.accessories'),
      description: t('categories.accessories.desc'),
      href: '/products/accessories',
      image: 'accessories',
    },
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('categories.title')}
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={category.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-xl transition-all duration-500"
            >
              {/* Category Image Placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                <category.icon className="h-24 w-24 text-primary/30 group-hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/products" className="gap-2">
              Alle Produkte anzeigen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
