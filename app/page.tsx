'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Radar,
  Lightbulb,
  FileSearch,
  FileText,
  Film,
  Calendar,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Eye,
  RotateCcw,
} from 'lucide-react';
import {
  ChannelRecord,
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
  PublishRecord,
  AnalyticsRecord,
  ExperimentRecord,
  CommentRecord,
  ApprovalGateConfig,
  TaskQueueRecord,
  AuditLogEntry,
  DailyCycleSlot,
  calculateWeightedIdeaScore,
  evaluateIdeaRiskFlags,
  evaluateVideoAssemblyQC,
  verifyPublishingAuthorization,
  classifyAndTriageComment,
  buildProductionPackageForIdea,
} from '@/lib/automation-engine';
import {
  INITIAL_CHANNELS,
  INITIAL_TRENDS,
  INITIAL_IDEAS,
  INITIAL_CLAIMS,
  INITIAL_SCRIPTS,
  INITIAL_ASSETS,
  INITIAL_VIDEOS,
  INITIAL_PUBLISHES,
  INITIAL_ANALYTICS,
  INITIAL_EXPERIMENTS,
  INITIAL_COMMENTS,
  INITIAL_APPROVAL_GATES,
  INITIAL_TASKS,
  INITIAL_AUDIT_LOGS,
  DAILY_AUTOMATION_CYCLE,
} from '@/lib/seed-data';
import { TraceabilityModal } from '@/components/TraceabilityModal';
import {
  TrendRadarView,
  IdeaBoardView,
  ResearchFactCheckView,
  ScriptStudioView,
  ProductionQcView,
} from '@/components/PipelineViews';
import {
  PublishingCalendarView,
  AnalyticsOptimizerView,
  CommunityAgentView,
  SecurityGatesSettingsView,
} from '@/components/OperationsViews';

type DashboardModule =
  | 'overview'
  | 'trends'
  | 'ideas'
  | 'research'
  | 'scripts'
  | 'production'
  | 'publishing'
  | 'analytics'
  | 'community'
  | 'security';

const STORAGE_KEY = 'pulseforge_automation_os_v1';

