import React, { useEffect, useState } from 'react';
import '../styles/landing.css';

export default function Landing({ onStart }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="landing-logo">Resu<span>Me</span></div>
        <button className="landing-cta-small" onClick={onStart}>Build CV</button>
      </nav>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="hero-content">
            <span className="landing-badge">ATS-Friendly & Responsive</span>
            <h1 className="landing-title">
              The resume that<br/>gets you hired.
            </h1>
            <p className="landing-subtitle">
              Stand out with a modern, beautifully designed CV. 
              Real-time preview, high-quality translation prompts, and privacy-first architecture natively built for the browser.
            </p>
            <div className="hero-actions">
              <button className="landing-cta-primary" onClick={onStart}>
                Start Building Free
              </button>
              <button className="landing-cta-secondary" onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}>
                Learn More
              </button>
            </div>
          </div>

          <div className="landing-showcase-premium">
            <div className="showcase-glow"></div>
            <img 
              src="./assets/desktop_features_showcase.png" 
              alt="Features" 
              className="showcase-layer showcase-back"
            />
            <img 
              src="./assets/desktop_showcase.png" 
              alt="Desktop App" 
              className="showcase-layer showcase-main"
            />
            <img 
              src="./assets/mobile_showcase_v2.png" 
              alt="Mobile App" 
              className="showcase-layer showcase-front"
            />
          </div>
        </section>

        <section id="features" className="landing-features">
          <div className="features-intro">
            <h2>Designed for performance.</h2>
            <p>Everything you need to craft the perfect profile, instantly.</p>
          </div>
          
          <div className="features-grid-premium">
            <div className="feature-card-premium">
              <div className="feature-icon-premium">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h3 className="feature-title">Privacy First</h3>
              <p className="feature-desc">All your data stays completely in your browser. No server saves, no tracking, absolute control.</p>
            </div>
            
            <div className="feature-card-premium">
              <div className="feature-icon-premium">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8l6 6"></path><path d="M4 14l6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="M22 22l-5-10-5 10"></path><path d="M14 18h6"></path></svg>
              </div>
              <h3 className="feature-title">AI Translation</h3>
              <p className="feature-desc">Instantly translate your CV into English or French with high-quality, pre-optimized AI prompts.</p>
            </div>
            
            <div className="feature-card-premium">
              <div className="feature-icon-premium">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
              </div>
              <h3 className="feature-title">Premium Templates</h3>
              <p className="feature-desc">Choose between standard and modern multi-column layouts crafted for maximum readability.</p>
            </div>
            
            <div className="feature-card-premium">
              <div className="feature-icon-premium">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </div>
              <h3 className="feature-title">Mobile Ready</h3>
              <p className="feature-desc">Build, edit, and preview your beautiful resume seamlessly from your smartphone.</p>
            </div>
          </div>
        </section>
        
        <footer className="landing-footer">
          <div className="landing-logo">Resu<span>Me</span></div>
          <p>© {new Date().getFullYear()} ResuMe Preview Project. Open Source.</p>
        </footer>
      </main>
    </div>
  );
}
