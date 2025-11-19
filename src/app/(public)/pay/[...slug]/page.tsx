import { Metadata } from 'next';
import { PublicPaymentPageClient } from './client';

/**
 * Unified Public Payment Page with SEO Optimization
 *
 * Handles both URL formats:
 * 1. Short URL: /pay/{short_url} (e.g., /pay/Xorp2Pto)
 * 2. SEO URL: /pay/{vendor_slug}/{payment_page_slug} (e.g., /pay/qqq-YM2D/product-purchase)
 *
 * SEO Features:
 * - Dynamic metadata (title, description)
 * - Open Graph tags for social sharing
 * - Twitter Card support
 * - Structured data (JSON-LD)
 * - Vendor branding integration
 *
 * SOLID Principles:
 * - SRP: Server component handles metadata, client handles interactivity
 * - DIP: Depends on API abstraction
 */

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Fetch payment page data for metadata generation
 * Follows DRY: Uses Laravel API directly for server-side rendering
 */
async function getPaymentPageData(slugParts: string[]) {
  try {
    const isShortUrl = slugParts.length === 1;

    // Determine base URL based on environment
    // Priority: LARAVEL_API_URL > Next.js API routes (fallback)
    let baseUrl: string;
    let useNextJsApi = false;

    if (process.env.LARAVEL_API_URL) {
      // Server-side: Use Laravel API directly (preferred)
      baseUrl = process.env.LARAVEL_API_URL;
      console.log('[Metadata] Using Laravel API:', baseUrl);
    } else {
      // Fallback: Use Next.js API routes (works in production)
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else if (process.env.NEXT_PUBLIC_SITE_URL) {
        baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
      } else {
        baseUrl = 'http://localhost:3000';
      }
      useNextJsApi = true;
      console.log('[Metadata] Using Next.js API:', baseUrl);
    }

    let apiUrl: string;
    if (useNextJsApi) {
      // Use Next.js BFF routes
      if (isShortUrl) {
        apiUrl = `${baseUrl}/api/pay/${slugParts[0]}`;
      } else {
        apiUrl = `${baseUrl}/api/pay/${slugParts[0]}/${slugParts[1]}`;
      }
    } else {
      // Use Laravel API directly
      if (isShortUrl) {
        apiUrl = `${baseUrl}/api/v1/pay/${slugParts[0]}`;
      } else {
        apiUrl = `${baseUrl}/api/v1/pay/${slugParts[0]}/${slugParts[1]}`;
      }
    }

    console.log('[Metadata] Fetching from:', apiUrl);

    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Metadata] Fetch failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('[Metadata] Response:', errorText);
      return null;
    }

    const result = await response.json();

    // Handle both Laravel and Next.js API response structures
    // Laravel: { success: true, data: {...} }
    // Next.js: { data: {...} } or direct data
    const paymentPage = result.data || result;

    if (paymentPage?.title) {
      console.log('[Metadata] Success:', paymentPage.title);
    } else {
      console.error('[Metadata] Invalid response structure:', JSON.stringify(result).substring(0, 200));
    }

    return paymentPage;
  } catch (error) {
    console.error('[Metadata] Error:', error);
    return null;
  }
}

/**
 * Generate dynamic metadata for SEO
 * Includes Open Graph, Twitter Cards, and structured data
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const paymentPage = await getPaymentPageData(slug);

  if (!paymentPage) {
    return {
      title: 'Payment Page Not Found',
      description: 'The payment page you are looking for does not exist.',
    };
  }

  // Build public URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const publicUrl = slug.length === 1
    ? `${baseUrl}/pay/${slug[0]}`
    : `${baseUrl}/pay/${slug[0]}/${slug[1]}`;

  // Extract vendor info
  const vendorName = paymentPage.vendor?.business_name || 'PayWe';
  const vendorLogo = paymentPage.vendor?.logo_url;
  const description = paymentPage.description ||
    `Make a payment for ${paymentPage.title} - Secure payment processing powered by ${vendorName}`;

  // Format amount for description
  let amountText = '';
  if (paymentPage.amount_type === 'fixed' && paymentPage.fixed_amount) {
    amountText = ` - ${paymentPage.currency_code} ${paymentPage.fixed_amount.toFixed(2)}`;
  } else if (paymentPage.amount_type === 'donation') {
    amountText = ' - Donation';
  } else if (paymentPage.amount_type === 'flexible') {
    amountText = ' - Flexible Amount';
  }

  const fullDescription = `${description}${amountText}`;

  return {
    title: `${paymentPage.title} | ${vendorName}`,
    description: fullDescription,
    keywords: [
      'payment',
      'secure payment',
      paymentPage.title,
      vendorName,
      paymentPage.currency_code,
      'online payment',
    ].join(', '),

    // Open Graph tags for social sharing
    openGraph: {
      type: 'website',
      url: publicUrl,
      title: `${paymentPage.title} | ${vendorName}`,
      description: fullDescription,
      siteName: vendorName,
      images: vendorLogo ? [
        {
          url: vendorLogo,
          width: 1200,
          height: 630,
          alt: `${vendorName} Logo`,
        },
      ] : [],
    },

    // Twitter Card tags
    twitter: {
      card: 'summary_large_image',
      title: `${paymentPage.title} | ${vendorName}`,
      description: fullDescription,
      images: vendorLogo ? [vendorLogo] : [],
    },

    // Additional meta tags
    robots: {
      index: paymentPage.is_active,
      follow: true,
    },

    // Canonical URL
    alternates: {
      canonical: publicUrl,
    },
  };
}

export default async function PublicPaymentPage({ params }: PageProps) {
  const { slug } = await params;
  const paymentPage = await getPaymentPageData(slug);

  // Add structured data (JSON-LD) for search engines
  const structuredData = paymentPage ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: paymentPage.title,
    description: paymentPage.description || `Payment for ${paymentPage.title}`,
    brand: {
      '@type': 'Brand',
      name: paymentPage.vendor?.business_name || 'PayWe',
      logo: paymentPage.vendor?.logo_url,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: paymentPage.currency_code,
      price: paymentPage.amount_type === 'fixed' ? paymentPage.fixed_amount : undefined,
      availability: paymentPage.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  } : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <PublicPaymentPageClient slug={slug} />
    </>
  );
}
