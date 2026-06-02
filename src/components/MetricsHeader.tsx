import React from "react";
import { AlertCircle, Calendar, CheckCircle, TrendingUp, DollarSign, Award } from "lucide-react";
import { DashboardSummary } from "../types";

interface MetricsHeaderProps {
  summary: DashboardSummary;
}

export default function MetricsHeader({ summary }: MetricsHeaderProps) {
  // Score label style
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-700 bg-emerald-50 border-emerald-250";
    if (score >= 75) return "text-amber-700 bg-amber-50 border-amber-250";
    return "text-rose-700 bg-rose-50 border-rose-250";
  };

  return (
    <div id="metrics-summary-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: OVERDUE */}
      <div id="card-metric-overdue" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-rose-550/30 transition-all shadow-sm flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-mono tracking-wider text-slate-500 uppercase font-semibold">Overdue filings</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-sans font-extrabold text-rose-600">{summary.overdueCount}</h3>
            <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-250 font-mono px-1.5 py-0.5 rounded font-semibold">Immediate attention</span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">Requires filing online immediately.</p>
        </div>
        <div className="p-3 rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* CARD 2: DUE THIS WEEK */}
      <div id="card-metric-due-week" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-amber-550/30 transition-all shadow-sm flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-mono tracking-wider text-slate-500 uppercase font-semibold">Due this week</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-sans font-extrabold text-amber-600">{summary.dueThisWeek}</h3>
            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-250 font-mono px-1.5 py-0.5 rounded font-semibold">Approaching list</span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">Prepare accounts & tally registers.</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      {/* CARD 3: DUE THIS MONTH */}
      <div id="card-metric-due-month" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-550/30 transition-all shadow-sm flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-mono tracking-wider text-slate-500 uppercase font-semibold">Due this month</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-sans font-extrabold text-sky-600">{summary.dueThisMonth}</h3>
            <span className="text-[10px] text-sky-700 bg-sky-50 border border-sky-250 font-mono px-1.5 py-0.5 rounded font-semibold">Mapped timelines</span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">Automatic recurrent timelines configured.</p>
        </div>
        <div className="p-3 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* CARD 4: COMPLIANCE HEALTH SCORE */}
      <div id="card-metric-health" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-550/30 transition-all shadow-sm flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-mono tracking-wider text-slate-500 uppercase font-semibold">Compliance score</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-sans font-extrabold text-emerald-600">{summary.complianceScore}%</h3>
            <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border font-semibold ${getScoreColor(summary.complianceScore)}`}>
              {summary.complianceScore >= 90 ? "Excellent" : summary.complianceScore >= 75 ? "Warning" : "Critical"}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">Filings submitted without penalty offsets.</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
          <Award className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
