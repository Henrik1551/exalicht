// Mock product data - will be replaced with database later

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  shape: 'round' | 'square' | 'rectangular';
  minPrice: number;
  maxPrice?: number;
  image?: string;
  features: string[];
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  productCount: number;
  image?: string;
}

export const categories: Category[] = [
  {
    id: 'lichtkuppeln-rund',
    name: 'Lichtkuppel mit Aufsatzkranz rund',
    nameEn: 'Skylight with upstand round',
    description: 'Runde Lichtkuppeln mit integriertem Aufsatzkranz',
    descriptionEn: 'Round skylights with integrated upstand',
    productCount: 24,
  },
  {
    id: 'lichtkuppeln-rechteckig',
    name: 'Lichtkuppel mit Aufsatzkranz rechteckig',
    nameEn: 'Skylight with upstand rectangular',
    description: 'Rechteckige und quadratische Lichtkuppeln',
    descriptionEn: 'Rectangular and square skylights',
    productCount: 32,
  },
  {
    id: 'oberschalen-rund',
    name: 'Lichtkuppeln/Oberschalen – Rund',
    nameEn: 'Skylights/Domes – Round',
    description: 'Runde Oberschalen für Lichtkuppeln',
    descriptionEn: 'Round domes for skylights',
    productCount: 18,
  },
  {
    id: 'oberschalen-rechteckig',
    name: 'Lichtkuppeln/Oberschalen – rechteckig',
    nameEn: 'Skylights/Domes – Rectangular',
    description: 'Rechteckige Oberschalen für Lichtkuppeln',
    descriptionEn: 'Rectangular domes for skylights',
    productCount: 22,
  },
];

