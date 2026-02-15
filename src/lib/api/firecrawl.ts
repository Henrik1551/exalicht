// Firecrawl API - direct HTTP calls (previously proxied through Supabase edge functions)
// To use this, set VITE_FIRECRAWL_API_KEY in your .env file

type FirecrawlResponse<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
  links?: string[];
};

type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot')[];
  onlyMainContent?: boolean;
  waitFor?: number;
};

type MapOptions = {
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
};

const FIRECRAWL_BASE = 'https://api.firecrawl.dev/v1';
const getApiKey = () => import.meta.env.VITE_FIRECRAWL_API_KEY || '';

export const firecrawlApi = {
  // Scrape a single URL
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse> {
    try {
      const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getApiKey()}` },
        body: JSON.stringify({ url, ...options }),
      });
      return await res.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Map a website to discover all URLs
  async map(url: string, options?: MapOptions): Promise<FirecrawlResponse> {
    try {
      const res = await fetch(`${FIRECRAWL_BASE}/map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getApiKey()}` },
        body: JSON.stringify({ url, ...options }),
      });
      return await res.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Get all product URLs from lichtkuppel shop
  async getProductUrls(): Promise<string[]> {
    const result = await this.map('https://lichtkuppel-direkt.de/shop/', {
      search: 'produkt',
      limit: 200,
    });
    
    if (result.success && result.links) {
      // Filter for product URLs only
      return result.links.filter(url => 
        url.includes('/produkt/') || url.includes('/product/')
      );
    }
    return [];
  },

  // Scrape product page and extract data
  async scrapeProduct(url: string) {
    const result = await this.scrape(url, {
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      waitFor: 2000,
    });

    if (result.success && result.data) {
      return this.parseProductData(result.data);
    }
    return null;
  },

  // Parse product data from scraped content
  parseProductData(data: unknown): ParsedProduct | null {
    const typedData = data as { markdown?: string; html?: string; metadata?: { title?: string; sourceURL?: string } };
    const markdown = typedData.markdown || '';
    const html = typedData.html || '';
    
    // Extract title from markdown (usually first heading)
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch?.[1] || typedData.metadata?.title || 'Unknown Product';

    // Extract price patterns (e.g., "ab 189,00 €" or "189,00 € – 289,00 €")
    const priceMatch = markdown.match(/(\d+[.,]\d{2})\s*€/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : null;

    // Extract price range
    const priceRangeMatch = markdown.match(/(\d+[.,]\d{2})\s*€\s*[–-]\s*(\d+[.,]\d{2})\s*€/);
    const minPrice = priceRangeMatch 
      ? parseFloat(priceRangeMatch[1].replace(',', '.'))
      : price;
    const maxPrice = priceRangeMatch 
      ? parseFloat(priceRangeMatch[2].replace(',', '.'))
      : null;

    // Extract images from HTML
    const imageMatches = html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/g);
    const images: string[] = [];
    for (const match of imageMatches) {
      const src = match[1];
      if (src && !src.includes('placeholder') && !src.includes('icon')) {
        images.push(src);
      }
    }

    // Extract description (first paragraph after title)
    const descMatch = markdown.match(/^[^#\n].{20,}/m);
    const description = descMatch?.[0]?.trim() || '';

    // Detect category from URL or content
    let category = 'lichtkuppeln';
    if (markdown.toLowerCase().includes('akku')) category = 'akkus';
    else if (markdown.toLowerCase().includes('antrieb')) category = 'antriebe';
    else if (markdown.toLowerCase().includes('rwa')) category = 'rwa';
    else if (markdown.toLowerCase().includes('aufsatzkranz')) category = 'aufsatzkraenze';
    else if (markdown.toLowerCase().includes('zubehör')) category = 'zubehoer';

    return {
      name: title,
      description,
      category,
      minPrice,
      maxPrice,
      images,
      sourceUrl: typedData.metadata?.sourceURL || '',
      rawMarkdown: markdown,
    };
  },
};

export interface ParsedProduct {
  name: string;
  description: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  images: string[];
  sourceUrl: string;
  rawMarkdown: string;
}
