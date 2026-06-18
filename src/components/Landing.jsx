import { getTranslation } from '../utils/translations';
import React, { useEffect, useState } from 'react';
import ImportModal from './ui/ImportModal';

import '../styles/landing.css';

function LandingVideo({ src, poster, className }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <img
        src={poster}
        alt="Preview fallback"
        className={className}
        loading="lazy"
      />
    );
  }

  return (
    <video
      src={src}
      poster={poster}
      preload="none"
      loop
      muted
      playsInline
      className={`${className} animate-video-on-scroll`}
      onError={() => setError(true)}
    />
  );
}

export default function Landing({ onStart, onNavigate }) {
  const [lang, setLang] = useState('en');
  useEffect(() => {
    try {
      const browserLang = navigator.language || navigator.userLanguage || 'en';
      setLang(browserLang.startsWith('fr') ? 'fr' : 'en');
    } catch {}
  }, []);
  const t = (k) => getTranslation(lang, k);

  const [scrolled, setScrolled] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleImportSuccess = (parsedData) => {
    localStorage.setItem('resume-builder-data', JSON.stringify(parsedData));
    onStart(); // Navigate to app
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.tagName === 'VIDEO') {
            entry.target.play().catch(e => console.log('Autoplay prevented', e));
          }
        } else {
          if (entry.target.tagName === 'VIDEO') {
            entry.target.pause();
          }
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-video-on-scroll').forEach((el) => {
      observer.observe(el);
    });
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
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="landing-logo">Resu<span>Me</span></div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="landing-cta-small" style={{ background: 'var(--landing-bg)', color: 'var(--landing-text)', border: '1px solid var(--landing-text-secondary)' }} onClick={() => setShowImportModal(true)}>
            <i className="fi fi-rr-magic-wand"></i> Import CV
          </button>
          <button className="landing-cta-small" onClick={onStart}>{t('Build CV')}</button>
        </div>
      </nav>

      <main className="landing-main">
        {/* HERO SECTION */}
        <section className="landing-hero">
          <div className="hero-content">
            <h1 className="landing-title animate-on-scroll staggered-1">
              {t('Craft your story.')}<br />
              <span className="text-gradient">{t('Land the job.')}</span>
            </h1>
            <p className="landing-subtitle animate-on-scroll staggered-2">
              {t('A meticulously designed, privacy-first resume builder right in your browser. Real-time preview, intelligent translations, and absolute control.')}
            </p>
            <div className="hero-actions animate-on-scroll staggered-3">
              <button className="landing-cta-primary" onClick={onStart}>
                Start Building Free
              </button>
              <button className="landing-cta-secondary" onClick={() => setShowImportModal(true)}>
                <i className="fi fi-rr-magic-wand"></i> Import Resume
              </button>
            </div>
          </div>

          <div className="hero-showcase animate-on-scroll staggered-4">
            <div className="showcase-glow"></div>
            <div className="hero-image-wrapper">
              <LandingVideo
                src="./assets/dark_mode_playing_with_parameters_desktop.mov"
                poster="./assets/dark_mode__parameter_extended_view.png"
                className="hero-video"
              />
            </div>
          </div>
        </section>

        {/* FEATURES SECTION: DESKTOP & MOBILE SPLIT */}
        <section id="features" className="landing-bento-section">
          <div className="bento-header animate-on-scroll">
            <h2>{t('Pro-level tools.')}</h2>
            <p>{t('Everything you need, intelligently organized for your device.')}</p>
          </div>

          {/* DESKTOP EXPERIENCE */}
          <div className="section-divider animate-on-scroll">
            <h3>{t('Desktop Canvas')}</h3>
            <p>{t('A panoramic interface designed for precision editing and rapid workflow.')}</p>
          </div>

          <div className="bento-grid">
            {/* Feature 1: {t('Adaptive Editor')} (Full Desktop) */}
            <div className="bento-box bx-full animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <div className="bento-text bento-centered-top">
                <h3>{t('Adaptive Editor')}</h3>
                <p>{t('Toggle sections, reorder freely, and see updates instantly without reload.')}</p>
              </div>
              <div className="hero-showcase bento-showcase">
                <div className="hero-image-wrapper">
                  <LandingVideo
                    src="./assets/light_mode_desktop_drag_add_remove_section.mov"
                    poster="./assets/light_mode_desktop_parameter_collapsed_view.png"
                    className="hero-video"
                  />
                </div>
              </div>
            </div>

            {/* Feature 2: {t('Precision Control')} (Full Desktop) */}
            <div className="bento-box bx-full animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <div className="bento-text bento-centered-top">
                <h3>{t('Precision Control')}</h3>
                <p>{t('Fine-tune every aspect of your timeline, adjust ATS-friendly margins, and effortlessly switch themes with our advanced parameter engine.')}</p>
              </div>
              <div className="hero-showcase bento-showcase">
                <div className="hero-image-wrapper">
                  <img
                    src="./assets/dark_mode__parameter_extended_view.png"
                    alt="Extended Parameters View"
                    className="hero-video animate-video-on-scroll"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE EXPERIENCE */}
          <div className="section-divider animate-on-scroll" style={{ marginTop: '100px' }}>
            <h3>{t('Mobile Freedom')}</h3>
            <p>{t('Create, update, and preview your CV natively on your phone. No compromises.')}</p>
          </div>

          <div className="bento-grid">
            {/* Feature 3: Mobile Centric (Half) */}
            <div className="bento-box bx-half animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <div className="bento-text bento-centered-top">
                <h3>{t('Flawless on Mobile')}</h3>
                <p>{t('Edit your CV seamlessly on the go.')}</p>
              </div>
              <div className="mockup-frame">
                <LandingVideo
                  src="./assets/light_mode_mobile_preview_and_parameters_playging_view.mp4"
                  poster="./assets/mobile_dark_mode_custom_section_view.jpeg"
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
                  className="bento-video animate-video-on-scroll"
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

      <ImportModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        onImportSuccess={handleImportSuccess}
        language={lang}
      />
    </div>
  );
}