export const filterCategories = [
  { id: 'all', name: 'Alle', nameEn: 'All', count: 90 },
  { id: 'akkus', name: 'Akkus', nameEn: 'Batteries', count: 7 },
  { id: 'antriebe', name: 'Antriebe', nameEn: 'Drives', count: 12 },
  { id: 'aufsatzkraenze', name: 'Aufsatzkränze', nameEn: 'Upstands', count: 15 },
  { id: 'lichtkuppeln', name: 'Lichtkuppeln', nameEn: 'Skylights', count: 45 },
  { id: 'oberschalen', name: 'Oberschalen', nameEn: 'Domes', count: 20 },
  { id: 'rwa', name: 'RWA-Systeme', nameEn: 'RWA Systems', count: 8 },
  { id: 'zubehoer', name: 'Zubehör', nameEn: 'Accessories', count: 18 },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Akku 12V 7,2Ah',
    description: 'Hochwertiger Ersatzakku für RWA-Anlagen',
    category: 'akkus',
    shape: 'rectangular',
    minPrice: 29.90,
    features: ['12V Spannung', '7,2Ah Kapazität', 'Wartungsfrei'],
    inStock: true,
  },
  {
    id: '2',
    name: 'Akku 12V 12Ah',
    description: 'Leistungsstarker Akku für größere Anlagen',
    category: 'akkus',
    shape: 'rectangular',
    minPrice: 45.90,
    features: ['12V Spannung', '12Ah Kapazität', 'Lange Lebensdauer'],
    inStock: true,
    isBestseller: true,
  },
  {
    id: '3',
    name: 'Lichtkuppel rund Ø 60cm',
    description: 'Runde Lichtkuppel mit Aufsatzkranz, 2-schalig',
    category: 'lichtkuppeln',
    subcategory: 'lichtkuppeln-rund',
    shape: 'round',
    minPrice: 189.00,
    maxPrice: 289.00,
    features: ['2-schalig', 'UV-beständig', 'Hagelschutz'],
    inStock: true,
    isNew: true,
  },
  {
    id: '4',
    name: 'Lichtkuppel rund Ø 80cm',
    description: 'Runde Lichtkuppel mit Aufsatzkranz, 2-schalig',
    category: 'lichtkuppeln',
    subcategory: 'lichtkuppeln-rund',
    shape: 'round',
    minPrice: 249.00,
    maxPrice: 349.00,
    features: ['2-schalig', 'UV-beständig', 'Hagelschutz'],
    inStock: true,
  },
  {
    id: '5',
    name: 'Lichtkuppel rund Ø 100cm',
    description: 'Große runde Lichtkuppel mit Aufsatzkranz, 3-schalig',
    category: 'lichtkuppeln',
    subcategory: 'lichtkuppeln-rund',
    shape: 'round',
    minPrice: 389.00,
    maxPrice: 489.00,
    features: ['3-schalig', 'UV-beständig', 'Optimale Dämmung'],
    inStock: true,
    isBestseller: true,
  },
  {
    id: '6',
    name: 'Lichtkuppel rechteckig 60x90cm',
    description: 'Rechteckige Lichtkuppel mit Aufsatzkranz',
    category: 'lichtkuppeln',
    subcategory: 'lichtkuppeln-rechteckig',
    shape: 'rectangular',
    minPrice: 279.00,
    maxPrice: 379.00,
    features: ['2-schalig', 'UV-beständig', 'Hagelschutz'],
    inStock: true,
  },
  {
    id: '7',
    name: 'Lichtkuppel rechteckig 80x120cm',
    description: 'Große rechteckige Lichtkuppel mit Aufsatzkranz',
    category: 'lichtkuppeln',
    subcategory: 'lichtkuppeln-rechteckig',
    shape: 'rectangular',
    minPrice: 429.00,
    maxPrice: 529.00,
    features: ['3-schalig', 'UV-beständig', 'Premium Qualität'],
    inStock: true,
  },
  {
    id: '8',
    name: 'Spindelantrieb 24V',
    description: 'Elektrischer Antrieb für Lichtkuppeln',
    category: 'antriebe',
    shape: 'rectangular',
    minPrice: 189.00,
    features: ['24V Betriebsspannung', 'Leise', 'Wartungsarm'],
    inStock: true,
  },
  {
    id: '9',
    name: 'Kettenantrieb 230V',
    description: 'Leistungsstarker Kettenantrieb für große Kuppeln',
    category: 'antriebe',
    shape: 'rectangular',
    minPrice: 259.00,
    features: ['230V Netzspannung', 'Hohe Zugkraft', 'Robust'],
    inStock: false,
  },
  {
    id: '10',
    name: 'Aufsatzkranz PVC 60x60cm',
    description: 'Hochwertiger PVC-Aufsatzkranz',
    category: 'aufsatzkraenze',
    shape: 'square',
    minPrice: 89.00,
    features: ['Wärmedämmend', 'Witterungsbeständig', 'Leicht'],
    inStock: true,
  },
  {
    id: '11',
    name: 'RWA-Zentrale 4-Gruppen',
    description: 'Zentrale für Rauch- und Wärmeabzugsanlagen',
    category: 'rwa',
    shape: 'rectangular',
    minPrice: 890.00,
    features: ['4 Gruppen', 'VdS-zugelassen', 'Akkupufferung'],
    inStock: true,
    isNew: true,
  },
  {
    id: '12',
    name: 'Handauslösetaster grün',
    description: 'Manueller Auslösetaster für RWA-Anlagen',
    category: 'zubehoer',
    shape: 'square',
    minPrice: 45.00,
    features: ['Grüne Ausführung', 'IP65', 'Mit Abdeckung'],
    inStock: true,
  },
];

export const sortOptions = [
  { value: 'default', label: 'Standardsortierung', labelEn: 'Default sorting' },
  { value: 'price-asc', label: 'Preis: aufsteigend', labelEn: 'Price: low to high' },
  { value: 'price-desc', label: 'Preis: absteigend', labelEn: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A-Z', labelEn: 'Name: A-Z' },
  { value: 'name-desc', label: 'Name: Z-A', labelEn: 'Name: Z-A' },
  { value: 'newest', label: 'Neueste zuerst', labelEn: 'Newest first' },
];
