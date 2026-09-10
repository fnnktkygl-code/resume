// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FollowUpModal from '../components/career/FollowUpModal';
import InterviewPrepModal from '../components/career/InterviewPrepModal';
import UpskillModal from '../components/career/UpskillModal';
import JobApplicationTracker from '../components/career/JobApplicationTracker';
import CareerOpsHub from '../components/career/CareerOpsHub';
import { TranslationContext } from '../utils/TranslationContext';

const mockApp = {
  id: 'app-1',
  jobTitle: 'Senior Full Stack Engineer',
  company: 'TechCorp',
  location: 'Paris, France',
  status: 'applied',
  createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  tailoredResume: { personal: { name: 'Marie Dubois' } },
  coverLetter: 'Cher recruteur...'
};

const mockResume = {
  personal: { name: 'Marie Dubois', tagline: 'Senior Full Stack Engineer' },
  skills: ['React', 'TypeScript', 'Node.js'],
  experience: [
    { company: 'TechCorp', title: 'Senior Engineer', bullets: ['Built scalable system with +40% perf.'] }
  ]
};

describe('CareerOps Extended Suite (Follow-Up, Interview Prep, Upskill)', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation((url, opts) => {
      let body = {};
      try { body = JSON.parse(opts?.body || '{}'); } catch {}
      if (body.action === 'followup') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({
            subject: 'Relance candidature TechCorp',
            body: 'Corps du message de relance.',
            tips: ['Conseil de relance']
          }))
        });
      }
      if (body.action === 'interviewPrep') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({
            summary: 'Briefing entretien',
            starQuestions: [{ id: 'q1', category: 'STAR Behavioral', question: 'STAR Q', starGuide: {} }],
            questionsToAsk: ['Question 1']
          }))
        });
      }
      if (body.action === 'upskill') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({
            readinessScore: 85,
            summary: "Profil adapté avec 85% d'adéquation.",
            skillGaps: [{ skill: 'Docker', priority: 'critical', category: 'DevOps', practicalMiniProject: 'Dockeriser une app' }],
            twoWeekRoadmap: [{ phase: 'Semaine 1', focus: 'Bases Docker', deliverable: 'Dockerfile opérationnel' }]
          }))
        });
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('{}')
      });
    });
  });

  it('renders JobApplicationTracker with new action buttons', () => {
    const onOpenFollowUp = vi.fn();
    const onOpenInterviewPrep = vi.fn();
    const onOpenUpskill = vi.fn();

    render(
      <TranslationContext.Provider value="fr">
        <JobApplicationTracker
          applications={[mockApp]}
          onOpenFollowUp={onOpenFollowUp}
          onOpenInterviewPrep={onOpenInterviewPrep}
          onOpenUpskill={onOpenUpskill}
        />
      </TranslationContext.Provider>
    );

    expect(screen.getByText('Senior Full Stack Engineer')).toBeInTheDocument();
    expect(screen.getByText(/TechCorp/)).toBeInTheDocument();

    // Verify presence of buttons
    const prepBtn = screen.getByTitle(/Pack de questions STAR/i);
    fireEvent.click(prepBtn);
    expect(onOpenInterviewPrep).toHaveBeenCalledWith(mockApp);

    const followUpBtn = screen.getByTitle(/Générer un email de relance ou de remerciement/i);
    fireEvent.click(followUpBtn);
    expect(onOpenFollowUp).toHaveBeenCalledWith(mockApp);

    const upskillBtn = screen.getByTitle(/Matrice de compétences et plan d'apprentissage/i);
    fireEvent.click(upskillBtn);
    expect(onOpenUpskill).toHaveBeenCalledWith(mockApp);
  });

  it('renders FollowUpModal and switches between Follow-Up and Thank You', async () => {
    render(
      <TranslationContext.Provider value="fr">
        <FollowUpModal
          isOpen={true}
          onClose={vi.fn()}
          application={mockApp}
          candidateName="Marie Dubois"
        />
      </TranslationContext.Provider>
    );

    expect(screen.getByText(/Générateur d'Email de Relance & Remerciement/i)).toBeInTheDocument();
    expect(screen.getByText(/Relance Candidature/i)).toBeInTheDocument();
    expect(screen.getByText(/Remerciement Post-Entretien/i)).toBeInTheDocument();

    const generateBtn = screen.getByText(/Générer l'email/i);
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText('Corps du message de relance.')).toBeInTheDocument();
    });
  });

  it('renders InterviewPrepModal with STAR tabs', async () => {
    render(
      <TranslationContext.Provider value="fr">
        <InterviewPrepModal
          isOpen={true}
          onClose={vi.fn()}
          application={mockApp}
          resumeData={mockResume}
        />
      </TranslationContext.Provider>
    );

    expect(screen.getByText(/Préparation d'Entretien IA/i)).toBeInTheDocument();
    expect(screen.getByText(/Questions Comportementales \(STAR\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Questions Techniques & Métier/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Réponses Passerelles/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Simulateur d'Entretien en Direct/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Questions Comportementales \(STAR\)/i)).toBeInTheDocument();
    });
  });

  it('renders UpskillModal with skills gap and roadmap', async () => {
    render(
      <TranslationContext.Provider value="fr">
        <UpskillModal
          isOpen={true}
          onClose={vi.fn()}
          application={mockApp}
          resumeData={mockResume}
        />
      </TranslationContext.Provider>
    );

    expect(screen.getByText(/Matrice de Compétences & Plan d'Apprentissage/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Docker')).toBeInTheDocument();
      expect(screen.getByText(/Bases Docker/i)).toBeInTheDocument();
    });
  });

  it('renders CareerOpsHub command center and switches tabs', async () => {
    render(
      <TranslationContext.Provider value="fr">
        <CareerOpsHub
          isOpen={true}
          onClose={() => {}}
          resumeData={mockResume}
          onApplyTailoredResume={() => {}}
          language="fr"
        />
      </TranslationContext.Provider>
    );

    expect(screen.getByText(/CareerOps — Command Center/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Auto-Pipeline/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Suivi de Candidatures/i)).toBeInTheDocument();

    const trackerTabBtn = screen.getByText(/Suivi de Candidatures/i);
    fireEvent.click(trackerTabBtn);
    expect(screen.getByText(/Pipeline Kanban/i)).toBeInTheDocument();
  });
});
