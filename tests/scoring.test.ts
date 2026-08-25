import assert from "node:assert/strict";
import test from "node:test";
import { extractSignals } from "../src/lib/signal-extraction.ts";
import { scoreAnalysis } from "../src/lib/scoring.ts";
import { parseSemanticReview } from "../src/lib/semantic-analysis.ts";

function analyze(html: string, market: "us" | "de" | "jp") {
  return scoreAnalysis("fixture-store.test", market, extractSignals(html));
}

function dimension(report: ReturnType<typeof analyze>, name: string) {
  const result = report.dimensions.find((item) => item.name === name);
  assert.ok(result, `${name} should exist`);
  return result;
}

test("US fixture detects public policy links and does not require every USD format", () => {
  const report = analyze(`<!doctype html><html lang="en"><head><title>US store</title><meta name="description" content="US shop"><link rel="canonical" href="https://store.test"></head><body><h1>Welcome</h1><p>Our price is USD 49. We accept PayPal, Visa and Mastercard.</p><footer><a href="/returns">Help centre</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/shipping">Shipping</a></footer></body></html>`, "us");
  const currency = dimension(report, "Currency Localization");
  assert.deepEqual(currency.detectedSignals, ["USD"]);
  assert.deepEqual(currency.missingSignals, []);
  assert.ok(dimension(report, "Legal & Policy").detectedSignals.includes("return/refund"));
  assert.ok(report.priorities.every((item) => item.title !== "Return or refund signal is difficult to find"));
});

test("German fixture uses EUR, German policy signals, and Klarna", () => {
  const report = analyze(`<!doctype html><html lang="de"><head><title>Deutscher Shop</title><meta name="description" content="Bequeme Produkte für Deutschland"><link rel="canonical" href="https://store.test/de"></head><body><h1>Willkommen</h1><p>Preis: €49. Zahlung mit PayPal, Klarna, Visa und Mastercard.</p><footer><a href="/datenschutz">Datenschutz</a><a href="/agb">AGB</a><a href="/widerruf">Widerruf</a><a href="/impressum">Impressum</a></footer></body></html>`, "de");
  assert.ok(dimension(report, "Currency Localization").detectedSignals.includes("€"));
  assert.deepEqual(dimension(report, "Currency Localization").missingSignals, []);
  assert.ok(dimension(report, "Payment Localization").detectedSignals.includes("Klarna"));
  assert.ok(dimension(report, "Legal & Policy").detectedSignals.includes("impressum"));
});

test("Japanese fixture detects Japanese language, JPY symbol, and local payment signals", () => {
  const report = analyze(`<!doctype html><html lang="ja"><head><title>日本のストア</title><meta name="description" content="日本のお客様向け"><link rel="canonical" href="https://store.test/jp"></head><body><h1>ようこそ</h1><p>価格は¥5000です。PayPay、Visa、Mastercard、コンビニ、銀行振込に対応しています。</p><footer><a href="/return">返品</a><a href="/privacy">プライバシー</a><a href="/terms">利用規約</a><a href="/company">会社概要</a></footer></body></html>`, "jp");
  assert.ok(dimension(report, "Currency Localization").detectedSignals.includes("¥"));
  assert.ok(dimension(report, "Payment Localization").detectedSignals.includes("PayPay"));
  assert.ok(dimension(report, "Language & Cultural Readiness").detectedSignals.includes("Japanese text"));
  assert.ok(dimension(report, "Legal & Policy").detectedSignals.includes("company"));
});

test("the same US fixture receives a lower score for Germany than the United States", () => {
  const html = `<!doctype html><html lang="en"><head><title>US store</title></head><body><p>USD $49 PayPal Visa Mastercard</p></body></html>`;
  assert.ok(analyze(html, "us").overallScore > analyze(html, "de").overallScore);
});

test("semantic review accepts only complete, bounded findings", () => {
  const review = parseSemanticReview({ summary: "The English homepage is not tailored to German shoppers.", findings: [{ title: "English-only messaging", evidence: "The main call to action is in English.", recommendation: "Localize key navigation and calls to action.", priority: "Critical" }, { title: "Incomplete", evidence: "Missing a recommendation." }] });
  assert.equal(review?.findings.length, 1);
  assert.equal(review?.findings[0]?.priority, "Critical");
});
