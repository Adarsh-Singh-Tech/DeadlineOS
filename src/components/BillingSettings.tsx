import React, { useState } from "react";
import { Check, CreditCard, Sparkles, Loader2, Star, ShieldCheck, Zap } from "lucide-react";
import { Workspace, PlanTier } from "../types";

interface BillingSettingsProps {
  workspace: Workspace;
  onRefreshWorkspace: () => void;
}

export default function BillingSettings({ workspace, onRefreshWorkspace }: BillingSettingsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<any | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const plans = [
    {
      id: "starter",
      name: "Starter Sandbox Mode",
      price: "₹0",
      period: "forever",
      description: "Ideal for fresh Sole Proprietors & Single Micro-consultancies.",
      features: [
        "Track 1 Registered Business Entity",
        "Standard Email notifications alerts",
        "Basic regulatory tax suggested dashboard",
        "Standard support channels"
      ]
    },
    {
      id: "growth",
      name: "Corporate Growth License",
      price: "₹1,999",
      period: "monthly",
      badge: "MOST POPULAR",
      description: "Supports growing small startups that handle multiple business units.",
      features: [
        "Track up to 3 Concurrent Entities",
        "WhatsApp Sandbox SMS Alerts on phone",
        "Expert CA advisor relationship dashboard portal",
        "Secure digital receipt storage document vaults",
        "Extended timeline calendar grid"
      ]
    },
    {
      id: "business",
      name: "Enterprise Business Slate",
      price: "₹4,999",
      period: "monthly",
      description: "Ultimate statutory peace of mind for agencies and CAs handling wide books.",
      features: [
        "Track up to 10 Registered Entities",
        "Automated AI filing summary guidelines from Gemini",
        "Dedicated Chartered Accountant direct partnership",
        "Bulk filings integration logs",
        "Advanced practitioners audit logs & telemetry tracking",
        "Priority live desk support"
      ]
    }
  ];

  const handleUpgrade = (plan: any) => {
    setCheckoutPlan(plan);
    setSuccess(false);
  };

  const executeSimulatedRazorpay = async () => {
    if (!checkoutPlan) return;
    setLoading("VERIFYING_CARD_BANK_DETAILS");
    try {
      const res = await fetch("/api/v1/workspaces/me/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_tier: checkoutPlan.id }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setCheckoutPlan(null);
          onRefreshWorkspace(); // trigger reload
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div id="billing-licensing-settings" className="space-y-6">
      {/* active Plan status info banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[9px] uppercase font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded leading-none font-bold">
            Active Workspace Tier
          </span>
          <h2 className="text-md font-sans font-extrabold text-slate-800 flex items-center gap-1.5 uppercase mt-1">
            <CreditCard className="w-4.5 h-4.5 text-blue-600" />
            {workspace.plan_tier} Compliance Mode Enabled
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Registered Workspace: <strong className="text-slate-700">{workspace.name}</strong> • Licensed on {new Date(workspace.created_at).toLocaleDateString("en-IN")}
          </p>
        </div>

        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-xs font-mono text-slate-700 uppercase font-bold">
            {workspace.plan_tier === "business" ? "10 Entity Limit Active" : workspace.plan_tier === "growth" ? "3 Entity Limit Active" : "1 Entity Limit Active"}
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {plans.map((pl) => {
          const isCurrent = workspace.plan_tier === pl.id;

          return (
            <div
              key={pl.id}
              className={`bg-white border rounded-2xl p-6 flex flex-col justify-between space-y-6 relative transition-all shadow-sm hover:translate-y-[-2px] ${
                isCurrent 
                  ? "border-blue-500 shadow-blue-500/5 bg-gradient-to-b from-white to-blue-50/15" 
                  : pl.badge 
                  ? "border-slate-250 " 
                  : "border-slate-200"
              }`}
            >
              {pl.badge && (
                <span className="absolute top-0 right-6 translate-y-[-50%] bg-blue-600 text-white font-bold font-mono tracking-wide text-[9px] px-2.5 py-0.5 rounded-full shadow-md">
                  {pl.badge}
                </span>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-xs font-extrabold uppercase font-mono tracking-wider text-slate-500">{pl.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-sans font-extrabold text-slate-800">{pl.price}</span>
                    <span className="text-xs text-slate-400 font-mono">/ {pl.period}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">{pl.description}</p>
                </div>

                <ul className="space-y-2.5 border-t border-slate-150 pt-4.5">
                  {pl.features.map((ft, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-xs text-slate-600">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{ft}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isCurrent ? (
                <div className="w-full text-center border border-emerald-250 bg-emerald-50 py-2.5 rounded-xl text-emerald-800 font-mono text-[10px] uppercase font-extrabold tracking-wider flex items-center justify-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Active Licensed Plan
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpgrade(pl)}
                  className="w-full py-2.5 rounded-xl font-mono text-xs font-extrabold transition-all border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100/50 hover:text-blue-700 hover:border-blue-300 cursor-pointer"
                >
                  Configure {pl.id} plan &rarr;
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* RAZORPAY GATEWAY OVERLAY INTEGRATION */}
      {checkoutPlan && (
        <div id="razorpay-simulated-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => setCheckoutPlan(null)} />
          
          <div className="bg-white border border-slate-250 rounded-2xl w-full max-w-md p-6 relative z-10 space-y-6 shadow-2xl overflow-hidden">
            {/* Razorpay Brand Header bar */}
            <div className="bg-slate-900 mx-[-24px] mt-[-24px] p-4 border-b border-slate-800 flex items-center justify-between px-6 shadow-md">
              <span className="text-[10px] font-mono tracking-widest text-[#528FF0] font-extrabold flex items-center gap-1 align-middle">
                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                RAZORPAY SUBSCRIPTOR
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Test Sandbox Mode</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">Upgrade License To</span>
                <h4 className="text-sm font-sans font-extrabold text-slate-800">{checkoutPlan.name}</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Immediate debit cycle active of <strong className="text-slate-800 font-bold">{checkoutPlan.price}</strong> per {checkoutPlan.period}. Features list will unlock on your compliance workspace instantly.
                </p>
              </div>

              {success ? (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Subscription Verified! Reloading workspace module...
                </div>
              ) : (
                <div className="space-y-3.5 border-t border-slate-150 pt-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-500 font-mono flex items-center gap-2 leading-relaxed">
                    <Loader2 className="w-4.5 h-4.5 text-blue-600 animate-spin shrink-0" />
                    Razorpay secured checkout connection initiated...
                  </div>

                  <button
                    onClick={executeSimulatedRazorpay}
                    disabled={loading !== null}
                    className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                  >
                    Confirm simulated payment gateway
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
