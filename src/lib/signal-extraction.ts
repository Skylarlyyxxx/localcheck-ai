import * as cheerio from "cheerio";
import { marketConfigs, paymentPatterns, policyPatterns, trustPatterns } from "./markets.ts";
import type { AnalysisSignals } from "./scoring.ts";

const MAX_SEARCHABLE_TEXT_LENGTH = 50_000;
const policyLinkPatterns: [string, RegExp][] = [
  ["privacy", /privacy|datenschutz|プライバシー/i],
  ["terms", /terms|agb|利用規約/i],
  ["return/refund", /returns?|refund|widerruf|返品|返金/i],
  ["shipping", /shipping|delivery|配送/i],
  ["cookie", /cookie/i],
  ["impressum", /impressum/i],
  ["contact", /contact|お問い合わせ/i],
  ["company", /会社概要|company\s+(information|profile)/i],
];

function detect(patterns: [string, RegExp][], source: string) {
  return patterns.filter(([, pattern]) => pattern.test(source)).map(([name]) => name);
}

export function extractSignals(html: string): AnalysisSignals {
  const $ = cheerio.load(html);
  const basic = { title: $("title").first().text().trim() || null, metaDescription: $("meta[name='description']").attr("content")?.trim() || null, htmlLang: $("html").attr("lang")?.trim() || null, h1: $("h1").first().text().trim() || null, canonicalUrl: $("link[rel='canonical']").attr("href")?.trim() || null };
  const linkText = $("a[href]").map((_, link) => `${$(link).text()} ${$(link).attr("href") || ""}`).get().join(" ");
  $("script, style, noscript").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, MAX_SEARCHABLE_TEXT_LENGTH);
  const searchable = `${text}\n${html}`;
  const allCurrencySignals = Object.values(marketConfigs).flatMap((config) => config.currencySignals);
  const detectedCurrencySignals = allCurrencySignals.filter(({ pattern }) => pattern.test(searchable)).map(({ label }) => label);
  const foreignCurrencySignals = ["CNY", "RMB", "￥"].filter((signal) => new RegExp(signal === "￥" ? "￥" : `\\b${signal}\\b`, "i").test(searchable));
  const languageSignals = [
    (text.match(/\b[a-z]{3,}\b/gi) || []).length >= 20 ? "en" : "",
    /\b(und|der|die|das|mit|für|zahlung)\b/i.test(text) ? "de" : "",
    /[ぁ-んァ-ン一-龯]/.test(text) ? "ja" : "",
  ].filter(Boolean);
  return {
    basic,
    currencySignals: [...new Set(detectedCurrencySignals)],
    foreignCurrencySignals,
    paymentsDetected: detect(paymentPatterns, searchable),
    trustSignals: detect(trustPatterns, searchable),
    policySignals: [...new Set([...detect(policyPatterns, searchable), ...detect(policyLinkPatterns, linkText)])],
    seoSignals: { title: Boolean(basic.title), metaDescription: Boolean(basic.metaDescription), h1: Boolean(basic.h1), htmlLang: Boolean(basic.htmlLang), canonical: Boolean(basic.canonicalUrl) },
    languageSignals,
  };
}
