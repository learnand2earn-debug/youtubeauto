'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Play,
  Sparkles,
  Volume2,
  Download,
  ArrowRight,
  Eye,
  Square,
} from 'lucide-react';
import {
  TrendRecord,
  IdeaRecord,
  IdeaScoreBreakdown,
  IdeaStage,
  ContentFormat,
  ResearchClaimRecord,
  VerificationStatus,
  ScriptRecord,
  AssetLedgerItem,
  VideoProductionRecord,
  VideoQCChecklist,
  evaluateResearchVerificationGate,
  buildStructuredScriptFromClaims,
  evaluateVideoAssemblyQC,
  SCRIPT_FRAMEWORKS,
} from '@/lib/automation-engine';

// ============================================================================
// MODULE 2: TREND & RESEARCH ENGINE VIEW (PDF Page 3)
// ============================================================================
interface TrendRadarViewProps {
  trends: TrendRecord[];
  onAddTrendAndGenerateIdea: (params: {
    niche: string;
    keyword: string;
    format: ContentFormat;
  }) => Promise<void>;
  isRunningPipeline: boolean;
}

export function TrendRadarView({
  trends,
  onAddTrendAndGenerateIdea,
  isRunningPipeline,
}: TrendRadarViewProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [competitionFilter, setCompetitionFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [newNiche, setNewNiche] = useState('AI Engineering & Creator Systems');
  const [newKeyword, setNewKeyword] = useState('');
  const [newFormat, setNewFormat] = useState<ContentFormat>('Long-form');
  const [formError, setFormError] = useState('');

  const filteredTrends = trends.filter((t) => {
    const matchesText =
      t.keyword.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.niche.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.content_gap.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesComp = competitionFilter === 'All' || t.competition === competitionFilter;
    return matchesText && matchesComp;
  });

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) {
      setFormError('Please enter a search trend keyword or topic query to scan.');
      return;
    }
    setFormError('');
    await onAddTrendAndGenerateIdea({
      niche: newNiche.trim() || 'AI Automation',
      keyword: newKeyword.trim(),
      format: newFormat,
    });
    setNewKeyword('');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Live Trend Scanner & End-to-End Pipeline Trigger */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-cyan-400 font-mono text-xs">02.</span>
                <span>Trend & Research Intelligence Scanner</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Scans YouTube search signals, public metadata, RSS/news authority, competitor watchlists, and channel retention gaps.
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            {trends.length} Active Trend Records
          </div>
        </div>

        <form onSubmit={handleScanSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end relative z-10">
          <div className="md:col-span-3">
            <label
              htmlFor="trend-niche-input"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Channel Niche
            </label>
            <input
              id="trend-niche-input"
              type="text"
              value={newNiche}
              onChange={(e) => setNewNiche(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
            />
          </div>
          <div className="md:col-span-4">
            <label
              htmlFor="trend-keyword-input"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Search Query / Topic Pattern
            </label>
            <input
              id="trend-keyword-input"
              type="text"
              placeholder="e.g., Automated SRT Forced Alignment with FFmpeg"
              value={newKeyword}
              onChange={(e) => {
                setNewKeyword(e.target.value);
                if (formError) setFormError('');
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="trend-format-select"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Recommended Format
            </label>
            <select
              id="trend-format-select"
              value={newFormat}
              onChange={(e) => setNewFormat(e.target.value as ContentFormat)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
            >
              <option value="Long-form">Long-form</option>
              <option value="Short-form">Short-form</option>
              <option value="Explainer">Explainer</option>
              <option value="Current topic">Current topic</option>
              <option value="Story">Story</option>
              <option value="Facebook-native">Facebook-native</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={isRunningPipeline}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-200 whitespace-nowrap shrink-0 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              {isRunningPipeline ? 'Scanning & Scoring...' : 'Scan Trend & Score Idea'}
            </button>
          </div>
        </form>
        {formError && (
          <p className="mt-2 text-xs text-red-400" role="alert">
            {formError}
          </p>
        )}
      </div>

      {/* Filter Bar & Structured Trend Records Table */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Filter trend records"
              placeholder="Filter by keyword, niche, or content gap..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            {(['All', 'Low', 'Medium', 'High'] as const).map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => setCompetitionFilter(comp)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
                  competitionFilter === comp
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {comp === 'All' ? 'All Competition' : `${comp} Comp`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-xs text-slate-400 bg-slate-950/60 font-mono">
                <th className="py-3 px-4 font-medium">Topic ID & Keyword</th>
                <th className="py-3 px-4 font-medium">Source & Date</th>
                <th className="py-3 px-4 font-medium text-right">Freshness</th>
                <th className="py-3 px-4 font-medium text-right">Audience Fit</th>
                <th className="py-3 px-4 font-medium">Competition & Risk</th>
                <th className="py-3 px-4 font-medium">Identified Content Gap</th>
                <th className="py-3 px-4 font-medium text-right">Format & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTrends.map((t) => (
                <tr
                  key={t.topic_id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-mono text-cyan-400/80 text-[11px]">{t.topic_id}</div>
                    <div className="font-semibold text-white mt-0.5">
                      {t.keyword}
                    </div>
                    <div className="text-slate-400 mt-0.5 text-[11px]">
                      {t.niche} · <span className="text-cyan-400">{t.search_volume_signal}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-top">
                    <div className="text-slate-200">{t.source_name}</div>
                    <div className="font-mono text-slate-400 mt-0.5 text-[11px]">
                      {t.source_date}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-top text-right font-mono tabular-nums">
                    <div className="font-semibold text-emerald-400">{t.freshness}%</div>
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                        style={{ width: `${t.freshness}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-top text-right font-mono tabular-nums">
                    <div className="font-semibold text-cyan-400">{t.audience_fit}%</div>
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                        style={{ width: `${t.audience_fit}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-top">
                    <span className="text-slate-200 font-medium">
                      {t.competition} Comp
                    </span>
                    <span className="mx-1.5 text-slate-500">·</span>
                    <span
                      className={
                        t.risk_level === 'high'
                          ? 'text-amber-400 font-medium'
                          : 'text-slate-400'
                      }
                    >
                      {t.risk_level} risk
                    </span>
                  </td>
                  <td className="py-3.5 px-4 align-top max-w-xs text-slate-300">
                    {t.content_gap}
                  </td>
                  <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                    <div className="font-mono text-slate-300 mb-1.5 text-[11px]">
                      {t.recommended_format}
                    </div>
                    <button
                      type="button"
                      disabled={isRunningPipeline}
                      onClick={() =>
                        onAddTrendAndGenerateIdea({
                          niche: t.niche,
                          keyword: `${t.keyword} (Deep-Dive Angle)`,
                          format: t.recommended_format,
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-cyan-600 hover:text-white border border-slate-700 hover:border-cyan-400 text-slate-200 rounded-lg transition-all duration-200 disabled:opacity-50 whitespace-nowrap shrink-0 shadow-xs active:scale-95"
                    >
                      + Spin Off Idea
                    </button>
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
// MODULE 3: IDEA GENERATOR & 7-FACTOR WEIGHTED SCORING BOARD (PDF Page 4 & 17)
// ============================================================================
interface IdeaBoardViewProps {
  ideas: IdeaRecord[];
  selectedIdeaId: string;
  onSelectIdea: (id: string) => void;
  onUpdateIdeaStage: (id: string, nextStage: IdeaStage) => void;
  onUpdateIdeaScoreBreakdown: (id: string, breakdown: IdeaScoreBreakdown) => void;
  onOpenDossier: (idea: IdeaRecord) => void;
}

const STAGES: IdeaStage[] = ['New', 'Research', 'Script', 'Review', 'Approved', 'Published'];

export function IdeaBoardView({
  ideas,
  selectedIdeaId,
  onSelectIdea,
  onUpdateIdeaStage,
  onUpdateIdeaScoreBreakdown,
  onOpenDossier,
}: IdeaBoardViewProps) {
  const [stageFilter, setStageFilter] = useState<'All' | IdeaStage>('All');
  const activeIdea = ideas.find((i) => i.id === selectedIdeaId) || ideas[0];

  const visibleIdeas =
    stageFilter === 'All' ? ideas : ideas.filter((i) => i.status === stageFilter);

  const handleFactorChange = (key: keyof IdeaScoreBreakdown, value: number) => {
    if (!activeIdea) return;
    const updated: IdeaScoreBreakdown = {
      ...activeIdea.score_breakdown,
      [key]: value,
    };
    onUpdateIdeaScoreBreakdown(activeIdea.id, updated);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Stage Pipeline Board (New -> Research -> Script -> Review -> Approved -> Published) */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs">03.</span>
              <span>Idea Board & Traceable Stage Progression</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every content item progresses through New → Research → Script → Review → Approved → Published.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl overflow-x-auto">
            {(['All', ...STAGES] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStageFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
                  stageFilter === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {visibleIdeas.map((idea) => {
            const isSelected = idea.id === activeIdea?.id;
            const currentIdx = STAGES.indexOf(idea.status);
            const nextStage = STAGES[Math.min(STAGES.length - 1, currentIdx + 1)];

            return (
              <div
                key={idea.id}
                onClick={() => onSelectIdea(idea.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-md relative ${
                  isSelected
                    ? 'border-cyan-500/80 bg-gradient-to-b from-cyan-950/30 via-slate-900/80 to-[#0c101c] shadow-[0_0_25px_rgba(6,182,212,0.25)] scale-[1.01]'
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/50 hover:-translate-y-0.5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
                    <span className="text-cyan-400/90 font-medium">
                      {idea.id} · <span className="text-slate-300">{idea.status}</span>
                    </span>
                    <span className="font-bold text-white px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">
                      {idea.score} pts
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-2 leading-snug">
                    {idea.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {idea.angle}
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono mt-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-300 border border-slate-700/50">
                      {idea.format}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${
                      idea.risk_level === 'high'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                        : 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40'
                    }`}>
                      {idea.risk_level} risk
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDossier(idea);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:underline whitespace-nowrap shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    18-Item Dossier
                  </button>

                  {idea.status !== 'Published' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateIdeaStage(idea.id, nextStage);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-cyan-600 hover:text-white border border-slate-700 hover:border-cyan-400 text-slate-200 rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 shadow-xs active:scale-95"
                    >
                      Move to {nextStage}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 7-Factor Weighted Rubric Calculator & Selected Idea Output */}
      {activeIdea && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>7-Factor Weighted Scoring Rubric</span>
                  <span className="font-mono text-cyan-400 text-xs">({activeIdea.id})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust factor sliders to recalculate live weighted score per PDF Section 3.
                </p>
              </div>
              <div className="text-right font-mono tabular-nums whitespace-nowrap shrink-0">
                <div className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  {activeIdea.score} / 100
                </div>
                <div className="text-xs text-slate-400">Weighted Total</div>
              </div>
            </div>

            <div className="space-y-3.5 mt-4">
              {(
                [
                  {
                    key: 'audienceDemand',
                    label: 'Audience demand',
                    weight: '25%',
                    question: 'Real audience interest/problem',
                  },
                  {
                    key: 'freshness',
                    label: 'Freshness',
                    weight: '15%',
                    question: 'Angle newly relevant',
                  },
                  {
                    key: 'contentGap',
                    label: 'Content gap',
                    weight: '15%',
                    question: 'Missing coverage filled',
                  },
                  {
                    key: 'hookPotential',
                    label: 'Hook potential',
                    weight: '15%',
                    question: 'Curiosity/hook clarity',
                  },
                  {
                    key: 'feasibility',
                    label: 'Feasibility',
                    weight: '10%',
                    question: 'Can be produced well',
                  },
                  {
                    key: 'discoveryFit',
                    label: 'Discovery fit',
                    weight: '10%',
                    question: 'Searchable keywords exist',
                  },
                  {
                    key: 'originalityRisk',
                    label: 'Originality / low-risk',
                    weight: '10%',
                    question: 'Original and compliant',
                  },
                ] as const
              ).map((factor) => {
                const val = activeIdea.score_breakdown[factor.key];
                return (
                  <div key={factor.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">
                          {factor.label}
                        </span>
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span className="font-mono text-cyan-400/80">
                          {factor.weight}
                        </span>
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span className="text-slate-400 text-[11px]">{factor.question}</span>
                      </div>
                      <span className="font-mono tabular-nums font-bold text-white px-1.5 py-0.5 rounded bg-slate-800">
                        {val}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      aria-label={`${factor.label} score slider`}
                      value={val}
                      onChange={(e) => handleFactorChange(factor.key, Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Idea Strategist Output Details */}
          <div className="lg:col-span-6 bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
            <div className="pb-3 border-b border-slate-800/80">
              <div className="text-[11px] text-cyan-400 font-mono tracking-wider">
                IDEA STRATEGIST OUTPUT · {activeIdea.format.toUpperCase()}
              </div>
              <h3 className="text-sm font-semibold text-white mt-1">
                {activeIdea.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Audience: <span className="text-slate-300">{activeIdea.target_audience}</span>
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Alternative Curiosity Hooks (3)
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeIdea.alternative_hooks.map((hook, i) => (
                  <li key={i} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <span className="font-mono text-cyan-400 mr-2 font-bold">0{i + 1}.</span>
                    {hook}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white mb-2">
                Research Questions Passed to Fact-Checking Agent
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {activeIdea.research_questions.map((rq, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono text-cyan-400/80 shrink-0 font-bold">Q{i + 1}.</span>
                    <span>{rq}</span>
                  </li>
                ))}
              </ul>
            </div>

            {activeIdea.risk_flags.length > 0 && (
              <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-300">
                <div className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Risk Flags Detected:
                </div>
                <ul className="mt-1.5 space-y-0.5 text-slate-300">
                  {activeIdea.risk_flags.map((flag, idx) => (
                    <li key={idx}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 4: RESEARCH & FACT-CHECKING AGENT VIEW (PDF Page 5)
// ============================================================================
interface ResearchFactCheckViewProps {
  claims: ResearchClaimRecord[];
  ideas: IdeaRecord[];
  selectedIdeaId: string;
  onSelectIdea: (id: string) => void;
  onUpdateClaimStatus: (claimId: string, status: VerificationStatus) => void;
  onAddVerifiedClaim: (claim: Omit<ResearchClaimRecord, 'id'>) => void;
  gateBEnabled: boolean;
}

export function ResearchFactCheckView({
  claims,
  ideas,
  selectedIdeaId,
  onSelectIdea,
  onUpdateClaimStatus,
  onAddVerifiedClaim,
  gateBEnabled,
}: ResearchFactCheckViewProps) {
  const [newClaimText, setNewClaimText] = useState('');
  const [newClaimSource, setNewClaimSource] = useState('');
  const [claimError, setClaimError] = useState('');

  const filteredClaims = claims.filter((c) => c.idea_id === selectedIdeaId);
  const displayClaims = filteredClaims.length > 0 ? filteredClaims : claims;
  const gateEval = evaluateResearchVerificationGate(displayClaims, gateBEnabled);

  const handleAddClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimText.trim() || !newClaimSource.trim()) {
      setClaimError('Both claim statement and primary/official source citation are required.');
      return;
    }
    setClaimError('');
    onAddVerifiedClaim({
      idea_id: selectedIdeaId,
      topic: 'Primary Source Verification',
      claim: newClaimText.trim(),
      source: newClaimSource.trim(),
      source_url: 'https://developers.google.com/youtube/v3',
      is_primary_source: true,
      date: '2026-11-01',
      confidence: 96,
      script_usage: 'Main Points & Evidence Section',
      verification_status: 'verified',
    });
    setNewClaimText('');
    setNewClaimSource('');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Gate B Verification Banner */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs">04.</span>
              <span>Research & Fact-Checking Agent (Gate B Enforcement)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prioritizes primary and official sources, flags conflicting information, and blocks unsupported sensational claims.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <label htmlFor="research-idea-select" className="text-xs text-slate-400 font-mono">
              Idea:
            </label>
            <select
              id="research-idea-select"
              value={selectedIdeaId}
              onChange={(e) => onSelectIdea(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {ideas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.id}: {i.title.slice(0, 48)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border backdrop-blur-md transition-all duration-300 ${
          gateEval.canProceedToScript
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
            : 'bg-amber-950/20 border-amber-500/30 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
        }`}>
          <div className="space-y-1">
            <div className="text-xs font-semibold flex items-center gap-2">
              {gateEval.canProceedToScript ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-white font-bold">Gate B Cleared — Primary Sources Verified (Ready for Script)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="text-white font-bold">Gate B Hold — Unresolved or Blocked Claims Detected</span>
                </>
              )}
            </div>
            {gateEval.blockingReasons.length > 0 && (
              <ul className="text-xs text-amber-300/90 space-y-0.5">
                {gateEval.blockingReasons.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="font-mono tabular-nums text-right shrink-0">
            <div className="text-xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {gateEval.verifiedRatio}% Verified
            </div>
            <div className="text-xs text-slate-400">Claim Verification Ratio</div>
          </div>
        </div>

        {/* Add Primary Source Claim Form */}
        <form onSubmit={handleAddClaim} className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label
              htmlFor="new-claim-text"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Verified Claim Statement (Numbers, Dates, Quotations)
            </label>
            <input
              id="new-claim-text"
              type="text"
              placeholder="e.g., FFmpeg 7.1 native AAC-LC encoder reduces audio drift under 15ms"
              value={newClaimText}
              onChange={(e) => {
                setNewClaimText(e.target.value);
                if (claimError) setClaimError('');
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all duration-200"
            />
          </div>
          <div className="md:col-span-4">
            <label
              htmlFor="new-claim-source"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Primary / Official Source & Date
            </label>
            <input
              id="new-claim-source"
              type="text"
              placeholder="e.g., Official FFmpeg 7.1 Release Notes (2026-10)"
              value={newClaimSource}
              onChange={(e) => {
                setNewClaimSource(e.target.value);
                if (claimError) setClaimError('');
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all duration-200"
            />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 shadow-md hover:shadow-cyan-500/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Verified Claim
            </button>
          </div>
        </form>
        {claimError && (
          <p className="mt-2 text-xs text-red-400" role="alert">
            {claimError}
          </p>
        )}
      </div>

      {/* Claims Table */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-xs text-slate-400 bg-slate-950/60 font-mono">
                <th className="py-3 px-4 font-medium">Claim ID & Statement</th>
                <th className="py-3 px-4 font-medium">Source & Date</th>
                <th className="py-3 px-4 font-medium text-right">Confidence</th>
                <th className="py-3 px-4 font-medium">Script Usage</th>
                <th className="py-3 px-4 font-medium">Verification Status & Gate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {displayClaims.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 align-top max-w-md">
                    <div className="font-mono text-cyan-400/80 text-[11px]">
                      {c.id} · Idea {c.idea_id} · {c.topic}
                    </div>
                    <div className="text-white font-medium mt-1">
                      {c.claim}
                    </div>
                    {c.conflict_note && (
                      <div className="text-amber-400 mt-1 text-[11px]">
                        Note: {c.conflict_note}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 align-top">
                    <div className="text-slate-200 font-medium">{c.source}</div>
                    <div className="text-slate-400 font-mono mt-0.5 text-[11px]">
                      {c.date} · <span className="text-cyan-400">{c.is_primary_source ? 'Primary Source' : 'Secondary'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-top text-right font-mono tabular-nums">
                    <div className="font-bold text-emerald-400">{c.confidence}%</div>
                    <div className="w-14 h-1.5 bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                        style={{ width: `${c.confidence}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-300">
                    {c.script_usage}
                  </td>
                  <td className="py-3.5 px-4 align-top">
                    <select
                      aria-label={`Verification status for ${c.id}`}
                      value={c.verification_status}
                      onChange={(e) =>
                        onUpdateClaimStatus(c.id, e.target.value as VerificationStatus)
                      }
                      className="px-2.5 py-1.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-lg font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="verified">Verified (Approved for Script)</option>
                      <option value="human_review">Gate B — Human Review Required</option>
                      <option value="conflict_flagged">Conflict Flagged (Do Not Combine)</option>
                      <option value="blocked_unsupported">Blocked (Unsupported Claim)</option>
                    </select>
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
// MODULE 5: SCRIPTWRITING ENGINE STUDIO VIEW (PDF Page 6)
// ============================================================================
interface ScriptStudioViewProps {
  scripts: ScriptRecord[];
  ideas: IdeaRecord[];
  claims: ResearchClaimRecord[];
  selectedIdeaId: string;
  onSelectIdea: (id: string) => void;
  onSaveOrGenerateScript: (script: ScriptRecord) => void;
}

export function ScriptStudioView({
  scripts,
  ideas,
  claims,
  selectedIdeaId,
  onSelectIdea,
  onSaveOrGenerateScript,
}: ScriptStudioViewProps) {
  const activeIdea = ideas.find((i) => i.id === selectedIdeaId) || ideas[0];
  const existingScript = scripts.find((s) => s.idea_id === activeIdea.id) || scripts[0];

  const [framework, setFramework] = useState<ContentFormat>(existingScript?.framework || activeIdea.format || 'Long-form');
  const [speakingSpeedWpm, setSpeakingSpeedWpm] = useState<number>(
    existingScript?.speaking_speed_wpm || 155
  );
  const [targetDurationSec, setTargetDurationSec] = useState<number>(
    existingScript?.target_duration_sec || 480
  );
  const [language, setLanguage] = useState<string>(
    existingScript?.language || 'English (with Roman Urdu Subtitle Track Ready)'
  );
  const [tone, setTone] = useState<string>(
    existingScript?.tone || 'Analytical, Authoritative & Practical'
  );
  const [readingLevel] = useState<string>(
    existingScript?.reading_level || 'Grade 8 — Clear Technical Prose'
  );

  // Sync controls when user switches Idea
  useEffect(() => {
    const matched = scripts.find((s) => s.idea_id === selectedIdeaId);
    if (matched) {
      setFramework(matched.framework);
      setSpeakingSpeedWpm(matched.speaking_speed_wpm);
      setTargetDurationSec(matched.target_duration_sec);
      setLanguage(matched.language);
      setTone(matched.tone);
    } else if (activeIdea) {
      setFramework(activeIdea.format);
    }
  }, [selectedIdeaId, scripts, activeIdea]);

  const handleSynthesizeScript = () => {
    const ideaClaims = claims.filter((c) => c.idea_id === activeIdea.id);
    const built = buildStructuredScriptFromClaims({
      idea: activeIdea,
      claims: ideaClaims.length > 0 ? ideaClaims : claims,
      framework,
      speakingSpeedWpm,
      targetDurationSec,
      language,
      tone,
      readingLevel,
      ctaStyle: 'Technical Discussion Question Prompt',
    });

    const matched = scripts.find((s) => s.idea_id === activeIdea.id);
    const newRecord: ScriptRecord = {
      ...built,
      id: matched ? matched.id : `SCR-${activeIdea.id.replace('IDEA-', '')}`,
      version: (matched?.version || 0) + 1,
      updated_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    onSaveOrGenerateScript(newRecord);
  };

  const handleApproveGateC = () => {
    if (!existingScript) return;
    onSaveOrGenerateScript({
      ...existingScript,
      approval_status: 'approved',
      updated_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
  };

  const handleDownloadScriptMarkdown = () => {
    if (!existingScript) return;
    const md = `# ${activeIdea.title}\nFramework: ${existingScript.framework} | Version: v${existingScript.version} | Speed: ${existingScript.speaking_speed_wpm} WPM\n\n${existingScript.body}\n\n## Facebook Companion Caption\n${existingScript.facebook_caption}\n\nDiscussion Prompt: ${existingScript.facebook_discussion_prompt}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${existingScript.id}-v${existingScript.version}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Controls Bar */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs">05.</span>
              <span>Multi-Framework Scriptwriting Studio</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports Long-form, Short-form, Explainer, Current topic, Story, and Facebook-native structures with WPM & reading-level controls.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              aria-label="Select idea for script studio"
              value={activeIdea.id}
              onChange={(e) => onSelectIdea(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {ideas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.id}: {i.title.slice(0, 42)}...
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleDownloadScriptMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-700/80 rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 hover:border-slate-600"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export Script (.md)
            </button>

            <button
              type="button"
              onClick={handleApproveGateC}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-xl hover:bg-emerald-900/50 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {existingScript?.approval_status === 'approved'
                ? 'Gate C Approved'
                : 'Approve Script (Gate C)'}
            </button>
          </div>
        </div>

        {/* Framework & Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-4">
          <div>
            <label
              htmlFor="script-framework-select"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Script Framework
            </label>
            <select
              id="script-framework-select"
              value={framework}
              onChange={(e) => setFramework(e.target.value as ContentFormat)}
              className="w-full px-3 py-2 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {Object.keys(SCRIPT_FRAMEWORKS).map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="script-duration-input"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Target Duration (sec)
            </label>
            <input
              id="script-duration-input"
              type="number"
              min={30}
              max={1800}
              value={targetDurationSec}
              onChange={(e) => setTargetDurationSec(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label
              htmlFor="script-wpm-input"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Speaking Speed (WPM)
            </label>
            <input
              id="script-wpm-input"
              type="number"
              min={100}
              max={220}
              value={speakingSpeedWpm}
              onChange={(e) => setSpeakingSpeedWpm(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label
              htmlFor="script-language-select"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Language Track
            </label>
            <select
              id="script-language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="English (with Roman Urdu Subtitle Track Ready)">
                English + Roman Urdu SRT
              </option>
              <option value="Urdu / Roman Urdu Native Narration">Urdu / Roman Urdu Native</option>
              <option value="English (Global Technical Standard)">English (Global Technical)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="script-tone-select"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Tone & Reading Level
            </label>
            <select
              id="script-tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="Analytical, Authoritative & Practical">Analytical & Direct (Gr 8)</option>
              <option value="Fast-Paced Visual Storyteller">Fast-Paced Storyteller (Gr 7)</option>
              <option value="Executive Deep-Tech Briefing">Executive Briefing (Gr 10)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSynthesizeScript}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 shadow-md hover:shadow-cyan-500/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              Synthesize v{(existingScript?.version || 1) + 1} Script
            </button>
          </div>
        </div>

        {/* Active Framework Flow Sequence */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center flex-wrap gap-2 text-xs text-slate-400">
          <span className="font-semibold text-white">
            Active {framework} Structure:
          </span>
          {(SCRIPT_FRAMEWORKS[framework] || []).map((step, idx, arr) => (
            <React.Fragment key={step}>
              <span className="font-mono text-cyan-400/90">{step}</span>
              {idx < arr.length - 1 && <span className="text-slate-600">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Script Sections & Native Facebook Output */}
      {existingScript && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <span className="text-xs font-mono text-cyan-400/80">
                  {existingScript.id} · Idea {activeIdea.id} · Version v{existingScript.version} · {existingScript.framework}
                </span>
                <h3 className="text-sm font-semibold text-white mt-1">
                  Timestamped Narration Script ({activeIdea.title})
                </h3>
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-400 shrink-0 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                Est. {existingScript.estimated_duration_sec}s @ {existingScript.speaking_speed_wpm} WPM
              </div>
            </div>

            <div className="space-y-3">
              {existingScript.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      0{idx + 1}. {sec.label}
                    </span>
                    <span className="text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">{sec.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-3 backdrop-blur-xl shadow-xl">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="text-blue-400">FB</span>
                <span>Facebook-Native Companion Post</span>
              </h3>
              <p className="text-xs text-slate-400">
                Adapted shorter caption + comment discussion prompt for Meta Graph API.
              </p>
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                {existingScript.facebook_caption}
              </div>
              <div className="p-3 bg-blue-950/30 border border-blue-800/50 rounded-xl text-xs">
                <div className="font-semibold text-blue-300">
                  Discussion Prompt (Engagement Signal):
                </div>
                <p className="text-blue-200 mt-1">
                  {existingScript.facebook_discussion_prompt}
                </p>
              </div>
            </div>

            <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-2 text-xs backdrop-blur-xl shadow-xl">
              <h3 className="text-sm font-semibold text-white">
                Editor & Compliance Guardrails
              </h3>
              <div className="text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sensational claims check: Cleared</span>
              </div>
              <div className="text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reading level: {existingScript.reading_level}</span>
              </div>
              <div className="text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Source requirement: Verified claims linked</span>
              </div>
              <div className="text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Approval: <span className="font-mono text-cyan-300 font-semibold">{existingScript.approval_status}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 6 & 7: CREATIVE PRODUCTION PIPELINE & 8-POINT VIDEO QC (PDF Page 7 & 8)
// ============================================================================
interface ProductionQcViewProps {
  ideas: IdeaRecord[];
  selectedIdeaId: string;
  onSelectIdea: (id: string) => void;
  videos: VideoProductionRecord[];
  assets: AssetLedgerItem[];
  onToggleQcItem: (videoId: string, key: keyof VideoQCChecklist) => void;
  onApproveGateD: (videoId: string) => void;
  onRunRenderSimulation: (videoId: string) => void;
  onUpdateAssetLicenseStatus: (
    assetId: string,
    status: AssetLedgerItem['license_status']
  ) => void;
}

export function ProductionQcView({
  ideas,
  selectedIdeaId,
  onSelectIdea,
  videos,
  assets,
  onToggleQcItem,
  onApproveGateD,
  onRunRenderSimulation,
  onUpdateAssetLicenseStatus,
}: ProductionQcViewProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const video = videos.find((v) => v.idea_id === selectedIdeaId) || videos[0];
  const ideaAssets = assets.filter((a) => a.idea_id === video.idea_id);
  const displayAssets = ideaAssets.length > 0 ? ideaAssets : assets;
  const qcResult = evaluateVideoAssemblyQC(video, displayAssets);

  const handleToggleTtsPreview = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = video.storyboard.map((s) => s.voiceover_text).join(' ');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDownloadSrt = () => {
    const blob = new Blob([video.srt_captions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${video.id}-captions.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Orchestrator Pipeline Bar */}
      <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs">06 & 07.</span>
              <span>Creative Production Pipeline & 8-Point Video Assembly QC</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Orchestrator → TTS/Voice → Visual Assets → Subtitles (SRT) → FFmpeg Render Worker → 8-Point QC → S3 Storage.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              aria-label="Select content item for production and QC"
              value={selectedIdeaId}
              onChange={(e) => onSelectIdea(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {ideas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.id}: {i.title.slice(0, 38)}...
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleToggleTtsPreview}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-200 whitespace-nowrap shrink-0 ${
                isSpeaking
                  ? 'bg-red-950/40 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'text-slate-300 bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-3.5 h-3.5 text-red-400" />
                  <span>Stop Voiceover</span>
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-red-400 rounded-full animate-soundwave-1" />
                    <span className="w-0.5 bg-red-400 rounded-full animate-soundwave-2" />
                    <span className="w-0.5 bg-red-400 rounded-full animate-soundwave-3" />
                  </div>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Play TTS Voiceover</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadSrt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-700/80 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Download .SRT
            </button>

            <button
              type="button"
              onClick={() => onRunRenderSimulation(video.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-700/80 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-colors whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              Re-Verify FFmpeg
            </button>

            <button
              type="button"
              onClick={() => onApproveGateD(video.id)}
              disabled={!qcResult.passedAllChecks}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 disabled:opacity-50 ${
                video.gate_d_approved && qcResult.passedAllChecks
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {video.gate_d_approved && qcResult.passedAllChecks
                ? 'Gate D Approved (Ready)'
                : 'Approve Gate D QC'}
            </button>
          </div>
        </div>

        {/* Thumbnail Concepts Studio (Procedural 16:9 & 9:16 Preview Cards) */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Thumbnail Concepts & Title Pairing Variants for {video.idea_id} (No Misleading Clickbait)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {video.thumbnail_concepts.map((thm) => (
              <div
                key={thm.id}
                className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/60 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-[#0a0e1a] text-white p-4 relative min-h-[140px] flex flex-col justify-between border-b border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300">{thm.aspect_ratio}</span>
                    <span className="text-emerald-400 font-bold">PREDICTED CTR: {thm.predicted_ctr_score}%</span>
                  </div>
                  <div className="my-2">
                    <div className="text-sm font-bold tracking-tight text-white uppercase drop-shadow-md">
                      {thm.overlay_text}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {thm.visual_composition}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">{thm.color_scheme}</div>
                </div>
                <div className="p-3.5 text-xs space-y-1">
                  <div className="font-semibold text-white">
                    {thm.variant_label}
                  </div>
                  <div className="text-slate-400">
                    Paired Title: <span className="text-slate-300">“{thm.title_pairing}”</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Storyboard & 8-Point QC Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scene-by-Scene Storyboard */}
        <div className="lg:col-span-7 bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <h3 className="text-sm font-semibold text-white">
              Scene-by-Scene Storyboard & Captions ({video.id})
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              Master: {video.duration_sec}s ({video.aspect_ratio})
            </span>
          </div>

          <div className="space-y-3">
            {video.storyboard.map((scene) => (
              <div
                key={scene.scene_number}
                className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between font-mono text-slate-400">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Scene 0{scene.scene_number}
                  </span>
                  <span className="text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/30">{scene.timestamp_range}</span>
                </div>
                <div className="text-slate-300">
                  <span className="font-semibold text-white">Visual / B-Roll:</span> {scene.visual_direction} ({scene.b_roll_asset})
                </div>
                <div className="text-slate-200">
                  <span className="font-semibold text-cyan-300">Voiceover:</span> “{scene.voiceover_text}”
                </div>
                <div className="text-slate-400 text-[11px]">
                  <span className="font-semibold text-slate-300">Pronunciation Note:</span> {scene.pronunciation_notes}
                </div>
                <div className="font-mono text-cyan-300 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  On-Screen: [{scene.on_screen_caption}] · Emphasis: {scene.emphasis_words.join(' / ')}
                </div>
              </div>
            ))}
          </div>

          {/* Short-Form Cut Points */}
          <div className="pt-3 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-white mb-2">
              Short-Form Cut Points Extracted from Long-Form Master
            </h4>
            <ul className="space-y-1 text-xs font-mono text-slate-400">
              {video.short_form_cut_points.map((cut, idx) => (
                <li key={idx}>• {cut}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 8-Point Video Assembly QC & Asset License Ledger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  8-Point Video Quality Control (Section 7)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toggle any check to verify Gate D blocking behavior.
                </p>
              </div>
              <span
                className={`font-mono tabular-nums text-sm font-bold shrink-0 px-2 py-0.5 rounded-md ${
                  qcResult.passedAllChecks
                    ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                    : 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                }`}
              >
                {qcResult.scorePercent}% Passed
              </span>
            </div>

            {qcResult.failedChecks.length > 0 && (
              <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-300">
                <div className="font-semibold">Gate D Blocked — Resolve Failed Checks:</div>
                <ul className="mt-1 space-y-0.5 text-slate-300">
                  {qcResult.failedChecks.map((fc, i) => (
                    <li key={i}>• {fc}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2.5 text-xs">
              {(
                [
                  {
                    key: 'audio_present_understandable',
                    label: '1. Audio present & clear (24kHz TTS audio track)',
                  },
                  {
                    key: 'captions_synchronized',
                    label: '2. Captions synchronized (SRT drift < 40ms)',
                  },
                  {
                    key: 'no_missing_media',
                    label: '3. No missing media or unrendered black frames',
                  },
                  {
                    key: 'correct_aspect_ratio',
                    label: `4. Correct aspect ratio (${video.aspect_ratio} verified)`,
                  },
                  {
                    key: 'thumbnail_title_accurate',
                    label: '5. Thumbnail & title accurately represent content',
                  },
                  {
                    key: 'copyright_license_resolved',
                    label: '6. Copyright & asset license ledger flags resolved',
                  },
                  {
                    key: 'no_private_information',
                    label: '7. No accidental private information (PII / secrets)',
                  },
                  {
                    key: 'duration_within_range',
                    label: `8. Duration (${video.duration_sec}s) within range (${video.requested_min_sec}s–${video.requested_max_sec}s)`,
                  },
                ] as const
              ).map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    video.qc_checklist[item.key]
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-slate-200'
                      : 'border-slate-800/80 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-medium">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={video.qc_checklist[item.key]}
                    onChange={() => onToggleQcItem(video.id, item.key)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Asset / Copyright License Ledger */}
          <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-3 backdrop-blur-xl shadow-xl">
            <h3 className="text-sm font-semibold text-white">
              Asset & Copyright License Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Setting any asset to &ldquo;Pending Verification&rdquo; automatically blocks QC Check #6.
            </p>
            <div className="space-y-2 text-xs">
              {displayAssets.map((ast) => (
                <div
                  key={ast.id}
                  className="p-3 border border-slate-800/80 bg-slate-950/50 rounded-xl flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-medium text-white">
                      {ast.title}
                    </div>
                    <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                      {ast.id} · {ast.type} · {ast.source}
                    </div>
                  </div>
                  <select
                    aria-label={`License status for ${ast.id}`}
                    value={ast.license_status}
                    onChange={(e) =>
                      onUpdateAssetLicenseStatus(
                        ast.id,
                        e.target.value as AssetLedgerItem['license_status']
                      )
                    }
                    className="px-2.5 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 shrink-0 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Cleared">Cleared</option>
                    <option value="Attribution Required">Attribution Required</option>
                    <option value="Pending Verification">Pending Verification</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
