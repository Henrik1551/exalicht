import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">LK</span>
              </div>
              <div>
                <span className="text-lg font-bold">Lichtkuppel</span>
                <span className="text-lg font-bold text-primary">-direkt</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              {t('footer.address')}
            </p>
            <p className="text-sm font-medium">{t('footer.company')}</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('nav.products')}
              </Link>
              <Link to="/configurator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('nav.configurator')}
              </Link>
              <Link to="/downloads" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('nav.downloads')}
              </Link>
              <Link to="/quote" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('nav.quote')}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t('nav.contact')}</h4>
            <div className="flex flex-col gap-3">
              <a href="tel:+4912345678" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                +49 (0) 123 456 78
              </a>
              <a href="mailto:info@lichtkuppel-direkt.de" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                info@lichtkuppel-direkt.de
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Musterstraße 123<br />12345 Musterstadt</span>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Rechtliches</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/imprint" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.imprint')}
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.terms')}
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-muted-foreground/20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Lichtkuppel-direkt. {t('footer.rights')}.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Made with ❤️ in Germany</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
