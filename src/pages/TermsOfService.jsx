import React, { useEffect } from 'react';
import '../styles/legal.css';

export default function TermsOfService({ onBack }) {
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
          <h1>Terms of Service</h1>
          <p className="legal-updated">Last Updated: March 2026</p>

          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and utilizing ResuMe, you accept and agree to be bound by the terms and provisions of this agreement.
              If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2>2. Provision of Service</h2>
            <p>
              ResuMe is provided "as is" and without warranty of any kind. We offer this tool to help you build, format, 
              and export professional resumes. We reserve the right to modify, suspend, or discontinue the service at any time 
              without notice.
            </p>
          </section>

          <section>
            <h2>3. User Responsibilities</h2>
            <p>
              You are entirely responsible for the content you generate using ResuMe. You agree not to use the service 
              to generate illegal, harmful, or fraudulent documentation.
            </p>
          </section>

          <section>
            <h2>4. Intellectual Property</h2>
            <p>
              The original software, code, UI/UX designs, and logic underlying ResuMe remain our intellectual property. 
              However, the resume documents (PDFs, Markdown, JSON) you create and export using the tool are entirely yours.
            </p>
          </section>

          <section>
            <h2>5. Limitation of Liability</h2>
            <p>
              In no event shall the creators or maintainers of ResuMe be liable for any direct, indirect, incidental, 
              or consequential damages arising out of the use or inability to use the service, including but not limited 
              to loss of data, employment opportunities, or device malfunction, even if advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2>6. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with generally accepted international commercial laws, 
              without giving effect to any principles of conflicts of law.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
