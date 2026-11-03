import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWeightedIdeaScore,
  evaluateIdeaRiskFlags,
  evaluateResearchVerificationGate,
  estimateScriptDurationSeconds,
  buildStructuredScriptFromClaims,
  evaluateVideoAssemblyQC,
  verifyPublishingAuthorization,
  diagnoseContentPerformance,
  classifyAndTriageComment,
  buildProductionPackageForIdea,
  simulateIsolatedAgentRun,
  MODULAR_AGENT_SPECS,
} from './automation-engine';

test('7-factor weighted Idea Scoring math computes exact rubric weights', () => {
  const perfect = calculateWeightedIdeaScore({
    audienceDemand: 100, // 25%
    freshness: 100, // 15%
    contentGap: 100, // 15%
    hookPotential: 100, // 15%
    feasibility: 100, // 10%
    discoveryFit: 100, // 10%
    originalityRisk: 100, // 10%
  });
  assert.equal(perfect, 100);

  const mixed = calculateWeightedIdeaScore({
    audienceDemand: 90, // 22.5
    freshness: 80, // 12.0
    contentGap: 80, // 12.0
    hookPotential: 80, // 12.0
    feasibility: 70, // 7.0
    discoveryFit: 70, // 7.0
    originalityRisk: 75, // 7.5
  });
  assert.equal(mixed, 80);
});

test('evaluateIdeaRiskFlags flags low originality or high topic risk', () => {
  const lowRisk = evaluateIdeaRiskFlags(
    {
      audienceDemand: 88,
      freshness: 84,
      contentGap: 80,
      hookPotential: 86,
      feasibility: 82,
      discoveryFit: 80,
      originalityRisk: 85,
    },
    'low'
  );
  assert.equal(lowRisk.riskLevel, 'low');
  assert.equal(lowRisk.flags.length, 0);

  const highRisk = evaluateIdeaRiskFlags(
    {
      audienceDemand: 85,
      freshness: 90,
      contentGap: 75,
      hookPotential: 80,
      feasibility: 50,
      discoveryFit: 70,
      originalityRisk: 45,
    },
    'high'
  );
  assert.equal(highRisk.riskLevel, 'high');
  assert.equal(highRisk.flags.length, 3);
});

test('Research & Fact-Checking Gate blocks unsupported or conflicting claims', () => {
  const blockedResult = evaluateResearchVerificationGate(
    [
      {
        id: 'c1',
        idea_id: 'i1',
        topic: 'AI Agents',
        claim: 'Verified benchmark result',
        source: 'Official Paper',
        source_url: 'https://example.org/paper',
        is_primary_source: true,
        date: '2026-10-25',
        confidence: 96,
        script_usage: 'Context section',
        verification_status: 'verified',
      },
      {
        id: 'c2',
        idea_id: 'i1',
        topic: 'AI Agents',
        claim: 'Unverified 1000x rumor',
        source: 'Anonymous blog',
        source_url: 'https://example.org/rumor',
        is_primary_source: false,
        date: '2026-10-26',
        confidence: 20,
        script_usage: 'None',
        verification_status: 'blocked_unsupported',
      },
    ],
    true
  );
  assert.equal(blockedResult.canProceedToScript, false);
  assert.equal(blockedResult.verifiedRatio, 50);
  assert.ok(blockedResult.blockingReasons[0].includes('Blocked unsupported'));

  const cleanResult = evaluateResearchVerificationGate(
    [
      {
        id: 'c1',
        idea_id: 'i1',
        topic: 'AI Agents',
        claim: 'Verified benchmark result',
        source: 'Official Paper',
        source_url: 'https://example.org/paper',
        is_primary_source: true,
        date: '2026-10-25',
        confidence: 96,
        script_usage: 'Context section',
        verification_status: 'verified',
      },
    ],
    true
  );
  assert.equal(cleanResult.canProceedToScript, true);
  assert.equal(cleanResult.verifiedRatio, 100);
});

test('Scriptwriting Engine builds framework sections and estimates duration', () => {
  const durationSec = estimateScriptDurationSeconds(new Array(150).fill('word').join(' '), 150);
  assert.equal(durationSec, 60);

  const generated = buildStructuredScriptFromClaims({
    idea: {
      id: 'idea-1',
      topic_id: 'trend-1',
      title: 'Autonomous Video Pipelines in 2026',
      angle: 'How modular verification prevents AI hallucination in media workflows',
      score: 88.5,
      score_breakdown: {
        audienceDemand: 92,
        freshness: 90,
        contentGap: 86,
        hookPotential: 88,
        feasibility: 85,
        discoveryFit: 84,
        originalityRisk: 88,
      },
      format: 'Explainer',
      status: 'Script',
      selected_reason: 'High audience demand and clear content gap',
      alternative_hooks: ['Most automated channels fail at step 4 — here is the fix.'],
      title_variants: ['Autonomous Video Pipelines in 2026'],
      target_audience: 'Technical creators and media ops teams',
      research_questions: ['What is the failure rate of single-prompt scripts?'],
      risk_flags: [],
      risk_level: 'low',
      created_at: '2026-11-01',
    },
    claims: [],
    framework: 'Explainer',
    speakingSpeedWpm: 150,
    targetDurationSec: 180,
    language: 'English',
    tone: 'Analytical & Direct',
    readingLevel: 'Grade 8 — Accessible Technical',
    ctaStyle: 'Comment Question Prompt',
  });

  assert.equal(generated.sections.length, 5); // Problem -> Cause -> Evidence -> Solution -> Takeaway
  assert.equal(generated.sections[0].label, 'Problem');
  assert.equal(generated.sections[4].label, 'Takeaway');
});

