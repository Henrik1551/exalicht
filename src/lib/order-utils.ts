// Order utility functions

export const VAT_RATE = 0.19; // 19% German VAT

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderCalculation {
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
}

/**
 * Calculate order totals including VAT
 * All product prices are net (zzgl. MwSt.)
 */
export function calculateOrderTotals(
  subtotal: number,
  shippingCost: number = 0
): OrderCalculation {
  const taxAmount = subtotal * VAT_RATE;
  const total = subtotal + taxAmount + shippingCost;

  return {
    subtotal,
    taxAmount: Math.round(taxAmount * 100) / 100,
    shippingCost,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Format price in German locale
 */
export function formatPrice(price: number, language: 'de' | 'en' = 'de'): string {
  return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

/**
 * Format address to display string
 */
export function formatAddress(address: Address): string {
  return `${address.street}, ${address.postalCode} ${address.city}, ${address.country}`;
}

/**
 * Order status translations
 */
export const orderStatusLabels: Record<string, { de: string; en: string }> = {
  pending: { de: 'Ausstehend', en: 'Pending' },
  confirmed: { de: 'Bestätigt', en: 'Confirmed' },
  processing: { de: 'In Bearbeitung', en: 'Processing' },
  shipped: { de: 'Versendet', en: 'Shipped' },
  delivered: { de: 'Geliefert', en: 'Delivered' },
  cancelled: { de: 'Storniert', en: 'Cancelled' },
};

export function getStatusLabel(status: string, language: 'de' | 'en' = 'de'): string {
  return orderStatusLabels[status]?.[language] || status;
}

/**
 * Order status colors for badges
 */
export const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function getStatusColor(status: string): string {
  return orderStatusColors[status] || 'bg-gray-100 text-gray-800';
}
