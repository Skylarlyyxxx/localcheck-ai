import { marketConfigs } from "./markets.ts";
import type { Market } from "./markets.ts";

export type { Market } from "./markets.ts";
export type AnalysisSignals = { basic: { title: string | null; metaDescription: string | null; htmlLang: string | null; h1: string | null; canonicalUrl: string | null }; currencySignals: string[]; foreignCurrencySignals: string[]; paymentsDetected: string[]; trustSignals: string[]; policySignals: string[]; seoSignals: { title: boolean; metaDescription: boolean; h1: boolean; htmlLang: boolean; canonical: boolean }; languageSignals: string[] };
export type DimensionResult = { name: string; score: number; detectedSignals: string[]; missingSignals: string[]; whyItMatters: string };
export type ReportItem = { category: "Critical" | "Recommended" | "Good"; title: string; evidence: string; recommendation: string };
export type AnalysisReport = { site: string; market: Market; overallScore: number; rating: string; summary: string; dimensions: DimensionResult[]; priorities: ReportItem[]; strengths: ReportItem[]; signals: AnalysisSignals };

const trustKeys = ["reviews", "returns", "shipping", "contact", "faq", "secure payment"];
const seoLabels: Record<string, string> = { title: "Page title", metaDescription: "Meta description", h1: "H1 heading", htmlLang: "HTML language", canonical: "Canonical URL" };
const has = (signals: string[], signal: string) => signals.includes(signal);
const unique = (items: string[]) => [...new Set(items)];

function createSummary(score: number, marketName: string, priorities: ReportItem[]) {
  const gap = priorities[0]?.title.toLowerCase();
  if (score >= 85) return `This store shows strong homepage localization signals for ${marketName}, although this is not a full-site audit.`;
  if (score >= 70) return `This store has a solid foundation, but ${gap || "some localization gaps"} may create friction for shoppers in ${marketName}.`;
  return `This homepage has important localization gaps for ${marketName}, especially around ${gap || "market-specific signals"}.`;
}

