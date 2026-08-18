import { describe, it, expect } from 'vitest';
import { cleanJobTitle, cleanCompanyName, extractJobDetails } from '../utils/jobExtractor';

describe('jobExtractor', () => {
  describe('cleanJobTitle', () => {
    it('strips French gender markers and contracts', () => {
      expect(cleanJobTitle('Ingénieur(e) Logiciel (H/F)')).toBe('Ingénieur Logiciel');
      expect(cleanJobTitle('Consultant(e) Senior (F/H) - CDI')).toBe('Consultant Senior');
      expect(cleanJobTitle('Développeur.e Full Stack (M/F/D)')).toBe('Développeur Full Stack');
      expect(cleanJobTitle('Responsable Recrutement (H-F)')).toBe('Responsable Recrutement');
    });

    it('strips leading articles like "un", "le poste de"', () => {
      expect(cleanJobTitle('un Développeur React')).toBe('Développeur React');
      expect(cleanJobTitle('au poste de Chef de Projet')).toBe('Chef de Projet');
      expect(cleanJobTitle('le poste de Data Analyst')).toBe('Data Analyst');
    });

    it('title cases ALL CAPS role titles', () => {
      expect(cleanJobTitle('RESPONSABLE MARKETING DIGITAL')).toBe('Responsable Marketing Digital');
    });
  });

  describe('cleanCompanyName', () => {
    it('removes duplicate word repeats', () => {
      expect(cleanCompanyName('PHOTOSOL. PHOTOSOL')).toBe('Photosol');
      expect(cleanCompanyName('GOOGLE GOOGLE')).toBe('Google');
    });

    it('removes surrounding punctuation', () => {
      expect(cleanCompanyName('"Acme Corporation."')).toBe('Acme Corporation');
      expect(cleanCompanyName('- Doctolib -')).toBe('Doctolib');
    });

    it('title-cases ALL CAPS company names', () => {
      expect(cleanCompanyName('AIRBUS')).toBe('Airbus');
    });
  });

  describe('extractJobDetails', () => {
    it('extracts company name and job title from typical French job posting', () => {
      const jd = `
        Entreprise : Michelin
        Intitulé du poste : Lead Developer Full Stack (H/F)
        Description : Nous recherchons un talent pour concevoir nos architectures cloud.
      `;
      const result = extractJobDetails(jd);
      expect(result.companyName).toBe('Michelin');
      expect(result.targetRole).toBe('Lead Developer Full Stack');
    });

    it('extracts company name and job title from English job posting', () => {
      const jd = `
        Company: Stripe
        Job Title: Senior Infrastructure Engineer
        About the role: Build payments for the internet.
      `;
      const result = extractJobDetails(jd);
      expect(result.companyName).toBe('Stripe');
      expect(result.targetRole).toBe('Senior Infrastructure Engineer');
    });

    it('handles empty or short texts gracefully', () => {
      expect(extractJobDetails('')).toEqual({ companyName: '', targetRole: '' });
      expect(extractJobDetails(null)).toEqual({ companyName: '', targetRole: '' });
    });
  });
});
