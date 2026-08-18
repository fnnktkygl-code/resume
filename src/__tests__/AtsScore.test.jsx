// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AtsScore from '../components/AtsScore';
import { TranslationContext } from '../utils/TranslationContext';

describe('AtsScore Component', () => {
  afterEach(() => {
    cleanup();
  });

  const sampleData = {
    personal: { name: 'Elena Rostova', title: 'Data Scientist', email: 'elena@example.com', phone: '123', location: 'Lyon' },
    summary: 'Senior data scientist with 6 years experience in machine learning and Python.',
    experience: [
      {
        company: 'AI Labs',
        title: 'Lead ML Engineer',
        startMonth: '01',
        startYear: '2022',
        current: true,
        bullets: ['Deployed NLP pipeline serving 2M users', 'Reduced inferencing cost by 35%']
      }
    ],
    education: [{ institution: 'ENS Lyon', degree: 'M.S. Artificial Intelligence' }],
    skills: { technical: 'Python, PyTorch, SQL, Docker, AWS' },
    projects: [],
    certifications: []
  };

  const renderWithContext = (data = sampleData, dispatch = vi.fn()) => {
    return render(
      <TranslationContext.Provider value="en">
        <AtsScore data={data} dispatch={dispatch} onTriggerAction={vi.fn()} />
      </TranslationContext.Provider>
    );
  };

  it('renders ATS score percentage and status', () => {
    renderWithContext();
    expect(screen.getByText(/ATS Readiness|Score ATS/i)).toBeInTheDocument();
    expect(screen.getByText(/Excellent|Good/i)).toBeInTheDocument();
  });

  it('renders section completion checklist', () => {
    renderWithContext();
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  it('toggles target job description textarea', () => {
    renderWithContext();
    const toggleBtn = screen.getByText(/Paste Job Description for Live Match|Edit Target Job/i);
    fireEvent.click(toggleBtn);

    const textarea = screen.getByPlaceholderText(/Paste job description here/i);
    expect(textarea).toBeInTheDocument();
  });
});
