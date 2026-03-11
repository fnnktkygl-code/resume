import React, { useEffect } from 'react';
import '../styles/legal.css';

export default function Security({ onBack }) {
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
          <h1>Security Standards</h1>
          <p className="legal-updated">Last Updated: March 2026</p>

          <section>
            <h2>1. Architecture "By Design"</h2>
            <p>
              ResuMe treats security as an architectural default, not an afterthought. 
              Because our application is a fully client-side Progressive Web Application (PWA), 
              the attack surface is drastically minimized.
            </p>
          </section>

          <section>
            <h2>2. Local Execution & Data Residency</h2>
            <p>
              All the processing required to render your resume, compile PDFs, and parse Markdown 
              occurs locally inside your browser's execution environment. 
            </p>
            <ul>
              <li><strong>Zero Database Transmissions:</strong> We do not have a central database collecting your personal history.</li>
              <li><strong>Isolated Storage:</strong> Your data sits in your browser's isolated `localStorage` sandbox, inherently protected by browser-level Same-Origin Policies.</li>
            </ul>
          </section>

          <section>
            <h2>3. Network Security</h2>
            <p>
              The application logic and static assets are delivered exclusively over strong TLS/SSL connections (HTTPS). 
              This ensures that the delivery of the app itself is immune to Man-In-The-Middle (MITM) tampering, keeping 
              the codebase running on your machine verified and authentic.
            </p>
          </section>

          <section>
            <h2>4. External Integrations (AI)</h2>
            <p>
              If AI features are invoked, data in transit to those third-party providers is encrypted end-to-end. 
              We strictly vet providers that do not train their foundational models on API payload data, maintaining 
              the confidentiality of your inputs.
            </p>
          </section>

          <section>
            <h2>5. Reporting Vulnerabilities</h2>
            <p>
              If you are a security researcher and believe you have found a flaw in our client-side architecture 
              or infrastructure, please do not hesitate to contact our maintainers. We appreciate responsible disclosure.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
