import { createEmptyCustomSection, createEmptySpacer } from '../utils/constants';

export default function resumeReducer(state = {}, action = {}) {
  if (!action || !action.type) return state;

  switch (action.type) {
    case 'SET_DATA':
      return action.payload || state;

    case 'UPDATE_PERSONAL':
      return {
        ...state,
        personal: action.payload || {}
      };

    case 'UPDATE_HEADINGS':
      return {
        ...state,
        headings: action.payload || {}
      };

    case 'UPDATE_SUMMARY':
      return {
        ...state,
        summary: typeof action.payload === 'string' ? action.payload : (action.payload?.summary || '')
      };

    case 'UPDATE_TARGET_JOB':
    case 'UPDATE_TARGET_JOB_DESCRIPTION':
      return {
        ...state,
        targetJobDescription: typeof action.payload === 'object' && action.payload !== null ? action.payload.description : action.payload
      };

    case 'UPDATE_COVER_LETTER':
      return {
        ...state,
        coverLetter: action.payload
      };

    case 'UPDATE_COVER_LETTER_SETTINGS':
      return {
        ...state,
        coverLetterSettings: {
          ...(state?.coverLetterSettings || {}),
          ...(action.payload || {})
        }
      };

    case 'UPDATE_TARGET_JOB_ANALYSIS':
      return {
        ...state,
        targetJobAnalysis: action.payload
      };

    case 'UPDATE_SKILLS': {
      const nextSkills = action.payload || {};
      let updatedCustomSections = state.customSections;

      if (typeof nextSkills.languages === 'string' && Array.isArray(state.customSections)) {
        const langItems = nextSkills.languages.split(',').map(l => l.trim()).filter(Boolean);
        if (langItems.length > 0) {
          updatedCustomSections = state.customSections.map(sec => {
            if (sec.id === 'custom_langues' || sec.label?.toLowerCase().includes('langue')) {
              return {
                ...sec,
                items: langItems.map((l, i) => ({
                  id: sec.items?.[i]?.id || `lang_${i}_${Date.now()}`,
                  title: l,
                  subtitle: sec.items?.[i]?.subtitle || '',
                  description: sec.items?.[i]?.description || '',
                  date: ''
                }))
              };
            }
            return sec;
          });
        }
      }

      return {
        ...state,
        skills: nextSkills,
        customSections: updatedCustomSections
      };
    }

    case 'UPDATE_EXPERIENCE':
      return {
        ...state,
        experience: Array.isArray(action.payload) ? action.payload : []
      };

    case 'UPDATE_EDUCATION':
      return {
        ...state,
        education: Array.isArray(action.payload) ? action.payload : []
      };

    case 'UPDATE_PROJECTS':
      return {
        ...state,
        projects: Array.isArray(action.payload) ? action.payload : []
      };

    case 'UPDATE_CERTIFICATIONS':
      return {
        ...state,
        certifications: Array.isArray(action.payload) ? action.payload : []
      };

    case 'UPDATE_CUSTOM_SECTIONS': {
      const nextSections = Array.isArray(action.payload) ? action.payload : [];
      const langSec = nextSections.find(sec => sec.id === 'custom_langues' || sec.label?.toLowerCase().includes('langue'));
      let nextSkills = state.skills || {};

      if (langSec && Array.isArray(langSec.items)) {
        const joinedLangs = langSec.items
          .map(item => [item.title, item.subtitle].filter(Boolean).join(' '))
          .filter(Boolean)
          .join(', ');
        if (joinedLangs && joinedLangs !== nextSkills.languages) {
          nextSkills = { ...nextSkills, languages: joinedLangs };
        }
      }

      return {
        ...state,
        skills: nextSkills,
        customSections: nextSections
      };
    }

    case 'UPDATE_LAYOUT':
      return {
        ...state,
        layout: {
          ...(state?.layout || {}),
          ...(action.payload || {})
        }
      };

    case 'REORDER_SECTIONS':
      return {
        ...state,
        sectionOrder: Array.isArray(action.payload) ? action.payload : (state?.sectionOrder || [])
      };

    case 'REMOVE_SECTION': {
      const sectionId = action.payload;
      if (!sectionId) return state;
      const isCustom = typeof sectionId === 'string' && (sectionId.startsWith('custom_') || sectionId.startsWith('spacer_'));
      return {
        ...state,
        sectionOrder: (state?.sectionOrder || []).filter(id => id !== sectionId),
        ...(isCustom && {
          customSections: (state?.customSections || []).filter(s => s?.id !== sectionId)
        })
      };
    }

    case 'ADD_CUSTOM_SECTION': {
      const newSection = createEmptyCustomSection(action.payload || 'New Section');
      return {
        ...state,
        customSections: [...(state?.customSections || []), newSection],
        sectionOrder: [...(state?.sectionOrder || []), newSection.id]
      };
    }

    case 'ADD_SPACER_SECTION': {
      const currentStepId = action.payload?.currentStepId;
      const newSpacer = createEmptySpacer();
      const newOrder = [...(state?.sectionOrder || [])];
      const index = newOrder.indexOf(currentStepId);
      
      if (index !== -1) {
        newOrder.splice(index + 1, 0, newSpacer.id);
      } else {
        newOrder.unshift(newSpacer.id);
      }

      return {
        ...state,
        customSections: [...(state?.customSections || []), newSpacer],
        sectionOrder: newOrder
      };
    }

    case 'ADD_SECTION_SPACER': {
      const { indexInOrder = 0, column } = action.payload || {};
      const newSpacer = createEmptySpacer(column);
      const newOrder = [...(state?.sectionOrder || [])];
      newOrder.splice(Math.max(0, Math.min(indexInOrder, newOrder.length)), 0, newSpacer.id);
      return {
        ...state,
        customSections: [...(state?.customSections || []), newSpacer],
        sectionOrder: newOrder
      };
    }

    case 'UPDATE_SECTION_SPACER': {
      const { spacerId, height } = action.payload || {};
      return {
        ...state,
        customSections: (state?.customSections || []).map(s => 
          s?.id === spacerId ? { ...s, height } : s
        )
      };
    }

    case 'DELETE_SECTION_SPACER': {
      const spacerId = action.payload;
      return {
        ...state,
        sectionOrder: (state?.sectionOrder || []).filter(id => id !== spacerId),
        customSections: (state?.customSections || []).filter(s => s?.id !== spacerId)
      };
    }

    case 'REORDER_ITEMS': {
      const { sectionId, fromIdx, toIdx } = action.payload || {};
      if (!sectionId) return state;
      const next = { ...state };
      let list;
      if (typeof sectionId === 'string' && sectionId.startsWith('custom_')) {
        const customSecs = Array.isArray(next.customSections) ? [...next.customSections] : [];
        const secIndex = customSecs.findIndex(s => s?.id === sectionId);
        if (secIndex === -1) return state;
        list = [...(customSecs[secIndex].items || [])];
        if (fromIdx < 0 || fromIdx >= list.length || toIdx < 0 || toIdx >= list.length) return state;
        const [moved] = list.splice(fromIdx, 1);
        list.splice(toIdx, 0, moved);
        customSecs[secIndex] = { ...customSecs[secIndex], items: list };
        next.customSections = customSecs;
      } else {
        list = [...(next[sectionId] || [])];
        if (fromIdx < 0 || fromIdx >= list.length || toIdx < 0 || toIdx >= list.length) return state;
        const [moved] = list.splice(fromIdx, 1);
        list.splice(toIdx, 0, moved);
        next[sectionId] = list;
      }
      return next;
    }

    case 'DELETE_ITEM': {
      const { sectionId, index } = action.payload || {};
      if (!sectionId || index === undefined) return state;
      const next = { ...state };
      if (typeof sectionId === 'string' && sectionId.startsWith('custom_')) {
        const customSecs = Array.isArray(next.customSections) ? [...next.customSections] : [];
        const secIndex = customSecs.findIndex(s => s?.id === sectionId);
        if (secIndex === -1) return state;
        const items = (customSecs[secIndex].items || []).filter((_, i) => i !== index);
        customSecs[secIndex] = { ...customSecs[secIndex], items };
        next.customSections = customSecs;
      } else {
        next[sectionId] = (next[sectionId] || []).filter((_, i) => i !== index);
      }
      return next;
    }

    case 'UPDATE_ITEM': {
      const { sectionId, index, updatedItem } = action.payload || {};
      if (!sectionId || index === undefined) return state;
      const next = { ...state };
      if (typeof sectionId === 'string' && sectionId.startsWith('custom_')) {
        const customSecs = Array.isArray(next.customSections) ? [...next.customSections] : [];
        const secIndex = customSecs.findIndex(s => s?.id === sectionId);
        if (secIndex === -1) return state;
        const items = [...(customSecs[secIndex].items || [])];
        items[index] = updatedItem;
        customSecs[secIndex] = { ...customSecs[secIndex], items };
        next.customSections = customSecs;
      } else {
        const items = [...(next[sectionId] || [])];
        items[index] = updatedItem;
        next[sectionId] = items;
      }
      return next;
    }

    case 'ADD_ITEM_SPACER': {
      const { sectionId, index = 0 } = action.payload || {};
      if (!sectionId) return state;
      const next = { ...state };
      const newSpacer = {
        id: `item_spacer_${crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`,
        isSpacer: true,
        height: 24
      };
      if (typeof sectionId === 'string' && sectionId.startsWith('custom_')) {
        const customSecs = Array.isArray(next.customSections) ? [...next.customSections] : [];
        const secIndex = customSecs.findIndex(s => s?.id === sectionId);
        if (secIndex === -1) return state;
        const items = [...(customSecs[secIndex].items || [])];
        items.splice(index, 0, newSpacer);
        customSecs[secIndex] = { ...customSecs[secIndex], items };
        next.customSections = customSecs;
      } else {
        const items = [...(next[sectionId] || [])];
        items.splice(index, 0, newSpacer);
        next[sectionId] = items;
      }
      return next;
    }

    default:
      return state;
  }
}
