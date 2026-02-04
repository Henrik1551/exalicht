import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConfiguratorItems } from '@/hooks/useConfiguratorItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, Info, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/order-utils';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Skylight3DViewer } from './Skylight3DViewer';
// Simplified interface - only square sizes allowed
interface ConfigSelection {
  groesse: 80 | 100 | 110 | 180;  // Single size value for square dimensions
  material: 'acryl' | 'heatstop' | 'polycarbonat';
  optik: 'klar' | 'opal';
  shells: 1 | 2 | 3 | 4 | 5;
  kranzHeight: 15 | 30 | 50;
  luefterrahmen: 'festverglast' | '230v' | '24v';
  quantity: number;
}

const defaultSelection: ConfigSelection = {
  groesse: 100,
  material: 'acryl',
  optik: 'klar',
  shells: 2,
  kranzHeight: 30,
  luefterrahmen: 'festverglast',
  quantity: 1,
};

// Available options - only square sizes
const AVAILABLE_GROESSEN: (80 | 100 | 110 | 180)[] = [80, 100, 110, 180];
const SHELL_OPTIONS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];
const KRANZ_HEIGHTS: (15 | 30 | 50)[] = [15, 30, 50];

// Material mapping from UI to database values
const MATERIAL_MAP: Record<ConfigSelection['material'], string> = {
  acryl: 'AC',
  heatstop: 'HS',
  polycarbonat: 'PC',
};

