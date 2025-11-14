import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';

export interface ScrapedContent {
  url: string;
  title?: string;
  description?: string;
  content: string;
  links: string[];
  images: string[];
  metadata: {
    scrapedAt: string;
    contentHash: string;
  };
}

export interface ScrapeOptions {
  waitForSelector?: string;
  timeout?: number;
  userAgent?: string;
  headers?: Record<string, string>;
}

class WebScraperService {
  private browser: Browser | null = null;
  private lastRequestTime: number = 0;
  private readonly minDelayMs: number = 2000; // 2 seconds between requests (politeness)

  /**
   * Initialize the browser instance
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  /**
   * Enforce politeness delay between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minDelayMs) {
      const delay = this.minDelayMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Generate a simple hash for content comparison
   */
  private generateContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Scrape a single URL
   */
  async scrapeUrl(url: string, options: ScrapeOptions = {}): Promise<ScrapedContent> {
    await this.enforceRateLimit();

    const browser = await this.initBrowser();
    const context = await browser.newContext({
      userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      extraHTTPHeaders: options.headers || {},
    });

    let page: Page | null = null;

    try {
      page = await context.newPage();
      
      // Navigate to the URL
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: options.timeout || 30000,
      });

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.timeout || 30000,
        });
      }

      // Get the page content
      const html = await page.content();
      const $ = cheerio.load(html);

      // Extract metadata
      const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
      const description = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || '';

      // Extract main content (remove scripts, styles, etc.)
      $('script, style, nav, header, footer, aside').remove();
      const content = $('body').text().replace(/\s+/g, ' ').trim();

      // Extract links
      const links: string[] = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && (href.startsWith('http') || href.startsWith('/'))) {
          links.push(href);
        }
      });

      // Extract images
      const images: string[] = [];
      $('img[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src) {
          images.push(src);
        }
      });

      const scrapedContent: ScrapedContent = {
        url,
        title,
        description,
        content: content.substring(0, 10000), // Limit content size
        links: [...new Set(links)].slice(0, 50), // Dedupe and limit
        images: [...new Set(images)].slice(0, 20), // Dedupe and limit
        metadata: {
          scrapedAt: new Date().toISOString(),
          contentHash: this.generateContentHash(content),
        },
      };

      return scrapedContent;
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      throw new Error(`Failed to scrape ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (page) {
        await page.close();
      }
      await context.close();
    }
  }

  /**
   * Scrape multiple URLs with rate limiting
   */
  async scrapeUrls(urls: string[], options: ScrapeOptions = {}): Promise<ScrapedContent[]> {
    const results: ScrapedContent[] = [];

    for (const url of urls) {
      try {
        const content = await this.scrapeUrl(url, options);
        results.push(content);
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
        // Continue with other URLs even if one fails
      }
    }

    return results;
  }

  /**
   * Detect changes between two scraped contents
   */
  detectChanges(oldContent: ScrapedContent, newContent: ScrapedContent): {
    hasChanges: boolean;
    changes: {
      title?: boolean;
      description?: boolean;
      content?: boolean;
      links?: { added: string[]; removed: string[] };
      images?: { added: string[]; removed: string[] };
    };
  } {
    const changes: any = {};
    let hasChanges = false;

    // Check title change
    if (oldContent.title !== newContent.title) {
      changes.title = true;
      hasChanges = true;
    }

    // Check description change
    if (oldContent.description !== newContent.description) {
      changes.description = true;
      hasChanges = true;
    }

    // Check content change using hash
    if (oldContent.metadata.contentHash !== newContent.metadata.contentHash) {
      changes.content = true;
      hasChanges = true;
    }

    // Check links changes
    const oldLinks = new Set(oldContent.links);
    const newLinks = new Set(newContent.links);
    const addedLinks = [...newLinks].filter(link => !oldLinks.has(link));
    const removedLinks = [...oldLinks].filter(link => !newLinks.has(link));
    
    if (addedLinks.length > 0 || removedLinks.length > 0) {
      changes.links = { added: addedLinks, removed: removedLinks };
      hasChanges = true;
    }

    // Check images changes
    const oldImages = new Set(oldContent.images);
    const newImages = new Set(newContent.images);
    const addedImages = [...newImages].filter(img => !oldImages.has(img));
    const removedImages = [...oldImages].filter(img => !newImages.has(img));
    
    if (addedImages.length > 0 || removedImages.length > 0) {
      changes.images = { added: addedImages, removed: removedImages };
      hasChanges = true;
    }

    return { hasChanges, changes };
  }

  /**
   * Close the browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Export singleton instance
export const webScraperService = new WebScraperService();
