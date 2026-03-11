import React, { useEffect } from 'react';
import '../styles/legal.css';

export default function PrivacyPolicy({ onBack }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page-wrapper">
      <div className="legal-container">
        <button className="legal-back-btn" onClick={onBack}>
          &larr; Back to Home
        </button>
        <div className="legal-content">
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last Updated: March 2026</p>

          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to ResuMe. We respect your privacy and are committed to protecting it. 
              Our service is designed with privacy-first principles natively built-in: 
              <strong> all your data stays entirely on your device.</strong>
            </p>
          </section>

          <section>
            <h2>2. Data Collection and Usage</h2>
            <p>
              ResuMe is a client-side application. We do not transmit, collect, or store your 
              resume data, personal details, or any content you create on our servers. 
            </p>
            <ul>
              <li><strong>Local Storage:</strong> Your data is saved locally in your browser's <code>localStorage</code> purely for your convenience, allowing you to resume your work later.</li>
              <li><strong>Cookies:</strong> We do not use tracking cookies.</li>
              <li><strong>Analytics:</strong> We may use basic, anonymized analytics to understand overall site performance without identifying individual users.</li>
            </ul>
          </section>

          <section>
            <h2>3. Artificial Intelligence Features</h2>
            <p>
              If you utilize any AI-related features on our platform (like AI translation or prompt suggestions), 
              the specific data you invoke for that transaction may be securely sent to our chosen LLM providers 
              to generate the response. This data is not retained by us and is processed solely to fulfill your immediate request.
            </p>
          </section>

          <section>
            <h2>4. Third-Party Services</h2>
            <p>
              Since your data is not stored on our servers, we do not share, sell, or rent your personal information 
              to third parties. Any third-party tools used for application hosting or analytics observe strict privacy constraints.
            </p>
          </section>

          <section>
            <h2>5. Your Rights</h2>
            <p>
              Because you possess all your data locally, you have complete control over it. 
              You can permanently delete all your ResuMe data at any time simply by clicking the "Clear" button 
              within the app or clearing your browser's site data.
            </p>
          </section>

          <section>
            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us via our developer channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
