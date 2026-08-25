// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../test/setup';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import PersonalStep from '../components/steps/PersonalStep';
import SummaryStep from '../components/steps/SummaryStep';
import ExperienceStep from '../components/steps/ExperienceStep';
import EducationStep from '../components/steps/EducationStep';
import SkillsStep from '../components/steps/SkillsStep';
import ProjectsStep from '../components/steps/ProjectsStep';
import CertificationsStep from '../components/steps/CertificationsStep';
import CustomStep from '../components/steps/CustomStep';
import SpacerStep from '../components/steps/SpacerStep';
import { TranslationContext } from '../utils/TranslationContext';

describe('Form Step Components', () => {
  afterEach(() => {
    cleanup();
  });

  const renderStep = (component) => {
    return render(
      <TranslationContext.Provider value="en">
        {component}
      </TranslationContext.Provider>
    );
  };

  describe('PersonalStep', () => {
    it('renders personal inputs and triggers onChange', () => {
      const personal = { name: 'Arthur Dent', tagline: 'Traveler', email: 'arthur@galaxy.org', phone: '42' };
      const onChange = vi.fn();
      renderStep(<PersonalStep data={personal} headings={{}} onChange={onChange} />);

      expect(screen.getByDisplayValue('Arthur Dent')).toBeInTheDocument();
      expect(screen.getByText('Traveler')).toBeInTheDocument();

      const nameInput = screen.getByDisplayValue('Arthur Dent');
      fireEvent.change(nameInput, { target: { value: 'Arthur Philip Dent' } });
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'Arthur Philip Dent' }));
    });
  });

  describe('SummaryStep', () => {
    it('renders summary textarea and handles text input', () => {
      const summary = 'Experienced hitchhiker across the galaxy.';
      const onChange = vi.fn();
      renderStep(<SummaryStep data={summary} headings={{}} onChange={onChange} />);

      expect(screen.getByText(/Profil & Résumé|Professional Summary|Summary/i)).toBeInTheDocument();
      expect(screen.getByText(summary)).toBeInTheDocument();
    });
  });

  describe('ExperienceStep', () => {
    it('renders experience list and allows adding a new position', () => {
      const experience = [
        {
          id: 'exp-1',
          company: 'Sirius Cybernetics',
          title: 'Quality Inspector',
          startMonth: '01',
          startYear: '2020',
          current: true,
          bullets: ['Tested robotic doors']
        }
      ];
      const onChange = vi.fn();
      renderStep(<ExperienceStep data={experience} headings={{}} onChange={onChange} onAIAssist={vi.fn()} />);

      expect(screen.getByDisplayValue('Sirius Cybernetics')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Quality Inspector')).toBeInTheDocument();

      const addBtn = screen.getByText(/\+ Add another position|\+ Add Position|\+ Add Experience/i);
      fireEvent.click(addBtn);
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('EducationStep', () => {
    it('renders education items and allows adding degrees', () => {
      const education = [
        {
          id: 'edu-1',
          institution: 'University of Maximegalon',
          degree: 'B.S.',
          field: 'Cosmology',
          startYear: '2015',
          endYear: '2019'
        }
      ];
      const onChange = vi.fn();
      renderStep(<EducationStep data={education} headings={{}} onChange={onChange} />);

      expect(screen.getByDisplayValue('University of Maximegalon')).toBeInTheDocument();
      const addBtn = screen.getByText(/\+ Add Education|\+ Add another education/i);
      fireEvent.click(addBtn);
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('SkillsStep', () => {
    it('renders technical, soft, and language skill inputs', () => {
      const skills = { technical: 'Python, Rust', soft: 'Calm under pressure', languages: 'Galactic Basic' };
      const onChange = vi.fn();
      renderStep(<SkillsStep data={skills} headings={{}} onChange={onChange} />);

      expect(screen.getByText(/Technical Skills|Technical:/i)).toBeInTheDocument();
      expect(screen.getByText(/Soft Skills|Interpersonal:/i)).toBeInTheDocument();
      expect(screen.getByText(/Languages/i)).toBeInTheDocument();
    });

    it('correctly parses semicolon-separated skills into distinct editable chips', () => {
      const skills = { technical: 'HVAC (CVC); Electrical Systems (CFO/CFA); VRD; Project Management', soft: '', languages: '' };
      const onChange = vi.fn();
      renderStep(<SkillsStep data={skills} headings={{}} onChange={onChange} />);

      expect(screen.getByText('HVAC (CVC)')).toBeInTheDocument();
      expect(screen.getByText('Electrical Systems (CFO/CFA)')).toBeInTheDocument();
      expect(screen.getByText('VRD')).toBeInTheDocument();
      expect(screen.getByText('Project Management')).toBeInTheDocument();
    });
  });

  describe('ProjectsStep', () => {
    it('renders project cards and handles adding projects', () => {
      const projects = [
        { id: 'p1', name: 'Heart of Gold Ship', techStack: 'Infinite Improbability Drive', description: 'Faster than light vessel', highlights: [] }
      ];
      const onChange = vi.fn();
      renderStep(<ProjectsStep data={projects} headings={{}} onChange={onChange} />);

      expect(screen.getByDisplayValue('Heart of Gold Ship')).toBeInTheDocument();
      const addBtn = screen.getByText(/\+ Add another project|\+ Add Project/i);
      fireEvent.click(addBtn);
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('CertificationsStep', () => {
    it('renders certifications and handles adding certificates', () => {
      const certifications = [
        { id: 'c1', name: 'Towel Handling Level 3', issuer: 'Sub-Etha Security', date: '2023', credentialUrl: '' }
      ];
      const onChange = vi.fn();
      renderStep(<CertificationsStep data={certifications} headings={{}} onChange={onChange} />);

      expect(screen.getByDisplayValue('Towel Handling Level 3')).toBeInTheDocument();
      const addBtn = screen.getByText(/\+ Add Certification|\+ Add another certification/i);
      fireEvent.click(addBtn);
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('CustomStep', () => {
    it('renders custom section and allows title editing and item creation', () => {
      const section = {
        id: 'custom_1',
        label: 'Publications & Patents',
        items: [{ id: 'i1', title: 'Guide to Space', subtitle: 'Megadodo Publications', date: '2024', description: 'Best seller' }]
      };
      const onChange = vi.fn();
      renderStep(<CustomStep section={section} onChange={onChange} onDelete={vi.fn()} />);

      expect(screen.getByDisplayValue('Publications & Patents')).toBeInTheDocument();
      expect(screen.getByText('Guide to Space')).toBeInTheDocument();
    });
  });

  describe('SpacerStep', () => {
    it('renders spacer height slider and delete button', () => {
      const spacer = { id: 'sp1', height: 24 };
      const onChange = vi.fn();
      const onDelete = vi.fn();
      renderStep(<SpacerStep data={spacer} onChange={onChange} onDelete={onDelete} />);

      expect(screen.getByText('Spacer Height')).toBeInTheDocument();
      expect(screen.getByText('24px')).toBeInTheDocument();

      const deleteBtn = screen.getByText(/Delete Spacer/i);
      fireEvent.click(deleteBtn);
      expect(onDelete).toHaveBeenCalled();
    });
  });
});
