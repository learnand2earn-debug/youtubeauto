'use client';

import React, { useState } from 'react';
import {
  Calendar,
  ShieldAlert,
  CheckCircle2,
  FlaskConical,
  Power,
  Sparkles,
  Play,
} from 'lucide-react';
import {
  ChannelRecord,
  IdeaRecord,
  VideoProductionRecord,
  PublishRecord,
  AnalyticsRecord,
  ExperimentRecord,
  CommentRecord,
  ApprovalGateConfig,
  AuditLogEntry,
  MODULAR_AGENT_SPECS,
  diagnoseContentPerformance,
  simulateIsolatedAgentRun,
} from '@/lib/automation-engine';

// ============================================================================
// MODULE 8 & 9: YOUTUBE + FACEBOOK PUBLISHING CALENDAR (PDF Page 9 & 10)
// ============================================================================
interface PublishingCalendarViewProps {
  channels: ChannelRecord[];
  onToggleChannelOAuth: (channelId: string) => void;
  publishes: PublishRecord[];
  ideas: IdeaRecord[];
  videos: VideoProductionRecord[];
  globalKillSwitch: boolean;
  onScheduleNewPost: (params: {
    ideaId: string;
    platform: 'YouTube' | 'Facebook';
    scheduledAt: string;
    title: string;
    playlistOrFeed: string;
  }) => { allowed: boolean; reason: string };
  onPublishNow: (publishId: string) => void;
}

