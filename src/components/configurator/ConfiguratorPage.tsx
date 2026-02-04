import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConfiguratorItems } from '@/hooks/useConfiguratorItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Info, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/order-utils';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ConfigSelection {
  form: 'rechteckig' | 'rund';
  // Lichtkuppel
  size: string;
  material: 'AC' | 'HS' | 'PC';
  shells: number;
  // Aufsatzkranz
  includeKranz: boolean;
  kranzHeight: number;
  kranzWallThickness: number;
  kranzForm: 'schraeg' | 'gerade';
  vormontage: boolean;
  // Lüfterrahmen
  luefterrahmen: 'ohne' | 'starr' | '230v' | '24v';
  // Durchsturzsicherung
  includeDurchsturz: boolean;
  durchsturzSurface: 'RAL9010' | 'verzinkt' | 'RAL9010+verzinkt';
  // Quantity
  quantity: number;
}

const defaultSelection: ConfigSelection = {
  form: 'rechteckig',
  size: '100x100',
  material: 'AC',
  shells: 2,
  includeKranz: true,
  kranzHeight: 30,
  kranzWallThickness: 40,
  kranzForm: 'schraeg',
  vormontage: false,
  luefterrahmen: 'ohne',
  includeDurchsturz: false,
  durchsturzSurface: 'RAL9010',
  quantity: 1,
};

const AVAILABLE_SIZES_RECHTECKIG = [
  '100x100', '100x120', '100x150', '100x160', '100x180', '100x200',
  '120x120', '120x150', '120x180', '120x200',
  '150x150', '150x180', '150x200',
  '160x160', '180x180', '200x200',
];

const AVAILABLE_SIZES_RUND = [
  '60', '80', '90', '100', '110', '120', '140', '150', '160', '170', '180', '200'
];

const SHELL_OPTIONS = [1, 2, 3, 4, 5];
const KRANZ_HEIGHTS = [15, 30, 50];
const KRANZ_WALL_THICKNESSES = [20, 40, 50, 60, 80, 100];

