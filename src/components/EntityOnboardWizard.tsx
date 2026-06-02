import React, { useState, useEffect } from "react";
import { Check, ArrowRight, ArrowLeft, Loader2, Info, Sparkles, Building, MapPin, ListFilter, ShieldAlert } from "lucide-react";
import { BusinessType, ObligationType } from "../types";

// State code mapping
const INDIAN_STATES = [
  { code: "KA", name: "Karnataka" },
  { code: "MH", name: "Maharashtra" },
  { code: "DL", name: "Delhi" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "WB", name: "West Bengal" },
  { code: "TS", name: "Telangana" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "MH", name: "Maharashtra" }
];

interface EntityOnboardWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function EntityOnboardWizard({ onComplete, onCancel }: EntityOnboardWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields State
  const [businessName, setBusinessName] = useState<string>("");
  const [businessType, setBusinessType] = useState<BusinessType>("Pvt Ltd");
  const [isGstRegistered, setIsGstRegistered] = useState<boolean>(true);
  const [gstin, setGstin] = useState<string>("");
  const [pan, setPan] = useState<string>("");
  const [tan, setTan] = useState<string>("");

  const [stateCode, setStateCode] = useState<string>("KA");
  const [city, setCity] = useState<string>("");
  const [registrationDate, setRegistrationDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Suggested obligations
  const [suggestedObligations, setSuggestedObligations] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [selectedObligations, setSelectedObligations] = useState<string[]>([]);

  // Fetch recommended obligations when entering Step 3
  useEffect(() => {
    if (step === 3) {
      fetchSuggestions();
    }
  }, [step]);

  // Handle GSTIN pre-filling PAN
  useEffect(() => {
    if (gstin && gstin.length >= 12) {
      // GSTIN structure is e.g. 29AAAAA1111A1Z1. PAN is chars 3 to 12
      const extractedPan = gstin.substring(2, 12);
      if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(extractedPan.toUpperCase())) {
        setPan(extractedPan.toUpperCase());
      }
    }
  }, [gstin]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/v1/obligations/suggest?entity_type=${encodeURIComponent(
          businessType
        )}&state_code=${encodeURIComponent(stateCode)}&is_gst_registered=${isGstRegistered}`
      );
      
      if (!res.ok) {
        throw new Error("Failed to fetch compliance obligation parameters");
      }
      
      const data = await res.json();
      setSuggestedObligations(data.suggestions || []);
      setAiSummary(data.ai_recommendations_summary || "");
      
      // Auto-select all suggested obligations by default
      const defaultIds = (data.suggestions || []).map((s: any) => s.obligation_type_id);
      setSelectedObligations(defaultIds);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong fetching suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!businessName.trim()) {
        setErrorMsg("Please enter your official business name");
        return;
      }
      if (isGstRegistered && !gstin.trim()) {
        setErrorMsg("Please enter your 15-digit GSTIN or choose 'Unregistered'");
        return;
      }
      if (isGstRegistered && gstin.length < 15) {
        setErrorMsg("GSTIN must have exactly 15 characters (e.g. 29AAAAA1234A1Z1)");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!city.trim()) {
        setErrorMsg("City location is required to map local tax offices");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (selectedObligations.length === 0) {
        setErrorMsg("Please select at least one active obligation to generate your compliance timeline");
        return;
      }
      setStep(4);
    }
  };

  const handleBackStep = () => {
    setErrorMsg(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleToggleObligation = (id: string) => {
    if (selectedObligations.includes(id)) {
      setSelectedObligations(selectedObligations.filter((o) => o !== id));
    } else {
      setSelectedObligations([...selectedObligations, id]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Create the entity
      const entityRes = await fetch("/api/v1/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: businessName,
          business_type: businessType,
          state_code: stateCode,
          gstin: isGstRegistered ? gstin.toUpperCase() : undefined,
          pan: pan ? pan.toUpperCase() : undefined,
          tan: tan ? tan.toUpperCase() : undefined,
        }),
      });

      if (!entityRes.ok) {
        const errObj = await entityRes.json();
        throw new Error(errObj.error || "Failed to finalize business registration");
      }

      const entityData = await entityRes.json();

      // 2. Map obligations in bulk (triggers automatic deadline calc)
      const mappingRes = await fetch("/api/v1/entity-obligations/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: entityData.id,
          obligation_type_ids: selectedObligations,
        }),
      });

      if (!mappingRes.ok) {
        throw new Error("Business registered successfully, but failed to map tax timeline.");
      }

      // Success
      onComplete();
    } catch (err: any) {
      setErrorMsg(err.message || "Submission failed. Please check limitations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="entity-setup-wizard" className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Title Header */}
      <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-sans font-extrabold text-slate-800 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Indian Business Onboarding Wizard
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configure your corporate form to activate auto-adjusted tax deadlines.</p>
        </div>
        <button 
          onClick={onCancel}
          className="text-xs text-slate-600 hover:text-slate-900 font-mono px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 border-b border-slate-200 text-[10px] font-mono tracking-wider text-center bg-slate-50/50">
        <div className={`py-3 ${step >= 1 ? "text-blue-700 bg-blue-50/50 font-bold border-r border-slate-150" : "text-slate-400"}`}>1. BASICS</div>
        <div className={`py-3 ${step >= 2 ? "text-blue-700 bg-blue-50/50 font-bold border-r border-slate-150" : "text-slate-400"}`}>2. JURISDICTION</div>
        <div className={`py-3 ${step >= 3 ? "text-blue-700 bg-blue-50/50 font-bold border-r border-slate-150" : "text-slate-400"}`}>3. OBLIGATIONS</div>
        <div className={`py-3 ${step >= 4 ? "text-blue-700 bg-blue-50/50 font-bold" : "text-slate-400"}`}>4. REVIEW</div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-220 text-rose-700 p-4 rounded-xl text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Constraint Validation Error</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* STEP 1: BUSINESS BASICS */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 uppercase font-bold">1.1 Business Legal Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Indian Digital Ventures Private Limited"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500 uppercase font-bold">1.2 Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none font-sans"
                >
                  <option value="Pvt Ltd">Private Limited (Pvt Ltd)</option>
                  <option value="LLP">Limited Liability Partnership (LLP)</option>
                  <option value="Sole Prop">Sole Proprietorship / Freelancer</option>
                  <option value="OPC">One Person Company (OPC)</option>
                  <option value="Partnership">Partnership Firm</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500 uppercase font-bold">1.3 GST Registration</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsGstRegistered(true);
                      setErrorMsg(null);
                    }}
                    className={`text-xs py-2 rounded-lg font-mono transition-all cursor-pointer ${
                      isGstRegistered ? "bg-white text-blue-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Registered
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsGstRegistered(false);
                      setGstin("");
                    }}
                    className={`text-xs py-2 rounded-lg font-mono transition-all cursor-pointer ${
                      !isGstRegistered ? "bg-white text-blue-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Unregistered
                  </button>
                </div>
              </div>
            </div>

            {isGstRegistered && (
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-mono text-slate-500 uppercase font-bold">1.4 GSTIN (15-digit Identification Number)</label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 29AAAAA0000A1Z5"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none font-mono tracking-wider"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500 uppercase font-bold">1.5 Permanent Account Number (PAN)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="e.g. AAAAA1234A"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none font-mono tracking-wider"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500 uppercase font-bold">1.6 Tax Deduction Account Number (TAN)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={tan}
                  onChange={(e) => setTan(e.target.value.toUpperCase())}
                  placeholder="e.g. BLRA12345B"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none font-mono tracking-wider"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION & JURISDICTION */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500 uppercase font-bold">2.1 Base Indian State</label>
                <select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-bold leading-normal">Ensures mapping of state taxes, professional tax, and specific state public calendars.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500 uppercase font-bold">2.2 City of Operation</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru, Mumbai"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 uppercase font-bold">2.3 Corporate Date of Incorporation/Registration</label>
              <input
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400 font-bold leading-normal">AGM limits and ROC compliance periods are auto-calibrated based on your start of fiscal operation.</p>
            </div>
          </div>
        )}

        {/* STEP 3: OBLIGATIONS RADAR */}
        {step === 3 && (
          <div className="space-y-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-mono text-slate-400">Consulting Indian Statutory CBIC / MCA databases...</p>
              </div>
            ) : (
              <>
                {/* AI Suggestions Box */}
                {aiSummary && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/40 border border-blue-150 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                      <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                      Indian Compliance Intelligence AI
                    </div>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed italic">
                      "{aiSummary}"
                    </p>
                  </div>
                )}

                {/* Checklist */}
                <div className="space-y-3">
                  <label className="text-xs font-mono text-slate-500 uppercase font-black flex items-center justify-between">
                    <span>Suggested Obligation Timelines</span>
                    <span className="text-[10px] text-blue-600 font-bold capitalize">{selectedObligations.length} selected</span>
                  </label>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {suggestedObligations.length > 0 ? (
                      suggestedObligations.map((ob) => (
                        <div
                          key={ob.obligation_type_id}
                          onClick={() => handleToggleObligation(ob.obligation_type_id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                            selectedObligations.includes(ob.obligation_type_id)
                              ? "bg-blue-50/50 border-blue-200 text-slate-800"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            selectedObligations.includes(ob.obligation_type_id)
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}>
                            {selectedObligations.includes(ob.obligation_type_id) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-extrabold text-slate-800">{ob.name || ob.obligation_type_id}</p>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase font-bold border border-slate-200">
                                {ob.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal">{ob.reason}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-4">No specific obligations mapped for this configuration.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-205 pb-2 flex items-center gap-1 font-bold">
                <Info className="w-4 h-4 text-slate-400" />
                Onboarding Corporate Profile Summary
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Legal Business Name</p>
                  <p className="font-extrabold text-slate-700 mt-0.5">{businessName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Business Type</p>
                  <p className="font-extrabold text-slate-700 mt-0.5">{businessType}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Jurisdiction Base</p>
                  <p className="font-extrabold text-slate-700 mt-0.5">{stateCode} State, India ({city})</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">GST Registration Status</p>
                  <p className="font-extrabold text-slate-700 mt-0.5">{isGstRegistered ? `Registered (${gstin})` : "Unregistered"}</p>
                </div>
                {pan && (
                  <div>
                    <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Permanent Account Number (PAN)</p>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">{pan}</p>
                  </div>
                )}
                {tan && (
                  <div>
                    <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Tax deduction number (TAN)</p>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">{tan}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-1">
              <p className="text-xs font-bold text-blue-700">Timeline Engine Calibration Ready</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                By completing this setup, DeadlineOS will automatically calculate **{selectedObligations.length} compliance periods** over the next 12 rolling months. Saturdays, Sundays, and official Indian gazetted holidays (Republic Day, Holi, Independence Day, Gandhi Jayanti, etc.) are processed for weekend adjustment buffers dynamically.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Button Controls */}
      <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          disabled={step === 1 || loading}
          onClick={handleBackStep}
          className="text-xs font-mono text-slate-500 hover:text-slate-800 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="text-xs font-mono bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-205 text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Recalculating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Initialize Calendar
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
