"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const loadingSteps = [
  "Crawling website...",
  "Checking localization signals...",
  "Evaluating market readiness...",
  "Generating recommendations...",
];

const markets = [
  { value: "us", label: "🇺🇸 United States" },
  { value: "de", label: "🇩🇪 Germany" },
  { value: "jp", label: "🇯🇵 Japan" },
];

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [market, setMarket] = useState("us");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) return;
    const timer = window.setInterval(() => {
      setStep((current) => Math.min(current + 1, loadingSteps.length - 1));
    }, 700);
    return () => window.clearInterval(timer);
  }, [isLoading]);

  function beginDemo() {
    setError(null);
    sessionStorage.removeItem("localcheck-analysis");
    setIsLoading(true);
    setStep(0);
    window.setTimeout(() => {
      router.push("/report");
    }, 3100);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim()) { setError("Please enter a website URL to start an analysis."); return; }
    sessionStorage.removeItem("localcheck-analysis");
    setError(null);
    setIsLoading(true);
    setStep(0);
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, market: market.toUpperCase() }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Analysis unavailable");
      sessionStorage.setItem("localcheck-analysis", JSON.stringify(result.report));
      window.setTimeout(() => router.push("/report?source=live"), 400);
    } catch {
      setIsLoading(false);
      setError("We couldn't access this website. Some stores block automated website analysis.");
    }
  }

  if (error) {
    return <main className="loading-screen"><div className="loading-card error-card"><p className="eyebrow">ANALYSIS UNAVAILABLE</p><h1>Analysis unavailable</h1><p className="error-message">{error}</p><p className="loading-note">Try another website or use our Demo Report.</p><button className="primary-button" type="button" onClick={beginDemo}>Try Demo</button></div></main>;
  }

  if (isLoading) {
    return (
      <main className="loading-screen">
        <div className="loading-card">
          <div className="loading-orb" aria-hidden="true" />
          <p className="eyebrow">LOCALCHECK AI</p>
          <h1>Auditing your global readiness</h1>
          <p className="loading-status">{loadingSteps[step]}</p>
          <div className="progress-track" aria-label="Audit progress">
            <div className="progress-bar" style={{ width: `${((step + 1) / loadingSteps.length) * 100}%` }} />
          </div>
          <p className="loading-note">We analyze only the homepage and do not execute third-party scripts.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="home-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="LocalCheck AI home">
          <span className="brand-mark">L</span>
          <span>LocalCheck <strong>AI</strong></span>
        </Link>
        <span className="header-label">Automated Localization Audit</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">EXPAND WITH CONFIDENCE</p>
          <h1>Is Your Store Really Ready for Global Customers?</h1>
          <p className="hero-description">
            Run an automated homepage audit for localization gaps across payments, currency, trust, SEO and policy signals.
          </p>
        </div>

        <form className="audit-form" onSubmit={handleSubmit}>
          <label>
            <span>Website URL</span>
            <input
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://yourstore.com"
              aria-label="Website URL"
            />
          </label>
          <label>
            <span>Target Market</span>
            <select value={market} onChange={(event) => setMarket(event.target.value)} aria-label="Target Market">
              {markets.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <button className="primary-button" type="submit">Analyze Website <span>→</span></button>
          <button className="demo-button" type="button" onClick={beginDemo}>Try Demo</button>
          <p className="form-note">No login required <span>·</span> Free localization audit</p>
        </form>
      </section>

      <section className="methodology" aria-labelledby="methodology-title">
        <div className="methodology-intro"><p className="eyebrow">HOW LOCALCHECK WORKS</p><h2 id="methodology-title">A clear, explainable audit in three steps.</h2></div>
        <div className="methodology-steps">
          <article><span>01</span><h3>Scan</h3><p>We inspect localization signals available on the store&apos;s public homepage.</p></article>
          <article><span>02</span><h3>Evaluate</h3><p>Signals are evaluated against market-specific localization criteria.</p></article>
          <article><span>03</span><h3>Recommend</h3><p>LocalCheck highlights gaps, evidence and prioritized recommendations.</p></article>
        </div>
        <p className="methodology-note">The current MVP uses a transparent rule-based scoring framework to keep results explainable and reproducible.</p>
      </section>

      <section className="value-strip" aria-label="What LocalCheck checks">
        <span>Currency</span><span>Payments</span><span>Trust</span><span>SEO</span><span>Compliance</span>
      </section>
    </main>
  );
}
