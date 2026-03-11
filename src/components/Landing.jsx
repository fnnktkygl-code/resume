import React, { useEffect, useState } from 'react';

const landingStyles = `
/* Apple-like Minimalist Premium Theme */

:root {
  /* Enforcing a sophisticated dark/adaptive palette for the landing page */
  --landing-bg: #0a0a0c;
  --landing-text: #fcfcfc;
  --landing-text-secondary: #a1a1aa;
  --landing-accent: #34d399; /* Subtle green to match ATS ready badge */
  
  --bento-bg: rgba(255, 255, 255, 0.03);
  --bento-border: rgba(255, 255, 255, 0.08);
  --bento-hover: rgba(255, 255, 255, 0.05);
  
  --hero-glow: rgba(52, 211, 153, 0.15);
  --hero-glow-alt: rgba(56, 189, 248, 0.15);
}

/* Animations */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(40px) scale(0.98);
  filter: blur(4px);
  transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), 
              transform 0.8s cubic-bezier(0.25, 1, 0.5, 1),
              filter 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

.staggered-1 { transition-delay: 0.0s; }
.staggered-2 { transition-delay: 0.1s; }
.staggered-3 { transition-delay: 0.2s; }
.staggered-4 { transition-delay: 0.3s; }

/* Page Reset */
.landing-page {
  min-height: 100vh;
  background-color: var(--landing-bg);
  color: var(--landing-text);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Typography Enhancements */
.text-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glassmorphism Navigation */
.landing-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 80px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background: transparent;
  border-bottom: 1px solid transparent;
}

.landing-nav.nav-scrolled {
  padding: 16px 80px;
  background: rgba(10, 10, 12, 0.6);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid var(--bento-border);
}

.landing-logo {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--landing-text);
  display: flex;
  align-items: center;
  gap: 2px;
}

.landing-logo span {
  color: var(--landing-accent);
}

.landing-cta-small {
  background: var(--landing-text);
  color: var(--landing-bg);
  border: none;
  border-radius: 40px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-cta-small:hover {
  transform: scale(1.04);
  background: #ebebeb;
}

/* Hero Section */
.landing-main {
  padding-top: 120px;
}

.landing-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80px 20px 0;
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-content {
  max-width: 840px;
  z-index: 10;
}

.landing-title {
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
  margin-bottom: 24px;
  color: var(--landing-text);
}

.landing-subtitle {
  font-size: clamp(18px, 2vw, 24px);
  color: var(--landing-text-secondary);
  margin-bottom: 40px;
  line-height: 1.5;
  font-weight: 400;
  letter-spacing: -0.01em;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
}

.landing-cta-primary {
  background: var(--landing-text);
  color: var(--landing-bg);
  border: none;
  border-radius: 40px;
  padding: 16px 36px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 0 0 rgba(255,255,255,0.2);
}

.landing-cta-primary.large {
  padding: 20px 48px;
  font-size: 20px;
}

.landing-cta-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 0 20px 0 rgba(255,255,255,0.15);
  background: #ebebeb;
}

.landing-cta-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--landing-text);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  padding: 16px 36px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.landing-cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Hero Showcase Image */
.hero-showcase {
  margin-top: 80px;
  position: relative;
  width: 100%;
  max-width: 1100px;
  display: flex;
  justify-content: center;
}

.showcase-glow {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: radial-gradient(circle at 30% 50%, var(--hero-glow) 0%, transparent 50%),
              radial-gradient(circle at 70% 50%, var(--hero-glow-alt) 0%, transparent 50%);
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
}

.hero-image-wrapper {
  width: 100%;
  position: relative;
  z-index: 2;
  border-radius: 24px 24px 0 0;
  padding: 8px 8px 0 8px;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
}

.hero-video {
  width: 100%;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8);
  border: 1px solid var(--bento-border);
  border-bottom: none;
  background-color: #111;
}

/* Bento Grid Section */
.landing-bento-section {
  padding: 120px 40px;
  position: relative;
  z-index: 10;
}

.bento-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 80px;
}

.bento-header h2 {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
}

.bento-header p {
  font-size: 20px;
  color: var(--landing-text-secondary);
}

/* Sub-section Dividers */
.section-divider {
  max-width: 1100px;
  margin: 0 auto 32px;
  padding: 0;
  text-align: left;
}

.section-divider h3 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--landing-text);
  margin-bottom: 8px;
}

.section-divider p {
  font-size: 18px;
  color: var(--landing-text-secondary);
}

/* THE GRID */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: minmax(460px, auto);
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.bento-box {
  background: var(--bento-bg);
  border: 1px solid var(--bento-border);
  border-radius: 36px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
              background 0.4s ease, 
              box-shadow 0.4s ease;
  box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05);
}

.bento-box:hover {
  transform: translateY(-4px);
  background: var(--bento-hover);
  box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.2);
}

/* Grid Layout Assignments */
.bx-full {
  grid-column: span 2;
  grid-row: span 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

.bx-half {
  grid-column: span 1;
  grid-row: span 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

.bento-centered-top {
  padding: 50px 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 10;
  position: relative;
  flex-shrink: 0;
  max-width: 800px;
  margin: 0 auto;
}

.bento-showcase {
  margin-top: 40px;
  margin-bottom: 0;
  width: 90%;
  display: flex;
  justify-content: center;
  align-items: flex-end; /* Always bottom align the media */
  flex-grow: 1; /* Stretch to fill bottom space */
}

/* Bento Text Content */
.bento-text {
  padding: 40px 40px 0;
  z-index: 10;
  position: relative;
  flex-shrink: 0; /* Prevents text from squishing when images scale */
}

.bento-text h3 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}

.bento-text p {
  font-size: 17px;
  color: var(--landing-text-secondary);
  line-height: 1.5;
}

.text-horizontal {
  width: 45%;
  padding: 40px;
  flex-shrink: 0;
}

/* Privacy First centered text */
.bento-centered {
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.icon-wrapper {
  background: rgba(52, 211, 153, 0.1);
  padding: 20px;
  border-radius: 24px;
  margin-bottom: 24px;
  color: var(--landing-accent);
  box-shadow: 0 0 30px rgba(52, 211, 153, 0.1);
}

/* Edge-to-Edge Media Elements */
/* By removing padding wrappers and relying on margin auto, 
   we elegantly push the images flush against the bottom and right edges */

.media-bleed-bottom {
  margin: auto auto 0 auto;
  width: 90%;
  height: auto;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  border-bottom: none;
  display: block;
  background-color: #111;
}

.media-bleed-center {
  margin: auto auto 0 auto;
  width: 80%;
  height: auto;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  border-bottom: none;
  display: block;
}

.media-bleed-right {
  margin: auto 0 0 auto; /* Pushes to bottom right corner */
  width: 60%;
  height: auto;
  border-radius: 16px 0 0 0;
  box-shadow: -10px -10px 40px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  border-bottom: none;
  border-right: none;
  display: block;
  align-self: flex-end;
}

/* CSS-only Realistic Mobile Mockup Enhancements */
.mockup-frame {
  margin: auto auto -30px auto;
  width: 100%;
  max-width: 280px; 
  border-radius: 42px;
  background: #000;
  padding: 12px;
  box-shadow: 0 0 0 1px #333, 0 30px 60px rgba(0,0,0,0.5);
  position: relative;
  box-sizing: border-box;
  z-index: 2;
}

.bento-video {
  width: 100%;
  height: auto;
  border-radius: 30px; /* perfectly curves inside the 12px padded 42px outer frame */
  display: block;
}

/* Gradient Box */
.gradient-box {
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
}

/* Final CTA */
.landing-final-cta {
  text-align: center;
  padding: 140px 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cta-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, var(--hero-glow) 0%, transparent 60%);
  filter: blur(60px);
  z-index: 0;
  pointer-events: none;
}

.landing-final-cta h2 {
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
  z-index: 1;
}

.landing-final-cta p {
  font-size: 20px;
  color: var(--landing-text-secondary);
  margin-bottom: 24px;
  z-index: 1;
}

.mt-6 { margin-top: 24px; z-index: 1; }

/* Footer */
.landing-footer {
  padding: 40px 80px;
  background: rgba(0,0,0,0.2);
  border-top: 1px solid var(--bento-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-tag {
  font-size: 13px;
  font-weight: 500;
  color: var(--landing-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.landing-footer p {
  color: var(--landing-text-secondary);
  font-size: 14px;
}

/* Responsiveness */
@media (max-width: 1024px) {
  .landing-nav.nav-scrolled, .landing-nav { padding-left: 40px; padding-right: 40px; }
  .landing-footer { padding-left: 40px; padding-right: 40px; }
  
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: minmax(420px, auto);
  }
  
  .bx-full { grid-column: span 2; }
  .bx-half { grid-column: span 1; }
  
  .bx-medium { 
    grid-column: span 1; 
  }
  
  .bx-medium .text-horizontal { width: 100%; padding: 40px; }
  
  .media-bleed-right {
    margin: auto auto 0 auto;
    width: 90%;
    border-radius: 16px 16px 0 0;
    border-right: 1px solid rgba(255,255,255,0.1);
    align-self: center;
  }
}

@media (max-width: 768px) {
  .landing-nav.nav-scrolled, .landing-nav { padding-left: 20px; padding-right: 20px; }
  .landing-main { padding-top: 100px; }
  .hero-actions { flex-direction: column; width: 100%; gap: 16px; }
  .landing-cta-primary, .landing-cta-secondary { width: 100%; max-width: 320px; }
  
  .hero-showcase { margin-top: 60px; }
  
  .landing-bento-section { padding: 80px 20px; }
  
  .bento-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
  .bx-full, .bx-half { 
    grid-column: span 1;
    grid-row: auto;
    min-height: 460px;
  }
  
  .bento-text { padding: 32px 32px 0; }
  
  /* Guarantee mobile media keeps appropriate spacing before intersecting text */
  .media-bleed-bottom, .media-bleed-center, .media-bleed-right {
    width: 90%;
    margin-top: 40px;
  }
  
  .mockup-frame { 
    max-width: 280px; 
    margin-top: 40px;
  }
  
  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.footer-nav {
  display: flex;
  gap: 24px;
  margin: 16px 0;
}

.footer-nav button {
  background: none;
  border: none;
  color: var(--landing-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0;
}

.footer-nav button:hover {
  color: var(--landing-accent);
}
`;

