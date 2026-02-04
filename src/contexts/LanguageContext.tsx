import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.products': 'Produkte',
    'nav.configurator': 'Konfigurator',
    'nav.downloads': 'Downloads',
    'nav.about': 'Über uns',
    'nav.contact': 'Kontakt',
    'nav.quote': 'Angebot anfordern',
    
    // Hero
    'hero.title': 'Lichtkuppeln & RWA-Systeme',
    'hero.subtitle': 'Professionelle Lösungen für Tageslicht und Sicherheit',
    'hero.cta': 'Produkte entdecken',
    'hero.quote': 'Angebot anfordern',
    
    // Benefits
    'benefits.title': 'Warum Lichtkuppel-direkt?',
    'benefits.selection': 'Große Auswahl',
    'benefits.selection.desc': 'Über 1000 Produkte für jeden Bedarf',
    'benefits.quality': 'Geprüfte Qualität',
    'benefits.quality.desc': 'Zertifizierte Produkte nach höchsten Standards',
    'benefits.delivery': 'Schnelle Lieferung',
    'benefits.delivery.desc': 'Deutschlandweite Lieferung in 3-5 Werktagen',
    'benefits.support': 'Expertenberatung',
    'benefits.support.desc': 'Persönliche Beratung durch Fachexperten',
    
    // Categories
    'categories.title': 'Unsere Produktkategorien',
    'categories.skylights': 'Lichtkuppeln',
    'categories.skylights.desc': 'Rund, eckig und Sonderformen für optimale Tageslichtnutzung',
    'categories.rwa': 'RWA-Systeme',
    'categories.rwa.desc': 'Rauch- und Wärmeabzugsanlagen für maximale Sicherheit',
    'categories.accessories': 'Zubehör',
    'categories.accessories.desc': 'Aufsetzkränze, Antriebe und Montagesysteme',
    
    // Process
    'process.title': 'In 5 Schritten zu Ihrer Lichtkuppel',
    'process.step1': 'Produkt wählen',
    'process.step1.desc': 'Finden Sie die passende Lösung',
    'process.step2': 'Konfigurieren',
    'process.step2.desc': 'Passen Sie Größe und Optionen an',
    'process.step3': 'Angebot erhalten',
    'process.step3.desc': 'Individuelles Angebot binnen 24h',
    'process.step4': 'Bestellen',
    'process.step4.desc': 'Einfache und sichere Bestellung',
    'process.step5': 'Lieferung',
    'process.step5.desc': 'Schnelle Lieferung zu Ihnen',
    
    // Contact
    'contact.title': 'Kontaktieren Sie uns',
    'contact.name': 'Name',
    'contact.email': 'E-Mail',
    'contact.phone': 'Telefon',
    'contact.message': 'Nachricht',
    'contact.send': 'Nachricht senden',
    'contact.success': 'Nachricht erfolgreich gesendet!',
    
    // Footer
    'footer.company': 'EXA Sicherheitstechnik',
    'footer.address': 'Ihr Partner für Lichtkuppeln und RWA-Systeme',
    'footer.rights': 'Alle Rechte vorbehalten',
    'footer.privacy': 'Datenschutz',
    'footer.imprint': 'Impressum',
    'footer.terms': 'AGB',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.configurator': 'Configurator',
    'nav.downloads': 'Downloads',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.quote': 'Request Quote',
    
    // Hero
    'hero.title': 'Skylights & RWA Systems',
    'hero.subtitle': 'Professional solutions for daylight and safety',
    'hero.cta': 'Explore Products',
    'hero.quote': 'Request Quote',
    
    // Benefits
    'benefits.title': 'Why Lichtkuppel-direkt?',
    'benefits.selection': 'Wide Selection',
    'benefits.selection.desc': 'Over 1000 products for every need',
    'benefits.quality': 'Certified Quality',
    'benefits.quality.desc': 'Products certified to the highest standards',
    'benefits.delivery': 'Fast Delivery',
    'benefits.delivery.desc': 'Germany-wide delivery in 3-5 business days',
    'benefits.support': 'Expert Advice',
    'benefits.support.desc': 'Personal consultation by specialists',
    
    // Categories
    'categories.title': 'Our Product Categories',
    'categories.skylights': 'Skylights',
    'categories.skylights.desc': 'Round, square and special shapes for optimal daylight',
    'categories.rwa': 'RWA Systems',
    'categories.rwa.desc': 'Smoke and heat exhaust systems for maximum safety',
    'categories.accessories': 'Accessories',
    'categories.accessories.desc': 'Upstands, drives and mounting systems',
    
    // Process
    'process.title': 'Your Skylight in 5 Steps',
    'process.step1': 'Choose Product',
    'process.step1.desc': 'Find the right solution',
    'process.step2': 'Configure',
    'process.step2.desc': 'Customize size and options',
    'process.step3': 'Get Quote',
    'process.step3.desc': 'Individual quote within 24h',
    'process.step4': 'Order',
    'process.step4.desc': 'Simple and secure ordering',
    'process.step5': 'Delivery',
    'process.step5.desc': 'Fast delivery to you',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.success': 'Message sent successfully!',
    
    // Footer
    'footer.company': 'EXA Sicherheitstechnik',
    'footer.address': 'Your partner for skylights and RWA systems',
    'footer.rights': 'All rights reserved',
    'footer.privacy': 'Privacy Policy',
    'footer.imprint': 'Imprint',
    'footer.terms': 'Terms & Conditions',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('de');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
