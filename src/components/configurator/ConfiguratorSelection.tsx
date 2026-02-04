import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Circle, Square, ArrowRight } from 'lucide-react';

interface ConfiguratorOption {
  id: string;
  titleDe: string;
  titleEn: string;
  descriptionDe: string;
  descriptionEn: string;
  path: string;
  shape: 'round' | 'square';
  withCurb: boolean;
}

const configuratorOptions: ConfiguratorOption[] = [
  {
    id: 'round-complete',
    titleDe: 'Lichtkuppeln mit Aufsatzkranz (Rund)',
    titleEn: 'Skylights with Mounting Curb (Round)',
    descriptionDe: 'Komplettset: Runde Kuppel mit passendem Aufsatzkranz',
    descriptionEn: 'Complete set: Round dome with matching mounting curb',
    path: '/configurator/rund-komplett',
    shape: 'round',
    withCurb: true,
  },
  {
    id: 'square-complete',
    titleDe: 'Lichtkuppeln mit Aufsatzkranz (Quadratisch)',
    titleEn: 'Skylights with Mounting Curb (Square)',
    descriptionDe: 'Komplettset: Quadratische Kuppel mit passendem Aufsatzkranz',
    descriptionEn: 'Complete set: Square dome with matching mounting curb',
    path: '/configurator/quadrat-komplett',
    shape: 'square',
    withCurb: true,
  },
  {
    id: 'round-shell',
    titleDe: 'Lichtkuppeln / Oberschalen (Rund)',
    titleEn: 'Skylights / Top Shells (Round)',
    descriptionDe: 'Nur die runde Oberschale, ohne Aufsatzkranz',
    descriptionEn: 'Round top shell only, without mounting curb',
    path: '/configurator/rund-kuppel',
    shape: 'round',
    withCurb: false,
  },
  {
    id: 'square-shell',
    titleDe: 'Lichtkuppeln / Oberschalen (Quadratisch)',
    titleEn: 'Skylights / Top Shells (Square)',
    descriptionDe: 'Nur die quadratische Oberschale, ohne Aufsatzkranz',
    descriptionEn: 'Square top shell only, without mounting curb',
    path: '/configurator/quadrat-kuppel',
    shape: 'square',
    withCurb: false,
  },
];

function ShapeIcon({ shape, withCurb, className = '' }: { shape: 'round' | 'square'; withCurb: boolean; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Dome */}
      {shape === 'round' ? (
        <Circle className="h-16 w-16 text-primary" strokeWidth={2} />
      ) : (
        <Square className="h-16 w-16 text-primary" strokeWidth={2} />
      )}
      
      {/* Curb indicator */}
      {withCurb && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 border-2 border-muted-foreground rounded-sm bg-muted/50" />
      )}
    </div>
  );
}

export function ConfiguratorSelection() {
  const { language } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {language === 'de' ? 'Lichtkuppel-Konfigurator' : 'Skylight Configurator'}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {language === 'de'
            ? 'Wählen Sie Ihre Produktkategorie, um mit der Konfiguration zu beginnen'
            : 'Choose your product category to start configuring'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {configuratorOptions.map((option) => (
          <Card 
            key={option.id} 
            className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
          >
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4 h-24 items-center">
                <ShapeIcon shape={option.shape} withCurb={option.withCurb} />
              </div>
              <CardTitle className="text-lg">
                {language === 'de' ? option.titleDe : option.titleEn}
              </CardTitle>
              <CardDescription>
                {language === 'de' ? option.descriptionDe : option.descriptionEn}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button asChild className="w-full group-hover:bg-primary/90">
                <Link to={option.path}>
                  {language === 'de' ? 'Konfigurieren' : 'Configure'}
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        <p>
          {language === 'de'
            ? 'Sie sind sich nicht sicher, welche Option die richtige für Sie ist? Kontaktieren Sie uns für eine persönliche Beratung.'
            : 'Not sure which option is right for you? Contact us for personalized advice.'}
        </p>
      </div>
    </div>
  );
}
