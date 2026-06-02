import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Calendar as CalendarIcon, 
  Users, 
  Settings, 
  Plus, 
  Sparkles, 
  Loader2, 
  FileSearch, 
  Mail, 
  LogOut, 
  HelpCircle, 
  Compass, 
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle,
  Clock
} from "lucide-react";
import { Deadline, Workspace, DashboardSummary } from "./types";
import MetricsHeader from "./components/MetricsHeader";
import EntityOnboardWizard from "./components/EntityOnboardWizard";
import CalendarGridView from "./components/CalendarGridView";
import FilingDetailDrawer from "./components/FilingDetailDrawer";
import CaAdvisorPortal from "./components/CaAdvisorPortal";
import BillingSettings from "./components/BillingSettings";

export default function App() {
  const [activeTab, setActiveTab] = useState<"calendar" | "advisor" | "settings">("calendar");
  const [loading, setLoading] = useState<boolean>(true);
  
  // API Core States
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [entities, setEntities] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    overdueCount: 0,
    dueThisWeek: 0,
    dueThisMonth: 0,
    complianceScore: 100
  });

  // Filters state (passed down to calendar/list view)
  const [selectedEntityId, setSelectedEntityId] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Interaction Panel States
  const [onboardWizardOpen, setOnboardWizardOpen] = useState<boolean>(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);

  // AI OCR SCAN SIMULATOR
  const [scanModalOpen, setScanModalOpen] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string>("");

  useEffect(() => {
    bootstrapDashboard();
  }, [activeTab, selectedEntityId, selectedCategory, selectedStatus]);

  const bootstrapDashboard = async () => {
    setLoading(true);
    try {
      // 1. Fetch active workspace
      const wsRes = await fetch("/api/v1/workspaces/me");
      if (wsRes.ok) {
        const wsData = await wsRes.json();
        setActiveWorkspace(wsData);
      }

      // 2. Fetch business entities
      const entRes = await fetch("/api/v1/entities");
      if (entRes.ok) {
        const entData = await entRes.json();
        setEntities(entData || []);
      }

      // 3. Fetch deadlines
      let url = "/api/v1/deadlines/upcoming?";
      if (selectedEntityId && selectedEntityId !== "All") {
        url += `entity_id=${selectedEntityId}&`;
      }
      if (selectedStatus && selectedStatus !== "All") {
        url += `status=${selectedStatus}&`;
      }
      if (selectedCategory && selectedCategory !== "All") {
        url += `category=${selectedCategory}&`;
      }
      const dlRes = await fetch(url);
      if (dlRes.ok) {
        const dlData = await dlRes.json();
        setDeadlines(dlData || []);
      }

      // 4. Fetch metrics summary
      const sumRes = await fetch("/api/v1/dashboard/summary");
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
    } catch (err) {
      console.error("Dashboard synchronization tick failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Simulated AI document scan
  const handleSimulateScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedReceiptName(file.name);
      setScanning(true);
      setScannedResult(null);

      // AI parser delay simulation
      setTimeout(() => {
        setScanning(false);
        setScannedResult(`--- PARSED COMPLIANCE INTELLIGENCE RESULTS ---
Business Identity discovered: "Acme Tech Digital Pvt Ltd"
Tax Sector context: GSTR-3B (Summary Return)
Period detected: FY 2026-27 (Quarter 1)
Action required: Mapped automatically to active compliance calendar pipeline. No delay penalties applied.`);
      }, 1500);
    }
  };

  const handleCloseScan = () => {
    setScanModalOpen(false);
    setScannedResult(null);
    setUploadedReceiptName("");
    bootstrapDashboard(); // refresh
  };

  const activeEmail = "adarshsinghgautam2@gmail.com";

  return (
    <div id="deadlineos-core-viewport" className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* GLOBAL HUD NAVBAR */}
      <header id="global-action-nav" className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0F172A] rounded-xl text-white flex items-center justify-center font-bold font-sans tracking-tight shrink-0 shadow-md">
            <Building2 className="w-5 h-5 text-slate-200 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold font-sans leading-none tracking-tight text-slate-800">DeadlineOS</h1>
              <span className="text-[8px] uppercase font-mono tracking-widest bg-blue-550/10 text-blue-600 border border-blue-200 px-1.5 py-0.2 rounded font-semibold">
                AI Compliance
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Statutory Tracker for Indian MSMEs & Practitioners</p>
          </div>
        </div>

        {/* Tab Role Switchers */}
        <div className="hidden md:flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-slate-800">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-1.5 text-xs font-sans font-semibold px-4 py-1.5 rounded-lg transition-all ${
              activeTab === "calendar"
                ? "bg-white text-blue-600 border border-slate-200/40 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            My Calendar Timeline
          </button>
          <button
            onClick={() => setActiveTab("advisor")}
            className={`flex items-center gap-1.5 text-xs font-sans font-semibold px-4 py-1.5 rounded-lg transition-all ${
              activeTab === "advisor"
                ? "bg-white text-blue-600 border border-slate-200/40 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            }`}
          >
            <Users className="w-4 h-4" />
            CA Advisor Portal
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-1.5 text-xs font-sans font-semibold px-4 py-1.5 rounded-lg transition-all ${
              activeTab === "settings"
                ? "bg-white text-blue-600 border border-slate-200/40 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            }`}
          >
            <Settings className="w-4 h-4" />
            Practitioner License
          </button>
        </div>

        {/* Profile Card HUD */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Practice</span>
            <span className="text-xs text-slate-700 font-semibold block">{activeEmail}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700 uppercase tracking-widest shrink-0">
            {activeEmail.charAt(0)}
          </div>
        </div>
      </header>

      {/* MOBILE HUD NAVIGATION tabs */}
      <div className="md:hidden flex bg-white border-b border-slate-200 justify-around p-2.5 text-[10px] font-mono">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`py-1 px-3 rounded-lg flex items-center gap-1 ${activeTab === "calendar" ? "text-blue-600 bg-blue-50 font-bold" : "text-slate-500"}`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab("advisor")}
          className={`py-1 px-3 rounded-lg flex items-center gap-1 ${activeTab === "advisor" ? "text-blue-600 bg-blue-50 font-bold" : "text-slate-500"}`}
        >
          CA Advisor
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`py-1 px-3 rounded-lg flex items-center gap-1 ${activeTab === "settings" ? "text-blue-600 bg-blue-50 font-bold" : "text-slate-500"}`}
        >
          License Setups
        </button>
      </div>

      {/* VIEWPORT CONTROLLER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6 animate-in fade-in duration-300">
        {activeTab === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* MAIN DASHBOARD CONTENT (3 Cols) */}
            <div className="lg:col-span-3 space-y-6 flex flex-col">
              
              {/* Metrics bar */}
              <MetricsHeader summary={summary} />

              {/* Loader */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-xs font-mono text-slate-500">Syncing Indian revenue calendar indexes...</p>
                </div>
              ) : (
                /* Primary Calendar views */
                <CalendarGridView
                  deadlines={deadlines}
                  entities={entities}
                  selectedEntityId={selectedEntityId}
                  setSelectedEntityId={setSelectedEntityId}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  onSelectDeadline={(dl) => setSelectedDeadline(dl)}
                />
              )}
            </div>

            {/* SIDEBAR QUICK ACTIONS UTILITIES (1 Col) */}
            <div className="space-y-6">
              
              {/* Active Entity Info card */}
              <div id="sidebar-entity-box" className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Practice Book</span>
                  <h3 className="text-sm font-bold text-slate-800">Corporate Units registered</h3>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {entities.map((ent) => (
                    <div key={ent.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs hover:bg-slate-100/50 transition-all text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-800 truncate max-w-[140px]">{ent.name}</p>
                        <span className="text-[10px] font-mono text-slate-500 leading-none">{ent.business_type} • {ent.state_code}</span>
                      </div>
                      
                      {ent.gstin ? (
                        <span className="text-[8px] font-mono py-0.5 px-1.5 rounded text-emerald-600 bg-emerald-50 border border-emerald-200/55 font-bold uppercase">
                          GST Mapped
                        </span>
                      ) : (
                        <span className="text-[8px] font-mono py-0.5 px-1.5 rounded text-slate-600 bg-slate-100 border border-slate-200">
                          Direct Tax
                        </span>
                      )}
                    </div>
                  ))}

                  {entities.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">No corporate entities onboarding yet.</p>
                  )}
                </div>

                <button
                  onClick={() => setOnboardWizardOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-sans text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 group font-semibold"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Onboard entity unit
                </button>
              </div>

              {/* AI Notice Scanner */}
              <div id="sidebar-scanner-box" className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 text-slate-300 space-y-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                    <Sparkles className="w-4.5 h-4.5" />
                    AI Compliance OCR Scanner
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    Upload a raw GSTIN challan receipt or government tax notice. Gemini parses file timelines and populates compliance queues.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setScanModalOpen(true);
                    setScannedResult(null);
                    setUploadedReceiptName("");
                  }}
                  className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-mono text-blue-400 font-bold hover:text-blue-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <FileSearch className="w-4 h-4 text-blue-400" />
                  Initiate AI OCR scan
                </button>
              </div>

              {/* India tax rules brief notes card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed font-sans space-y-2 shadow-sm">
                <p className="font-semibold text-slate-700 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  India Late filing penalties guidelines
                </p>
                <p>
                  <strong>GSTR-3B summary delays</strong>: ₹50 / day late fee (₹20 for nil files) + 18% p.a. interest balance calculated on payable net cash liabilities.
                </p>
                <p>
                  <strong>TDS deposits</strong>: 1.5% interest / month on delayed payments, plus compounding penalty balances on delayed filings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Advisor View */}
        {activeTab === "advisor" && <CaAdvisorPortal />}

        {/* License setups */}
        {activeTab === "settings" && activeWorkspace && (
          <BillingSettings
            workspace={activeWorkspace}
            onRefreshWorkspace={() => bootstrapDashboard()}
          />
        )}
      </main>

      {/* ONBOARD WIZARD FULL MODAL OVERLAY */}
      {onboardWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="p-1 max-w-2xl w-full">
            <EntityOnboardWizard
              onComplete={() => {
                setOnboardWizardOpen(false);
                bootstrapDashboard(); // refresh
              }}
              onCancel={() => setOnboardWizardOpen(false)}
            />
          </div>
        </div>
      )}

      {/* FILING IN-CHARGE DRAWER SIDE-OVER PANEL */}
      {selectedDeadline && (
        <FilingDetailDrawer
          deadline={selectedDeadline}
          onClose={() => setSelectedDeadline(null)}
          onFilingComplete={() => {
            setSelectedDeadline(null);
            bootstrapDashboard(); // refresh
          }}
        />
      )}

      {/* AI RECEIPT SCANNER MODAL */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070A]/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 relative z-10 space-y-6 shadow-2xl text-slate-800">
            <div className="flex justify-between items-start pb-2 border-b border-slate-150">
              <div>
                <h3 className="text-sm font-sans font-extrabold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Gemini Flash Statutory Parser Engine
                </h3>
                <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Automated date discovery</p>
              </div>
              <button 
                onClick={handleCloseScan}
                className="text-slate-400 hover:text-slate-600 font-mono text-xs border border-slate-200 px-2 py-0.5 rounded"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="border border-dashed border-slate-300 hover:border-blue-500/50 bg-slate-50 rounded-xl p-8 text-center relative cursor-key transition-all">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleSimulateScan}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                
                <div className="space-y-2 text-xs">
                  <p className="font-semibold text-slate-600">
                    {uploadedReceiptName ? `File: ${uploadedReceiptName}` : "Drag and drop challan receipt / tax doc"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">Supports PNG, Joeg, or statutory PDFs</p>
                </div>
              </div>

              {scanning && (
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-blue-600 py-4">
                  <Loader2 className="w-4.5 h-4.5 text-blue-600 animate-spin" />
                  Gemini parsing document structure & validating CBIC timelines...
                </div>
              )}

              {scannedResult && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4 shadow-inner">
                  <pre className="text-[10px] font-mono text-emerald-700 leading-relaxed whitespace-pre-wrap">
                    {scannedResult}
                  </pre>
                  
                  <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-lg text-[10px] text-emerald-700 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Timeline parsed successfully. Mapped into calendar timeline context.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-400 font-mono">
        <p>&copy; 2026 DeadlineOS Inc. All Rights Reserved. Fully Encrypted Sandbox Database Environment.</p>
      </footer>
    </div>
  );
}