export default function Landing({ onStart, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="landing-page">
      <style dangerouslySetInnerHTML={{ __html: landingStyles }} />
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="landing-logo">Resu<span>Me</span></div>
        <button className="landing-cta-small" onClick={onStart}>Build CV</button>
      </nav>

      <main className="landing-main">
        {/* HERO SECTION */}
        <section className="landing-hero">
          <div className="hero-content">
            <h1 className="landing-title animate-on-scroll staggered-1">
              Craft your story.<br />
              <span className="text-gradient">Land the job.</span>
            </h1>
            <p className="landing-subtitle animate-on-scroll staggered-2">
              A meticulously designed, privacy-first resume builder right in your browser.
              Real-time preview, intelligent translations, and absolute control.
            </p>
            <div className="hero-actions animate-on-scroll staggered-3">
              <button className="landing-cta-primary" onClick={onStart}>
                Start Building Free
              </button>
              <button className="landing-cta-secondary" onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}>
                Take a Tour
              </button>
            </div>
          </div>

          <div className="hero-showcase animate-on-scroll staggered-4">
            <div className="showcase-glow"></div>
            <div className="hero-image-wrapper">
              <video
                src="./assets/dark_mode_playing_with_parameters_desktop.mov"
                autoPlay
                loop
                muted
                playsInline
                className="hero-video"
              />
            </div>
          </div>
        </section>

        {/* FEATURES SECTION: DESKTOP & MOBILE SPLIT */}
        <section id="features" className="landing-bento-section">
          <div className="bento-header animate-on-scroll">
            <h2>Pro-level tools.</h2>
            <p>Everything you need, intelligently organized for your device.</p>
          </div>

          {/* DESKTOP EXPERIENCE */}
          <div className="section-divider animate-on-scroll">
            <h3>Desktop Canvas</h3>
            <p>A panoramic interface designed for precision editing and rapid workflow.</p>
          </div>

          <div className="bento-grid">
            {/* Feature 1: Adaptive Editor (Full Desktop) */}
            <div className="bento-box bx-full animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <div className="bento-text bento-centered-top">
                <h3>Adaptive Editor</h3>
                <p>Toggle sections, reorder freely, and see updates instantly without reload.</p>
              </div>
              <div className="hero-showcase bento-showcase">
                <div className="hero-image-wrapper">
                  <video
                    src="./assets/light_mode_desktop_drag_add_remove_section.mov"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="hero-video"
                  />
                </div>
              </div>
            </div>

            {/* Feature 2: Precision Control (Full Desktop) */}
            <div className="bento-box bx-full animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <div className="bento-text bento-centered-top">
                <h3>Precision Control</h3>
                <p>Fine-tune every aspect of your timeline, adjust ATS-friendly margins, and effortlessly switch themes with our advanced parameter engine.</p>
              </div>
              <div className="hero-showcase bento-showcase">
                <div className="hero-image-wrapper">
                  <img
                    src="./assets/dark_mode__parameter_extended_view.png"
                    alt="Extended Parameters View"
                    className="hero-video"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE EXPERIENCE */}
          <div className="section-divider animate-on-scroll" style={{ marginTop: '100px' }}>
            <h3>Mobile Freedom</h3>
            <p>Create, update, and preview your CV natively on your phone. No compromises.</p>
          </div>

          <div className="bento-grid">
            {/* Feature 3: Mobile Centric (Half) */}
            <div className="bento-box bx-half animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <div className="bento-text bento-centered-top">
                <h3>Flawless on Mobile</h3>
                <p>Edit your CV seamlessly on the go.</p>
              </div>
              <div className="mockup-frame">
                <video
                  src="./assets/light_mode_mobile_preview_and_parameters_playging_view.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="bento-video"
                />
              </div>
            </div>

            {/* Feature 4: Custom Sections (Half) */}
            <div className="bento-box bx-half animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <div className="bento-text bento-centered-top">
                <h3>Custom Blocks</h3>
                <p>Go beyond defaults. Add anything.</p>
              </div>
              <div className="mockup-frame">
                <img
                  src="./assets/mobile_dark_mode_custom_section_view.jpeg"
                  alt="Mobile Dark Mode Custom Section"
                  className="bento-video"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="landing-final-cta animate-on-scroll">
          <div className="cta-glow"></div>
          <h2>Ready to stand out?</h2>
          <p>Join the next generation of professionals.</p>
          <button className="landing-cta-primary large mt-6" onClick={onStart}>
            Start Building Now
          </button>
        </section>

        <footer className="landing-footer">
          <div className="landing-logo">Resu<span>Me</span></div>
          
          <nav className="footer-nav">
            <button onClick={() => onNavigate('privacy')}>Privacy Policy</button>
            <button onClick={() => onNavigate('terms')}>Terms of Service</button>
            <button onClick={() => onNavigate('security')}>Security</button>
          </nav>

          <div className="footer-links">
            <span className="footer-tag">ATS Ready</span>
            <span className="footer-tag">Privacy First</span>
            <span className="footer-tag">Open Source</span>
          </div>
          <p>© {new Date().getFullYear()} ResuMe Preview Project.</p>
        </footer>
      </main>
    </div>
  );
}