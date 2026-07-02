import { describe, test, expect } from 'vitest';
import resumeReducer from './resumeReducer';

describe('resumeReducer', () => {
  const initialState = {
    personal: { name: 'Alice', email: 'alice@example.com' },
    headings: { summary: 'Summary' },
    summary: 'Senior Developer',
    skills: { technical: 'React, Node' },
    experience: [
      { id: 'exp_1', company: 'Google', title: 'SWE' },
      { id: 'exp_2', company: 'Meta', title: 'SWE II' }
    ],
    education: [{ id: 'edu_1', institution: 'MIT' }],
    projects: [{ id: 'proj_1', name: 'Resume Builder' }],
    certifications: [{ id: 'cert_1', name: 'AWS Cloud Practitioner' }],
    customSections: [
      {
        id: 'custom_langues',
        label: 'Langues',
        items: [{ id: 'item_langues_1', title: 'English' }]
      }
    ],
    sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'custom_langues']
  };

  test('SET_DATA replaces full state', () => {
    const newState = { personal: { name: 'Bob' } };
    const result = resumeReducer(initialState, { type: 'SET_DATA', payload: newState });
    expect(result).toEqual(newState);
  });

  test('UPDATE_PERSONAL updates personal info', () => {
    const payload = { name: 'Alice Updated', email: 'alice@example.com' };
    const result = resumeReducer(initialState, { type: 'UPDATE_PERSONAL', payload });
    expect(result.personal.name).toBe('Alice Updated');
    expect(result.personal.email).toBe('alice@example.com');
  });

  test('UPDATE_HEADINGS updates headings', () => {
    const payload = { summary: 'Profil' };
    const result = resumeReducer(initialState, { type: 'UPDATE_HEADINGS', payload });
    expect(result.headings.summary).toBe('Profil');
  });

  test('UPDATE_SUMMARY updates summary', () => {
    const result = resumeReducer(initialState, { type: 'UPDATE_SUMMARY', payload: 'New summary text' });
    expect(result.summary).toBe('New summary text');
  });

  test('UPDATE_SKILLS updates skills', () => {
    const payload = { technical: 'React, Vite, Vitest' };
    const result = resumeReducer(initialState, { type: 'UPDATE_SKILLS', payload });
    expect(result.skills.technical).toBe('React, Vite, Vitest');
  });

  test('REORDER_SECTIONS changes sectionOrder', () => {
    const payload = ['personal', 'experience', 'summary'];
    const result = resumeReducer(initialState, { type: 'REORDER_SECTIONS', payload });
    expect(result.sectionOrder).toEqual(payload);
  });

  test('REMOVE_SECTION removes standard section from order', () => {
    const result = resumeReducer(initialState, { type: 'REMOVE_SECTION', payload: 'summary' });
    expect(result.sectionOrder).not.toContain('summary');
  });

  test('REMOVE_SECTION removes custom section and items', () => {
    const result = resumeReducer(initialState, { type: 'REMOVE_SECTION', payload: 'custom_langues' });
    expect(result.sectionOrder).not.toContain('custom_langues');
    expect(result.customSections.find(s => s.id === 'custom_langues')).toBeUndefined();
  });

  test('REORDER_ITEMS reorders items in standard section', () => {
    const payload = { sectionId: 'experience', fromIdx: 0, toIdx: 1 };
    const result = resumeReducer(initialState, { type: 'REORDER_ITEMS', payload });
    expect(result.experience[0].id).toBe('exp_2');
    expect(result.experience[1].id).toBe('exp_1');
  });

  test('DELETE_ITEM removes item in standard section', () => {
    const payload = { sectionId: 'experience', index: 0 };
    const result = resumeReducer(initialState, { type: 'DELETE_ITEM', payload });
    expect(result.experience.length).toBe(1);
    expect(result.experience[0].id).toBe('exp_2');
  });

  test('UPDATE_ITEM updates single item properties', () => {
    const updatedItem = { id: 'exp_1', company: 'Alphabet', title: 'Staff SWE' };
    const payload = { sectionId: 'experience', index: 0, updatedItem };
    const result = resumeReducer(initialState, { type: 'UPDATE_ITEM', payload });
    expect(result.experience[0].company).toBe('Alphabet');
    expect(result.experience[0].title).toBe('Staff SWE');
  });

  test('ADD_ITEM_SPACER inserts a spacer item', () => {
    const payload = { sectionId: 'experience', index: 1 };
    const result = resumeReducer(initialState, { type: 'ADD_ITEM_SPACER', payload });
    expect(result.experience.length).toBe(3);
    expect(result.experience[1].isSpacer).toBe(true);
    expect(result.experience[1].height).toBe(24);
  });
});
