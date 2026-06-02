import React, { useState, useEffect } from "react";
import { X, Sparkles, Loader2, Info, CheckSquare, Upload, ClipboardCheck, FileText, CheckCircle, ShieldAlert, Check } from "lucide-react";
import { Deadline } from "../types";

interface FilingDetailDrawerProps {
  deadline: Deadline;
  onClose: () => void;
  onFilingComplete: () => void;
}

export default function FilingDetailDrawer({ deadline, onClose, onFilingComplete }: FilingDetailDrawerProps) {
  const [loadingGuidance, setLoadingGuidance] = useState<boolean>(false);
  const [aiGuidance, setAiGuidance] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Checklist items
  const [checklist, setChecklist] = useState<{[key: string]: boolean}>({
    "Export and reconcile invoice lists": false,
    "Verify GSTR-2B Input Tax Credits match": false,
    "Complete online challan payment step": false,
    "Check director DSC verification readiness": false,
  });

  // Filing Receipt Input Form
  const [ackNumber, setAckNumber] = useState<string>("");
  const [filedBy, setFiledBy] = useState<string>("adarshsinghgautam2@gmail.com");
  const [notes, setNotes] = useState<string>("");
  const [mockFileName, setMockFileName] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);

  // Fetch AI guidance from server
  useEffect(() => {
    fetchFilingGuidance();
    // Pre-calculate score based on checklist
    setAckNumber("");
    setNotes("");
    setMockFileName("");
    setUploadProgress(0);
  }, [deadline.id]);

  const fetchFilingGuidance = async () => {
    setLoadingGuidance(true);
    setAiGuidance("");
    try {
      const res = await fetch(`/api/v1/deadlines/${deadline.id}/guidance`);
      if (res.ok) {
        const data = await res.json();
        setAiGuidance(data.guidance || "");
      }
    } catch (err) {
      console.error("Failed to load Gemini assistance", err);
    } finally {
      setLoadingGuidance(false);
    }
  };

  const handleToggleChecklist = (key: string) => {
    setChecklist((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      // dynamically increase/recalculate base readiness score on parent view if desired
      return updated;
    });
  };

  // Mock upload procedure
  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMockFileName(file.name);
      setUploading(true);
      setUploadProgress(10);
      
      const interval = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setUploading(false);
            return 100;
          }
          return p + 30;
        });
      }, 200);
    }
  };

  const handleSubmitFiling = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate checklist completance to build discipline
    const unfinished = Object.values(checklist).some(val => !val);
    if (unfinished) {
      setErrorMsg("Recommended task checklist must be completed to ensure filing safety.");
      return;
    }

    if (!ackNumber.trim()) {
      setErrorMsg("Government ARN / Acknowledgment Number is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/deadlines/${deadline.id}/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ack_number: ackNumber,
          filed_by: filedBy,
          notes,
          filename: mockFileName || undefined,
          document_type: `${deadline.category} Filing Acknowledgment Receipt`
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to log filing records. Check details.");
      }

      onFilingComplete();
    } catch (err: any) {
      setErrorMsg(err.message || "Filing submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Border status helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue": return "text-rose-700 border-rose-200 bg-rose-50";
      case "due_soon": return "text-amber-700 border-amber-200 bg-amber-50";
      case "filed": return "text-emerald-700 border-emerald-200 bg-emerald-50";
      default: return "text-blue-700 border-blue-200 bg-blue-50";
    }
  };

  // Readiness calculation progress
  const getCompletionPercent = () => {
    const list = Object.values(checklist);
    const checksCount = list.filter(Boolean).length;
    let score = 40 + Math.round((checksCount / list.length) * 40); // 40 to 80
    if (mockFileName) score += 20; // 100 max
    return score;
  };

  return (
    <div id="filing-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl h-full flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-300">
        <div className="flex flex-col flex-1">
          {/* Header */}
          <div className="bg-slate-50 p-6 border-b border-slate-150 flex items-start justify-between">
            <div className="space-y-1.5">
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border leading-none font-bold ${getStatusColor(deadline.status)}`}>
                {deadline.status}
              </span>
              <h2 className="text-sm font-sans font-extrabold text-slate-800">{deadline.entity_name}</h2>
              <p className="text-xs text-blue-600 font-bold">{deadline.obligation_name}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 outline-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 whitespace-nowrap text-rose-600" />
                <div>
                  <p className="font-semibold">Filing Blocked</p>
                  <p className="mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Government Statutory Period</span>
                <span className="font-extrabold text-slate-700 mt-0.5 block">{deadline.period_label}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Adjusted Extended Due Date</span>
                <span className="font-extrabold text-slate-700 mt-0.5 block font-sans">
                  {new Date(deadline.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* AI Guidance Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/40 border border-blue-150 p-5 rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                AI Filing Intelligence Counselor
              </div>
              
              {loadingGuidance ? (
                <div className="flex items-center gap-2 py-4 text-xs font-mono text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  Extracting CBIC statutes & TRACES portal guidelines...
                </div>
              ) : (
                <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line border-t border-slate-200/60 pt-2 font-sans">
                  {aiGuidance}
                </div>
              )}
            </div>

            {/* Checklist */}
            {deadline.status !== "filed" && (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-slate-150 pb-1.5">
                  <h3 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-slate-400" />
                    Required Filing Pre-requests
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-blue-600">Readiness Score: {getCompletionPercent()}%</span>
                </div>

                <div className="space-y-2">
                  {Object.keys(checklist).map((key) => (
                    <div
                      key={key}
                      onClick={() => handleToggleChecklist(key)}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        checklist[key]
                          ? "bg-slate-100/60 border-slate-250 text-slate-600"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350"
                      }`}
                    >
                      <span className={`${checklist[key] ? "line-through text-slate-400" : "font-medium"}`}>{key}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        checklist[key] ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {checklist[key] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filing Upload Box */}
            {deadline.status !== "filed" ? (
              <form onSubmit={handleSubmitFiling} className="space-y-4 pt-4 border-t border-slate-150">
                <h3 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5 pb-2 border-b border-slate-150-60">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Submit Filing Receipt Records
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-550 font-bold">Government Acknowledgement ID / ARN</label>
                  <input
                    type="text"
                    required
                    value={ackNumber}
                    onChange={(e) => setAckNumber(e.target.value)}
                    placeholder="e.g. ARN1234567890 / GSTR1ACK..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-[#64748B] font-bold">Audit Practitioner Email</label>
                    <input
                      type="email"
                      required
                      value={filedBy}
                      onChange={(e) => setFiledBy(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none"
                    />
                  </div>

                  {/* Receipt PDF attachment */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Government Challan pdf</label>
                    <div className="relative border border-slate-200 bg-slate-50 rounded-xl flex items-center justify-center py-2.5 px-3 overflow-hidden cursor-pointer hover:bg-slate-100/50">
                      <input
                        type="file"
                        accept=".pdf,.png"
                        onChange={handleMockUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono font-bold">
                        <Upload className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                        {mockFileName ? mockFileName.substring(0, 15) + "..." : "Attachments Upload"}
                      </span>
                    </div>
                  </div>
                </div>

                {uploading && (
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Practitioner Reconciliation Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide ledger references, verification balances or cross matching notes..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Reconciling on ledger records...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="w-4 h-4 text-emerald-100" />
                      Commit Filing Receipt (ARN)
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ALREADY FILED VIEW */
              <div className="space-y-4 pt-6 border-t border-slate-150">
                <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-2xl flex items-start gap-3.5 shadow-sm">
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-slate-700 text-xs">
                    <p className="font-extrabold text-emerald-800 text-sm">Statutory Timelines Successfully Met</p>
                    <p className="text-[11px] leading-relaxed mt-1 text-emerald-700">This filing was marked completed by corporate agent on active calendar dashboard.</p>
                    
                    <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl mt-3 space-y-2.5 font-mono text-[10px] text-slate-300 shadow-md">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase">GOVERNMENT ARN / ACK ID</span>
                        <span className="text-slate-100 font-extrabold">{deadline.filing_record?.ack_number || "ARN928B101Z3"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase">PRACTITIONER IN CHARGE</span>
                        <span className="text-slate-100 font-semibold">{deadline.filing_record?.filed_by || "adarshsinghgautam2@gmail.com"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase">SUBMISSION TIMESTAMP</span>
                        <span className="text-slate-100">
                          {deadline.filing_record?.filed_at 
                            ? new Date(deadline.filing_record.filed_at).toLocaleString("en-IN") 
                            : new Date().toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      {deadline.filing_record?.notes && (
                        <div>
                          <span className="text-slate-400 font-bold block uppercase">RECON NOTES</span>
                          <span className="text-slate-200 italic font-medium">"{deadline.filing_record.notes}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
