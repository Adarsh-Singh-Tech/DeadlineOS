import React, { useState, useEffect } from "react";
import { Users, Search, Bell, Mail, PlusCircle, Sparkles, Loader2, CheckCircle2, ShieldAlert, ExternalLink } from "lucide-react";
import { AdvisorRelationship } from "../types";

export default function CaAdvisorPortal() {
  const [loading, setLoading] = useState<boolean>(false);
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [healthFilter, setHealthFilter] = useState<string>("All");

  // Invite client modal states
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [inviteWorkspaceName, setInviteWorkspaceName] = useState<string>("");
  const [invitingState, setInvitingState] = useState<boolean>(false);

  // Nudge states
  const [nudgeModalOpen, setNudgeModalOpen] = useState<boolean>(false);
  const [activeNudgeClient, setActiveNudgeClient] = useState<any | null>(null);
  const [nudgeMessage, setNudgeMessage] = useState<string>("");
  const [nudgingState, setNudgingState] = useState<boolean>(false);
  const [actionDoneMsg, setActionDoneMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/advisor/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data || []);
      }
    } catch (err) {
      console.error("Failed to load CA Advisor client workspaces", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNudge = (client: any) => {
    setActiveNudgeClient(client);
    setNudgeMessage(`Please review upcoming statutory timelines immediately. Missing GSTR filing dates triggers standard interest balances & penalty notices.`);
    setNudgeModalOpen(true);
    setActionDoneMsg(null);
  };

  const submitNudge = async () => {
    if (!activeNudgeClient) return;
    setNudgingState(true);
    try {
      const res = await fetch("/api/v1/advisor/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_workspace_id: activeNudgeClient.client_workspace_id,
          message: nudgeMessage,
        }),
      });

      if (res.ok) {
        setActionDoneMsg("WhatsApp push nudges and transactional email alerts successfully dispatched.");
        setTimeout(() => {
          setNudgeModalOpen(false);
          setActionDoneMsg(null);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNudgingState(false);
    }
  };

  const submitInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteWorkspaceName.trim()) return;
    setInvitingState(true);
    try {
      const res = await fetch("/api/v1/advisor/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName: inviteWorkspaceName }),
      });

      if (res.ok) {
        setInviteWorkspaceName("");
        setInviteModalOpen(false);
        fetchClients(); // refresh
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInvitingState(false);
    }
  };

  const handleSwitchWorkspaceContext = async (workspaceId: string) => {
    try {
      const res = await fetch("/api/v1/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      if (res.ok) {
        window.location.reload(); // Quick refresh to load client calendar context
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.client_workspace_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesHealth = true;
    if (healthFilter === "critical") matchesHealth = c.overdue_count > 0;
    else if (healthFilter === "healthy") matchesHealth = c.compliance_score >= 90;

    return matchesSearch && matchesHealth;
  });

  return (
    <div id="ca-advisor-dashboard" className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-md font-sans font-extrabold text-slate-850 uppercase tracking-wide">CA Professional Practice Studio</h2>
          </div>
          <p className="text-xs text-slate-500">
            Monitor client multi-tenancy pipelines. Analyze regulatory statuses, audits compliance and trigger urgent nudges.
          </p>
        </div>

        <button
          onClick={() => {
            setInviteModalOpen(true);
            setActionDoneMsg(null);
          }}
          className="text-xs font-mono font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Link Client Workspace
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search linked SMB portfolio..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all font-sans"
          />
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-stretch md:self-auto gap-1">
          <button
            onClick={() => setHealthFilter("All")}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              healthFilter === "All" ? "bg-white text-blue-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Clients
          </button>
          <button
            onClick={() => setHealthFilter("critical")}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              healthFilter === "critical" ? "bg-white text-rose-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Critical Overdues
          </button>
          <button
            onClick={() => setHealthFilter("healthy")}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              healthFilter === "healthy" ? "bg-white text-emerald-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Healthy (≥90%)
          </button>
        </div>
      </div>

      {/* Main Client Table Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs font-mono text-slate-400">Recalculating multi-tenant tax records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider">
                  <th className="p-4">SMB Client Business</th>
                  <th className="p-4">Registered Units</th>
                  <th className="p-4 text-center">Filing score</th>
                  <th className="p-4">Next Mapped Obligation</th>
                  <th className="p-4 text-center">Overdue logs</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr key={client.relationship_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-extrabold text-slate-800 font-sans">
                      {client.client_workspace_name}
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {client.entity_count} entities
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        client.compliance_score >= 90 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-150" 
                          : "bg-amber-50 text-amber-700 border border-amber-150"
                      }`}>
                        {client.compliance_score}% Healthy
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-xs truncate max-w-xs font-sans">
                      {client.next_deadline}
                    </td>
                    <td className="p-4 text-center">
                      {client.overdue_count > 0 ? (
                        <span className="bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-full font-mono text-[10px] border border-rose-200">
                          {client.overdue_count} OVERDUE
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">&mdash;</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      {/* Send Nudge button */}
                      <button
                        onClick={() => handleOpenNudge(client)}
                        className="text-xs font-mono text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-600" />
                        Nudge SMS
                      </button>

                      {/* Switch context option */}
                      <button
                        onClick={() => handleSwitchWorkspaceContext(client.client_workspace_id)}
                        className="text-xs font-mono text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                        Audit View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                      No matching clients associated with your advisor license.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INVITE CLIENT MODAL */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => setInviteModalOpen(false)} />
          <div className="bg-white border border-slate-250 rounded-2xl w-full max-w-md p-6 relative z-10 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-sans font-extrabold text-slate-800">Add New Partner Client</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-mono font-bold">practice database mapping</p>
              </div>
              <button onClick={() => setInviteModalOpen(false)} className="text-slate-500 hover:text-slate-800 font-mono text-xs border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer">
                Close
              </button>
            </div>

            <form onSubmit={submitInvitation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Client Corporate Legal Workspace Name</label>
                <input
                  type="text"
                  required
                  value={inviteWorkspaceName}
                  onChange={(e) => setInviteWorkspaceName(e.target.value)}
                  placeholder="e.g. Chai Point Bangalore Ltd"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={invitingState}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white py-3 rounded-xl text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
              >
                {invitingState ? "Syncing..." : "Provision Practice Client Space"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SEND NUDGE MODAL */}
      {nudgeModalOpen && activeNudgeClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => setNudgeModalOpen(false)} />
          <div className="bg-white border border-slate-250 rounded-2xl w-full max-w-lg p-6 relative z-10 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-sans font-extrabold text-slate-800">Dispatch Push Reminders</h3>
                <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5 font-bold">client: {activeNudgeClient.client_workspace_name}</p>
              </div>
              <button onClick={() => setNudgeModalOpen(false)} className="text-slate-500 hover:text-slate-800 font-mono text-xs border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer">
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-normal flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                This executes SMS WhatsApp sandbox templates and places alerts logs on client's active landing dashboards.
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Urgent Professional Warning Message</label>
                <textarea
                  rows={4}
                  value={nudgeMessage}
                  onChange={(e) => setNudgeMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              {actionDoneMsg && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {actionDoneMsg}
                </div>
              )}

              <button
                maxLength={400}
                onClick={submitNudge}
                disabled={nudgingState}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 disabled:text-slate-450 text-amber-950 py-3 rounded-xl text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
              >
                {nudgingState ? "Dispatching..." : "Transmit WhatsApp & Email Alerts"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
