import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConfiguratorItems } from '@/hooks/useConfiguratorItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Skylight3DViewer } from './Skylight3DViewer';
import { OptionButton } from './shared/OptionButton';
import { ConfiguratorSummary } from './shared/ConfiguratorSummary';

export type ConfiguratorShape = 'round' | 'square';

export interface BaseConfigSelection {
  material: 'acryl' | 'heatstop' | 'polycarbonat';
  optik: 'klar' | 'opal';
  shells: 1 | 2 | 3 | 4 | 5;
  kranzHeight: 15 | 30 | 50;
  luefterrahmen: 'festverglast' | 'spindel' | '230v' | '24v';
  quantity: number;
}

export interface SquareConfigSelection extends BaseConfigSelection {
  laenge: 80 | 100 | 110 | 180;
  breite: 80 | 100 | 110 | 180;
}

export interface RoundConfigSelection extends BaseConfigSelection {
  diameter: 60 | 80 | 100 | 120 | 150;
}

const SHELL_OPTIONS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];
const KRANZ_HEIGHTS: (15 | 30 | 50)[] = [15, 30, 50];
const SQUARE_DIMENSIONS: (80 | 100 | 110 | 180)[] = [80, 100, 110, 180];
const ROUND_DIAMETERS: (60 | 80 | 100 | 120 | 150)[] = [60, 80, 100, 120, 150];

const MATERIAL_MAP: Record<BaseConfigSelection['material'], string> = {
  acryl: 'AC',
  heatstop: 'HS',
  polycarbonat: 'PC',
};

interface BaseConfiguratorProps {
  shape: ConfiguratorShape;
  withCurb: boolean;
  titleDe: string;
  titleEn: string;
}