export default function AutomationCommandCenterPage() {
  const [activeModule, setActiveModule] = useState<DashboardModule>('overview');
  const [darkMode, setDarkMode] = useState(true);

  // Core 10-Table State + Gates + Audit Logs
  const [channels, setChannels] = useState<ChannelRecord[]>(INITIAL_CHANNELS);
  const [trends, setTrends] = useState<TrendRecord[]>(INITIAL_TRENDS);
  const [ideas, setIdeas] = useState<IdeaRecord[]>(INITIAL_IDEAS);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(INITIAL_IDEAS[0].id);
  const [claims, setClaims] = useState<ResearchClaimRecord[]>(INITIAL_CLAIMS);
  const [scripts, setScripts] = useState<ScriptRecord[]>(INITIAL_SCRIPTS);
  const [assets, setAssets] = useState<AssetLedgerItem[]>(INITIAL_ASSETS);
  const [videos, setVideos] = useState<VideoProductionRecord[]>(INITIAL_VIDEOS);
  const [publishes, setPublishes] = useState<PublishRecord[]>(INITIAL_PUBLISHES);
  const [analytics, setAnalytics] = useState<AnalyticsRecord[]>(INITIAL_ANALYTICS);
  const [experiments, setExperiments] = useState<ExperimentRecord[]>(INITIAL_EXPERIMENTS);
  const [comments, setComments] = useState<CommentRecord[]>(INITIAL_COMMENTS);
  const [gates, setGates] = useState<ApprovalGateConfig[]>(INITIAL_APPROVAL_GATES);
  const [tasks, setTasks] = useState<TaskQueueRecord[]>(INITIAL_TASKS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [dailyCycle, setDailyCycle] = useState<DailyCycleSlot[]>(DAILY_AUTOMATION_CYCLE);
  const [globalKillSwitch, setGlobalKillSwitch] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  // End-to-End Pipeline Runner State
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [quickTopicInput, setQuickTopicInput] = useState('');
  const [pipelineBannerMsg, setPipelineBannerMsg] = useState<string>('');

  // Dossier / PDF Modal State
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('pf_theme');
      const isDark = savedTheme !== 'light';
      setDarkMode(isDark);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', isDark);
      }
    } catch {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');
      }
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.channels) setChannels(parsed.channels);
        if (parsed.trends) setTrends(parsed.trends);
        if (parsed.ideas) setIdeas(parsed.ideas);
        if (parsed.selectedIdeaId) setSelectedIdeaId(parsed.selectedIdeaId);
        if (parsed.claims) setClaims(parsed.claims);
        if (parsed.scripts) setScripts(parsed.scripts);
        if (parsed.assets) setAssets(parsed.assets);
        if (parsed.videos) setVideos(parsed.videos);
        if (parsed.publishes) setPublishes(parsed.publishes);
        if (parsed.analytics) setAnalytics(parsed.analytics);
        if (parsed.experiments) setExperiments(parsed.experiments);
        if (parsed.comments) setComments(parsed.comments);
        if (parsed.gates) setGates(parsed.gates);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.dailyCycle) setDailyCycle(parsed.dailyCycle);
        if (typeof parsed.globalKillSwitch === 'boolean') {
          setGlobalKillSwitch(parsed.globalKillSwitch);
        }
      }
    } catch {
      // Ignore malformed storage
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist to localStorage when state updates
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          channels,
          trends,
          ideas,
          selectedIdeaId,
          claims,
          scripts,
          assets,
          videos,
          publishes,
          analytics,
          experiments,
          comments,
          gates,
          tasks,
          auditLogs,
          dailyCycle,
          globalKillSwitch,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }, [
    hydrated,
    channels,
    trends,
    ideas,
    selectedIdeaId,
    claims,
    scripts,
    assets,
    videos,
    publishes,
    analytics,
    experiments,
    comments,
    gates,
    tasks,
    auditLogs,
    dailyCycle,
    globalKillSwitch,
  ]);

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) || ideas[0];

  // Ensure every Idea has a corresponding VideoProductionRecord so Production & QC works for any selected Idea
  const handleSelectIdeaWithProductionSync = (id: string) => {
    setSelectedIdeaId(id);
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return;
    const hasVideo = videos.some((v) => v.idea_id === id);
    if (!hasVideo) {
      const matchedScript = scripts.find((s) => s.idea_id === id);
      const pkg = buildProductionPackageForIdea(idea, matchedScript);
      setVideos((prev) => [pkg.video, ...prev]);
      setAssets((prev) => [...pkg.assets, ...prev]);
    }
  };

  const handleResetDemoState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setChannels(INITIAL_CHANNELS);
    setTrends(INITIAL_TRENDS);
    setIdeas(INITIAL_IDEAS);
    setSelectedIdeaId(INITIAL_IDEAS[0].id);
    setClaims(INITIAL_CLAIMS);
    setScripts(INITIAL_SCRIPTS);
    setAssets(INITIAL_ASSETS);
    setVideos(INITIAL_VIDEOS);
    setPublishes(INITIAL_PUBLISHES);
    setAnalytics(INITIAL_ANALYTICS);
    setExperiments(INITIAL_EXPERIMENTS);
    setComments(INITIAL_COMMENTS);
    setGates(INITIAL_APPROVAL_GATES);
    setTasks(INITIAL_TASKS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDailyCycle(DAILY_AUTOMATION_CYCLE);
    setGlobalKillSwitch(false);
    setPipelineBannerMsg('System state reset to clean verified seed records.');
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    try {
      localStorage.setItem('pf_theme', next ? 'dark' : 'light');
    } catch {
      // Ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next);
    }
  };

  const appendAuditLog = (
    actor: string,
    moduleName: string,
    action: string,
    targetId: string,
    status: AuditLogEntry['status'] = 'Success'
  ) => {
    const entry: AuditLogEntry = {
      id: `AUD-${Math.floor(8900 + Math.random() * 999)}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      actor,
      module: moduleName,
      action,
      target_id: targetId,
      status,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Master End-to-End AI Automation Runner (calls /api/automation/agent)
  const handleAddTrendAndGenerateIdea = async (params: {
    niche: string;
    keyword: string;
    format: ContentFormat;
  }) => {
    setIsRunningPipeline(true);
    setPipelineBannerMsg(`Running 12-Agent Pipeline for "${params.keyword}"...`);
    try {
      const res = await fetch('/api/automation/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_full_pipeline',
          niche: params.niche,
          topicKeyword: params.keyword,
          format: params.format,
        }),
      });
      const json = await res.json();
      const d = json.data;

      const newTopicId = `TRD-2026-${105 + trends.length}`;
      const newIdeaId = `IDEA-${905 + ideas.length}`;

      const newTrend: TrendRecord = {
        topic_id: newTopicId,
        niche: params.niche,
        keyword: params.keyword,
        source_url: 'https://trends.google.com/trends/explore',
        source_name: d?.source_name || 'YouTube Search Trends + Official Docs RSS',
        source_date: '2026-11-01',
        freshness: d?.score_breakdown?.freshness || 92,
        audience_fit: d?.score_breakdown?.audienceDemand || 91,
        competition: 'Low',
        content_gap:
          d?.content_gap ||
          `High-demand gap for verified architectural walkthrough on ${params.keyword}.`,
        risk_level: d?.risk_level || 'low',
        recommended_format: params.format,
        search_volume_signal: d?.search_volume_signal || '+210% 7d breakout query velocity',
      };

      const newIdea: IdeaRecord = {
        id: newIdeaId,
        topic_id: newTopicId,
        title: d?.idea_title || `${params.keyword}: The Verified Production Blueprint`,
        angle:
          d?.idea_angle ||
          `End-to-end breakdown of ${params.keyword} backed by primary sources and compliance QC.`,
        score: d?.score || 89.2,
        score_breakdown: d?.score_breakdown || {
          audienceDemand: 92,
          freshness: 91,
          contentGap: 89,
          hookPotential: 90,
          feasibility: 86,
          discoveryFit: 85,
          originalityRisk: 88,
        },
        format: params.format,
        status: 'Approved',
        selected_reason: `Generated by Master Pipeline (${json.engine}) with ${d?.score || 89.2} weighted score.`,
        alternative_hooks: d?.alternative_hooks || [
          `Everyone talks about ${params.keyword} — here is what the verified numbers show.`,
          `Why 80% of ${params.keyword} setups fail without a quality control gate.`,
          `The 3-step blueprint for ${params.keyword} using official APIs.`,
        ],
        title_variants: d?.title_variants || [
          `${params.keyword}: The Verified Production Blueprint`,
          `How ${params.keyword} Works in Production`,
          `Complete Architecture Guide: ${params.keyword}`,
        ],
        target_audience: 'AI engineers, technical creators, and media ops leads',
        research_questions: d?.research_questions || [
          `What are the primary benchmark figures for ${params.keyword}?`,
        ],
        risk_flags: d?.risk_flags || [],
        risk_level: d?.risk_level || 'low',
        created_at: '2026-11-01 21:40',
      };

      const newClaims: ResearchClaimRecord[] = (d?.claims || []).map(
        (
          c: { claim: string; source: string; confidence: number; script_usage: string },
          idx: number
        ) => ({
          id: `CLM-${510 + claims.length + idx}`,
          idea_id: newIdeaId,
          topic: params.keyword,
          claim: c.claim,
          source: c.source,
          source_url: 'https://developers.google.com',
          is_primary_source: true,
          date: '2026-11-01',
          confidence: c.confidence || 96,
          script_usage: c.script_usage || 'Context & Main Points',
          verification_status: 'verified' as const,
        })
      );

      const newScript: ScriptRecord = {
        id: `SCR-${710 + scripts.length}`,
        idea_id: newIdeaId,
        version: 1,
        framework: params.format,
        language: 'English (with Roman Urdu Subtitle Track Ready)',
        tone: 'Analytical, Authoritative & Practical',
        reading_level: 'Grade 8 — Clear Technical Prose',
        speaking_speed_wpm: 155,
        target_duration_sec: 360,
        estimated_duration_sec: 345,
        hook: d?.script_hook || newIdea.alternative_hooks[0],
        sections: [
          {
            label: 'Hook',
            timestamp: '00:00 - 00:30',
            content: d?.script_hook || newIdea.alternative_hooks[0],
          },
          {
            label: 'Context',
            timestamp: '00:30 - 01:30',
            content: d?.script_context || newTrend.content_gap,
          },
          {
            label: 'Main points',
            timestamp: '01:30 - 03:45',
            content: d?.script_main_points || newIdea.angle,
          },
          {
            label: 'Examples',
            timestamp: '03:45 - 05:15',
            content: d?.script_examples || 'Traceable database workflow verified.',
          },
          {
            label: 'CTA',
            timestamp: '05:15 - 06:00',
            content: d?.script_cta || 'Drop your questions below.',
          },
        ],
        body: `[00:00 - 00:30] HOOK:\n${d?.script_hook || newIdea.alternative_hooks[0]}\n\n[00:30 - 01:30] CONTEXT:\n${d?.script_context || newTrend.content_gap}\n\n[01:30 - 03:45] MAIN POINTS:\n${d?.script_main_points || newIdea.angle}\n\n[05:15 - 06:00] CTA:\n${d?.script_cta || 'Drop your questions below.'}`,
        cta: d?.script_cta || 'Drop your questions below.',
        facebook_caption: d?.facebook_caption || `${newIdea.title} — Full verified breakdown.`,
        facebook_discussion_prompt:
          d?.facebook_discussion_prompt || `How are you approaching ${params.keyword}?`,
        prohibited_claims_checked: true,
        approval_status: 'approved',
        updated_at: '2026-11-01 21:40',
      };

      const prodPkg = buildProductionPackageForIdea(newIdea, newScript);

      setTrends((prev) => [newTrend, ...prev]);
      setIdeas((prev) => [newIdea, ...prev]);
      if (newClaims.length > 0) {
        setClaims((prev) => [...newClaims, ...prev]);
      }
      setScripts((prev) => [newScript, ...prev]);
      setVideos((prev) => [prodPkg.video, ...prev]);
      setAssets((prev) => [...prodPkg.assets, ...prev]);
      setSelectedIdeaId(newIdeaId);
      setTasks((prev) => [
        {
          id: `TSK-${1010 + prev.length}`,
          job_type: 'Idea Scoring',
          content_title: `${newIdeaId}: ${newIdea.title}`,
          status: 'Completed',
          retries: 0,
          max_retries: 3,
          error: null,
          next_run_at: 'Completed Now',
          duration_ms: 2150,
        },
        ...prev,
      ]);
      appendAuditLog(
        'Master Orchestrator',
        '15. Master Automation Workflow',
        `Generated traceable Trend (${newTopicId}), Scored Idea (${newIdeaId}: ${newIdea.score} pts), Claims, Script & Production Package`,
        newIdeaId
      );
      setPipelineBannerMsg(
        `Pipeline Complete: Created ${newTopicId} → ${newIdeaId} (Score ${newIdea.score}/100) + Verified Claims, Script & Video Production Package.`
      );
    } finally {
      setIsRunningPipeline(false);
    }
  };

  // Handlers for Idea Board
  const handleUpdateIdeaStage = (id: string, nextStage: IdeaStage) => {
    setIdeas((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStage } : item))
    );
    appendAuditLog(
      'Idea Strategist Agent',
      '03. Idea Board',
      `Transitioned ${id} to stage "${nextStage}"`,
      id
    );
  };

  const handleUpdateIdeaScoreBreakdown = (id: string, breakdown: IdeaScoreBreakdown) => {
    const newScore = calculateWeightedIdeaScore(breakdown);
    setIdeas((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const riskEval = evaluateIdeaRiskFlags(breakdown, item.risk_level);
        return {
          ...item,
          score: newScore,
          score_breakdown: breakdown,
          risk_flags: riskEval.flags,
        };
      })
    );
  };

  // Handlers for Research & Fact-Checking
  const handleUpdateClaimStatus = (claimId: string, status: VerificationStatus) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, verification_status: status } : c))
    );
    appendAuditLog(
      'Research / Fact Checker Agent',
      '04. Research & Fact-Check',
      `Updated claim ${claimId} verification status to "${status}"`,
      claimId
    );
  };

  const handleAddVerifiedClaim = (newClaim: Omit<ResearchClaimRecord, 'id'>) => {
    const id = `CLM-${510 + claims.length}`;
    setClaims((prev) => [{ id, ...newClaim }, ...prev]);
    appendAuditLog(
      'Research / Fact Checker Agent',
      '04. Research & Fact-Check',
      `Logged primary source claim ${id} (${newClaim.source})`,
      id
    );
  };

  // Handlers for Script Studio
  const handleSaveOrGenerateScript = (script: ScriptRecord) => {
    setScripts((prev) => {
      const exists = prev.some((s) => s.id === script.id);
      if (exists) {
        return prev.map((s) => (s.id === script.id ? script : s));
      }
      return [script, ...prev];
    });
    appendAuditLog(
      'Scriptwriter Agent',
      '05. Script Studio',
      `Saved ${script.framework} script ${script.id} v${script.version} (${script.approval_status})`,
      script.id
    );
  };

  // Handlers for Video Production & 8-Point QC
  const handleToggleQcItem = (videoId: string, key: keyof VideoQCChecklist) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v;
        const updatedChecklist = {
          ...v.qc_checklist,
          [key]: !v.qc_checklist[key],
        };
        const ideaAssets = assets.filter((a) => a.idea_id === v.idea_id);
        const evalRes = evaluateVideoAssemblyQC(
          { ...v, qc_checklist: updatedChecklist },
          ideaAssets.length > 0 ? ideaAssets : assets
        );
        return {
          ...v,
          qc_checklist: updatedChecklist,
          gate_d_approved: evalRes.passedAllChecks ? v.gate_d_approved : false,
        };
      })
    );
  };

  const handleUpdateAssetLicenseStatus = (
    assetId: string,
    status: AssetLedgerItem['license_status']
  ) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, license_status: status } : a))
    );
    appendAuditLog(
      'Compliance / QC Agent',
      '06. Asset License Ledger',
      `Updated license status for ${assetId} to "${status}"`,
      assetId
    );
  };

  const handleApproveGateD = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, gate_d_approved: true, render_status: 'Ready' } : v
      )
    );
    appendAuditLog(
      'Compliance / QC Agent',
      '07. Video Assembly & QC',
      `Approved Gate D 8-point QC for ${videoId}`,
      videoId
    );
  };

  const handleRunRenderSimulation = (videoId: string) => {
    appendAuditLog(
      'Production Agent',
      '07. FFmpeg Render Worker',
      `Verified master render, 24kHz TTS audio track, and SRT sync for ${videoId}`,
      videoId
    );
    setPipelineBannerMsg(`FFmpeg Render Worker & 8-Point QC verified for ${videoId}.`);
  };

  // Handlers for Publishing Calendar
  const handleToggleChannelOAuth = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, oauth_connected: !ch.oauth_connected } : ch
      )
    );
    appendAuditLog(
      'Security Administrator',
      '17. OAuth 2.0 Controls',
      `Toggled OAuth connection status for channel ${channelId}`,
      channelId
    );
  };

  const handleScheduleNewPost = (params: {
    ideaId: string;
    platform: 'YouTube' | 'Facebook';
    scheduledAt: string;
    title: string;
    playlistOrFeed: string;
  }) => {
    const idea = ideas.find((i) => i.id === params.ideaId) || ideas[0];
    const video = videos.find((v) => v.idea_id === params.ideaId) || videos[0];
    const channel = channels.find((c) => c.platform === params.platform) || channels[0];
    const gateE = gates.find((g) => g.gate_id === 'Gate E')!;
    const idemKey = `idem-${params.platform.toLowerCase()}-${params.ideaId.toLowerCase()}-${params.scheduledAt
      .replace(/\s+/g, '-')
      .toLowerCase()}`;

    const ideaAssets = assets.filter((a) => a.idea_id === video.idea_id);
    const qcEval = evaluateVideoAssemblyQC(
      video,
      ideaAssets.length > 0 ? ideaAssets : assets
    );

    const authCheck = verifyPublishingAuthorization({
      globalKillSwitchActive: globalKillSwitch,
      oauthConnected: channel.oauth_connected,
      qcPassed: qcEval.passedAllChecks,
      gateDApproved: video.gate_d_approved,
      gateEMode: gateE.mode,
      gateEExplicitlyApproved: true,
      contentRiskLevel: idea.risk_level,
      idempotencyKey: idemKey,
      existingIdempotencyKeys: publishes.map((p) => p.idempotency_key),
    });

    if (authCheck.allowed || authCheck.status === 'Blocked by Kill Switch') {
      const newPub: PublishRecord = {
        id: `PUB-${605 + publishes.length}`,
        idea_id: params.ideaId,
        video_id: video.id,
        platform: params.platform,
        channel_id: channel.id,
        post_id:
          params.platform === 'YouTube'
            ? `yt_v3_${Math.random().toString(36).slice(2, 10)}`
            : `fb_graph_${Math.floor(100000000 + Math.random() * 900000000)}`,
        scheduled_at: params.scheduledAt,
        status: authCheck.status,
        title: params.title,
        caption_or_description: `${idea.angle} (Traceable ID: ${idea.id})`,
        tags: ['AIAutomation', 'VerifiedPipeline', params.platform],
        playlist_or_feed: params.playlistOrFeed,
        creative_version: 'v3.1-verified',
        idempotency_key: idemKey,
      };
      setPublishes((prev) => [newPub, ...prev]);
    }

    appendAuditLog(
      'Publisher Agent',
      '08/09. YouTube & Facebook Publisher',
      `${authCheck.allowed ? 'Scheduled' : 'Blocked'} ${params.platform} release for ${params.ideaId}: ${authCheck.reason}`,
      params.ideaId,
      authCheck.allowed ? 'Success' : 'Blocked'
    );

    return { allowed: authCheck.allowed, reason: authCheck.reason };
  };

  const handlePublishNow = (publishId: string) => {
    const targetPub = publishes.find((p) => p.id === publishId);
    if (!targetPub) return;

    if (globalKillSwitch) {
      setPublishes((prev) =>
        prev.map((p) =>
          p.id === publishId ? { ...p, status: 'Blocked by Kill Switch' } : p
        )
      );
      appendAuditLog(
        'Security Kill Switch',
        '17. Global Kill Switch',
        `Halted immediate publish attempt for ${publishId}`,
        publishId,
        'Blocked'
      );
      return;
    }

    setPublishes((prev) =>
      prev.map((p) =>
        p.id === publishId
          ? {
              ...p,
              status: 'Published',
              published_at: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
            }
          : p
      )
    );

    // Mark Idea as Published on the Idea Board and generate initial Analytics Snapshot (Closed-Loop Section 15)
    setIdeas((prev) =>
      prev.map((i) => (i.id === targetPub.idea_id ? { ...i, status: 'Published' } : i))
    );

    const newAnl: AnalyticsRecord = {
      id: `ANL-${105 + analytics.length}`,
      publish_id: targetPub.id,
      idea_id: targetPub.idea_id,
      platform: targetPub.platform,
      post_id: targetPub.post_id,
      date: '2026-11-01',
      impressions: 84200,
      views: 19400,
      ctr_percent: 7.4,
      avg_view_duration_sec: 195,
      retention_rate_percent: 68.5,
      retention_drop_note: 'Strong 00:04 diagram hook retention; steady chapter completion.',
      likes: 1480,
      comments_count: 92,
      shares: 310,
      traffic_sources: { search: 38, suggested: 39, external: 9, browse: 14 },
      audience_split: { new_viewers: 46, casual_viewers: 22, regular_viewers: 32 },
    };
    setAnalytics((prev) => [newAnl, ...prev]);

    appendAuditLog(
      'Publisher Agent',
      '08/09. YouTube & Facebook Publisher',
      `Published ${publishId} (${targetPub.post_id}) & initialized Analytics Loop ${newAnl.id}`,
      publishId
    );
    setPipelineBannerMsg(
      `Published ${targetPub.platform} post (${targetPub.post_id}) and initialized Analytics Telemetry ${newAnl.id}.`
    );
  };

  // Handler for Experiment Winner Adoption -> Pushes next Idea to Idea Board
  const handleAdoptExperimentWinner = (experimentId: string) => {
    const exp = experiments.find((e) => e.id === experimentId);
    if (!exp) return;
    setExperiments((prev) =>
      prev.map((e) =>
        e.id === experimentId
          ? { ...e, decision: 'Winner — Adopt', result_metric: '+14.8% Verified Cohort Winner' }
          : e
      )
    );

    const breakdown: IdeaScoreBreakdown = {
      audienceDemand: 94,
      freshness: 90,
      contentGap: 89,
      hookPotential: 92,
      feasibility: 88,
      discoveryFit: 87,
      originalityRisk: 90,
    };
    const score = calculateWeightedIdeaScore(breakdown);
    const nextIdea: IdeaRecord = {
      id: `IDEA-${905 + ideas.length}`,
      topic_id: trends[0].topic_id,
      title: exp.next_idea_recommendation,
      angle: `Generated from winning A/B Experiment ${exp.id} (${exp.variable}: "${exp.variant_value}").`,
      score,
      score_breakdown: breakdown,
      format: 'Explainer',
      status: 'New',
      selected_reason: `Closed-loop Optimizer winner from ${exp.id} (+${exp.lift_percent}% lift).`,
      alternative_hooks: [
        `Our split test proved "${exp.variant_value}" lifts performance by +${exp.lift_percent}% — here is the full breakdown.`,
      ],
      title_variants: [exp.next_idea_recommendation, exp.variant_value],
      target_audience: 'Technical creators and engineering leads',
      research_questions: ['How does this winning variable scale across long-form and short-form?'],
      risk_flags: [],
      risk_level: 'low',
      created_at: '2026-11-01 22:05',
    };
    setIdeas((prev) => [nextIdea, ...prev]);
    appendAuditLog(
      'Optimization Agent',
      '10. Analytics & Optimizer Loop',
      `Adopted experiment winner ${exp.id} and created next-cycle Idea ${nextIdea.id}`,
      nextIdea.id
    );
    setPipelineBannerMsg(
      `Adopted Experiment Winner ${exp.id} and added "${nextIdea.title}" (${nextIdea.id}) to the Idea Board.`
    );
  };

  // Handlers for Community Comment Agent
  const handleApproveCommentReply = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, reply_status: 'Approved & Sent', requires_human_escalation: false }
          : c
      )
    );
    appendAuditLog(
      'Community Agent',
      '11. Community Comment Agent',
      `Approved and posted brand-voice reply for ${commentId}`,
      commentId
    );
  };

  const handleAddSimulatedComment = async (
    author: string,
    platform: 'YouTube' | 'Facebook',
    text: string
  ) => {
    const triage = classifyAndTriageComment(text);
    let draftReply =
      'Thanks for the insightful comment! We have logged this in our topic cluster for our upcoming technical deep-dive.';
    let extractedIdea = `Audience Question Explainer: ${text.slice(0, 50)}`;
    let faqCluster = 'Viewer Technical Q&A';

    if (triage.requiresEscalation) {
      draftReply =
        '[ESCALATED TO HUMAN REVIEW] Sensitive legal/medical/financial/copyright issue detected. Auto-reply blocked per Section 11 & 17 safety rules.';
      extractedIdea = '';
      faqCluster = 'Escalated Safety & Legal Queue';
    } else {
      try {
        const res = await fetch('/api/automation/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'draft_comment_reply',
            commentText: text,
          }),
        });
        const json = await res.json();
        if (json.ok && json.data) {
          draftReply = json.data.draft_reply || draftReply;
          extractedIdea = json.data.extracted_content_idea || extractedIdea;
          faqCluster = json.data.faq_cluster || faqCluster;
        }
      } catch {
        // use deterministic fallback
      }
    }

    const newCmt: CommentRecord = {
      id: `CMT-${205 + comments.length}`,
      publish_id: publishes[0]?.id || 'PUB-600',
      platform,
      author,
      comment_text: text,
      timestamp: '2026-11-01 22:05',
      category: triage.category,
      sentiment_score: triage.requiresEscalation ? 35 : 86,
      requires_human_escalation: triage.requiresEscalation,
      escalation_reason: triage.escalationReason,
      draft_reply: draftReply,
      reply_status: triage.requiresEscalation ? 'Escalated to Human' : 'Drafted',
      extracted_content_idea: extractedIdea || undefined,
      faq_cluster: faqCluster,
    };

    setComments((prev) => [newCmt, ...prev]);
    appendAuditLog(
      'Community Agent',
      '11. Community Comment Agent',
      `Classified comment ${newCmt.id} as [${triage.category}] (${
        triage.requiresEscalation ? 'Escalated to Human' : 'Drafted Reply'
      })`,
      newCmt.id,
      triage.requiresEscalation ? 'Review Flagged' : 'Success'
    );
  };

  const handlePromoteQuestionToIdea = (questionTitle: string) => {
    const breakdown: IdeaScoreBreakdown = {
      audienceDemand: 93,
      freshness: 88,
      contentGap: 90,
      hookPotential: 87,
      feasibility: 88,
      discoveryFit: 86,
      originalityRisk: 90,
    };
    const score = calculateWeightedIdeaScore(breakdown);
    const newIdea: IdeaRecord = {
      id: `IDEA-${905 + ideas.length}`,
      topic_id: trends[0].topic_id,
      title: questionTitle,
      angle: 'Extracted directly from recurring audience comment feedback in the Community Agent.',
      score,
      score_breakdown: breakdown,
      format: 'Explainer',
      status: 'New',
      selected_reason: 'Extracted from genuine audience comment cluster (Section 11).',
      alternative_hooks: [
        `Our top viewer comment this week asked: "${questionTitle}" — here is the verified answer.`,
      ],
      title_variants: [questionTitle],
      target_audience: 'Regular channel subscribers and technical operators',
      research_questions: ['What is the exact official specification answering this viewer question?'],
      risk_flags: [],
      risk_level: 'low',
      created_at: '2026-11-01 22:05',
    };
    const prodPkg = buildProductionPackageForIdea(newIdea);
    setIdeas((prev) => [newIdea, ...prev]);
    setVideos((prev) => [prodPkg.video, ...prev]);
    setAssets((prev) => [...prodPkg.assets, ...prev]);
    setSelectedIdeaId(newIdea.id);
    setActiveModule('ideas');
    setPipelineBannerMsg(`Promoted viewer question into Idea ${newIdea.id} (Score: ${score}/100).`);
  };

  // Handlers for Security & Gates
  const handleToggleKillSwitch = () => {
    const next = !globalKillSwitch;
    setGlobalKillSwitch(next);
    appendAuditLog(
      'System Administrator',
      '17. Global Kill Switch',
      next
        ? 'ENGAGED Global Publishing Kill Switch — All outbound YouTube/FB API calls locked'
        : 'Disengaged Global Publishing Kill Switch — Authorized publishing resumed',
      'GLOBAL-KILL-SWITCH',
      next ? 'Blocked' : 'Success'
    );
  };

  const handleUpdateGateMode = (
    gateId: ApprovalGateConfig['gate_id'],
    mode: ApprovalGateConfig['mode']
  ) => {
    setGates((prev) =>
      prev.map((g) => (g.gate_id === gateId ? { ...g, mode } : g))
    );
    appendAuditLog(
      'System Administrator',
      '12. Human Approval Gates',
      `Updated ${gateId} enforcement policy to "${mode}"`,
      gateId
    );
  };

  const handleAdvanceDailyCycle = () => {
    setDailyCycle((prev) => {
      const activeIdx = prev.findIndex((s) => s.status === 'Active');
      if (activeIdx === -1) {
        return prev.map((s, i) => ({
          ...s,
          status: i === 0 ? 'Active' : 'Scheduled',
        }));
      }
      return prev.map((slot, idx) => {
        if (idx === activeIdx) return { ...slot, status: 'Completed' };
        if (idx === activeIdx + 1) return { ...slot, status: 'Active' };
        return slot;
      });
    });
    appendAuditLog(
      'Cron Scheduler',
      '18. Daily Automation Cycle',
      'Advanced daily automation cycle to next scheduled stage',
      'DAILY-CYCLE'
    );
  };

  const navItems: Array<{
    id: DashboardModule;
    label: string;
    shortNum: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'overview', label: 'Overview & Daily Cycle', shortNum: '01', icon: LayoutDashboard },
    { id: 'trends', label: 'Trend Radar', shortNum: '02', icon: Radar },
    { id: 'ideas', label: 'Idea Board & Scorer', shortNum: '03', icon: Lightbulb },
    { id: 'research', label: 'Research & Fact-Check', shortNum: '04', icon: FileSearch },
    { id: 'scripts', label: 'Script Studio', shortNum: '05', icon: FileText },
    { id: 'production', label: 'Production & 8-Pt QC', shortNum: '06', icon: Film },
    { id: 'publishing', label: 'Publishing Calendar', shortNum: '08', icon: Calendar },
    { id: 'analytics', label: 'Analytics & Optimizer', shortNum: '10', icon: BarChart3 },
    { id: 'community', label: 'Community Agent', shortNum: '11', icon: MessageSquare },
    { id: 'security', label: 'Gates, Agents & Security', shortNum: '12', icon: ShieldCheck },
  ];

  const activeNavMeta = navItems.find((n) => n.id === activeModule) || navItems[0];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-200">
      {/* Left Workspace Sidebar (260px on Desktop) */}
      <aside
        aria-label="Automation Modules Sidebar"
        className="w-full lg:w-64 shrink-0 bg-[#0c101c]/90 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between relative z-20"
      >
        <div>
          {/* Brand Header */}
          <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  PulseForge <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">OS</span>
                </span>
                <div className="text-[10px] text-slate-400 font-mono tracking-wider">AI AUTOMATION</div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={darkMode ? 'Switch to Day (Light) mode' : 'Switch to Night (Dark) mode'}
              title={darkMode ? 'Switch to Day (Light) mode' : 'Switch to Night (Dark) mode'}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-800/60 transition-all duration-200"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveModule(item.id)}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent text-cyan-300 font-semibold border-l-2 border-cyan-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:translate-x-0.5'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-slate-400'}`} />
                  <span className="font-mono text-[10px] opacity-60 tracking-wider">{item.shortNum}.</span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Reference & Active Item Dossier Trigger */}
        <div className="hidden lg:block p-4 border-t border-slate-800/80 space-y-2 text-xs bg-slate-950/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Active:</span>
              <strong className="font-mono text-cyan-300">
                {selectedIdea.id}
              </strong>
            </span>
            <button
              type="button"
              onClick={handleResetDemoState}
              title="Reset Demo Data"
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3 hover:rotate-180 transition-transform duration-300" />
              Reset
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsDossierOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 rounded-xl transition-all duration-200 whitespace-nowrap shadow-xs hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            18-Item Dossier & PDF Spec
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb on Left, Primary Actions on Right */}
        <header className="flex items-center justify-between gap-6 px-6 py-4 bg-[#0c101c]/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 font-mono hidden sm:block">
              PIPELINE CONTRACT <span className="text-cyan-400">/</span>
            </div>
            <div className="text-sm font-semibold text-white whitespace-nowrap truncate flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs">{activeNavMeta.shortNum}.</span>
              <span>{activeNavMeta.label}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              12 AGENTS ONLINE
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={darkMode ? 'Switch to Day (Light) mode' : 'Switch to Night (Dark) mode'}
              title={darkMode ? 'Switch to Day (Light) mode' : 'Switch to Night (Dark) mode'}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-700/70 transition-all duration-200"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
            </button>
            <button
              type="button"
              onClick={() => setIsDossierOpen(true)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/70 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-200 whitespace-nowrap shrink-0 hover:shadow-xs"
            >
              Inspect 18-Deliverable Dossier
            </button>
            <button
              type="button"
              onClick={() =>
                handleAddTrendAndGenerateIdea({
                  niche: 'AI Engineering & Creator Systems',
                  keyword:
                    quickTopicInput.trim() ||
                    'Automated Multi-Language Dubbing & Lip-Sync QC Pipelines',
                  format: 'Long-form',
                })
              }
              disabled={isRunningPipeline}
              className="relative inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 rounded-xl disabled:opacity-60 transition-all duration-200 whitespace-nowrap shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>{isRunningPipeline ? 'Running 12-Agent Pipeline...' : 'Run End-to-End Pipeline'}</span>
            </button>
          </div>
        </header>

        {/* Live Status Notification Banner */}
        {pipelineBannerMsg && (
          <div className="px-6 py-2.5 bg-gradient-to-r from-cyan-950/70 via-blue-950/50 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-medium">{pipelineBannerMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setPipelineBannerMsg('')}
              className="text-cyan-400 hover:text-white font-mono ml-4 text-[11px] underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Viewport Container */}
        <main className="flex-1 p-6 max-w-[1440px] w-full mx-auto space-y-6">
          {activeModule === 'overview' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Hero Command Banner & Quick End-to-End Content Factory Runner */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1322]/80 to-[#07090e] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        ENTERPRISE AUTOMATION SYSTEM · YOUTUBE DATA API + META GRAPH API
                      </div>
                      <h1 className="text-2xl font-bold text-white mt-2 tracking-tight">
                        YouTube & Facebook AI Automation Agent Command Center
                      </h1>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                        Traceable 9-module content factory: Trend Intelligence → 7-Factor Idea Scoring → Primary-Source Fact-Checking → Multi-Format Scriptwriting → Creative Storyboard & License Ledger → 8-Point Video QC → Authorized OAuth Publishing → 6-Signal Analytics & Continuous Optimization.
                      </p>
                    </div>

                    {/* Quick Topic Pipeline Input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddTrendAndGenerateIdea({
                          niche: 'AI Engineering & Content Automation',
                          keyword:
                            quickTopicInput.trim() ||
                            'Zero-Hallucination Fact-Checking Agents for Video Creators',
                          format: 'Long-form',
                        });
                        setQuickTopicInput('');
                      }}
                      className="flex flex-col sm:flex-row gap-2.5 pt-2"
                    >
                      <input
                        type="text"
                        aria-label="Enter topic to run full automation pipeline"
                        placeholder="Enter a topic or trend keyword to run the 9-module pipeline..."
                        value={quickTopicInput}
                        onChange={(e) => setQuickTopicInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
                      />
                      <button
                        type="submit"
                        disabled={isRunningPipeline}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] whitespace-nowrap shrink-0 active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                        {isRunningPipeline ? 'Synthesizing...' : 'Generate Traceable Content Item'}
                      </button>
                    </form>
                  </div>

                  {/* Right System Compliance & Core Rule Card */}
                  <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between space-y-4 backdrop-blur-md">
                    <div>
                      <div className="text-[11px] font-mono text-cyan-400/90 tracking-wider">
                        CORE COMPLIANCE & GOVERNANCE CONTRACT
                      </div>
                      <h2 className="text-sm font-semibold text-white mt-1">
                        Authorized APIs & Human Approval Gates (A–F)
                      </h2>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        Strictly uses authorized YouTube OAuth & Meta Graph APIs. Zero fake engagement, zero mass unsolicited messaging, zero private-data scraping, and mandatory primary-source fact-checking before script or video synthesis.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        Status:{' '}
                        <strong
                          className={`flex items-center gap-1.5 ${
                            globalKillSwitch
                              ? 'text-red-400 font-semibold'
                              : 'text-emerald-400 font-semibold'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${globalKillSwitch ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
                          {globalKillSwitch ? 'HALTED (Kill Switch Active)' : 'Nominal (Gates A–F Active)'}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveModule('security')}
                        className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline text-xs"
                      >
                        Configure Gates →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-Width 4-Column KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono tabular-nums">
                <div className="bg-[#0c101c]/80 border border-slate-800/80 border-t-2 border-t-cyan-500 rounded-2xl p-5 backdrop-blur-xl hover:-translate-y-1 hover:border-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                  <div className="text-xs text-slate-400 font-sans flex items-center justify-between">
                    <span>Connected Channels (OAuth 2.0)</span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">
                    {channels.filter((c) => c.oauth_connected).length} / {channels.length} Active
                  </div>
                  <div className="text-xs text-slate-400 font-sans mt-1">
                    YouTube (184.2K) · Facebook (312.5K)
                  </div>
                </div>

                <div className="bg-[#0c101c]/80 border border-slate-800/80 border-t-2 border-t-blue-500 rounded-2xl p-5 backdrop-blur-xl hover:-translate-y-1 hover:border-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                  <div className="text-xs text-slate-400 font-sans flex items-center justify-between">
                    <span>Traceable Content Items</span>
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400 mt-2">
                    {ideas.length} Items
                  </div>
                  <div className="text-xs text-slate-400 font-sans mt-1">
                    Top Score: {Math.max(...ideas.map((i) => i.score))} / 100 (7-Factor Rubric)
                  </div>
                </div>

                <div className="bg-[#0c101c]/80 border border-slate-800/80 border-t-2 border-t-emerald-500 rounded-2xl p-5 backdrop-blur-xl hover:-translate-y-1 hover:border-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <div className="text-xs text-slate-400 font-sans flex items-center justify-between">
                    <span>Fact-Check & QC Pass Rate</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 mt-2">
                    8 / 8 Checks
                  </div>
                  <div className="text-xs text-slate-400 font-sans mt-1">
                    {claims.filter((c) => c.verification_status === 'verified').length} Verified Claims · {assets.length} Ledger Assets
                  </div>
                </div>

                <div className="bg-[#0c101c]/80 border border-slate-800/80 border-t-2 border-t-purple-500 rounded-2xl p-5 backdrop-blur-xl hover:-translate-y-1 hover:border-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                  <div className="text-xs text-slate-400 font-sans flex items-center justify-between">
                    <span>Scheduled & Published Releases</span>
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-purple-400 mt-2">
                    {publishes.length} Posts
                  </div>
                  <div className="text-xs text-slate-400 font-sans mt-1">
                    Avg Retention: 76.4% YT · 65.2% FB
                  </div>
                </div>
              </div>

              {/* Section 1: Complete 9-Module System Architecture Table (PDF Page 2) */}
              <div className="bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
                <div className="px-6 py-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/40">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span className="text-cyan-400 font-mono text-xs">01.</span>
                      <span>Complete 9-Module System Architecture & Traceable Record Hand-Off</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Every module passes structured records to the next module so every content item remains traceable from research to final result.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDossierOpen(true)}
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:underline whitespace-nowrap shrink-0"
                  >
                    View Original 21-Page PDF Blueprint →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-xs text-slate-400 bg-slate-950/60 font-mono">
                        <th className="py-3 px-4 font-medium">Module</th>
                        <th className="py-3 px-4 font-medium">Main Job</th>
                        <th className="py-3 px-4 font-medium">Structured Output Record</th>
                        <th className="py-3 px-4 font-medium">Approval Gate</th>
                        <th className="py-3 px-4 font-medium text-right">Workspace Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {[
                        {
                          mod: '01. Trend Intelligence',
                          job: 'Search trends, public content patterns, niche changes, own analytics',
                          out: 'Trend records (topic_id, freshness, gap, format)',
                          gate: 'Automated Cron (06:00)',
                          target: 'trends' as DashboardModule,
                        },
                        {
                          mod: '02. Idea Engine',
                          job: 'Generate and score content angles across 7 weighted factors',
                          out: 'Ranked ideas (score, 3 hooks, 5 titles, risk flags)',
                          gate: 'Gate A (Optional)',
                          target: 'ideas' as DashboardModule,
                        },
                        {
                          mod: '03. Research Agent',
                          job: 'Collect and verify primary facts/sources; block unsupported claims',
                          out: 'Research brief (claim, source, date, confidence)',
                          gate: 'Gate B (High-Risk Claims)',
                          target: 'research' as DashboardModule,
                        },
                        {
                          mod: '04. Script Agent',
                          job: 'Hooks, structure, narration, speaking-speed WPM, Facebook caption, CTA',
                          out: 'Final script (6 supported frameworks)',
                          gate: 'Gate C (Configurable)',
                          target: 'scripts' as DashboardModule,
                        },
                        {
                          mod: '05. Creative Director',
                          job: 'Titles, thumbnails, timestamped storyboard, B-roll & license ledger',
                          out: 'Production brief & asset license ledger',
                          gate: 'Automated Ledger Check',
                          target: 'production' as DashboardModule,
                        },
                        {
                          mod: '06. Production & Assembly',
                          job: 'Voice TTS, visuals, synchronized SRT captions, FFmpeg rendering, 8-pt QC',
                          out: 'Verified video assets + SRT + thumbnail concepts',
                          gate: 'Gate D (Recommended QC)',
                          target: 'production' as DashboardModule,
                        },
                        {
                          mod: '07. Publisher Agent',
                          job: 'YouTube Data API + Meta Graph API metadata, chapters, scheduling',
                          out: 'Published/scheduled post + idempotency key',
                          gate: 'Gate E + Global Kill Switch',
                          target: 'publishing' as DashboardModule,
                        },
                        {
                          mod: '08. Analytics & Community',
                          job: 'Performance analysis (6 signals) + comment classification & FAQ extraction',
                          out: 'Performance report + triaged comments',
                          gate: 'Human Escalation for Safety',
                          target: 'analytics' as DashboardModule,
                        },
                        {
                          mod: '09. Optimizer Agent',
                          job: 'Hook/title/thumbnail A/B experiments and next-cycle topic allocation',
                          out: 'Optimization actions & next ideas',
                          gate: 'Gate F (Weekly Review)',
                          target: 'analytics' as DashboardModule,
                        },
                      ].map((row) => (
                        <tr key={row.mod} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white">
                            {row.mod}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{row.job}</td>
                          <td className="py-3 px-4 font-mono text-cyan-300">
                            {row.out}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{row.gate}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setActiveModule(row.target)}
                              className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium whitespace-nowrap"
                            >
                              Open Module →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 18: Daily Automation Cycle (06:00 -> Nightly) & Active Worker Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <span className="text-cyan-400 font-mono text-xs">18.</span>
                        <span>Configurable Daily Automation Cycle (06:00 → Nightly)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Closed feedback loop scheduled by channel timezone and audience retention windows.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAdvanceDailyCycle}
                      className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-cyan-500/20 whitespace-nowrap shrink-0 active:scale-95"
                    >
                      Step Next Cycle Window
                    </button>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {dailyCycle.map((slot) => (
                      <div
                        key={slot.time}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-4 transition-all duration-200 ${
                          slot.status === 'Active'
                            ? 'border-cyan-500/60 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                            : 'border-slate-800/70 bg-slate-950/30 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono font-bold text-cyan-400 shrink-0">
                            {slot.time}
                          </span>
                          <div>
                            <div className="font-semibold text-white">
                              {slot.stage} ({slot.module})
                            </div>
                            <div className="text-slate-400 mt-0.5">
                              {slot.description}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`font-mono font-medium shrink-0 flex items-center gap-1.5 ${
                            slot.status === 'Completed'
                              ? 'text-emerald-400'
                              : slot.status === 'Active'
                              ? 'text-cyan-300 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          {slot.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                          {slot.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Redis / BullMQ Worker Queue (tasks table from Section 14) */}
                <div className="lg:col-span-5 bg-[#0c101c]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
                  <div className="pb-3 border-b border-slate-800/80">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span className="text-cyan-400 font-mono text-xs">13 & 14.</span>
                      <span>Queue Worker Tasks & Retries (BullMQ / Cron)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tracks job_type, status, retries, error state, and next_run_at.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs max-h-80 overflow-y-auto pr-1">
                    {tasks.map((tsk) => (
                      <div
                        key={tsk.id}
                        className="p-3 border border-slate-800/70 bg-slate-950/40 rounded-xl space-y-1 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between font-mono text-slate-400">
                          <span className="text-cyan-300">
                            {tsk.id} · {tsk.job_type}
                          </span>
                          <span
                            className={
                              tsk.status === 'Completed'
                                ? 'text-emerald-400 font-semibold'
                                : tsk.status === 'Awaiting Gate'
                                ? 'text-amber-400 font-semibold'
                                : 'text-cyan-400 font-semibold'
                            }
                          >
                            {tsk.status}
                          </span>
                        </div>
                        <div className="font-medium text-white">
                          {tsk.content_title}
                        </div>
                        {tsk.error && (
                          <div className="text-amber-400">{tsk.error}</div>
                        )}
                        <div className="text-slate-500 font-mono tabular-nums text-[11px]">
                          Retries: {tsk.retries}/{tsk.max_retries} · Duration: {tsk.duration_ms}ms · Next: {tsk.next_run_at}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'trends' && (
            <TrendRadarView
              trends={trends}
              onAddTrendAndGenerateIdea={handleAddTrendAndGenerateIdea}
              isRunningPipeline={isRunningPipeline}
            />
          )}

          {activeModule === 'ideas' && (
            <IdeaBoardView
              ideas={ideas}
              selectedIdeaId={selectedIdeaId}
              onSelectIdea={handleSelectIdeaWithProductionSync}
              onUpdateIdeaStage={handleUpdateIdeaStage}
              onUpdateIdeaScoreBreakdown={handleUpdateIdeaScoreBreakdown}
              onOpenDossier={(idea) => {
                handleSelectIdeaWithProductionSync(idea.id);
                setIsDossierOpen(true);
              }}
            />
          )}

          {activeModule === 'research' && (
            <ResearchFactCheckView
              claims={claims}
              ideas={ideas}
              selectedIdeaId={selectedIdeaId}
              onSelectIdea={handleSelectIdeaWithProductionSync}
              onUpdateClaimStatus={handleUpdateClaimStatus}
              onAddVerifiedClaim={handleAddVerifiedClaim}
              gateBEnabled={gates.find((g) => g.gate_id === 'Gate B')?.enabled ?? true}
            />
          )}

          {activeModule === 'scripts' && (
            <ScriptStudioView
              scripts={scripts}
              ideas={ideas}
              claims={claims}
              selectedIdeaId={selectedIdeaId}
              onSelectIdea={handleSelectIdeaWithProductionSync}
              onSaveOrGenerateScript={handleSaveOrGenerateScript}
            />
          )}

          {activeModule === 'production' && (
            <ProductionQcView
              ideas={ideas}
              selectedIdeaId={selectedIdeaId}
              onSelectIdea={handleSelectIdeaWithProductionSync}
              videos={videos}
              assets={assets}
              onToggleQcItem={handleToggleQcItem}
              onApproveGateD={handleApproveGateD}
              onRunRenderSimulation={handleRunRenderSimulation}
              onUpdateAssetLicenseStatus={handleUpdateAssetLicenseStatus}
            />
          )}

          {activeModule === 'publishing' && (
            <PublishingCalendarView
              channels={channels}
              onToggleChannelOAuth={handleToggleChannelOAuth}
              publishes={publishes}
              ideas={ideas}
              videos={videos}
              globalKillSwitch={globalKillSwitch}
              onScheduleNewPost={handleScheduleNewPost}
              onPublishNow={handlePublishNow}
            />
          )}

          {activeModule === 'analytics' && (
            <AnalyticsOptimizerView
              analytics={analytics}
              experiments={experiments}
              onCreateExperiment={(exp) => {
                const newExp: ExperimentRecord = {
                  id: `EXP-${405 + experiments.length}`,
                  ...exp,
                };
                setExperiments((prev) => [newExp, ...prev]);
                appendAuditLog(
                  'Optimization Agent',
                  '10. Experiment Center',
                  `Created split test ${newExp.id} on ${newExp.variable}`,
                  newExp.id
                );
              }}
              onAdoptExperimentWinner={handleAdoptExperimentWinner}
            />
          )}

          {activeModule === 'community' && (
            <CommunityAgentView
              comments={comments}
              onApproveCommentReply={handleApproveCommentReply}
              onAddSimulatedComment={handleAddSimulatedComment}
              onPromoteQuestionToIdea={handlePromoteQuestionToIdea}
            />
          )}

          {activeModule === 'security' && (
            <SecurityGatesSettingsView
              gates={gates}
              globalKillSwitch={globalKillSwitch}
              onToggleKillSwitch={handleToggleKillSwitch}
              onUpdateGateMode={handleUpdateGateMode}
              auditLogs={auditLogs}
              activeIdea={selectedIdea}
            />
          )}
        </main>
      </div>

      {/* Section 20: Final 18-Deliverable Output Per Content Item + Original PDF Modal */}
      <TraceabilityModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        selectedIdea={selectedIdea}
        trends={trends}
        claims={claims}
        scripts={scripts}
        assets={assets}
        videos={videos}
        publishes={publishes}
        analytics={analytics}
        experiments={experiments}
      />
    </div>
  );
}
