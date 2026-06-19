import React from 'react';

export function formatSkills(skillsString) {
  if (!skillsString) return skillsString;
  return skillsString.replace(/\*\*([^\*]+)\*\*/g, (match, p1) => {
    return p1.split(',').map(s => `**${s.trim()}**`).join(', ');
  });
}

export function parseMarkdown(text) {
  if (!text) return text;
  if (typeof text !== 'string') return text;
  
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function formatUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  if (/^tel:/i.test(trimmed)) return trimmed;
  if (trimmed.includes('@') && !trimmed.includes('/') && !trimmed.includes('http')) {
    return `mailto:${trimmed}`;
  }
  return `https://${trimmed}`;
}
