import React, { useEffect, useState, useRef } from 'react';
import '../styles/landing.css';

export default function Landing({ onStart }) {
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
    }, { threshold: 0.1 });

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
        <button className="landing-cta-small" onClick={onStart}>Build CV</button>
      </nav>

      <main className="landing-main">
        {/* HERO SECTION */}
        <section className="landing-hero animate-on-scroll">
          <div className="hero-content">
            <h1 className="landing-title">
              Craft your story.<br/>Land the job.
            </h1>
            <p className="landing-subtitle">
              A meticulously designed, privacy-first resume builder right in your browser. 
              Real-time preview, intelligent translations, and absolute control.
            </p>
            <div className="hero-actions">
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

          <div className="hero-showcase">
            <div className="showcase-glow"></div>
            <video 
              src="./assets/dark_mode_playing_with_parameters_desktop.mov" 
              autoPlay 
              loop 
              muted 
              playsInline
              className="hero-image mask-hero"
            />
          </div>
        </section>

        {/* BENTO GRID FEATURES SECTION */}
        <section id="features" className="landing-bento-section">
          <div className="bento-header animate-on-scroll">
            <h2>Pro-level tools.</h2>
            <p>Everything you need, wrapped in a beautiful, adaptive interface.</p>
          </div>
          
          <div className="bento-grid">
            {/* Feature 1: The App Frame (Large - span 2 cols) */}
            <div className="bento-box bx-large animate-on-scroll">
              <div className="bento-text">
                <h3>Adaptive Editor</h3>
                <p>Toggle sections, reorder freely, and see updates instantly without reload.</p>
              </div>
              <div className="bento-media-wrapper">
                <video 
                  src="./assets/light_mode_desktop_drag_add_remove_section.mov" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="bento-img-top" 
                />
              </div>
            </div>

            {/* Feature 2: Mobile Centric (Tall - span 2 rows) */}
            <div className="bento-box bx-tall animate-on-scroll">
              <div className="bento-text">
                <h3>Flawless on Mobile</h3>
                <p>Edit your CV seamlessly on the go.</p>
              </div>
              <div className="bento-video-wrapper">
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
            </div>

            {/* Feature 3: Custom Sections (Small - Col 1 Row 2) */}
            <div className="bento-box bx-small animate-on-scroll">
              <div className="bento-text">
                <h3>Custom Blocks</h3>
                <p>Go beyond defaults. Add anything.</p>
              </div>
              <div className="bento-media-wrapper-custom">
                 <img src="./assets/mobile_dark_mode_custom_section_view.jpeg" alt="Mobile Dark Mode" className="bento-img-custom" />
              </div>
            </div>
            
            {/* Feature 4: Privacy (Small - Col 2 Row 2) */}
             <div className="bento-box bx-small animate-on-scroll gradient-box">
              <div className="bento-text bento-centered">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="bento-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <h3>Privacy First</h3>
                <p>100% Client-side.<br/>No servers. No tracking.</p>
              </div>
            </div>

            {/* Feature 5: High Customization (Medium - span 3 cols, Row 3) */}
            <div className="bento-box bx-medium animate-on-scroll">
               <div className="bento-text text-horizontal">
                <div>
                  <h3>Precision Control</h3>
                  <p>Fine-tune every aspect of your timeline and effortlessly toggle between languages with integrated AI translation prompt hints.</p>
                </div>
              </div>
              <img src="./assets/dark_mode_desktop_english_toggled_view_on_certifs_panel.png" alt="Certifications English" className="bento-img-offset" />
            </div>
          </div>
        </section>
        
        {/* FINAL CTA */}
        <section className="landing-final-cta animate-on-scroll">
          <h2>Ready to stand out?</h2>
          <button className="landing-cta-primary large" onClick={onStart}>
            Start Building Now
          </button>
        </section>

        <footer className="landing-footer">
          <div className="landing-logo">Resu<span>Me</span></div>
          <p>© {new Date().getFullYear()} ResuMe Preview Project. Open Source.</p>
        </footer>
      </main>
    </div>
  );
}