export function ConfiguratorPage() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const [selection, setSelection] = useState<ConfigSelection>(defaultSelection);
  
  const { data: lichtkuppelItems, isLoading: loadingLK } = useConfiguratorItems('lichtkuppel');
  const { data: kranzItems, isLoading: loadingKranz } = useConfiguratorItems('aufsatzkranz');
  const { data: luefterItems, isLoading: loadingLuefter } = useConfiguratorItems('luefterrahmen');
  const { data: durchsturzItems, isLoading: loadingDurchsturz } = useConfiguratorItems('durchsturzsicherung');

  const isLoading = loadingLK || loadingKranz || loadingLuefter || loadingDurchsturz;

  // Calculate prices based on selection
  const prices = useMemo(() => {
    const [width, length] = selection.size.split('x').map(Number);
    
    // Find matching Lichtkuppel
    const lkItem = lichtkuppelItems?.find(item => {
      if (selection.form === 'rund') {
        return item.diameter_cm === parseInt(selection.size) &&
               item.material === selection.material &&
               item.shells === selection.shells;
      }
      return item.width_cm === width &&
             item.length_cm === (length || width) &&
             item.material === selection.material &&
             item.shells === selection.shells;
    });

    // Find matching Kranz
    const kranzItem = selection.includeKranz ? kranzItems?.find(item => {
      if (selection.form === 'rund') {
        return item.diameter_cm === parseInt(selection.size) &&
               item.height_cm === selection.kranzHeight &&
               item.wall_thickness_mm === selection.kranzWallThickness;
      }
      return item.width_cm === width &&
             item.length_cm === (length || width) &&
             item.height_cm === selection.kranzHeight &&
             item.wall_thickness_mm === selection.kranzWallThickness &&
             item.form === selection.kranzForm;
    }) : null;

    // Find matching Lüfterrahmen
    const luefterItem = selection.luefterrahmen !== 'ohne' ? luefterItems?.find(item => {
      if (selection.form === 'rund') {
        return item.diameter_cm === parseInt(selection.size);
      }
      return item.width_cm === width && item.length_cm === (length || width);
    }) : null;

    // Find matching Durchsturzsicherung
    const durchsturzItem = selection.includeDurchsturz ? durchsturzItems?.find(item => {
      if (selection.form === 'rund') {
        return item.diameter_cm === parseInt(selection.size) &&
               item.surface === selection.durchsturzSurface;
      }
      return item.width_cm === width &&
             item.length_cm === (length || width) &&
             item.surface === selection.durchsturzSurface;
    }) : null;

    const lichtkuppelPrice = lkItem?.sale_price || 0;
    const kranzPrice = kranzItem?.sale_price || 0;
    const luefterPrice = luefterItem?.sale_price || 0;
    const durchsturzPrice = durchsturzItem?.sale_price || 0;
    const vormontagePrice = selection.vormontage ? 25 : 0; // Fixed vormontage price

    const unitTotal = lichtkuppelPrice + kranzPrice + luefterPrice + durchsturzPrice + vormontagePrice;
    const total = unitTotal * selection.quantity;

    return {
      lichtkuppel: lichtkuppelPrice,
      kranz: kranzPrice,
      luefter: luefterPrice,
      durchsturz: durchsturzPrice,
      vormontage: vormontagePrice,
      unitTotal,
      total,
      hasItems: lichtkuppelPrice > 0,
    };
  }, [selection, lichtkuppelItems, kranzItems, luefterItems, durchsturzItems]);

  const getUValue = () => {
    const uValues: Record<number, number> = { 1: 5.0, 2: 2.7, 3: 1.7, 4: 1.3, 5: 1.0 };
    return uValues[selection.shells] || 2.7;
  };

  const handleAddToCart = () => {
    const configName = selection.form === 'rund' 
      ? `Lichtkuppel Ø${selection.size} cm`
      : `Lichtkuppel ${selection.size} cm`;
    
    const description = [
      `${selection.shells}-schalig ${selection.material}`,
      selection.includeKranz ? `+ Aufsatzkranz ${selection.kranzHeight}cm` : null,
      selection.luefterrahmen !== 'ohne' ? `+ Lüfterrahmen` : null,
      selection.includeDurchsturz ? `+ Durchsturzsicherung` : null,
    ].filter(Boolean).join(', ');

    const configSku = `KONFIG-${selection.size}-${selection.material}-${selection.shells}S`;

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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configuration Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'de' ? '1. Form wählen' : '1. Choose Shape'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selection.form}
                onValueChange={(v) => setSelection(s => ({ 
                  ...s, 
                  form: v as 'rechteckig' | 'rund',
                  size: v === 'rund' ? '100' : '100x100'
                }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rechteckig" id="rechteckig" />
                  <Label htmlFor="rechteckig" className="cursor-pointer">
                    {language === 'de' ? 'Rechteckig / Quadratisch' : 'Rectangular / Square'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rund" id="rund" />
                  <Label htmlFor="rund" className="cursor-pointer">
                    {language === 'de' ? 'Rund' : 'Round'}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Lichtkuppel Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'de' ? '2. Lichtkuppel' : '2. Skylight Dome'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Size */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'de' ? 'Größe (ULW)' : 'Size (ULW)'}</Label>
                  <Select
                    value={selection.size}
                    onValueChange={(v) => setSelection(s => ({ ...s, size: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(selection.form === 'rund' ? AVAILABLE_SIZES_RUND : AVAILABLE_SIZES_RECHTECKIG).map(size => (
                        <SelectItem key={size} value={size}>
                          {selection.form === 'rund' ? `Ø ${size} cm` : `${size} cm`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Material */}
                <div className="space-y-2">
                  <Label>{language === 'de' ? 'Material Oberschale' : 'Top Shell Material'}</Label>
                  <Select
                    value={selection.material}
                    onValueChange={(v) => setSelection(s => ({ ...s, material: v as 'AC' | 'HS' | 'PC' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">
                        Acryl (AC) - Standard
                      </SelectItem>
                      <SelectItem value="HS">
                        Heatstop (HS) - {language === 'de' ? 'Wärmeabweisend' : 'Heat Reflective'}
                      </SelectItem>
                      <SelectItem value="PC">
                        Polycarbonat (PC) - {language === 'de' ? 'Schlagfest' : 'Impact Resistant'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Shells */}
              <div className="space-y-2">
                <Label>{language === 'de' ? 'Schalung / Dämmung' : 'Shells / Insulation'}</Label>
                <RadioGroup
                  value={selection.shells.toString()}
                  onValueChange={(v) => setSelection(s => ({ ...s, shells: parseInt(v) }))}
                  className="flex flex-wrap gap-2"
                >
                  {SHELL_OPTIONS.map(shell => (
                    <div key={shell} className="flex items-center">
                      <RadioGroupItem value={shell.toString()} id={`shell-${shell}`} className="peer sr-only" />
                      <Label
                        htmlFor={`shell-${shell}`}
                        className="flex flex-col items-center px-4 py-2 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span className="font-medium">{shell}-{language === 'de' ? 'schalig' : 'shell'}</span>
                        <span className="text-xs text-muted-foreground">
                          U={[5.0, 2.7, 1.7, 1.3, 1.0][shell - 1]} W/m²K
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Aufsatzkranz */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {language === 'de' ? '3. Aufsatzkranz' : '3. Mounting Curb'}
              </CardTitle>
              <Switch
                checked={selection.includeKranz}
                onCheckedChange={(v) => setSelection(s => ({ ...s, includeKranz: v }))}
              />
            </CardHeader>
            {selection.includeKranz && (
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'de' ? 'Höhe' : 'Height'}</Label>
                    <Select
                      value={selection.kranzHeight.toString()}
                      onValueChange={(v) => setSelection(s => ({ ...s, kranzHeight: parseInt(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KRANZ_HEIGHTS.map(h => (
                          <SelectItem key={h} value={h.toString()}>{h} cm</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'de' ? 'Wandstärke' : 'Wall Thickness'}</Label>
                    <Select
                      value={selection.kranzWallThickness.toString()}
                      onValueChange={(v) => setSelection(s => ({ ...s, kranzWallThickness: parseInt(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KRANZ_WALL_THICKNESSES.map(w => (
                          <SelectItem key={w} value={w.toString()}>{w} mm</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'de' ? 'Ausführung' : 'Style'}</Label>
                    <Select
                      value={selection.kranzForm}
                      onValueChange={(v) => setSelection(s => ({ ...s, kranzForm: v as 'schraeg' | 'gerade' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="schraeg">{language === 'de' ? 'Schräg' : 'Sloped'}</SelectItem>
                        <SelectItem value="gerade">{language === 'de' ? 'Gerade' : 'Straight'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="vormontage"
                    checked={selection.vormontage}
                    onCheckedChange={(v) => setSelection(s => ({ ...s, vormontage: v }))}
                  />
                  <Label htmlFor="vormontage">
                    {language === 'de' ? 'Vormontage (Kuppel auf Kranz montiert)' : 'Pre-assembly (Dome mounted on curb)'}
                  </Label>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Lüfterrahmen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'de' ? '4. Lüfterrahmen / Öffnung' : '4. Ventilation Frame'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selection.luefterrahmen}
                onValueChange={(v) => setSelection(s => ({ ...s, luefterrahmen: v as any }))}
                className="grid sm:grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="ohne" id="luefter-ohne" />
                  <Label htmlFor="luefter-ohne" className="cursor-pointer flex-1">
                    <span className="font-medium">{language === 'de' ? 'Ohne (starr)' : 'None (fixed)'}</span>
                    <span className="block text-xs text-muted-foreground">
                      {language === 'de' ? 'Nicht öffenbar' : 'Not openable'}
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="starr" id="luefter-starr" />
                  <Label htmlFor="luefter-starr" className="cursor-pointer flex-1">
                    <span className="font-medium">{language === 'de' ? 'Mit Lüfterrahmen' : 'With Frame'}</span>
                    <span className="block text-xs text-muted-foreground">
                      {language === 'de' ? 'Manuell öffenbar' : 'Manual opening'}
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="230v" id="luefter-230v" />
                  <Label htmlFor="luefter-230v" className="cursor-pointer flex-1">
                    <span className="font-medium">230V Motor</span>
                    <span className="block text-xs text-muted-foreground">
                      {language === 'de' ? 'Elektrisch' : 'Electric'}
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="24v" id="luefter-24v" />
                  <Label htmlFor="luefter-24v" className="cursor-pointer flex-1">
                    <span className="font-medium">24V Motor (RWA)</span>
                    <span className="block text-xs text-muted-foreground">
                      {language === 'de' ? 'Rauch-Wärme-Abzug' : 'Smoke ventilation'}
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Durchsturzsicherung */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {language === 'de' ? '5. Durchsturzsicherung' : '5. Fall Protection'}
              </CardTitle>
              <Switch
                checked={selection.includeDurchsturz}
                onCheckedChange={(v) => setSelection(s => ({ ...s, includeDurchsturz: v }))}
              />
            </CardHeader>
            {selection.includeDurchsturz && (
              <CardContent>
                <div className="space-y-2">
                  <Label>{language === 'de' ? 'Oberfläche' : 'Surface'}</Label>
                  <RadioGroup
                    value={selection.durchsturzSurface}
                    onValueChange={(v) => setSelection(s => ({ ...s, durchsturzSurface: v as any }))}
                    className="flex flex-wrap gap-2"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="RAL9010" id="ds-ral" />
                      <Label htmlFor="ds-ral">RAL 9010 ({language === 'de' ? 'Weiß' : 'White'})</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="verzinkt" id="ds-verzinkt" />
                      <Label htmlFor="ds-verzinkt">{language === 'de' ? 'Verzinkt' : 'Galvanized'}</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="RAL9010+verzinkt" id="ds-both" />
                      <Label htmlFor="ds-both">RAL 9010 + {language === 'de' ? 'Verzinkt' : 'Galvanized'}</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Price Summary - Sticky */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'de' ? 'Ihre Konfiguration' : 'Your Configuration'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Summary */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {language === 'de' ? 'Lichtkuppel' : 'Skylight'}
                        </span>
                        <span>
                          {selection.form === 'rund' ? `Ø${selection.size}` : selection.size} cm, {selection.shells}S {selection.material}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">U-Wert</span>
                        <Badge variant="secondary">{getUValue()} W/m²K</Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{language === 'de' ? 'Lichtkuppel' : 'Skylight'}</span>
                        <span>{prices.lichtkuppel > 0 ? formatPrice(prices.lichtkuppel, language) : '-'}</span>
                      </div>
                      {selection.includeKranz && (
                        <div className="flex justify-between">
                          <span>{language === 'de' ? 'Aufsatzkranz' : 'Mounting Curb'}</span>
                          <span>{prices.kranz > 0 ? formatPrice(prices.kranz, language) : '-'}</span>
                        </div>
                      )}
                      {selection.vormontage && (
                        <div className="flex justify-between">
                          <span>{language === 'de' ? 'Vormontage' : 'Pre-assembly'}</span>
                          <span>{formatPrice(prices.vormontage, language)}</span>
                        </div>
                      )}
                      {selection.luefterrahmen !== 'ohne' && (
                        <div className="flex justify-between">
                          <span>{language === 'de' ? 'Lüfterrahmen' : 'Vent Frame'}</span>
                          <span>{prices.luefter > 0 ? formatPrice(prices.luefter, language) : '-'}</span>
                        </div>
                      )}
                      {selection.includeDurchsturz && (
                        <div className="flex justify-between">
                          <span>{language === 'de' ? 'Durchsturzsicherung' : 'Fall Protection'}</span>
                          <span>{prices.durchsturz > 0 ? formatPrice(prices.durchsturz, language) : '-'}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Unit Total */}
                    <div className="flex justify-between font-medium">
                      <span>{language === 'de' ? 'Stückpreis' : 'Unit Price'}</span>
                      <span>{prices.unitTotal > 0 ? formatPrice(prices.unitTotal, language) : '-'}</span>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-4">
                      <Label>{language === 'de' ? 'Anzahl' : 'Quantity'}</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelection(s => ({ ...s, quantity: Math.max(1, s.quantity - 1) }))}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={selection.quantity}
                          onChange={(e) => setSelection(s => ({ ...s, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                          className="w-16 h-8 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelection(s => ({ ...s, quantity: s.quantity + 1 }))}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between text-lg font-bold">
                      <span>{language === 'de' ? 'Gesamt' : 'Total'}</span>
                      <span>{prices.total > 0 ? formatPrice(prices.total, language) : '-'}</span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {language === 'de'
                        ? 'zzgl. MwSt. zzgl. Versandkosten'
                        : 'excl. VAT, plus shipping'}
                    </p>

                    {!prices.hasItems && (
                      <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-sm">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {language === 'de'
                            ? 'Für diese Konfiguration liegen noch keine Preisdaten vor. Bitte kontaktieren Sie uns für ein Angebot.'
                            : 'No pricing data available for this configuration. Please contact us for a quote.'}
                        </span>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={!prices.hasItems}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {language === 'de' ? 'In den Warenkorb' : 'Add to Cart'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
