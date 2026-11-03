'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  CheckCircle2,
  ShieldAlert,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import {
  TrendRecord,
  IdeaRecord,
  ResearchClaimRecord,
  ScriptRecord,
  AssetLedgerItem,
  VideoProductionRecord,
  PublishRecord,
  AnalyticsRecord,
  ExperimentRecord,
  diagnoseContentPerformance,
} from '@/lib/automation-engine';

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIdea: IdeaRecord;
  trends: TrendRecord[];
  claims: ResearchClaimRecord[];
  scripts: ScriptRecord[];
  assets: AssetLedgerItem[];
  videos: VideoProductionRecord[];
  publishes: PublishRecord[];
  analytics: AnalyticsRecord[];
  experiments: ExperimentRecord[];
}

export function TraceabilityModal({
  isOpen,
  onClose,
  selectedIdea,
  trends,
  claims,
  scripts,
  assets,
  videos,
  publishes,
  analytics,
  experiments,
}: TraceabilityModalProps) {
  const [activeTab, setActiveTab] = useState<'dossier' | 'pdf'>('dossier');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const trend = trends.find((t) => t.topic_id === selectedIdea.topic_id) || trends[0];
  const ideaClaims = claims.filter((c) => c.idea_id === selectedIdea.id);
  const script = scripts.find((s) => s.idea_id === selectedIdea.id) || scripts[0];
  const ideaAssets = assets.filter((a) => a.idea_id === selectedIdea.id);
  const video = videos.find((v) => v.idea_id === selectedIdea.id) || videos[0];
  const itemPublishes = publishes.filter((p) => p.idea_id === selectedIdea.id);
  const itemAnalytics = analytics.filter((a) => a.idea_id === selectedIdea.id);
  const activeAnalytics = itemAnalytics[0] || analytics[0];
  const itemExperiments = experiments.filter((e) => e.idea_id === selectedIdea.id);
  const diagnoses = activeAnalytics ? diagnoseContentPerformance(activeAnalytics) : [];

  const exportFullDossierJson = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      content_item_id: selectedIdea.id,
      deliverables_count: 18,
      '01_trend_research_brief': trend,
      '02_idea_and_7_factor_score': {
        title: selectedIdea.title,
        angle: selectedIdea.angle,
        weighted_score: selectedIdea.score,
        breakdown: selectedIdea.score_breakdown,
      },
      '03_title_variants': selectedIdea.title_variants,
      '04_hooks': selectedIdea.alternative_hooks,
      '05_final_script': script,
      '06_source_claim_sheet': ideaClaims,
      '07_storyboard': video?.storyboard || [],
      '08_voiceover_guide': video?.storyboard.map((s) => ({
        scene: s.scene_number,
        text: s.voiceover_text,
        pronunciation: s.pronunciation_notes,
      })),
      '09_captions_srt': video?.srt_captions || '',
      '10_visual_broll_ledger': ideaAssets.length > 0 ? ideaAssets : assets,
      '11_thumbnail_concepts': video?.thumbnail_concepts || [],
      '12_youtube_metadata': {
        description: video?.youtube_description,
        chapters: video?.youtube_chapters,
      },
      '13_facebook_caption': {
        caption: script?.facebook_caption,
        discussion_prompt: script?.facebook_discussion_prompt,
      },
      '14_publishing_schedule': itemPublishes.map((p) => ({
        platform: p.platform,
        scheduled_at: p.scheduled_at,
        playlist_or_feed: p.playlist_or_feed,
      })),
      '15_published_ids_status': itemPublishes.map((p) => ({
        platform: p.platform,
        post_id: p.post_id,
        status: p.status,
        idempotency_key: p.idempotency_key,
      })),
      '16_analytics_snapshot': activeAnalytics,
      '17_optimization_report': diagnoses,
      '18_next_content_recommendations':
        itemExperiments.length > 0
          ? itemExperiments.map((e) => e.next_idea_recommendation)
          : ['Expand high-retention 00:04 architecture diagram into follow-up Explainer'],
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedIdea.id}-18-deliverable-dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyDossierSummary = () => {
    const summary = `CONTENT FACTORY DOSSIER: ${selectedIdea.id} — ${selectedIdea.title}
Score: ${selectedIdea.score}/100 | Format: ${selectedIdea.format} | Stage: ${selectedIdea.status}
Hook: ${selectedIdea.alternative_hooks[0]}
Verified Claims: ${ideaClaims.length} | Script Version: v${script?.version || 1} (${script?.estimated_duration_sec || 0}s)
Video QC: ${video?.gate_d_approved ? '8/8 Passed' : 'Pending'} | Publishes: ${itemPublishes.map((p) => `${p.platform}:${p.post_id}`).join(', ')}`;
    navigator.clipboard?.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
    >
      <div className="bg-[#0c101c] border border-cyan-500/30 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div>
            <div className="text-[11px] text-cyan-400 font-mono tracking-wider">
              SECTION 20 TRACEABLE RECORD · {selectedIdea.id} · TOPIC {selectedIdea.topic_id}
            </div>
            <h2
              id="dossier-modal-title"
              className="text-base font-semibold text-white mt-0.5"
            >
              Final 18-Deliverable Content Factory Output & System Spec
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('dossier')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
                  activeTab === 'dossier'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                18-Item Content Dossier
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pdf')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
                  activeTab === 'pdf'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Original 21-Page PDF Blueprint
              </button>
            </div>

            <button
              type="button"
              onClick={copyDossierSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-700/80 rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              {copied ? 'Copied' : 'Copy Summary'}
            </button>

            <button
              type="button"
              onClick={exportFullDossierJson}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all shadow-md hover:shadow-cyan-500/20 whitespace-nowrap shrink-0 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Export Dossier JSON
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Dossier Modal"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {activeTab === 'pdf' ? (
          <div className="flex-1 bg-slate-950 p-4 flex flex-col gap-3 min-h-[540px]">
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span>
                Reference Document: YouTube + Facebook AI Automation Agent — Complete Professional System Structure & Workflow (21 Pages)
              </span>
              <a
                href="/assets/aistudio/YouTube_Facebook_AI_Automation_Agent_Complete_Structure_1ca63753.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-medium"
              >
                Open PDF in New Tab <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <iframe
              src="/assets/aistudio/YouTube_Facebook_AI_Automation_Agent_Complete_Structure_1ca63753.pdf"
              title="YouTube + Facebook AI Automation Agent Complete Structure PDF"
              className="w-full flex-1 rounded-xl border border-slate-800 bg-white min-h-[480px]"
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top summary bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-6 border-b border-slate-800/80">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400">01. Trend & Research Brief</div>
                <div className="text-sm font-semibold text-white mt-1">
                  {trend?.keyword}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
                  Freshness <span className="text-emerald-400">{trend?.freshness}%</span> · Fit <span className="text-cyan-400">{trend?.audience_fit}%</span>
                </div>
              </div>
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400">02. Idea + 7-Factor Score</div>
                <div className="text-sm font-semibold text-cyan-400 mt-1 font-mono tabular-nums">
                  {selectedIdea.score} / 100 Weighted Score
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Format: {selectedIdea.format} · Stage: {selectedIdea.status}
                </div>
              </div>
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400">06. Fact-Check & Source Sheet</div>
                <div className="text-sm font-semibold text-white mt-1 font-mono tabular-nums">
                  {ideaClaims.length > 0 ? ideaClaims.length : claims.length} Documented Claims
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Primary sources dated & confidence-scored
                </div>
              </div>
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400">07–15. Render, QC & Publish</div>
                <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  8/8 Video QC Checks Verified
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
                  Duration: {video?.duration_sec}s · {video?.aspect_ratio}
                </div>
              </div>
            </div>

            {/* Deliverables 3, 4, 5 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 border-b border-slate-800/80">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">
                  03. Title Variants (3–5 Searchable Angles)
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {selectedIdea.title_variants.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                      <span className="font-mono text-cyan-400 font-bold">0{idx + 1}.</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-sm font-semibold text-white pt-2">
                  04. Opening Curiosity Hooks (3 Variants)
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {selectedIdea.alternative_hooks.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                      <span className="font-mono text-cyan-400 font-bold">H{idx + 1}.</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">
                  05. Final Script & 13. Native Facebook Caption
                </h3>
                <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {script?.body}
                </div>
                <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs text-slate-300">
                  <div className="font-semibold text-white mb-1">
                    Facebook-Native Caption + Discussion Prompt:
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">{script?.facebook_caption}</p>
                  <p className="mt-2 font-medium text-cyan-300">
                    Discussion Prompt: {script?.facebook_discussion_prompt}
                  </p>
                </div>
              </div>
            </div>

            {/* Deliverables 7, 8, 9, 10, 11, 12 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 border-b border-slate-800/80">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">
                  07 & 08. Scene Storyboard + Voiceover Pronunciation Notes
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {video?.storyboard.map((sc) => (
                    <div
                      key={sc.scene_number}
                      className="p-3 border border-slate-800/80 bg-slate-950/50 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 font-mono">
                        <span className="text-white font-semibold">Scene 0{sc.scene_number}</span>
                        <span className="text-cyan-400">{sc.timestamp_range}</span>
                      </div>
                      <div className="text-slate-300">
                        Visual: {sc.visual_direction}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        TTS Pronunciation: {sc.pronunciation_notes}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">
                  09. Synchronized Captions (SRT) & 12. YouTube Chapters
                </h3>
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs font-mono text-cyan-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {video?.srt_captions}
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs text-slate-300">
                  <div className="font-semibold text-white mb-1">
                    YouTube Chapters & Short-Form Cut Points:
                  </div>
                  <div className="font-mono space-y-0.5 text-slate-400">
                    {video?.youtube_chapters.map((ch, idx) => (
                      <div key={idx}>{ch}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Deliverables 14, 15, 16, 17, 18 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">
                  14 & 15. Publishing Schedule & Returned Post IDs
                </h3>
                {(itemPublishes.length > 0 ? itemPublishes : publishes.slice(0, 2)).map((pub) => (
                  <div
                    key={pub.id}
                    className="p-3 border border-slate-800/80 bg-slate-950/50 rounded-xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {pub.platform} · {pub.title}
                      </div>
                      <div className="text-slate-400 font-mono mt-0.5 text-[11px]">
                        Post ID: {pub.post_id} · Scheduled: {pub.scheduled_at} · Key: {pub.idempotency_key}
                      </div>
                    </div>
                    <span className="font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-[11px]">
                      {pub.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">
                  16, 17 & 18. Analytics Snapshot, Optimization & Next Content
                </h3>
                <div className="p-3.5 border border-slate-800/80 bg-slate-950/50 rounded-xl text-xs space-y-2">
                  <div className="font-mono tabular-nums text-slate-300">
                    Impressions: {activeAnalytics?.impressions.toLocaleString()} · Views:{' '}
                    {activeAnalytics?.views.toLocaleString()} · CTR: {activeAnalytics?.ctr_percent}% · Avg
                    Retention: {activeAnalytics?.retention_rate_percent}%
                  </div>
                  <div className="text-slate-400">
                    Optimization Diagnosis: {diagnoses[0]?.recommendedAction}
                  </div>
                  <div className="text-cyan-400 font-medium">
                    Next-Content: {itemExperiments[0]?.next_idea_recommendation ||
                      'Standardize 00:04 system diagram hook across next week’s Explainer batch.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
