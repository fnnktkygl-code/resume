#!/usr/bin/env node

/**
 * 🚀 Master E2E System Audit & Governance Runner
 * 
 * Orchestrates all unit tests, governance benchmarks, and audit harnesses
 * across the Resume & CareerOps platform.
 * 
 * Usage:
 *   node harnesses/run_e2e_audit.mjs
 */

import { execSync } from 'child_process';

console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║        🚀 SUITE D\'AUDIT GLOBAL & GOUVERNANCE MULTI-AGENTS         ║');
console.log('║                     RESUME & BIG CAREEROPS                        ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

const steps = [
  {
    name: '1. Tests Unitaires & Intégration Vitest (26 Suites)',
    command: 'npx vitest run'
  },
  {
    name: '2. Benchmark Gouvernance IA & CareerOps (Anti-Hallucination / Haversine)',
    command: 'node harnesses/test_career_ops_orchestrator.mjs'
  },
  {
    name: '3. Audit Qualité WCAG AAA & Ergonomie Design System',
    command: 'node harnesses/audit_contrast_and_ux.mjs'
  },
  {
    name: '4. Audit de Résilience & Sécurité API Serverless',
    command: 'node harnesses/test_api_resilience.mjs'
  }
];

let allPassed = true;

for (const step of steps) {
  console.log(`\n▶️ EXÉCUTION : ${step.name}...`);
  console.log('───────────────────────────────────────────────────────────────────');
  try {
    execSync(step.command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ [SUCCÈS] ${step.name}`);
  } catch (err) {
    console.error(`❌ [ÉCHEC] ${step.name}`);
    allPassed = false;
    break;
  }
}

console.log('\n═══════════════════════════════════════════════════════════════════');
if (allPassed) {
  console.log('🎉 TOUTES LES VÉRIFICATIONS SONT VALIDÉES À 100% (ZÉRO ERREUR)');
} else {
  console.error('❌ ÉCHEC SUR UNE OU PLUSIEURS ÉTAPES D\'AUDIT');
  process.exit(1);
}
console.log('═══════════════════════════════════════════════════════════════════\n');