export function scoreAnalysis(site: string, market: Market, signals: AnalysisSignals): AnalysisReport {
  const config = marketConfigs[market];
  const currencyDetected = signals.currencySignals.filter((signal) => config.currencySignals.some(({ label }) => label === signal));
  const currencyMissing = currencyDetected.length ? [] : [`${config.currency} currency signal`];
  const foreignCurrencyDetected = signals.foreignCurrencySignals.some((signal) => market === "jp" ? signal !== "￥" : true);
  const currency = Math.max(0, Math.min(85, 15 + (currencyDetected.includes(config.currency) ? 40 : 0) + (currencyDetected.some((signal) => signal !== config.currency) ? 25 : 0) - (foreignCurrencyDetected ? 10 : 0)));

  const cardDetected = has(signals.paymentsDetected, "Visa") || has(signals.paymentsDetected, "Mastercard");
  const primaryDetected = has(signals.paymentsDetected, config.primaryPayment);
  const enhancedCount = config.enhancedPayments.filter((payment) => has(signals.paymentsDetected, payment)).length;
  const otherCount = config.otherPayments.filter((payment) => has(signals.paymentsDetected, payment)).length;
  const payment = Math.min(85, 20 + (cardDetected ? 20 : 0) + (primaryDetected ? 20 : 0) + Math.min(20, enhancedCount * 10) + Math.min(20, otherCount * 10));
  const paymentDetected = config.preferredPayments.filter((payment) => has(signals.paymentsDetected, payment));
  const paymentMissing = config.preferredPayments.filter((payment) => !has(signals.paymentsDetected, payment));

  const trustDetected = trustKeys.filter((signal) => has(signals.trustSignals, signal));
  const trustMissing = trustKeys.filter((signal) => !has(signals.trustSignals, signal));
  const trust = Math.min(80, trustDetected.length * 12 + (trustDetected.length >= 5 ? 8 : 0));
  const seoDetected = Object.entries(signals.seoSignals).filter(([, value]) => value).map(([key]) => seoLabels[key]);
  const seoMissing = Object.entries(signals.seoSignals).filter(([, value]) => !value).map(([key]) => seoLabels[key]);
  const seo = seoDetected.length * 16;
  const policyDetected = config.policySignals.filter((signal) => has(signals.policySignals, signal));
  const policyMissing = config.policySignals.filter((signal) => !has(signals.policySignals, signal));
  const legal = Math.min(80, Math.round((policyDetected.length / config.policySignals.length) * 70) + (policyDetected.includes("privacy") && policyDetected.includes("terms") ? 10 : 0));
  const languageMatched = signals.basic.htmlLang?.toLowerCase().startsWith(config.languageCode) || false;
  const targetTextDetected = has(signals.languageSignals, config.languageCode);
  const language = Math.min(85, (signals.basic.htmlLang ? 15 : 0) + (languageMatched ? 45 : 0) + (targetTextDetected ? 20 : 0) + (foreignCurrencyDetected ? 0 : 5));
  const languageDetected = unique([signals.basic.htmlLang ? `HTML lang: ${signals.basic.htmlLang}` : "", targetTextDetected ? `${config.languageLabel} text` : ""].filter(Boolean));
  const languageMissing = unique([!signals.basic.htmlLang ? "HTML language declaration" : "", !languageMatched ? `HTML lang=${config.languageCode}` : "", !targetTextDetected ? `${config.languageLabel} page text` : ""].filter(Boolean));

  const dimensions: DimensionResult[] = [
    { name: "Currency Localization", score: Math.max(0, currency), detectedSignals: currencyDetected, missingSignals: currencyMissing, whyItMatters: `Showing ${config.currency} clearly helps shoppers understand pricing without conversion uncertainty.` },
    { name: "Payment Localization", score: payment, detectedSignals: paymentDetected, missingSignals: paymentMissing, whyItMatters: "Familiar payment methods can reduce checkout friction and improve trust for local shoppers." },
    { name: "Trust & Conversion", score: trust, detectedSignals: trustDetected, missingSignals: trustMissing, whyItMatters: "Visible reviews, policies, support, and delivery information help shoppers make purchase decisions with confidence." },
    { name: "SEO Localization", score: seo, detectedSignals: seoDetected, missingSignals: seoMissing, whyItMatters: "Basic metadata and language signals help search engines understand the intended version of a page." },
    { name: "Legal & Policy", score: legal, detectedSignals: policyDetected, missingSignals: policyMissing, whyItMatters: "These are localization and policy-discovery signals only; they do not determine legal compliance." },
    { name: "Language & Cultural Readiness", score: language, detectedSignals: languageDetected, missingSignals: languageMissing, whyItMatters: `A clear ${config.languageLabel} experience helps shoppers understand content and complete key tasks.` },
  ];
  const overallScore = Math.round(currency * .15 + payment * .20 + trust * .25 + seo * .15 + legal * .15 + language * .10);
  const rating = overallScore < 50 ? "Poor Localization" : overallScore < 70 ? "Needs Improvement" : overallScore < 85 ? "Good Foundation" : "Localization Ready";
  const priorities: ReportItem[] = [];
  const strengths: ReportItem[] = [];
  if (!currencyDetected.length) priorities.push({ category: "Critical", title: `No ${config.currency} signal detected`, evidence: `We could not detect ${config.currency} pricing signals on the homepage.`, recommendation: config.recommendations.currency });
  if (!cardDetected || !primaryDetected) priorities.push({ category: "Critical", title: "Key local payment signals are missing", evidence: `Detected payment signals: ${paymentDetected.join(", ") || "none"}.`, recommendation: config.recommendations.payments });
  if (!policyDetected.includes("return/refund")) priorities.push({ category: "Critical", title: "Return or refund signal is difficult to find", evidence: "No obvious return or refund policy signal was detected on the homepage.", recommendation: config.recommendations.policies });
  if (!signals.seoSignals.metaDescription) priorities.push({ category: "Recommended", title: "Missing meta description", evidence: "No meta description was detected in the homepage HTML.", recommendation: "Add a localized meta description that explains the store's value for this market." });
  if (!languageMatched) priorities.push({ category: "Recommended", title: `Homepage language is not targeted to ${config.displayName}`, evidence: `Detected HTML language: ${signals.basic.htmlLang || "none"}.`, recommendation: `Consider providing a ${config.languageLabel} version for this market.` });
  if (paymentDetected.length >= 3) strengths.push({ category: "Good", title: "Multiple familiar payment signals detected", evidence: `Detected: ${paymentDetected.join(", ")}.`, recommendation: "Keep these payment options easy to discover before checkout." });
  if (trustDetected.length >= 4) strengths.push({ category: "Good", title: "Strong trust-signal coverage on the homepage", evidence: `Detected: ${trustDetected.join(", ")}.`, recommendation: "Maintain this visibility as the site evolves." });
  if (seoDetected.length >= 4) strengths.push({ category: "Good", title: "Core SEO signals are present", evidence: `Detected: ${seoDetected.join(", ")}.`, recommendation: "Review this metadata when creating market-specific pages." });
  if (!strengths.length) strengths.push({ category: "Good", title: "Homepage analysis completed", evidence: "LocalCheck detected the available public homepage signals.", recommendation: "Use the priority items above to guide the next localization improvements." });
  return { site, market, overallScore, rating, summary: createSummary(overallScore, config.displayName, priorities), dimensions, priorities: priorities.slice(0, 4), strengths: strengths.slice(0, 3), signals };
}
