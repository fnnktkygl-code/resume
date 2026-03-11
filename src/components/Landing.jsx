import React from 'react';
import '../styles/landing.css';

export default function Landing({ onStart }) {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-logo">Resu<span>Me</span></div>
        <button className="landing-cta" style={{ padding: '10px 24px', fontSize: '15px' }} onClick={onStart}>Build CV</button>
      </nav>

      <header className="landing-hero">
        <span className="landing-badge">ATS-Friendly & Responsive</span>
        <h1 className="landing-title">Build a Resume that gets you hired.</h1>
        <p className="landing-subtitle">
          Stand out with a modern, beautifully designed CV. 
          Real-time preview, high-quality translation prompts, and privacy-first architecture.
        </p>
        <button className="landing-cta" onClick={onStart}>
          Start Building It's Free
        </button>

        <div className="landing-showcase">
          <img 
            src="./assets/desktop_showcase.png" 
            alt="ResuMe Desktop Experience" 
            className="showcase-desktop"
          />
          <img 
            src="./assets/mobile_showcase.png" 
            alt="ResuMe Mobile Experience" 
            className="showcase-mobile"
          />
        </div>
      </header>

      <section className="landing-features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Privacy First</h3>
            <p className="feature-desc">All your data stays completely in your browser. No server saves, no tracking.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3 className="feature-title">AI Translation Prompt</h3>
            <p className="feature-desc">Instantly translate your CV into English or French with high-quality AI prompts.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3 className="feature-title">Modern Templates</h3>
            <p className="feature-desc">Choose between standard and two-column layouts that look great on any device.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Mobile Ready</h3>
            <p className="feature-desc">Build and preview your resume directly from your smartphone with our resilient UI.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
