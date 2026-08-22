#!/usr/bin/env node

/**
 * 🎯 CareerOps & Multi-Agent Governance Benchmark Harness
 * 
 * Tests:
 * 1. Geodesic distance calculations (Haversine formula)
 * 2. ATS Matcher accuracy & Skill Gap analysis
 * 3. Anti-Hallucination & Anti-Sycophancy in CV Tailoring
 * 4. 1-Click Pipeline Batch Execution
 * 
 * Usage:
 *   node harnesses/test_career_ops_orchestrator.mjs
 */

import { calculateHaversineDistance, resolveLocationCoordinates, matchResumeWithJob } from '../src/utils/careerOpsMatcher.js';

console.log('═══════════════════════════════════════════════════════════════════');
console.log('🎯 HARNAIS DE BENCHMARK CAREEROPS & GOUVERNANCE IA');
console.log('═══════════════════════════════════════════════════════════════════\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ ÉCHEC : ${message}`);
    failedTests++;
  }
}

async function runCareerOpsGovernanceTests() {
  // 1. Test Geodesic Haversine Calculation (Paris -> Lyon)
  console.log('1️⃣ Test Géodésique Haversine : Paris -> Lyon (~390-410 km)...');
  const parisCoord = resolveLocationCoordinates('Paris');
  const lyonCoord = resolveLocationCoordinates('Lyon');

  assert(parisCoord && parisCoord.lat === 48.8566, 'Coordonnées de Paris résolues correctement');
  assert(lyonCoord && lyonCoord.lat === 45.7640, 'Coordonnées de Lyon résolues correctement');

  const distance = calculateHaversineDistance(parisCoord.lat, parisCoord.lng, lyonCoord.lat, lyonCoord.lng);
  assert(distance >= 385 && distance <= 410, `Distance calculée conforme : ${distance} km`);

  // 2. Test ATS Matching Engine
  console.log('\n2️⃣ Test ATS Matcher & Détection des Écarts de Compétences (Skill Gap)...');
  const sampleResume = {
    personal: {
      name: 'Claire Dupont',
      tagline: 'Développeuse Frontend React Senior',
      location: 'Paris'
    },
    skills: ['React', 'TypeScript', 'CSS', 'Jest'],
    experiences: [
      {
        role: 'Ingénieure Frontend',
        company: 'VeloceTech',
        bulletPoints: ['Développement d\'une SPA React haute performance.']
      }
    ]
  };

  const sampleJob = {
    title: 'Lead Frontend React / TypeScript',
    company: 'Doctolib',
    location: 'Paris',
    skills: ['React', 'TypeScript', 'GraphQL', 'Docker', 'Kubernetes'],
    description: 'Architecture frontend et design system.'
  };

  const match = matchResumeWithJob(sampleResume, sampleJob, { location: 'Paris', radiusKm: 30 });
  assert(match.score >= 50 && match.score <= 95, `Score ATS calculé dans la plage attendue (${match.score}%)`);
  assert(match.matchedSkills.includes('React'), 'Compétence React bien détectée comme acquise');
  assert(match.matchedSkills.includes('TypeScript'), 'Compétence TypeScript bien détectée comme acquise');
  assert(match.missingSkills.includes('Docker'), 'Docker correctement identifié dans les compétences manquantes');
  assert(match.locationMatch === true, 'Correspondance de localisation validée');

  // 3. Test Anti-Sycophancy & Anti-Hallucination
  console.log('\n3️⃣ Test Anti-Psychophanie : Détection d\'incompatibilité sur profil non-aligné...');
  const juniorChefResume = {
    personal: {
      name: 'Marc Lefevre',
      tagline: 'Chef Cuisinier / Restauration',
      location: 'Marseille'
    },
    skills: ['Cuisine', 'Pâtisserie', 'HACCP'],
    experiences: []
  };

  const quantumComputingJob = {
    title: 'Chercheur en Physique Quantique & Qiskit',
    company: 'CERN / CNRS',
    location: 'Genève',
    skills: ['Physique Quantique', 'Python', 'Qiskit', 'Mathématiques'],
    description: 'Recherche fondamentale sur les processeurs quantiques supraconducteurs.'
  };

  const incompatibleMatch = matchResumeWithJob(juniorChefResume, quantumComputingJob, { location: 'Marseille', radiusKm: 50 });
  assert(incompatibleMatch.score < 50, `Score réaliste et honnête attribué pour un profil non-aligné (${incompatibleMatch.score}% < 50%)`);
  assert(incompatibleMatch.matchedSkills.length === 0, 'Zéro compétence imaginaire inventée (Radical Truth validée)');

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log(`🏁 BILAN GOUVERNANCE CAREEROPS : ${passedTests} réussis, ${failedTests} échoués`);
  console.log('═══════════════════════════════════════════════════════════════════');

  if (failedTests > 0) process.exit(1);
}

runCareerOpsGovernanceTests().catch(err => {
  console.error('Erreur critique :', err);
  process.exit(1);
});
