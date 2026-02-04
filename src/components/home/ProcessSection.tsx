import { Search, Settings, FileText, ShoppingCart, Truck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function ProcessSection() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Search,
      number: '01',
      title: t('process.step1'),
      description: t('process.step1.desc'),
    },
    {
      icon: Settings,
      number: '02',
      title: t('process.step2'),
      description: t('process.step2.desc'),
    },
    {
      icon: FileText,
      number: '03',
      title: t('process.step3'),
      description: t('process.step3.desc'),
    },
    {
      icon: ShoppingCart,
      number: '04',
      title: t('process.step4'),
      description: t('process.step4.desc'),
    },
    {
      icon: Truck,
      number: '05',
      title: t('process.step5'),
      description: t('process.step5.desc'),
    },
  ];

  return (
    <section className="py-20 bg-foreground text-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('process.title')}
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-muted-foreground/20 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                {/* Step Circle */}
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background border-4 border-primary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
