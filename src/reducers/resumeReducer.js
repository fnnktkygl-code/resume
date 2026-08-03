import { createEmptyCustomSection, createEmptySpacer } from '../utils/constants';

export default function resumeReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return action.payload;

    case 'UPDATE_PERSONAL':
      return {
        ...state,
        personal: action.payload
      };

    case 'UPDATE_HEADINGS':
      return {
        ...state,
        headings: action.payload
      };

    case 'UPDATE_SUMMARY':
      return {
        ...state,
        summary: action.payload
      };

    case 'UPDATE_TARGET_JOB':
    case 'UPDATE_TARGET_JOB_DESCRIPTION':
      return {
        ...state,
        targetJobDescription: typeof action.payload === 'object' ? action.payload.description : action.payload
      };

    case 'UPDATE_TARGET_JOB_ANALYSIS':
      return {
        ...state,
        targetJobAnalysis: action.payload
      };

    case 'UPDATE_SKILLS':
      return {
        ...state,
        skills: action.payload
      };

    case 'UPDATE_EXPERIENCE':
      return {
        ...state,
        experience: action.payload
      };

    case 'UPDATE_EDUCATION':
      return {
        ...state,
        education: action.payload
      };

    case 'UPDATE_PROJECTS':
      return {
        ...state,
        projects: action.payload
      };

    case 'UPDATE_CERTIFICATIONS':
      return {
        ...state,
        certifications: action.payload
      };

    case 'UPDATE_CUSTOM_SECTIONS':
      return {
        ...state,
        customSections: action.payload
      };

    case 'UPDATE_LAYOUT':
      return {
        ...state,
        layout: {
          ...(state.layout || {}),
          ...action.payload
        }
      };

    case 'REORDER_SECTIONS':
      return {
        ...state,
        sectionOrder: action.payload
      };

    case 'REMOVE_SECTION': {
      const sectionId = action.payload;
      const isCustom = sectionId.startsWith('custom_') || sectionId.startsWith('spacer_');
      return {
        ...state,
        sectionOrder: state.sectionOrder.filter(id => id !== sectionId),
        ...(isCustom && {
          customSections: (state.customSections || []).filter(s => s.id !== sectionId)
        })
      };
    }

    case 'ADD_CUSTOM_SECTION': {
      const newSection = createEmptyCustomSection(action.payload || 'New Section');
      return {
        ...state,
        customSections: [...(state.customSections || []), newSection],
        sectionOrder: [...state.sectionOrder, newSection.id]
      };
    }

    case 'ADD_SPACER_SECTION': {
      const { currentStepId } = action.payload;
      const newSpacer = createEmptySpacer();
      const newOrder = [...state.sectionOrder];
      const index = newOrder.indexOf(currentStepId);
      
      if (index !== -1) {
        newOrder.splice(index + 1, 0, newSpacer.id);
      } else {
        newOrder.unshift(newSpacer.id);
      }

      return {
        ...state,
        customSections: [...(state.customSections || []), newSpacer],
        sectionOrder: newOrder
      };
    }

    case 'ADD_SECTION_SPACER': {
      const { indexInOrder, column } = action.payload;
      const newSpacer = createEmptySpacer(column);
      const newOrder = [...state.sectionOrder];
      newOrder.splice(indexInOrder, 0, newSpacer.id);
      return {
        ...state,
        customSections: [...(state.customSections || []), newSpacer],
        sectionOrder: newOrder
      };
    }

    case 'UPDATE_SECTION_SPACER': {
      const { spacerId, height } = action.payload;
      return {
        ...state,
        customSections: (state.customSections || []).map(s => 
          s.id === spacerId ? { ...s, height } : s
        )
      };
    }

    case 'DELETE_SECTION_SPACER': {
      const spacerId = action.payload;
      return {
        ...state,
        sectionOrder: state.sectionOrder.filter(id => id !== spacerId),
        customSections: (state.customSections || []).filter(s => s.id !== spacerId)
      };
    }

    case 'REORDER_ITEMS': {
      const { sectionId, fromIdx, toIdx } = action.payload;
      const next = { ...state };
      let list;
      if (sectionId.startsWith('custom_')) {
        const secIndex = next.customSections.findIndex(s => s.id === sectionId);
        if (secIndex === -1) return state;
        list = [...next.customSections[secIndex].items];
        const [moved] = list.splice(fromIdx, 1);
        list.splice(toIdx, 0, moved);
        next.customSections = [...next.customSections];
        next.customSections[secIndex] = { ...next.customSections[secIndex], items: list };
      } else {
        list = [...(next[sectionId] || [])];
        const [moved] = list.splice(fromIdx, 1);
        list.splice(toIdx, 0, moved);
        next[sectionId] = list;
      }
      return next;
    }

    case 'DELETE_ITEM': {
      const { sectionId, index } = action.payload;
      const next = { ...state };
      if (sectionId.startsWith('custom_')) {
        const secIndex = next.customSections.findIndex(s => s.id === sectionId);
        if (secIndex === -1) return state;
        const items = next.customSections[secIndex].items.filter((_, i) => i !== index);
        next.customSections = [...next.customSections];
        next.customSections[secIndex] = { ...next.customSections[secIndex], items };
      } else {
        next[sectionId] = (next[sectionId] || []).filter((_, i) => i !== index);
      }
      return next;
    }

    case 'UPDATE_ITEM': {
      const { sectionId, index, updatedItem } = action.payload;
      const next = { ...state };
      if (sectionId.startsWith('custom_')) {
        const secIndex = next.customSections.findIndex(s => s.id === sectionId);
        if (secIndex === -1) return state;
        const items = [...next.customSections[secIndex].items];
        items[index] = updatedItem;
        next.customSections = [...next.customSections];
        next.customSections[secIndex] = { ...next.customSections[secIndex], items };
      } else {
        const items = [...(next[sectionId] || [])];
        items[index] = updatedItem;
        next[sectionId] = items;
      }
      return next;
    }

    case 'ADD_ITEM_SPACER': {
      const { sectionId, index } = action.payload;
      const next = { ...state };
      const newSpacer = {
        id: `item_spacer_${crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`,
        isSpacer: true,
        height: 24
      };
      if (sectionId.startsWith('custom_')) {
        const secIndex = next.customSections.findIndex(s => s.id === sectionId);
        if (secIndex === -1) return state;
        const items = [...next.customSections[secIndex].items];
        items.splice(index, 0, newSpacer);
        next.customSections = [...next.customSections];
        next.customSections[secIndex] = { ...next.customSections[secIndex], items };
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
