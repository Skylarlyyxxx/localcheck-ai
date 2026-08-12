"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { marketConfigs } from "@/lib/markets";
import type { AnalysisReport, DimensionResult, ReportItem } from "@/lib/scoring";

const demoDimensions: DimensionResult[] = [
  { name: "Currency Localization", score: 65, detectedSignals: ["USD", "$"], missingSignals: ["Clear market selector"], whyItMatters: "Showing USD clearly helps shoppers understand pricing without conversion uncertainty." },
  { name: "Payment Localization", score: 60, detectedSignals: ["Visa", "Mastercard", "PayPal"], missingSignals: ["Apple Pay", "Google Pay", "Shop Pay"], whyItMatters: "Familiar payment methods can reduce checkout friction and improve trust for local shoppers." },
  { name: "Trust & Conversion", score: 56, detectedSignals: ["reviews", "shipping", "contact"], missingSignals: ["returns", "faq", "secure payment"], whyItMatters: "Visible reviews, policies, support, and delivery information help shoppers make purchase decisions with confidence." },
  { name: "SEO Localization", score: 80, detectedSignals: ["Page title", "Meta description", "H1 heading", "HTML language", "Canonical URL"], missingSignals: [], whyItMatters: "Basic metadata and language signals help search engines understand the intended version of a page." },
  { name: "Legal & Policy", score: 53, detectedSignals: ["privacy", "terms"], missingSignals: ["return/refund", "shipping"], whyItMatters: "These are localization and policy-discovery signals only; they do not determine legal compliance." },
  { name: "Language & Cultural Readiness", score: 80, detectedSignals: ["HTML lang: en", "English text"], missingSignals: [], whyItMatters: "A clear English experience helps shoppers understand content and complete key tasks." },
];
const demoReport: AnalysisReport = { site: "example-store.com", market: "us", overallScore: 65, rating: "Needs Improvement", summary: "This store has a solid foundation, but return policy is difficult to find may create friction for shoppers in United States.", dimensions: demoDimensions, priorities: [{ category: "Critical", title: "Return policy is difficult to find", evidence: "No obvious return or refund policy signal was detected on the homepage.", recommendation: "Make the return and refund policy easier to discover, especially near purchase decision points." }, { category: "Recommended", title: "More familiar payment choices could be visible", evidence: "Apple Pay, Google Pay, and Shop Pay were not detected in this demo.", recommendation: "Consider making familiar payment options clearly visible for US shoppers." }], strengths: [{ category: "Good", title: "Core SEO signals are present", evidence: "Title, description, heading, language, and canonical signals are present.", recommendation: "Review this metadata when creating market-specific pages." }], signals: { basic: { title: null, metaDescription: null, htmlLang: "en", h1: null, canonicalUrl: null }, currencySignals: ["USD", "$"], foreignCurrencySignals: [], paymentsDetected: ["Visa", "Mastercard", "PayPal"], trustSignals: [], policySignals: [], seoSignals: { title: true, metaDescription: true, h1: true, htmlLang: true, canonical: true }, languageSignals: ["en"] } };
let lastStoredValue: string | null | undefined;
let storedReport: AnalysisReport = demoReport;
const subscribe = () => () => {};
function getStoredReport() { const value = sessionStorage.getItem("localcheck-analysis"); if (value === lastStoredValue) return storedReport; lastStoredValue = value; try { storedReport = value ? JSON.parse(value) : demoReport; } catch { sessionStorage.removeItem("localcheck-analysis"); storedReport = demoReport; } return storedReport; }
function SignalList({ title, signals, emptyText }: { title: string; signals: string[]; emptyText: string }) { return <div className="signal-list"><strong>{title}</strong><div>{signals.length ? signals.map((signal) => <span className="signal-pill" key={signal}>{signal}</span>) : <span className="signal-empty">{emptyText}</span>}</div></div>; }
function ReportItemCard({ item }: { item: ReportItem }) { return <article className="issue-card"><div><span className={`priority ${item.category.toLowerCase()}`}>{item.category}</span></div><div><h3>{item.title}</h3><div className="issue-detail"><strong>Evidence</strong><span>{item.evidence}</span></div><div className="issue-detail"><strong>Recommendation</strong><span>{item.recommendation}</span></div></div></article>; }

export default function ReportPage() {
  const report = useSyncExternalStore(subscribe, getStoredReport, () => demoReport);
  const isLive = report !== demoReport;
  const market = marketConfigs[report.market] || marketConfigs.us;
  return <main className="report-page"><div className="report-shell">
    <div className="report-top"><div><Link className="back-link" href="/">New audit</Link><h1 className="report-heading">Localization Report</h1><p className="report-subheading">{isLive ? "Homepage signals detected through a server-side audit." : "Demo report with representative sample data."}</p></div><span className="brand"><span className="brand-mark">L</span>LocalCheck <strong>AI</strong></span></div>
    <section className="summary-card"><div><span className="summary-label">Website</span><span className="summary-value">{report.site}</span></div><div><span className="summary-label">Target market</span><span className="summary-value">{market.displayName}</span></div><div className="score-box"><div><span className="summary-label">Localization score</span><span className="score">{report.overallScore} <small>/ 100</small></span></div><span className="status">{report.rating}</span></div></section>
    <p className="report-summary">{report.summary}</p><aside className="scope-note"><strong>Analysis Scope: Homepage only</strong><span>LocalCheck currently evaluates signals detected on the public homepage. Checkout, product pages, and dynamically loaded content may not be included.</span></aside>
    <h2 className="section-title">Localization dimensions</h2><section className="dimension-grid evidence-grid">{report.dimensions.map((dimension) => <article className="dimension-card evidence-card" key={dimension.name}><div className="dimension-header"><div className="dimension-name">{dimension.name}</div><div className="dimension-score">{dimension.score}<span>/100</span></div></div><SignalList title="Detected signals" signals={dimension.detectedSignals} emptyText="None detected" /><SignalList title="Missing signals" signals={dimension.missingSignals} emptyText="No obvious gaps on this check" /><p className="why-it-matters"><strong>Why it matters</strong>{dimension.whyItMatters}</p></article>)}</section>
    <h2 className="section-title">Top Priorities</h2><section className="issues">{report.priorities.length ? report.priorities.map((item) => <ReportItemCard item={item} key={item.title} />) : <p className="empty-state">No high-priority homepage gaps were detected by these rules.</p>}</section>
    <h2 className="section-title">What You&apos;re Doing Well</h2><section className="issues">{report.strengths.map((item) => <ReportItemCard item={item} key={item.title} />)}</section>
    <p className="disclaimer"><strong>Disclaimer:</strong> LocalCheck provides localization guidance only and does not constitute legal advice.</p>
  </div></main>;
}