export function BaseConfigurator({ shape, withCurb, titleDe, titleEn }: BaseConfiguratorProps) {
  const { language } = useLanguage();
  const { addItem } = useCart();

  const defaultSelection = shape === 'square' 
    ? { laenge: 100 as const, breite: 100 as const, material: 'acryl' as const, optik: 'klar' as const, shells: 2 as const, kranzHeight: 30 as const, luefterrahmen: 'festverglast' as const, quantity: 1 }
    : { diameter: 100 as const, material: 'acryl' as const, optik: 'klar' as const, shells: 2 as const, kranzHeight: 30 as const, luefterrahmen: 'festverglast' as const, quantity: 1 };

  const [selection, setSelection] = useState<SquareConfigSelection | RoundConfigSelection>(defaultSelection as any);

  const { data: lichtkuppelItems, isLoading: loadingLK } = useConfiguratorItems('lichtkuppel');
  const { data: kranzItems, isLoading: loadingKranz } = useConfiguratorItems('aufsatzkranz');
  const { data: luefterItems, isLoading: loadingLuefter } = useConfiguratorItems('luefterrahmen');

  const isLoading = loadingLK || loadingKranz || loadingLuefter;

  const getLaenge = () => shape === 'square' ? (selection as SquareConfigSelection).laenge : 0;
  const getBreite = () => shape === 'square' ? (selection as SquareConfigSelection).breite : 0;
  const getDiameter = () => shape === 'round' ? (selection as RoundConfigSelection).diameter : 0;

  const getSizeLabel = () => {
    if (shape === 'square') {
      const l = getLaenge();
      const b = getBreite();
      return `${l} x ${b} cm`;
    }
    return `Ø ${getDiameter()} cm`;
  };

  const prices = useMemo(() => {
    const dbMaterial = MATERIAL_MAP[selection.material];
    const laenge = getLaenge();
    const breite = getBreite();
    const diameter = getDiameter();

    // Find matching Lichtkuppel
    let lkItem;
    if (shape === 'square') {
      lkItem = lichtkuppelItems?.find(item =>
        item.width_cm === breite &&
        item.length_cm === laenge &&
        item.material === dbMaterial &&
        item.shells === selection.shells
      );
    } else {
      // For round, we use diameter_cm
      lkItem = lichtkuppelItems?.find(item =>
        item.diameter_cm === diameter &&
        item.material === dbMaterial &&
        item.shells === selection.shells
      );
    }

    // Find matching Aufsatzkranz (only if withCurb)
    let kranzItem = null;
    if (withCurb) {
      if (shape === 'square') {
        kranzItem = kranzItems?.find(item =>
          item.width_cm === breite &&
          item.length_cm === laenge &&
          item.height_cm === selection.kranzHeight
        );
      } else {
        kranzItem = kranzItems?.find(item =>
          item.diameter_cm === diameter &&
          item.height_cm === selection.kranzHeight
        );
      }
    }

    // Find matching Lüfterrahmen
    let luefterItem = null;
    if (selection.luefterrahmen !== 'festverglast' && selection.luefterrahmen !== 'spindel') {
      if (shape === 'square') {
        luefterItem = luefterItems?.find(item =>
          item.width_cm === breite &&
          item.length_cm === laenge
        );
      } else {
        luefterItem = luefterItems?.find(item =>
          item.diameter_cm === diameter
        );
      }
    }

    const lichtkuppelPrice = lkItem?.sale_price || 0;
    const kranzPrice = withCurb ? (kranzItem?.sale_price || 0) : 0;
    const luefterPrice = luefterItem?.sale_price || 0;

    const unitTotal = lichtkuppelPrice + kranzPrice + luefterPrice;
    const total = unitTotal * selection.quantity;

    return {
      lichtkuppel: lichtkuppelPrice,
      kranz: withCurb ? kranzPrice : undefined,
      luefter: luefterPrice,
      unitTotal,
      total,
      lichtkuppelFound: !!lkItem,
      kranzFound: withCurb ? !!kranzItem : undefined,
      luefterFound: selection.luefterrahmen === 'festverglast' || selection.luefterrahmen === 'spindel' || !!luefterItem,
    };
  }, [selection, lichtkuppelItems, kranzItems, luefterItems, shape, withCurb, getLaenge, getBreite, getDiameter]);

  const hasProducts = lichtkuppelItems && lichtkuppelItems.length > 0;

  const getUValue = () => {
    const uValues: Record<number, number> = { 1: 5.0, 2: 2.7, 3: 1.7, 4: 1.3, 5: 1.0 };
    return uValues[selection.shells] || 2.7;
  };

  const getMaterialLabel = (mat: BaseConfigSelection['material']) => {
    const labels = { acryl: 'Acryl', heatstop: 'Heatstop', polycarbonat: 'Polycarbonat' };
    return labels[mat];
  };

  const getLuefterrahmenLabel = (type: BaseConfigSelection['luefterrahmen']) => {
    const labels = { festverglast: 'festverglast', spindel: 'Spindel', '230v': '230V Antrieb', '24v': '24V RWA-Antrieb' };
    return labels[type];
  };

  const handleAddToCart = () => {
    const sizeLabel = getSizeLabel();
    const configName = `Lichtkuppel ${sizeLabel}`;
    const configSku = shape === 'square'
      ? `KONFIG-${getLaenge()}x${getBreite()}-${MATERIAL_MAP[selection.material]}-${selection.shells}S`
      : `KONFIG-R${getDiameter()}-${MATERIAL_MAP[selection.material]}-${selection.shells}S`;

    addItem({
      productId: `config-${Date.now()}`,
      name: configName,
      price: prices.unitTotal,
      image: '/placeholder.svg',
      sku: configSku,
    }, selection.quantity);

    toast.success(
      language === 'de'
        ? `${configName} zum Warenkorb hinzugefügt`
        : `${configName} added to cart`
    );
  };

  // Convert to 3D viewer props
  const get3DViewerProps = () => {
    // Map to the expected groesse type for viewer (use laenge for square)
    const groesse = shape === 'square' 
      ? (getLaenge() as 80 | 100 | 110 | 180)
      : (getDiameter() <= 80 ? 80 : getDiameter() <= 100 ? 100 : getDiameter() <= 110 ? 110 : 180) as 80 | 100 | 110 | 180;
    
    return {
      groesse,
      material: selection.material,
      optik: selection.optik,
      shells: selection.shells,
      kranzHeight: selection.kranzHeight,
      luefterrahmen: selection.luefterrahmen,
      shape,
      showCurb: withCurb,
    };
  };

  const viewerProps = get3DViewerProps();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/configurator">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'de' ? 'Zurück zur Auswahl' : 'Back to selection'}
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'de' ? titleDe : titleEn}
        </h1>
        <p className="text-muted-foreground">
          {language === 'de'
            ? 'Konfigurieren Sie Ihre individuelle Lichtkuppel'
            : 'Configure your custom skylight'}
        </p>
      </div>

      {/* 3D Preview */}
      <div className="mb-8 relative">
        <Skylight3DViewer {...viewerProps} />
      </div>

      {/* Warning if no products found */}
      {!hasProducts && !isLoading && (
        <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-amber-800 dark:text-amber-200">
              {language === 'de'
                ? 'Keine Preisdaten gefunden. Preise werden als "auf Anfrage" angezeigt.'
                : 'No pricing data found. Prices will be shown as "on request".'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="ml-4 border-amber-500 text-amber-700 hover:bg-amber-100"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {language === 'de' ? 'Neu laden' : 'Reload'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configuration Options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Maße */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {language === 'de' ? 'Maße' : 'Dimensions'}
                <Badge variant="secondary" className="text-xs font-normal">
                  {shape === 'round' 
                    ? (language === 'de' ? 'Durchmesser' : 'Diameter')
                    : (language === 'de' ? 'Innenlichtweite' : 'Interior Width')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shape === 'square' ? (
                <>
                  {/* Länge */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {language === 'de' ? 'Länge' : 'Length'} <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {SQUARE_DIMENSIONS.map(size => (
                        <OptionButton
                          key={size}
                          selected={(selection as SquareConfigSelection).laenge === size}
                          onClick={() => {
                            const newSelection = { ...selection, laenge: size } as SquareConfigSelection;
                            // If breite > laenge, adjust breite
                            if (newSelection.breite > size) {
                              newSelection.breite = size;
                            }
                            setSelection(newSelection);
                          }}
                        >
                          {size} cm
                        </OptionButton>
                      ))}
                    </div>
                  </div>

                  {/* Breite */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {language === 'de' ? 'Breite' : 'Width'} <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {SQUARE_DIMENSIONS.filter(size => size <= getLaenge()).map(size => (
                        <OptionButton
                          key={size}
                          selected={(selection as SquareConfigSelection).breite === size}
                          onClick={() => setSelection(s => ({ ...s, breite: size }))}
                        >
                          {size} cm
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'de' ? 'Durchmesser' : 'Diameter'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {ROUND_DIAMETERS.map(d => (
                      <OptionButton
                        key={d}
                        selected={(selection as RoundConfigSelection).diameter === d}
                        onClick={() => setSelection(s => ({ ...s, diameter: d }))}
                      >
                        Ø {d} cm
                      </OptionButton>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 text-sm text-muted-foreground">
                {language === 'de' ? 'Gewählte Größe:' : 'Selected size:'}{' '}
                <span className="font-medium text-foreground">{getSizeLabel()}</span>
              </div>
            </CardContent>
          </Card>

          {/* 2. OBERSCHALE (Material & Optik) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'de' ? 'OBERSCHALE (Material & Optik)' : 'TOP SHELL (Material & Appearance)'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Material */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Material <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  <OptionButton
                    selected={selection.material === 'acryl'}
                    onClick={() => setSelection(s => ({ ...s, material: 'acryl' }))}
                  >
                    Acryl (Standard)
                  </OptionButton>
                  <OptionButton
                    selected={selection.material === 'heatstop'}
                    onClick={() => setSelection(s => ({ ...s, material: 'heatstop' }))}
                  >
                    Heatstop ({language === 'de' ? 'wärmereflektierend' : 'heat reflective'})
                  </OptionButton>
                  <OptionButton
                    selected={selection.material === 'polycarbonat'}
                    onClick={() => setSelection(s => ({ ...s, material: 'polycarbonat' }))}
                  >
                    Polycarbonat ({language === 'de' ? 'schlagfest' : 'impact resistant'})
                  </OptionButton>
                </div>
              </div>

              {/* Optik */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Optik <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  <OptionButton
                    selected={selection.optik === 'klar'}
                    onClick={() => setSelection(s => ({ ...s, optik: 'klar' }))}
                  >
                    klar ({language === 'de' ? 'transparent' : 'transparent'})
                  </OptionButton>
                  <OptionButton
                    selected={selection.optik === 'opal'}
                    onClick={() => setSelection(s => ({ ...s, optik: 'opal' }))}
                  >
                    opal ({language === 'de' ? 'Milchglas' : 'frosted'})
                  </OptionButton>
                </div>
              </div>

              {/* Schale */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Schale <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {SHELL_OPTIONS.map(shell => (
                    <OptionButton
                      key={shell}
                      selected={selection.shells === shell}
                      onClick={() => setSelection(s => ({ ...s, shells: shell }))}
                      className="flex flex-col items-center min-w-[80px]"
                    >
                      <span>{shell}-schalig</span>
                      <span className="text-xs opacity-70">
                        U={[5.0, 2.7, 1.7, 1.3, 1.0][shell - 1]} W/m²K
                      </span>
                    </OptionButton>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. AUFSATZKRANZ - Only show if withCurb */}
          {withCurb && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'de' ? 'AUFSATZKRANZ' : 'MOUNTING CURB'}
                  <span className="block text-sm font-normal text-muted-foreground mt-1">
                    {language === 'de' ? '(Rahmen zwischen Dach und Kuppel)' : '(Frame between roof and dome)'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'de' ? 'Höhe' : 'Height'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {KRANZ_HEIGHTS.map(h => (
                      <OptionButton
                        key={h}
                        selected={selection.kranzHeight === h}
                        onClick={() => setSelection(s => ({ ...s, kranzHeight: h }))}
                      >
                        {h} cm
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* Dämmung - fest 20mm */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'de' ? 'Dämmung' : 'Insulation'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <OptionButton selected={true} onClick={() => {}}>
                      20 mm
                    </OptionButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 4. Lüfterrahmen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'de' ? 'Lüfterrahmen' : 'Ventilation Frame'}
                <span className="block text-sm font-normal text-muted-foreground mt-1">
                  ({language === 'de' ? 'optional' : 'optional'})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {language === 'de' ? 'Variante' : 'Variant'} <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  <OptionButton
                    selected={selection.luefterrahmen === 'festverglast'}
                    onClick={() => setSelection(s => ({ ...s, luefterrahmen: 'festverglast' }))}
                  >
                    festverglast ({language === 'de' ? 'nicht zu öffnen' : 'fixed'})
                  </OptionButton>
                  <OptionButton
                    selected={selection.luefterrahmen === 'spindel'}
                    onClick={() => setSelection(s => ({ ...s, luefterrahmen: 'spindel' }))}
                  >
                    manuell öffenbar (Spindel)
                  </OptionButton>
                  <OptionButton
                    selected={selection.luefterrahmen === '230v'}
                    onClick={() => setSelection(s => ({ ...s, luefterrahmen: '230v' }))}
                  >
                    elektrisch öffenbar (230V Antrieb)
                  </OptionButton>
                  <OptionButton
                    selected={selection.luefterrahmen === '24v'}
                    onClick={() => setSelection(s => ({ ...s, luefterrahmen: '24v' }))}
                  >
                    elektrisch öffenbar (24V RWA-Antrieb)
                  </OptionButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Summary Sidebar */}
        <div className="lg:col-span-1">
          <ConfiguratorSummary
            config={{
              size: getSizeLabel(),
              material: getMaterialLabel(selection.material),
              optik: selection.optik,
              shells: selection.shells,
              uValue: getUValue(),
              kranzHeight: withCurb ? selection.kranzHeight : undefined,
              luefterrahmen: getLuefterrahmenLabel(selection.luefterrahmen),
            }}
            prices={prices}
            quantity={selection.quantity}
            onQuantityChange={(qty) => setSelection(s => ({ ...s, quantity: qty }))}
            onAddToCart={handleAddToCart}
            isLoading={isLoading}
            showKranz={withCurb}
          />
        </div>
      </div>
    </div>
  );
}
