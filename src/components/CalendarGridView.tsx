import React, { useState } from "react";
import { Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, HelpCircle, Clock, Check } from "lucide-react";
import { Deadline } from "../types";

interface CalendarGridViewProps {
  deadlines: Deadline[];
  entities: any[];
  selectedEntityId: string;
  setSelectedEntityId: (id: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  onSelectDeadline: (dl: Deadline) => void;
}

export default function CalendarGridView({
  deadlines,
  entities,
  selectedEntityId,
  setSelectedEntityId,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  onSelectDeadline,
}: CalendarGridViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  
  // Calendar Navigation date
  const [currentNavDate, setCurrentNavDate] = useState<Date>(new Date());

  const categories = ["All", "GST", "TDS", "Income Tax", "ROC", "PF & ESIC"];
  const statuses = ["All", "upcoming", "due_soon", "filed", "overdue"];

  // Navigate calendar month
  const handlePrevMonth = () => {
    setCurrentNavDate(new Date(currentNavDate.getFullYear(), currentNavDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentNavDate(new Date(currentNavDate.getFullYear(), currentNavDate.getMonth() + 1, 1));
  };

  // Border status helpers
  const getStatusBorder = (status: string) => {
    switch (status) {
      case "overdue":
        return "border-l-4 border-l-rose-500 border-slate-205";
      case "due_soon":
        return "border-l-4 border-l-amber-500 border-slate-205";
      case "filed":
        return "border-l-4 border-l-emerald-550 border-slate-205";
      default:
        return "border-l-4 border-l-blue-500 border-slate-205";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return <span className="text-[10px] uppercase font-bold font-mono bg-rose-50 text-rose-600 border border-rose-200 px-3 py-0.7 rounded-md">overdue</span>;
      case "due_soon":
        return <span className="text-[10px] uppercase font-bold font-mono bg-amber-50 text-amber-750 border border-amber-200 px-3 py-0.7 rounded-md">due within ≤ 3 days</span>;
      case "filed":
        return <span className="text-[10px] uppercase font-bold font-mono bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-0.7 rounded-md">filed</span>;
      default:
        return <span className="text-[10px] uppercase font-bold font-mono bg-blue-50 text-blue-600 border border-blue-200 px-3 py-0.7 rounded-md">upcoming</span>;
    }
  };

  // Grouped lists for List View
  const getGroupedList = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const todayStr = today.toISOString().split("T")[0];
    
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);

    const groups: { title: string; subtitle: string; items: Deadline[] }[] = [
      { title: "Today & Overdue", subtitle: "Requires immediate online action context", items: [] },
      { title: "Due This Week", subtitle: "Calibrate calculations and prep documents", items: [] },
      { title: "Upcoming (Next 30 Days)", subtitle: "Under structural review cycle", items: [] },
      { title: "Filed / Audited History", subtitle: "Government records logged with ACK context", items: [] },
    ];

    deadlines.forEach((dl) => {
      const dlDate = new Date(dl.due_date);
      dlDate.setHours(0,0,0,0);

      if (dl.status === "filed") {
        groups[3].items.push(dl);
      } else if (dlDate.getTime() < today.getTime() || dl.due_date === todayStr) {
        groups[0].items.push(dl);
      } else if (dlDate.getTime() <= oneWeekFromNow.getTime()) {
        groups[1].items.push(dl);
      } else {
        groups[2].items.push(dl);
      }
    });

    return groups;
  };

  // Calendar Grid builder
  const renderCalendarGrid = () => {
    const year = currentNavDate.getFullYear();
    const month = currentNavDate.getMonth();

    // Days structure
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDays = new Date(year, month + 1, 0).getDate();

    const daysArray: (Date | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      daysArray.push(new Date(year, month, d));
    }

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm space-y-4 text-slate-800">
        {/* Month Navigation */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-sans font-extrabold text-slate-800 uppercase tracking-wider">
              {currentNavDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 md:gap-2.5 text-center text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100 pb-2">
          {weekdays.map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1 md:gap-2.5">
          {daysArray.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="bg-slate-100/50 aspect-video rounded-xl" />;
            }

            const formattedISO = date.toISOString().split("T")[0];
            const currentDayDeadlines = deadlines.filter((d) => d.due_date === formattedISO);

            // current date highlight
            const isToday = new Date().toISOString().split("T")[0] === formattedISO;

            return (
              <div
                key={formattedISO}
                className={`bg-slate-50/50 hover:bg-white aspect-video rounded-xl border p-1 md:p-2.5 flex flex-col justify-between hover:border-blue-650/40 cursor-pointer group transition-all text-left shadow-sm hover:shadow ${
                  isToday ? "border-blue-500 bg-blue-50/50" : "border-slate-200"
                }`}
                onClick={() => {
                  if (currentDayDeadlines.length > 0) {
                    onSelectDeadline(currentDayDeadlines[0]);
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-mono leading-none ${isToday ? "text-blue-600 font-bold animate-pulse" : "text-slate-400"}`}>
                    {date.getDate()}
                  </span>
                  
                  {isToday && (
                    <span className="text-[8px] uppercase tracking-wider font-mono text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.2 rounded font-semibold scale-90">
                      Today
                    </span>
                  )}
                </div>

                {/* Deadlines Dots Indicators */}
                <div className="flex flex-wrap gap-1 mt-1 justify-start">
                  {currentDayDeadlines.slice(0, 3).map((dl) => {
                    let dotColor = "bg-blue-500";
                    if (dl.status === "filed") dotColor = "bg-emerald-500";
                    else if (dl.status === "overdue") dotColor = "bg-rose-500";
                    else if (dl.status === "due_soon") dotColor = "bg-amber-500";

                    return (
                      <div
                        key={dl.id}
                        title={`${dl.entity_name}: ${dl.obligation_name}`}
                        className={`w-1.5 h-1.5 rounded-full ${dotColor} group-hover:scale-125 transition-all`}
                      />
                    );
                  })}
                  {currentDayDeadlines.length > 3 && (
                    <span className="text-[7px] text-slate-400 font-mono leading-none">
                      +{currentDayDeadlines.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="compliance-timeline-manager" className="space-y-6">
      {/* FILTER BAR CONTROLS */}
      <div id="calendar-filter-bar" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-800">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-sans font-extrabold text-slate-800 flex items-center gap-2">
              Compliance Calendar Hub
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-sans font-semibold border border-slate-200">
                {deadlines.length} Active Records
              </span>
            </h2>
          </div>

          {/* View Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch md:self-auto justify-between gap-1 text-slate-850">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 text-xs font-sans font-semibold px-4 py-1.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List Timeline
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 text-xs font-sans font-semibold px-4 py-1.5 rounded-lg transition-all ${
                viewMode === "calendar"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Grid Calendar
            </button>
          </div>
        </div>

        {/* Action Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 border-t border-slate-150 pt-4">
          {/* Entity select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">Select Registered Business</label>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-slate-700 outline-none hover:bg-slate-100/30 font-sans"
            >
              <option value="All">All Businesses ({entities.length})</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.business_type})
                </option>
              ))}
            </select>
          </div>

          {/* Category select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">Tax Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-slate-700 outline-none hover:bg-slate-100/30 capitalize font-sans"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">Filing Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-slate-700 outline-none hover:bg-slate-100/30 font-sans"
            >
              {statuses.map((st) => (
                <option key={st} value={st} className="capitalize">
                  {st === "All" ? "All Statuses" : st.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* RENDER MODES */}
      {viewMode === "calendar" ? (
        renderCalendarGrid()
      ) : (
        <div id="compliance-list-views" className="space-y-6">
          {getGroupedList().map((group) => {
            if (group.items.length === 0) return null;

            return (
              <div key={group.title} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-1.5">
                  <h3 className="text-xs font-sans font-extrabold text-slate-800 uppercase tracking-widest">{group.title}</h3>
                  <p className="text-[10px] font-mono font-medium text-slate-400">{group.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((dl) => (
                    <div
                      key={dl.id}
                      onClick={() => onSelectDeadline(dl)}
                      className={`bg-white border ${getStatusBorder(
                        dl.status
                      )} border-slate-200 hover:border-slate-350 rounded-xl p-4 cursor-pointer flex flex-col justify-between space-y-3 hover:translate-y-[-2px] transition-all shadow-sm hover:shadow group`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5">
                          <p className="text-xs font-extrabold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                            {dl.entity_name}
                          </p>
                          <p className="text-xs font-sans font-semibold text-slate-655">
                            {dl.obligation_name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 font-semibold bg-slate-50 border border-slate-100/80 px-2 py-0.5 rounded w-fit">
                            Period: {dl.period_label}
                          </p>
                        </div>
                        {getStatusBadge(dl.status)}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100/80 pt-2 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1 font-mono font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Due: {new Date(dl.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-slate-400 font-semibold">
                            Readiness: {dl.readiness_score}%
                          </span>
                          <span className="text-[10px] font-sans text-blue-600 font-bold group-hover:underline">
                            Details &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {deadlines.length === 0 && (
            <div id="calendar-empty-state" className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm text-slate-800">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">No matching deadlines found</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Adjust your search filters or register a new business entity to activate your automatic GSTR and ROC statutory calendars.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