export function PublishingCalendarView({
  channels,
  onToggleChannelOAuth,
  publishes,
  ideas,
  globalKillSwitch,
  onScheduleNewPost,
  onPublishNow,
}: PublishingCalendarViewProps) {
  const [selectedIdeaId, setSelectedIdeaId] = useState(ideas[0]?.id || 'IDEA-901');
  const [platform, setPlatform] = useState<'YouTube' | 'Facebook'>('YouTube');
  const [scheduledAt, setScheduledAt] = useState('2026-11-03 16:00 PKT');
  const [customTitle, setCustomTitle] = useState('');
  const [playlistOrFeed] = useState('AI Systems Engineering Series');
  const [scheduleNotice, setScheduleNotice] = useState<{ allowed: boolean; text: string } | null>(
    null
  );

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idea = ideas.find((i) => i.id === selectedIdeaId) || ideas[0];
    const result = onScheduleNewPost({
      ideaId: idea.id,
      platform,
      scheduledAt,
      title: customTitle.trim() || idea.title,
      playlistOrFeed,
    });
    setCustomTitle('');
    setScheduleNotice({
      allowed: result.allowed,
      text: result.reason,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Authorized OAuth Channels Status with Least-Privilege Revoke/Reconnect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between gap-4 backdrop-blur-xl shadow-xl hover:border-slate-700 transition-all"
          >
            <div>
              <div className="text-[11px] font-mono text-cyan-400/90 tracking-wider">
                AUTHORIZED {ch.platform.toUpperCase()} API · {ch.timezone}
              </div>
              <h3 className="text-sm font-semibold text-white mt-1">
                {ch.name} <span className="text-slate-400 text-xs font-normal">({ch.handle})</span>
              </h3>
              <div className="text-xs text-slate-400 mt-1">
                Voice: <span className="text-slate-300">{ch.brand_voice}</span>
              </div>
            </div>
            <div className="text-right font-mono tabular-nums shrink-0 space-y-2">
              <div
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 border ${
                  ch.oauth_connected
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-950/40 border-red-500/30 text-red-400'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ch.oauth_connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                {ch.oauth_connected ? 'OAuth 2.0 Encrypted' : 'OAuth Disconnected'}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onToggleChannelOAuth(ch.id)}
                  className="px-3 py-1 text-xs font-sans font-medium border border-slate-700/80 bg-slate-900/60 text-slate-300 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all"
                >
                  {ch.oauth_connected ? 'Revoke / Disconnect' : 'Reconnect OAuth'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Authorized Release Form */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs">08 & 09.</span>
              <span>YouTube Data API + Meta Graph API Publisher</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforces Gate D/E approvals, encrypted OAuth tokens, idempotency keys, and zero spam/fake-engagement rules.
            </p>
          </div>
          {globalKillSwitch && (
            <div className="text-xs font-semibold text-red-400 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/30 border border-red-500/40">
              <ShieldAlert className="w-4 h-4 animate-ping" />
              <span>Kill Switch Active — Outbound Publishing Locked</span>
            </div>
          )}
        </div>

        <form onSubmit={handleScheduleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
            <label
              htmlFor="pub-idea-select"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Approved Content Item
            </label>
            <select
              id="pub-idea-select"
              value={selectedIdeaId}
              onChange={(e) => setSelectedIdeaId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {ideas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.id}: {i.title.slice(0, 38)}...
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="pub-platform-select"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Target Platform
            </label>
            <select
              id="pub-platform-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as 'YouTube' | 'Facebook')}
              className="w-full px-3 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="YouTube">YouTube Data API v3</option>
              <option value="Facebook">Meta Graph API (Page)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="pub-schedule-time"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Release Window
            </label>
            <input
              id="pub-schedule-time"
              type="text"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-mono bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="md:col-span-3">
            <label
              htmlFor="pub-custom-title"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Title / Native Caption Override
            </label>
            <input
              id="pub-custom-title"
              type="text"
              placeholder="Defaults to selected Idea primary title..."
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 shadow-md hover:shadow-cyan-500/20 active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              Schedule Release
            </button>
          </div>
        </form>
        {scheduleNotice && (
          <div
            className={`mt-3 text-xs font-medium p-2.5 rounded-xl border ${
              scheduleNotice.allowed
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
            }`}
          >
            {scheduleNotice.text}
          </div>
        )}
      </div>

      {/* Scheduled & Published Queue Table */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-xs text-slate-400 bg-slate-950/60 font-mono">
                <th className="py-3 px-4 font-medium">Publish ID & Platform</th>
                <th className="py-3 px-4 font-medium">Title & Metadata Snapshot</th>
                <th className="py-3 px-4 font-medium">Returned Post ID & Idempotency Key</th>
                <th className="py-3 px-4 font-medium">Schedule Window</th>
                <th className="py-3 px-4 font-medium">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {publishes.map((pub) => (
                <tr key={pub.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-mono text-cyan-400/80">{pub.id}</div>
                    <div className="font-semibold text-white mt-0.5">
                      {pub.platform}
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">{pub.creative_version}</div>
                  </td>
                  <td className="py-3.5 px-4 align-top max-w-md">
                    <div className="font-semibold text-white">
                      {pub.title}
                    </div>
                    <div className="text-slate-400 mt-1 line-clamp-2">
                      {pub.caption_or_description}
                    </div>
                    <div className="text-slate-500 mt-1 text-[11px]">
                      Playlist: {pub.playlist_or_feed} · Tags: {pub.tags.join(', ')}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-top font-mono text-slate-400 text-[11px]">
                    <div className="text-cyan-300">ID: {pub.post_id}</div>
                    <div className="mt-0.5 text-slate-500">Key: {pub.idempotency_key}</div>
                  </td>
                  <td className="py-3.5 px-4 align-top font-mono tabular-nums text-slate-300">
                    {pub.scheduled_at}
                  </td>
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-medium px-2 py-0.5 rounded-md text-[11px] ${
                          pub.status === 'Published'
                            ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400'
                            : pub.status === 'Blocked by Kill Switch' || pub.status === 'Failed'
                            ? 'bg-red-950/40 border border-red-500/30 text-red-400'
                            : 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-300'
                        }`}
                      >
                        {pub.status}
                      </span>
                      {pub.status !== 'Published' && (
                        <button
                          type="button"
                          onClick={() => onPublishNow(pub.id)}
                          className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all shadow-xs whitespace-nowrap shrink-0 active:scale-95"
                        >
                          Publish Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 10: ANALYTICS & 6-SIGNAL OPTIMIZATION LOOP + EXPERIMENT CENTER (PDF Page 11)
// ============================================================================
interface AnalyticsOptimizerViewProps {
  analytics: AnalyticsRecord[];
  experiments: ExperimentRecord[];
  onCreateExperiment: (exp: Omit<ExperimentRecord, 'id'>) => void;
  onAdoptExperimentWinner: (experimentId: string) => void;
}

export function AnalyticsOptimizerView({
  analytics,
  experiments,
  onCreateExperiment,
  onAdoptExperimentWinner,
}: AnalyticsOptimizerViewProps) {
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState(analytics[0]?.id || 'ANL-101');
  const [hypothesis, setHypothesis] = useState('');
  const [variable, setVariable] = useState<ExperimentRecord['variable']>('Title Variant');
  const [variantValue, setVariantValue] = useState('');

  const activeMetric = analytics.find((a) => a.id === selectedAnalyticsId) || analytics[0];
  const diagnoses = diagnoseContentPerformance(activeMetric);

  const handleAddExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesis.trim() || !variantValue.trim()) return;
    onCreateExperiment({
      idea_id: activeMetric.idea_id,
      signal_category: variable === 'Opening 15s Hook' ? 'Retention' : 'Packaging',
      hypothesis: hypothesis.trim(),
      variable,
      baseline_value: 'Current Channel Control Baseline',
      variant_value: variantValue.trim(),
      baseline_metric: `${activeMetric.ctr_percent}% CTR / ${activeMetric.retention_rate_percent}% Ret`,
      result_metric: 'Running 48h Split Cohort',
      lift_percent: 14.8,
      decision: 'Running Test',
      next_idea_recommendation: `Next-Cycle Idea: ${variantValue.trim()} (Validated via Split Test)`,
    });
    setHypothesis('');
    setVariantValue('');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Cross-Platform KPI Strip */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs">10.</span>
              <span>Analytics & 6-Signal Closed-Loop Optimizer</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluates Packaging, Retention, Engagement, Audience, Traffic, and Topics to drive future content allocation.
            </p>
          </div>
          <select
            aria-label="Select published post telemetry"
            value={activeMetric.id}
            onChange={(e) => setSelectedAnalyticsId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            {analytics.map((a) => (
              <option key={a.id} value={a.id}>
                {a.platform} ({a.post_id}) — {a.views.toLocaleString()} views
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5 font-mono tabular-nums">
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 border-t-2 border-t-cyan-500 rounded-xl">
            <div className="text-xs text-slate-400 font-sans">Impressions</div>
            <div className="text-xl font-bold text-white mt-1">
              {activeMetric.impressions.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 border-t-2 border-t-emerald-500 rounded-xl">
            <div className="text-xs text-slate-400 font-sans">Packaging CTR</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {activeMetric.ctr_percent}%
            </div>
          </div>
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 border-t-2 border-t-blue-500 rounded-xl">
            <div className="text-xs text-slate-400 font-sans">Avg Retention</div>
            <div className="text-xl font-bold text-blue-400 mt-1">
              {activeMetric.retention_rate_percent}% <span className="text-xs text-slate-400">({activeMetric.avg_view_duration_sec}s)</span>
            </div>
          </div>
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 border-t-2 border-t-purple-500 rounded-xl">
            <div className="text-xs text-slate-400 font-sans">Likes & Shares</div>
            <div className="text-xl font-bold text-purple-400 mt-1">
              {activeMetric.likes.toLocaleString()} <span className="text-xs text-slate-400">/ {activeMetric.shares}</span>
            </div>
          </div>
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 border-t-2 border-t-amber-500 rounded-xl">
            <div className="text-xs text-slate-400 font-sans">Search / Suggested</div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {activeMetric.traffic_sources.search}% <span className="text-xs text-slate-400">/ {activeMetric.traffic_sources.suggested}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Signal Diagnostic Matrix (PDF Page 11 Table) */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <h3 className="text-sm font-semibold text-white">
            6-Signal Performance Diagnostic Matrix (Packaging · Retention · Engagement · Audience · Traffic · Topics)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-xs text-slate-400 bg-slate-950/60 font-mono">
                <th className="py-3 px-4 font-medium">Signal</th>
                <th className="py-3 px-4 font-medium">Check Metric</th>
                <th className="py-3 px-4 font-medium">Observed Telemetry</th>
                <th className="py-3 px-4 font-medium">Diagnosis Status</th>
                <th className="py-3 px-4 font-medium">Automated Optimizer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {diagnoses.map((d) => (
                <tr key={d.signal} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {d.signal}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{d.checkMetric}</td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-cyan-300">
                    {d.observedValue}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {d.recommendedAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Experiment Center */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-cyan-400" />
            <span>Experiment Center (Hook / Title / Thumbnail Split Tests)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured hypothesis → variable → baseline → result → decision records feeding the Idea Engine.
          </p>
        </div>

        <form onSubmit={handleAddExperiment} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
            <label
              htmlFor="exp-variable-select"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Test Variable
            </label>
            <select
              id="exp-variable-select"
              value={variable}
              onChange={(e) => setVariable(e.target.value as ExperimentRecord['variable'])}
              className="w-full px-3 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="Title Variant">Title Variant</option>
              <option value="Thumbnail Concept">Thumbnail Concept</option>
              <option value="Opening 15s Hook">Opening 15s Hook</option>
              <option value="Caption CTA">Caption CTA</option>
              <option value="Short Cut Point">Short Cut Point</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <label
              htmlFor="exp-hypothesis-input"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Experiment Hypothesis
            </label>
            <input
              id="exp-hypothesis-input"
              type="text"
              placeholder="e.g., Front-loading primary benchmark number in title lifts CTR > 7%"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="md:col-span-3">
            <label
              htmlFor="exp-variant-input"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Challenger Variant
            </label>
            <input
              id="exp-variant-input"
              type="text"
              placeholder="e.g., -68% Hallucinations: The 9-Module Pipeline"
              value={variantValue}
              onChange={(e) => setVariantValue(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 shadow-md hover:shadow-cyan-500/20 active:scale-95"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Launch Test
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              className="p-4 border border-slate-800/80 rounded-2xl bg-slate-950/60 text-xs flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-slate-400">
                  <span className="text-cyan-400">
                    {exp.id} · {exp.variable}
                  </span>
                  <span className="text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30">
                    +{exp.lift_percent}% Lift
                  </span>
                </div>
                <div className="font-semibold text-white text-sm">
                  {exp.hypothesis}
                </div>
                <div className="text-slate-400">
                  Baseline: {exp.baseline_metric} → <span className="text-cyan-300 font-medium">Result: {exp.result_metric}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="font-mono font-semibold text-cyan-300">
                  {exp.decision}
                </span>
                {exp.decision === 'Running Test' && (
                  <button
                    type="button"
                    onClick={() => onAdoptExperimentWinner(exp.id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0 active:scale-95"
                  >
                    Adopt Winner → Idea
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 11: COMMUNITY / COMMENT AGENT VIEW (PDF Page 12)
// ============================================================================
interface CommunityAgentViewProps {
  comments: CommentRecord[];
  onApproveCommentReply: (commentId: string) => void;
  onAddSimulatedComment: (
    author: string,
    platform: 'YouTube' | 'Facebook',
    text: string
  ) => Promise<void>;
  onPromoteQuestionToIdea: (questionIdeaTitle: string) => void;
}

export function CommunityAgentView({
  comments,
  onApproveCommentReply,
  onAddSimulatedComment,
  onPromoteQuestionToIdea,
}: CommunityAgentViewProps) {
  const [filterCat, setFilterCat] = useState<string>('all');
  const [newAuthor, setNewAuthor] = useState('@DevBuilderPK');
  const [newPlatform, setNewPlatform] = useState<'YouTube' | 'Facebook'>('YouTube');
  const [newCommentText, setNewCommentText] = useState('');

  const filtered = comments.filter(
    (c) => filterCat === 'all' || c.category === filterCat
  );

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    await onAddSimulatedComment(newAuthor.trim() || '@Viewer', newPlatform, newCommentText.trim());
    setNewCommentText('');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs">11.</span>
              <span>Community & Comment Triage Agent</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Classifies comments (question, praise, criticism, spam, lead, support, safety issue), drafts brand-voice replies, escalates legal/medical/financial issues, and extracts recurring FAQ ideas.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl overflow-x-auto">
            {(['all', 'question', 'lead', 'praise', 'safety_issue', 'support', 'criticism'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
                    filterCat === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All Comments' : cat.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {/* Test Comment Classifier & AI Reply Drafter */}
        <form onSubmit={handleCommentSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-2">
            <label
              htmlFor="cmt-platform-select"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Platform
            </label>
            <select
              id="cmt-platform-select"
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value as 'YouTube' | 'Facebook')}
              className="w-full px-3 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="YouTube">YouTube</option>
              <option value="Facebook">Facebook</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="cmt-author-input"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Viewer Handle
            </label>
            <input
              id="cmt-author-input"
              type="text"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="md:col-span-6">
            <label
              htmlFor="cmt-text-input"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Incoming Viewer Comment (Technical question, support, or safety query)
            </label>
            <input
              id="cmt-text-input"
              type="text"
              placeholder="e.g., How do you store encrypted OAuth refresh tokens in PostgreSQL?"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 shadow-md hover:shadow-cyan-500/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              Classify & Draft
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 backdrop-blur-xl shadow-xl hover:border-slate-700 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-cyan-400">
                  {c.id} · {c.platform} · {c.author} · {c.timestamp}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                    c.requires_human_escalation
                      ? 'bg-red-950/40 border border-red-500/30 text-red-400'
                      : 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-300'
                  }`}
                >
                  [{c.category.toUpperCase()}]
                </span>
              </div>
              <p className="text-xs font-medium text-white leading-relaxed">
                “{c.comment_text}”
              </p>

              {c.requires_human_escalation && (
                <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{c.escalation_reason}</span>
                </div>
              )}

              <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-300">
                <div className="font-semibold text-white mb-1">
                  Brand-Voice Draft Reply ({c.faq_cluster}):
                </div>
                {c.draft_reply}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
              {c.extracted_content_idea ? (
                <button
                  type="button"
                  onClick={() => onPromoteQuestionToIdea(c.extracted_content_idea!)}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium text-left truncate"
                >
                  + Add Extracted Idea to Board
                </button>
              ) : (
                <span className="text-slate-500">FAQ: {c.faq_cluster}</span>
              )}

              {c.reply_status !== 'Approved & Sent' ? (
                <button
                  type="button"
                  onClick={() => onApproveCommentReply(c.id)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-cyan-600 hover:text-white border border-slate-700 hover:border-cyan-400 text-slate-200 rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 active:scale-95 shadow-xs"
                >
                  {c.requires_human_escalation ? 'Resolve & Approve Human Reply' : 'Approve & Send Reply'}
                </button>
              ) : (
                <span className="font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 shrink-0 text-[11px]">
                  {c.reply_status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MODULES 12, 13, 14, 17, 19: SECURITY, HUMAN GATES, 12 PROMPT MODULES & SCHEMA
// ============================================================================
interface SecurityGatesSettingsViewProps {
  gates: ApprovalGateConfig[];
  globalKillSwitch: boolean;
  onToggleKillSwitch: () => void;
  onUpdateGateMode: (
    gateId: ApprovalGateConfig['gate_id'],
    mode: ApprovalGateConfig['mode']
  ) => void;
  auditLogs: AuditLogEntry[];
  activeIdea: IdeaRecord;
}

export function SecurityGatesSettingsView({
  gates,
  globalKillSwitch,
  onToggleKillSwitch,
  onUpdateGateMode,
  auditLogs,
  activeIdea,
}: SecurityGatesSettingsViewProps) {
  const [selectedAgentId, setSelectedAgentId] = useState(MODULAR_AGENT_SPECS[0].id);
  const [agentTestOutput, setAgentTestOutput] = useState<string>('');

  const activeAgent =
    MODULAR_AGENT_SPECS.find((a) => a.id === selectedAgentId) || MODULAR_AGENT_SPECS[0];

  const handleRunAgentTest = () => {
    const sample = simulateIsolatedAgentRun(activeAgent.id, activeIdea);
    setAgentTestOutput(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Global Publishing Kill Switch & Security Controls (PDF Section 17) */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs">17.</span>
              <span>Security, Copyright, Rate-Limit & Global Publishing Kill Switch</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Encrypted OAuth 2.0 tokens, least-privilege scopes, prompt-injection defense for external content, daily API budget caps, and instant outbound halt.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleKillSwitch}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 active:scale-95 ${
              globalKillSwitch
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:from-emerald-500 hover:to-teal-500'
                : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:from-red-500 hover:to-rose-500'
            }`}
          >
            <Power className="w-4 h-4" />
            {globalKillSwitch
              ? 'Deactivate Kill Switch (Resume Publishing)'
              : 'Engage Global Publishing Kill Switch'}
          </button>
        </div>
      </div>

      {/* Section 12: Human Approval Gates (Gates A - F) */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs">12.</span>
            <span>Human Approval Gates Configuration (Gates A through F)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure which workflow transitions require explicit human sign-off vs automatic progression for low-risk content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gates.map((g) => (
            <div
              key={g.gate_id}
              className="p-4 border border-slate-800/80 rounded-2xl bg-slate-950/60 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-cyan-400 font-bold">{g.stage}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px]">Pending: {g.pending_count}</span>
                </div>
                <div className="text-sm font-semibold text-white mt-2">
                  {g.name}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{g.description}</p>
              </div>
              <div>
                <label
                  htmlFor={`gate-select-${g.gate_id}`}
                  className="block text-[11px] text-slate-400 mb-1 font-mono"
                >
                  Enforcement Policy
                </label>
                <select
                  id={`gate-select-${g.gate_id}`}
                  value={g.mode}
                  onChange={(e) =>
                    onUpdateGateMode(g.gate_id, e.target.value as ApprovalGateConfig['mode'])
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Manual Approval Required">Manual Approval Required</option>
                  <option value="Auto for Low-Risk">Auto for Trusted Low-Risk Only</option>
                  <option value="Optional / Bypass">Optional / Bypass</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 19: 12 Modular Agent Roles / Prompt Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-3 backdrop-blur-xl shadow-xl">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs">19.</span>
            <span>12 Modular AI Agent Prompt Roles</span>
          </h3>
          <p className="text-xs text-slate-400">
            Separate modules make debugging, cost control, and quality improvement easier than one giant prompt.
          </p>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {MODULAR_AGENT_SPECS.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => {
                  setSelectedAgentId(agent.id);
                  setAgentTestOutput('');
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-between ${
                  selectedAgentId === agent.id
                    ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-transparent border-l-2 border-cyan-400 text-cyan-300 font-semibold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span>
                  {agent.moduleNumber}. {agent.role}
                </span>
                <span className="font-mono text-[10px] opacity-70">Inspect</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
            <div>
              <div className="text-[11px] font-mono text-cyan-400/80">
                MODULE {activeAgent.moduleNumber} · PROMPT CONTRACT
              </div>
              <h3 className="text-base font-semibold text-white mt-0.5">
                {activeAgent.role}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleRunAgentTest}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all shadow-md hover:shadow-cyan-500/20 whitespace-nowrap shrink-0 active:scale-95"
            >
              <Play className="w-3.5 h-3.5" />
              Test Agent on {activeIdea.id}
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{activeAgent.purpose}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <div className="font-semibold text-white">Input Contract</div>
              <div className="font-mono text-cyan-300 text-[11px] mt-1">
                {activeAgent.inputSchema}
              </div>
            </div>
            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <div className="font-semibold text-white">
                Structured Output Record
              </div>
              <div className="font-mono text-cyan-300 text-[11px] mt-1">
                {activeAgent.outputSchema}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs">
            <div className="font-semibold text-white mb-1">
              System Prompt Instruction:
            </div>
            <p className="font-mono text-slate-300 leading-relaxed text-[11px]">
              {activeAgent.systemPrompt}
            </p>
          </div>

          {agentTestOutput && (
            <div className="p-3.5 bg-slate-950 text-cyan-300 rounded-xl text-xs font-mono whitespace-pre-wrap border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              {agentTestOutput}
            </div>
          )}

          {/* Section 14 Audit Log */}
          <div className="pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
              <span>Immutable Security & Compliance Audit Trail</span>
              <span className="text-slate-500 font-mono text-[11px]">LIVE STREAM</span>
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs font-mono">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                >
                  <span className="truncate text-slate-300">
                    <span className="text-cyan-400">[{log.timestamp}]</span> {log.actor}: {log.action}
                  </span>
                  <span className="text-emerald-400 font-semibold shrink-0 text-[11px]">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 13 & 14: 10-Table Relational Database Structure & Technical Stack */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs">13 & 14.</span>
            <span>Complete 10-Table Database Schema & Technical Stack Contract</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Next.js / React + Node/API + PostgreSQL/Supabase Schema + Redis/BullMQ Workers + S3 Object Storage + FFmpeg + OAuth 2.0.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {[
            { table: 'channels', cols: 'platform, name, timezone, niche, brand_voice' },
            { table: 'research_items', cols: 'source, topic, claims, date, verification_status' },
            { table: 'ideas', cols: 'angle, score, format, status, selected_reason' },
            { table: 'scripts', cols: 'version, language, duration, hook, body, CTA, approval' },
            { table: 'assets', cols: 'type, source, license_status, file_url' },
            { table: 'videos', cols: 'render_status, duration, master_url, thumbnail_url' },
            { table: 'publishes', cols: 'platform, post_id, scheduled_at, status, metadata' },
            { table: 'analytics', cols: 'post_id, date, views, retention, CTR, engagement' },
            { table: 'experiments', cols: 'hypothesis, variable, baseline, result, decision' },
            { table: 'tasks', cols: 'job_type, status, retries, error, next_run_at' },
          ].map((tbl) => (
            <div
              key={tbl.table}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/30 transition-colors"
            >
              <div className="font-mono font-semibold text-cyan-400">
                {tbl.table}
              </div>
              <div className="font-mono text-[11px] text-slate-400 mt-1">
                {tbl.cols}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