test('Video Assembly 8-point QC fails when asset license is Pending Verification', () => {
  const qcFailLicense = evaluateVideoAssemblyQC(
    {
      duration_sec: 420,
      requested_min_sec: 360,
      requested_max_sec: 480,
      qc_checklist: {
        audio_present_understandable: true,
        captions_synchronized: true,
        no_missing_media: true,
        correct_aspect_ratio: true,
        thumbnail_title_accurate: true,
        copyright_license_resolved: true,
        no_private_information: true,
        duration_within_range: true,
      },
    },
    [
      {
        id: 'a-pending',
        idea_id: 'i1',
        type: 'Music Track',
        title: 'Unverified track',
        source: 'Unknown',
        license_type: 'Unknown',
        license_status: 'Pending Verification',
        file_url: '/media/track.mp3',
      },
    ]
  );
  assert.equal(qcFailLicense.passedAllChecks, false);
  assert.equal(qcFailLicense.scorePercent, 88);
});

test('Publishing Guard enforces Kill Switch, OAuth, Gate D/E, and Duplicate Idempotency', () => {
  const killSwitchBlocked = verifyPublishingAuthorization({
    globalKillSwitchActive: true,
    oauthConnected: true,
    qcPassed: true,
    gateDApproved: true,
    gateEMode: 'Auto for Low-Risk',
    gateEExplicitlyApproved: false,
    contentRiskLevel: 'low',
    idempotencyKey: 'pub-key-101',
    existingIdempotencyKeys: [],
  });
  assert.equal(killSwitchBlocked.allowed, false);
  assert.equal(killSwitchBlocked.status, 'Blocked by Kill Switch');

  const oauthDisconnected = verifyPublishingAuthorization({
    globalKillSwitchActive: false,
    oauthConnected: false,
    qcPassed: true,
    gateDApproved: true,
    gateEMode: 'Auto for Low-Risk',
    gateEExplicitlyApproved: true,
    contentRiskLevel: 'low',
    idempotencyKey: 'pub-key-102',
    existingIdempotencyKeys: [],
  });
  assert.equal(oauthDisconnected.allowed, false);
  assert.equal(oauthDisconnected.status, 'Failed');

  const duplicateBlocked = verifyPublishingAuthorization({
    globalKillSwitchActive: false,
    oauthConnected: true,
    qcPassed: true,
    gateDApproved: true,
    gateEMode: 'Auto for Low-Risk',
    gateEExplicitlyApproved: true,
    contentRiskLevel: 'low',
    idempotencyKey: 'pub-key-101',
    existingIdempotencyKeys: ['pub-key-101'],
  });
  assert.equal(duplicateBlocked.allowed, false);
  assert.ok(duplicateBlocked.reason.includes('Duplicate-post protection'));
});

test('Analytics 6-Signal Optimizer diagnoses Packaging, Retention, Engagement, Audience, Traffic, Topics', () => {
  const diag = diagnoseContentPerformance({
    id: 'ANL-1',
    publish_id: 'PUB-1',
    idea_id: 'IDEA-1',
    platform: 'YouTube',
    post_id: 'yt_123',
    date: '2026-11-01',
    impressions: 100000,
    views: 25000,
    ctr_percent: 4.1, // below 4.5 critical
    avg_view_duration_sec: 120,
    retention_rate_percent: 60,
    retention_drop_note: 'Steady hold',
    likes: 1200,
    comments_count: 95,
    shares: 210,
    traffic_sources: { search: 30, suggested: 45, external: 10, browse: 15 },
    audience_split: { new_viewers: 40, casual_viewers: 25, regular_viewers: 35 },
  });
  assert.equal(diag.length, 6);
  assert.equal(diag[0].signal, 'Packaging');
  assert.equal(diag[0].status, 'Critical Drop');
  assert.equal(diag[1].signal, 'Retention');
  assert.equal(diag[1].status, 'Optimal');
});

test('buildProductionPackageForIdea and simulateIsolatedAgentRun generate valid production & agent records', () => {
  const sampleIdea = {
    id: 'IDEA-999',
    topic_id: 'TRD-999',
    title: 'Short-Form Retention Diagrams',
    angle: 'Visualizing system architecture in 60 seconds',
    score: 90,
    score_breakdown: {
      audienceDemand: 90,
      freshness: 90,
      contentGap: 90,
      hookPotential: 90,
      feasibility: 90,
      discoveryFit: 90,
      originalityRisk: 90,
    },
    format: 'Short-form' as const,
    status: 'Approved' as const,
    selected_reason: 'High hook potential',
    alternative_hooks: ['Hook 1'],
    title_variants: ['Title 1', 'Title 2', 'Title 3'],
    target_audience: 'Creators',
    research_questions: ['Q1'],
    risk_flags: [],
    risk_level: 'low' as const,
    created_at: '2026-11-01',
  };

  const pkg = buildProductionPackageForIdea(sampleIdea);
  assert.equal(pkg.video.aspect_ratio, '9:16');
  assert.equal(pkg.video.thumbnail_concepts.length, 3);
  assert.equal(pkg.assets.length, 3);

  const agentRun = simulateIsolatedAgentRun('fact_checker', sampleIdea);
  assert.equal(agentRun.agent_id, 'fact_checker');
  assert.equal(agentRun.target_content_item, 'IDEA-999');
  assert.equal(MODULAR_AGENT_SPECS.length, 12);
});

test('Community Comment Agent classifies and escalates sensitive topics', () => {
  const legal = classifyAndTriageComment('Can you give me legal advice on a copyright strike lawsuit?');
  assert.equal(legal.category, 'safety_issue');
  assert.equal(legal.requiresEscalation, true);

  const question = classifyAndTriageComment('How do you configure FFmpeg subtitle burn-in timecodes?');
  assert.equal(question.category, 'question');
  assert.equal(question.requiresEscalation, false);
});
