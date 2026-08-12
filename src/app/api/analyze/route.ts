import * as cheerio from "cheerio";
import { AnalysisSignals, Market, scoreAnalysis } from "@/lib/scoring";
import { marketConfigs, paymentPatterns, policyPatterns, trustPatterns } from "@/lib/markets";
import { lookup } from "node:dns/promises";

const MAX_HTML_LENGTH = 1_000_000;

export const runtime = "nodejs";

function isPrivateAddress(address: string) {
  const value = address.toLowerCase();
  if (value === "::1" || value === "0:0:0:0:0:0:0:1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:" )) return true;
  const parts = value.split(".").map(Number);
  return parts.length === 4 && (parts[0] === 10 || parts[0] === 127 || parts[0] === 0 || (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168));
}

async function validateUrl(value: string) {
  const normalized = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;
  const url = new URL(normalized);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || ["localhost", "0.0.0.0", "::1"].includes(url.hostname.toLowerCase())) throw new Error("invalid-url");
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("blocked-url");
  return url;
}

async function fetchHomepage(input: string) {
  let url = await validateUrl(input);
  for (let redirectCount = 0; redirectCount < 4; redirectCount++) {
    const response = await fetch(url, { redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(10_000), headers: { "User-Agent": "LocalCheckAI/1.0 (homepage localization audit)", Accept: "text/html,application/xhtml+xml" } });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("unavailable");
      url = await validateUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) throw new Error("unavailable");
    if (!response.headers.get("content-type")?.toLowerCase().includes("html")) throw new Error("not-html");
    const html = (await response.text()).slice(0, MAX_HTML_LENGTH);
    if (!html.trim()) throw new Error("unavailable");
    return { html, finalUrl: url };
  }
  throw new Error("unavailable");
}

function extractSignals(html: string): AnalysisSignals {
  const $ = cheerio.load(html);
  const basic = { title: $("title").first().text().trim() || null, metaDescription: $("meta[name='description']").attr("content")?.trim() || null, htmlLang: $("html").attr("lang")?.trim() || null, h1: $("h1").first().text().trim() || null, canonicalUrl: $("link[rel='canonical']").attr("href")?.trim() || null };
  $("script, style, noscript").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 50_000);
  const searchable = `${text}\n${html.slice(0, MAX_HTML_LENGTH)}`;
  const detect = (patterns: [string, RegExp][]) => patterns.filter(([, pattern]) => pattern.test(searchable)).map(([name]) => name);
  const allCurrencySignals = Object.values(marketConfigs).flatMap((config) => config.currencySignals);
  const detectedCurrencySignals = allCurrencySignals.filter(({ pattern }) => pattern.test(searchable)).map(({ label }) => label);
  const foreignCurrencySignals = ["CNY", "RMB", "￥"].filter((signal) => new RegExp(signal === "￥" ? "￥" : `\\b${signal}\\b`, "i").test(searchable));
  const languageSignals = [
    (text.match(/\b[a-z]{3,}\b/gi) || []).length >= 20 ? "en" : "",
    /\b(und|der|die|das|mit|für|zahlung)\b/i.test(text) ? "de" : "",
    /[ぁ-んァ-ン一-龯]/.test(text) ? "ja" : "",
  ].filter(Boolean);
  return { basic, currencySignals: [...new Set(detectedCurrencySignals)], foreignCurrencySignals, paymentsDetected: detect(paymentPatterns), trustSignals: detect(trustPatterns), policySignals: detect(policyPatterns), seoSignals: { title: Boolean(basic.title), metaDescription: Boolean(basic.metaDescription), h1: Boolean(basic.h1), htmlLang: Boolean(basic.htmlLang), canonical: Boolean(basic.canonicalUrl) }, languageSignals };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body.url !== "string" || !body.url.trim() || body.url.length > 2048) return Response.json({ success: false, error: "Please enter a valid website URL." }, { status: 400 });
    const market = (["us", "de", "jp"].includes(String(body.market).toLowerCase()) ? String(body.market).toLowerCase() : "us") as Market;
    const { html, finalUrl } = await fetchHomepage(body.url);
    const site = finalUrl.hostname;
    return Response.json({ success: true, report: scoreAnalysis(site, market, extractSignals(html)) });
  } catch {
    return Response.json({ success: false, error: "We couldn't access this website." }, { status: 422 });
  }
}
