import React from 'react';
import { Link } from 'react-router-dom';
import Seo from './Seo';
import JsonLd from './JsonLd';

const SITE_URL = 'https://bhaargavifreshcuts.com';

// Real answers sourced from the policy pages and llms.txt. Keep factual.
const FAQS: { q: string; a: string }[] = [
  {
    q: 'Which areas in Chennai do you deliver to?',
    a: 'We deliver within a 15 km radius of Pazhanthandalam, Kancheepuram District. Please confirm your pin code with us on WhatsApp before placing an order.',
  },
  {
    q: 'What are your delivery days and timings?',
    a: 'We deliver Monday to Saturday, between 6 AM and 8 PM. We do not deliver on Sundays and public holidays.',
  },
  {
    q: 'What is the minimum order value?',
    a: 'The minimum order value for home delivery is ₹199. Orders below this can be picked up from our facility at Plot No. 28, ORR Diamond Avenue, Pazhanthandalam.',
  },
  {
    q: 'How do I place an order?',
    a: 'Orders are placed via WhatsApp at +91 91502 19379. Add items to your cart on the website and check out through WhatsApp, or message us directly.',
  },
  {
    q: 'Are your vegetables preservative-free and hygienic?',
    a: 'Yes. All products are FSSAI-certified, washed in RO water, and processed in an AC room with zero preservatives. Everything is freshly cut on the day of delivery.',
  },
  {
    q: 'How can I pay?',
    a: 'Payment is collected at the time of delivery. We accept UPI, cash, and bank transfer.',
  },
  {
    q: 'What if a product arrives damaged or not fresh?',
    a: 'Send us a WhatsApp message with a photo within 2 hours of delivery. We will replace the item on the next delivery or issue a full refund for it.',
  },
  {
    q: 'When will my order be delivered?',
    a: 'Same-day delivery is available for orders placed before 10 AM. Orders placed after 10 AM are delivered the next working day.',
  },
];

const FaqPage: React.FC = () => {
  const path = '/faq/';
  const title = 'Frequently Asked Questions | Bhaargavi Fresh Cuts';
  const description =
    'Answers about Bhaargavi Fresh Cuts: delivery areas and timings in Chennai, minimum order, ordering via WhatsApp, hygiene, payment, and refunds.';

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${SITE_URL}${path}` },
    ],
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-bv-cream">
      <Seo title={title} description={description} path={path} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumb} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-bv-muted mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-bv-green">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-bv-dark">FAQ</span>
        </nav>
        <h1 className="font-display text-3xl sm:text-4xl text-bv-dark mb-10">Frequently Asked Questions</h1>
        <div className="space-y-6">
          {FAQS.map((f) => (
            <div key={f.q} className="bg-white rounded-2xl border border-bv-border p-5 sm:p-6">
              <h2 className="font-bold text-bv-dark text-base sm:text-lg mb-2">{f.q}</h2>
              <p className="text-bv-muted leading-relaxed text-sm sm:text-base">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