export function ConfiguratorPage() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const [selection, setSelection] = useState<ConfigSelection>(defaultSelection);
  
  const { data: lichtkuppelItems, isLoading: loadingLK } = useConfiguratorItems('lichtkuppel');
  const { data: kranzItems, isLoading: loadingKranz } = useConfiguratorItems('aufsatzkranz');
  const { data: luefterItems, isLoading: loadingLuefter } = useConfiguratorItems('luefterrahmen');

  const isLoading = loadingLK || loadingKranz || loadingLuefter;

  // Calculate prices based on selection
  const prices = useMemo(() => {
    const dbMaterial = MATERIAL_MAP[selection.material];
    const size = selection.groesse;
    
    // Find matching Lichtkuppel (square size: width = length = groesse)
    const lkItem = lichtkuppelItems?.find(item => 
      item.width_cm === size &&
      item.length_cm === size &&
      item.material === dbMaterial &&
      item.shells === selection.shells
    );

    // Find matching Aufsatzkranz
    const kranzItem = kranzItems?.find(item =>
      item.width_cm === size &&
      item.length_cm === size &&
      item.height_cm === selection.kranzHeight
    );

    // Find matching Lüfterrahmen (only if not festverglast - fixed glazing is part of dome)
    const luefterItem = selection.luefterrahmen !== 'festverglast' ? luefterItems?.find(item =>
      item.width_cm === size &&
      item.length_cm === size
    ) : null;

    const lichtkuppelPrice = lkItem?.sale_price || 0;
    const kranzPrice = kranzItem?.sale_price || 0;
    const luefterPrice = luefterItem?.sale_price || 0;

    const unitTotal = lichtkuppelPrice + kranzPrice + luefterPrice;
    const total = unitTotal * selection.quantity;

    return {
      lichtkuppel: lichtkuppelPrice,
      kranz: kranzPrice,
      luefter: luefterPrice,
      unitTotal,
      total,
      lichtkuppelFound: !!lkItem,
      kranzFound: !!kranzItem,
      luefterFound: selection.luefterrahmen === 'festverglast' || !!luefterItem,
    };
  }, [selection, lichtkuppelItems, kranzItems, luefterItems]);

  // Helper function for price display
  const formatPriceOrNA = (price: number, found: boolean) => {
    if (!found && price === 0) return 'auf Anfrage';
    return formatPrice(price);
  };

  // Check if we have any products loaded
  const hasProducts = lichtkuppelItems && lichtkuppelItems.length > 0;

  const getUValue = () => {
    const uValues: Record<number, number> = { 1: 5.0, 2: 2.7, 3: 1.7, 4: 1.3, 5: 1.0 };
    return uValues[selection.shells] || 2.7;
  };

  const getMaterialLabel = (mat: ConfigSelection['material']) => {
    const labels = {
      acryl: 'Acryl',
      heatstop: 'Heatstop',
      polycarbonat: 'Polycarbonat',
    };
    return labels[mat];
  };

  const getLuefterrahmenLabel = (type: ConfigSelection['luefterrahmen']) => {
    const labels = {
      festverglast: 'festverglast',
      '230v': '230V Antrieb',
      '24v': '24V RWA-Antrieb',
    };
    return labels[type];
  };

  const handleAddToCart = () => {
    const sizeLabel = `${selection.groesse}x${selection.groesse}`;
    const configName = `Lichtkuppel ${sizeLabel} cm`;
    
    const configSku = `KONFIG-${sizeLabel}-${MATERIAL_MAP[selection.material]}-${selection.shells}S`;

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

  // Toggle button component for selections
  const OptionButton = ({ 
    selected, 
    onClick, 
    children, 
    className = '' 
  }: { 
    selected: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 border rounded-lg transition-all text-sm font-medium
        ${selected 
          ? 'border-primary bg-primary text-primary-foreground' 
          : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
        } ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'de' ? 'Lichtkuppel-Konfigurator' : 'Skylight Configurator'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'de'
            ? 'Konfigurieren Sie Ihre individuelle Lichtkuppel mit passendem Zubehör'
            : 'Configure your custom skylight with matching accessories'}
        </p>
      </div>

      {/* 3D Preview */}
      <div className="mb-8 relative">
        <Skylight3DViewer
          groesse={selection.groesse}
          material={selection.material}
          optik={selection.optik}
          shells={selection.shells}
          kranzHeight={selection.kranzHeight}
          luefterrahmen={selection.luefterrahmen}
        />
      </div>
      {/* Warning if no products found */}
      {!hasProducts && !isLoading && (
        <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-amber-800 dark:text-amber-200">
              {language === 'de'
                ? 'Keine Preisdaten gefunden. Bitte laden Sie die Seite neu.'
                : 'No pricing data found. Please reload the page.'}
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
          
          {/* 1. Maße [ULW] - Nur quadratische Größen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {language === 'de' ? 'Maße [ULW]' : 'Dimensions [ULW]'}
                <Badge variant="secondary" className="text-xs font-normal">
                  {language === 'de' ? 'Innenlichtweite' : 'Interior Light Width'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {language === 'de' ? 'Größe' : 'Size'} <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_GROESSEN.map(size => (
                    <OptionButton
                      key={size}
                      selected={selection.groesse === size}
                      onClick={() => setSelection(s => ({ ...s, groesse: size }))}
                    >
                      {size} x {size} cm
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Size display */}
              <div className="pt-2 text-sm text-muted-foreground">
                {language === 'de' ? 'Gewählte Größe:' : 'Selected size:'}{' '}
                <span className="font-medium text-foreground">
                  {selection.groesse} x {selection.groesse} cm
                </span>
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

          {/* 3. AUFSATZKRANZ */}
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
            </CardContent>
          </Card>

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
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {language === 'de' ? 'Zusammenfassung' : 'Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Configuration Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'de' ? 'Größe' : 'Size'}:</span>
                      <span className="font-medium">{selection.groesse} x {selection.groesse} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Material:</span>
                      <span className="font-medium">{getMaterialLabel(selection.material)} {selection.optik}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'de' ? 'Schalung' : 'Shells'}:</span>
                      <span className="font-medium">{selection.shells}-schalig (U={getUValue()})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'de' ? 'Aufsatzkranz' : 'Curb'}:</span>
                      <span className="font-medium">{selection.kranzHeight} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'de' ? 'Lüfterrahmen' : 'Frame'}:</span>
                      <span className="font-medium">{getLuefterrahmenLabel(selection.luefterrahmen)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lichtkuppel:</span>
                      <span className={!prices.lichtkuppelFound ? 'text-amber-600' : ''}>
                        {formatPriceOrNA(prices.lichtkuppel, prices.lichtkuppelFound)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Aufsatzkranz:</span>
                      <span className={!prices.kranzFound ? 'text-amber-600' : ''}>
                        {formatPriceOrNA(prices.kranz, prices.kranzFound)}
                      </span>
                    </div>
                    {selection.luefterrahmen !== 'festverglast' && (
                      <div className="flex justify-between text-sm">
                        <span>Lüfterrahmen:</span>
                        <span className={!prices.luefterFound ? 'text-amber-600' : ''}>
                          {formatPriceOrNA(prices.luefter, prices.luefterFound)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Unit Price */}
                  <div className="flex justify-between font-medium">
                    <span>{language === 'de' ? 'Stückpreis' : 'Unit Price'}:</span>
                    <span className={!prices.lichtkuppelFound ? 'text-amber-600' : ''}>
                      {prices.lichtkuppelFound ? formatPrice(prices.unitTotal) : 'auf Anfrage'}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-4">
                    <Label htmlFor="quantity" className="whitespace-nowrap">
                      {language === 'de' ? 'Menge' : 'Quantity'}:
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={100}
                      value={selection.quantity}
                      onChange={(e) => setSelection(s => ({ 
                        ...s, 
                        quantity: Math.max(1, parseInt(e.target.value) || 1) 
                      }))}
                      className="w-20"
                    />
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold">
                    <span>{language === 'de' ? 'Gesamt' : 'Total'}:</span>
                    <span className={!prices.lichtkuppelFound ? 'text-amber-600' : 'text-primary'}>
                      {prices.lichtkuppelFound ? formatPrice(prices.total) : 'auf Anfrage'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {language === 'de' 
                      ? 'Alle Preise zzgl. MwSt. zzgl. Versandkosten'
                      : 'All prices excl. VAT, plus shipping'}
                  </p>

                  {/* Add to Cart */}
                  {prices.lichtkuppelFound ? (
                    <Button 
                      onClick={handleAddToCart}
                      className="w-full"
                      size="lg"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {language === 'de' ? 'In den Warenkorb' : 'Add to Cart'}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      {language === 'de' ? 'Angebot anfordern' : 'Request Quote'}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
