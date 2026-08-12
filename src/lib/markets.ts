export type Market = "us" | "de" | "jp";

export type MarketConfig = {
  displayName: string;
  currency: string;
  currencySignals: { label: string; pattern: RegExp }[];
  preferredPayments: string[];
  primaryPayment: string;
  enhancedPayments: string[];
  otherPayments: string[];
  policySignals: string[];
  languageCode: string;
  languageLabel: string;
  recommendations: { currency: string; payments: string; policies: string };
};

export const marketConfigs: Record<Market, MarketConfig> = {
  us: {
    displayName: "United States", currency: "USD", currencySignals: [{ label: "USD", pattern: /\bUSD\b/i }, { label: "US$", pattern: /US\$/i }, { label: "$", pattern: /\$(?=\s?\d)/ }],
    preferredPayments: ["Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay", "Shop Pay"], primaryPayment: "PayPal", enhancedPayments: ["Apple Pay", "Google Pay"], otherPayments: ["Shop Pay"],
    policySignals: ["privacy", "terms", "return/refund", "shipping"], languageCode: "en", languageLabel: "English", recommendations: { currency: "Show USD or a clear US currency selector.", payments: "Make familiar US payment methods visible before checkout.", policies: "Make key policy links easy to find for US shoppers." },
  },
  de: {
    displayName: "Germany", currency: "EUR", currencySignals: [{ label: "EUR", pattern: /\bEUR\b/i }, { label: "€", pattern: /€/ }],
    preferredPayments: ["Visa", "Mastercard", "PayPal", "Klarna", "SEPA"], primaryPayment: "PayPal", enhancedPayments: ["Klarna"], otherPayments: ["SEPA"],
    policySignals: ["privacy", "cookie", "terms", "return/refund", "impressum"], languageCode: "de", languageLabel: "German", recommendations: { currency: "Show EUR pricing or a clear Germany market selector.", payments: "Consider familiar German payment methods such as PayPal, Klarna, or SEPA.", policies: "Surface localization and compliance signals such as Datenschutz, AGB, Widerruf, and Impressum where relevant." },
  },
  jp: {
    displayName: "Japan", currency: "JPY", currencySignals: [{ label: "JPY", pattern: /\bJPY\b/i }, { label: "¥", pattern: /¥|￥/ }],
    preferredPayments: ["Visa", "Mastercard", "PayPay", "Apple Pay", "Google Pay", "Convenience store", "Cash on delivery", "Bank transfer"], primaryPayment: "PayPay", enhancedPayments: ["Apple Pay", "Google Pay"], otherPayments: ["Convenience store", "Cash on delivery", "Bank transfer"],
    policySignals: ["privacy", "terms", "return/refund", "shipping", "contact", "company"], languageCode: "ja", languageLabel: "Japanese", recommendations: { currency: "Show JPY pricing or a clear Japan market selector.", payments: "Consider familiar Japanese methods such as PayPay, convenience-store payment, or bank transfer.", policies: "Make Japanese-facing return, delivery, contact, privacy, terms, and company information easy to discover." },
  },
};

export const paymentPatterns: [string, RegExp][] = [["PayPal", /paypal/i], ["Apple Pay", /apple\s*pay/i], ["Google Pay", /google\s*pay/i], ["Visa", /\bvisa\b/i], ["Mastercard", /master\s*card/i], ["American Express", /american\s*express|\bamex\b/i], ["Shop Pay", /shop\s*pay/i], ["Klarna", /klarna/i], ["SEPA", /\bsepa\b/i], ["PayPay", /paypay/i], ["Convenience store", /コンビニ|convenience\s*store/i], ["Cash on delivery", /代引き|cash\s+on\s+delivery/i], ["Bank transfer", /銀行振込|bank\s+transfer/i]];
export const trustPatterns: [string, RegExp][] = [["reviews", /\breviews?|ratings?|testimonials?\b|レビュー|評価/i], ["returns", /\breturns?|refund\b|返品|返金/i], ["shipping", /\bshipping|delivery\b|配送/i], ["contact", /\bcontact\b|お問い合わせ/i], ["faq", /\bfaq\b|よくある質問/i], ["secure payment", /secure\s+(checkout|payment)|安全な決済/i]];
export const policyPatterns: [string, RegExp][] = [["privacy", /privacy(?:\s+policy)?|datenschutz|プライバシー/i], ["terms", /terms\s+(of\s+service|&\s+conditions|and\s+conditions)|agb|利用規約/i], ["return/refund", /return\s+policy|refund\s+policy|widerruf|返品|返金/i], ["shipping", /shipping\s+policy|配送/i], ["cookie", /cookie(?:\s+policy)?/i], ["impressum", /impressum/i], ["contact", /\bcontact\b|お問い合わせ/i], ["company", /会社概要|company\s+(information|profile)/i]];
