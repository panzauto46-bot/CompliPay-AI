import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';
import './LandingPage.css';

const tickerItems = [
  'Real-time settlement on Solana',
  'KYC + KYT + AML + Travel Rule ready',
  'Programmable payment contracts',
  'Institutional-grade audit trail',
  'AI-assisted treasury automation',
];

const features = [
  {
    title: 'Compliance by Default',
    description:
      'Every payment goes through KYC, KYT, AML, and Travel Rule guardrails before execution.',
    icon: ShieldCheck,
  },
  {
    title: 'Programmable Payments',
    description:
      'Define escrow, milestone, subscription, or treasury rules in a single operational flow.',
    icon: Workflow,
  },
  {
    title: 'Global Stablecoin Rail',
    description:
      'Optimize cross-border payments with fast finality on Solana testnet/mainnet.',
    icon: Globe2,
  },
];

const flowSteps = [
  {
    title: 'Create Contract',
    description: 'The treasury team creates a payment contract with clear policy rules.',
  },
  {
    title: 'Run Compliance',
    description: 'The engine checks KYC/KYT/AML + Travel Rule and returns a transparent risk score.',
  },
  {
    title: 'AI Decisioning',
    description: 'The AI agent suggests optimal timing and execution route within policy constraints.',
  },
  {
    title: 'Settle + Audit',
    description: 'Payment is settled, tx hash is recorded, and audit evidence is ready for regulators.',
  },
];

const proofPoints = [
  { label: 'Mock Pass Rate', value: '98.5%' },
  { label: 'Daily Volume Simulation', value: '$2.75M' },
  { label: 'Settlement Window', value: '< 15s' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <div className="landing-backdrop" aria-hidden="true">
        <span className="mesh mesh-1" />
        <span className="mesh mesh-2" />
        <span className="mesh mesh-3" />
        <span className="grid-noise" />
      </div>

      <header className={`landing-nav${scrolled ? ' nav-scrolled' : ''}`}>
        <div className="nav-glass">
          <a href="#home" className="brand">
            <span className="brand-dot" />
            CompliPay AI
          </a>

          <nav className="nav-links" aria-label="Landing menu">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#flow" className="nav-link">
              Flow
            </a>
            <a href="#demo" className="nav-link">
              Demo
            </a>
          </nav>

          <div className="nav-cta">
            <Link to="/login" className="btn btn-nav">
              <Sparkles className="btn-icon" />
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="landing-container hero">
          <div className="hero-copy">
            <p className="eyebrow">Institutional Stablecoin Infrastructure</p>
            <h1>
              Institutional-Grade <span>Compliant Programmable Payments</span> on Solana.
            </h1>
            <p className="hero-text">
              CompliPay AI helps institutions automate cross-border payments with compliance
              guardrails and audit trails ready for regulator review.
            </p>

            <div className="hero-cta">
              <a href="#flow" className="btn btn-primary">
                View Flow
                <ArrowRight className="btn-icon" />
              </a>
              <Link to="/dashboard" className="btn btn-secondary">
                <PlayCircle className="btn-icon" />
                View Dashboard
              </Link>
            </div>

            <div className="trust-row">
              <span>
                <CheckCircle2 className="mini-icon" />
                KYC / KYT / AML
              </span>
              <span>
                <CheckCircle2 className="mini-icon" />
                Travel Rule
              </span>
              <span>
                <CheckCircle2 className="mini-icon" />
                Solana Settlement
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="scene">
              <span className="orbit orbit-a" />
              <span className="orbit orbit-b" />

              <div className="cube">
                <div className="face front">KYC</div>
                <div className="face back">KYT</div>
                <div className="face right">AML</div>
                <div className="face left">TRAVEL</div>
                <div className="face top">RULE</div>
                <div className="face bottom">PASS</div>
              </div>

              <article className="float-card card-a">
                <ShieldCheck className="float-icon" />
                <div>
                  <p>Policy Locked</p>
                  <small>Auto-block if risk is high</small>
                </div>
              </article>
              <article className="float-card card-b">
                <Zap className="float-icon" />
                <div>
                  <p>AI Execution</p>
                  <small>Runs only when compliant</small>
                </div>
              </article>
              <article className="float-card card-c">
                <Sparkles className="float-icon" />
                <div>
                  <p>Audit Ready</p>
                  <small>Hash + timestamp trace</small>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="ticker-band" aria-label="Live highlights">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <div key={`${item}-${index}`} className="ticker-item">
                <span className="ticker-dot" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="landing-container section">
          <div className="section-head">
            <p className="eyebrow">Core Capabilities</p>
            <h2>Built for regulated institutions, not just crypto-native teams.</h2>
          </div>
          <div className="feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="feature-card">
                  <div className="feature-icon-wrap">
                    <Icon className="feature-icon" />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="flow" className="landing-container section">
          <div className="section-head">
            <p className="eyebrow">Automation Flow</p>
            <h2>Animated flow from contract creation to settlement.</h2>
          </div>

          <div className="flow-shell">
            <span className="flow-line" />
            <span className="flow-runner" />
            <div className="flow-grid">
              {flowSteps.map((step, index) => (
                <article key={step.title} className="flow-card">
                  <span className="flow-index">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="landing-container section">
          <div className="proof-grid">
            {proofPoints.map((point) => (
              <article key={point.label} className="proof-card">
                <p>{point.label}</p>
                <h3>{point.value}</h3>
              </article>
            ))}
          </div>

          <div className="cta-panel">
            <div>
              <p className="eyebrow">Get Started</p>
              <h2>Experience compliance-first programmable payments — live on Solana testnet.</h2>
            </div>
            <Link to="/dashboard" className="btn btn-primary">
              Enter Product Demo
              <ArrowRight className="btn-icon" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <p>CompliPay AI • Stablecoin Infrastructure for Institutions</p>
          <Link to="/dashboard">Open App</Link>
        </div>
      </footer>
    </div>
  );
}
