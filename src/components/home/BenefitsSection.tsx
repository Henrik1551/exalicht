import { Package, Shield, Truck, HeadphonesIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function BenefitsSection() {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Package,
      title: t('benefits.selection'),
      description: t('benefits.selection.desc'),
    },
    {
      icon: Shield,
      title: t('benefits.quality'),
      description: t('benefits.quality.desc'),
    },
    {
      icon: Truck,
      title: t('benefits.delivery'),
      description: t('benefits.delivery.desc'),
    },
    {
      icon: HeadphonesIcon,
      title: t('benefits.support'),
      description: t('benefits.support.desc'),
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('benefits.title')}
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
