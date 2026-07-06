import React from 'react';
import { Link } from 'react-router-dom';
import Seo from './Seo';

const PolicyLayout: React.FC<{
  title: string;
  lastUpdated: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  children: React.ReactNode;
}> = ({ title, lastUpdated, path, metaTitle, metaDescription, children }) => (
  <div className="pt-24 pb-16 min-h-screen bg-bv-cream">
    <Seo title={metaTitle} description={metaDescription} path={path} />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/" className="text-bv-green text-sm font-semibold hover:underline mb-6 inline-block">
        &larr; Back to Home
      </Link>
      <h1 className="font-display text-3xl sm:text-4xl text-bv-dark mb-2">{title}</h1>
      <p className="text-bv-muted text-sm mb-10">Last updated: {lastUpdated}</p>
      <div className="prose prose-sm prose-headings:font-bold prose-headings:text-bv-dark prose-p:text-bv-muted prose-p:leading-relaxed max-w-none space-y-6 text-bv-muted">
        {children}
      </div>
    </div>
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <PolicyLayout
    title="Privacy Policy"
    lastUpdated="1 June 2026"
    path="/privacy"
    metaTitle="Privacy Policy | Bhaargavi Fresh Cuts"
    metaDescription="How Bhaargavi Fresh Cuts collects, uses, and protects your information when you order fresh cut vegetables in Chennai via WhatsApp."
  >
    <p>Bhaargavi Fresh Cuts (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates through WhatsApp and this website. This policy explains how we collect and use your information.</p>
    <h2>1. Information We Collect</h2>
    <p>When you place an order, you share your WhatsApp phone number and address voluntarily. We do not collect sensitive personal data.</p>
    <h2>2. How We Use Your Information</h2>
    <p>Your contact information is used solely to process your order, confirm delivery, and provide customer support via WhatsApp. We do not sell or share your data with third parties.</p>
    <h2>3. WhatsApp Communication</h2>
    <p>By ordering through WhatsApp, you consent to receive order confirmation and delivery updates from our team at +91 63851 14580.</p>
    <h2>4. Cookies</h2>
    <p>This website uses browser local storage to save your cart. No cookies are sent to third-party servers.</p>
    <h2>5. Data Retention</h2>
    <p>Order records are kept in a private Google Sheet accessible only to our team for up to 6 months after order fulfilment.</p>
    <h2>6. Contact</h2>
    <p>For privacy concerns, contact us at bhaargavifreshvegetables@gmail.com or via WhatsApp.</p>
  </PolicyLayout>
);

export const TermsOfService: React.FC = () => (
  <PolicyLayout
    title="Terms and Conditions"
    lastUpdated="1 June 2026"
    path="/terms"
    metaTitle="Terms and Conditions | Bhaargavi Fresh Cuts"
    metaDescription="Terms for ordering FSSAI-certified fresh cut vegetables and fruits from Bhaargavi Fresh Cuts in Chennai: products, pricing, minimum order, and payment."
  >
    <p>By placing an order with Bhaargavi Fresh Cuts, you agree to these terms.</p>
    <h2>1. Products</h2>
    <p>All products are FSSAI-registered, freshly cut on the day of delivery. Images are for illustrative purposes. Actual weight may vary by up to 5% due to natural product variation.</p>
    <h2>2. Ordering</h2>
    <p>Orders are placed via WhatsApp. An order is confirmed only when our team sends you a confirmation message. We reserve the right to decline orders due to stock unavailability.</p>
    <h2>3. Pricing</h2>
    <p>Prices are in Indian Rupees (Rs) and inclusive of all taxes. Prices may change without prior notice; the price at the time of order confirmation is final.</p>
    <h2>4. Minimum Order</h2>
    <p>The minimum order value for delivery is ₹ 199. Orders below this value may be collected in person.</p>
    <h2>5. Payment</h2>
    <p>Payment is collected at the time of delivery. We accept UPI, cash, and bank transfer.</p>
    <h2>6. Perishable Nature</h2>
    <p>All products are perishable. We are not liable for quality degradation caused by improper storage after delivery.</p>
    <h2>7. Governing Law</h2>
    <p>These terms are governed by Indian law. Disputes shall be subject to jurisdiction in Chennai, Tamil Nadu.</p>
  </PolicyLayout>
);

export const RefundPolicy: React.FC = () => (
  <PolicyLayout
    title="Refund and Return Policy"
    lastUpdated="1 June 2026"
    path="/refund"
    metaTitle="Refund and Return Policy | Bhaargavi Fresh Cuts"
    metaDescription="Bhaargavi Fresh Cuts refund and return policy for fresh cut vegetables in Chennai: quality issues, wrong items, refund process, and cancellations."
  >
    <p>We take quality seriously. If you are not satisfied with your order, we are here to help.</p>
    <h2>1. Quality Issues</h2>
    <p>If you receive a product that is not fresh, damaged, or significantly different from your order, please send us a WhatsApp message with a photo within 2 hours of delivery.</p>
    <h2>2. Wrong Item Delivered</h2>
    <p>If we delivered the wrong product, we will replace it at no cost on the next available delivery date, or issue a full refund for that item.</p>
    <h2>3. Refund Process</h2>
    <p>Approved refunds are processed via UPI or bank transfer within 2 business days. Cash-on-delivery orders may receive a credit note for the next order.</p>
    <h2>4. Non-Refundable Cases</h2>
    <p>We do not accept returns for products that have been stored improperly after delivery, or complaints raised more than 2 hours after delivery.</p>
    <h2>5. Cancellation</h2>
    <p>Orders can be cancelled up to 1 hour after placing via WhatsApp. After our team has begun preparing your order, cancellations are not accepted.</p>
    <h2>6. Contact</h2>
    <p>For all refund queries, contact us at +91 63851 14580 on WhatsApp.</p>
  </PolicyLayout>
);

export const ShippingPolicy: React.FC = () => (
  <PolicyLayout
    title="Shipping and Delivery Policy"
    lastUpdated="1 June 2026"
    path="/shipping"
    metaTitle="Shipping and Delivery Policy | Bhaargavi Fresh Cuts"
    metaDescription="Bhaargavi Fresh Cuts delivery areas, days and hours (Mon–Sat, 6 AM–8 PM), minimum order, charges, and freshness guarantee for Chennai."
  >
    <p>We deliver fresh cut vegetables and fruits to select areas in Chennai.</p>
    <h2>1. Delivery Area</h2>
    <p>We currently deliver within a 15 km radius of Pazhanthandalam, Kancheepuram District. Please confirm your pin code via WhatsApp before placing an order.</p>
    <h2>2. Delivery Days and Hours</h2>
    <p>We deliver Monday to Saturday, between 6 AM and 8 PM. We do not deliver on Sundays and public holidays.</p>
    <h2>3. Minimum Order for Delivery</h2>
    <p>The minimum order value for home delivery is ₹ 199. Orders below this threshold can be picked up from our facility at Plot No. 28, ORR Diamond Avenue, Pazhanthandalam.</p>
    <h2>4. Delivery Charges</h2>
    <p>Delivery is free for orders above ₹ 199 within our standard service area. Delivery charges for extended areas will be communicated at the time of order confirmation.</p>
    <h2>5. Delivery Timeline</h2>
    <p>Same-day delivery is available for orders placed before 10 AM. Orders placed after 10 AM will be delivered the next working day.</p>
    <h2>6. Failed Delivery</h2>
    <p>If we are unable to reach you at the delivery address, we will contact you via WhatsApp. A second delivery attempt may attract an additional ₹ 30 charge.</p>
    <h2>7. Freshness Guarantee</h2>
    <p>Products are processed and packed on the day of delivery to ensure maximum freshness. All products are transported in cold-chain conditions.</p>
  </PolicyLayout>
);
