var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  generateDeadlinesForEntity: () => generateDeadlinesForEntity
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
app.use(import_express.default.json());
var PORT = process.env.PORT ? parseInt(process.env.PORT) : 3e3;
var DB_FILE = import_path.default.join(process.cwd(), "deadlineos_db.json");
var INDIAN_HOLIDAYS = [
  "01-26",
  // Republic Day
  "08-15",
  // Independence Day
  "10-02",
  // Gandhi Jayanti
  "12-25",
  // Christmas
  "05-01",
  // May Day / Maharashtra Day
  "04-14",
  // Ambedkar Jayanti
  "11-01"
  // Karnataka Rajyotsava (state holiday example)
];
var MASTER_OBLIGATIONS = [
  {
    id: "ob-gstr1",
    name: "GSTR-1 (Sales Return)",
    category: "GST",
    frequency: "monthly",
    governing_body: "CBIC",
    applicable_entity_types: ["Pvt Ltd", "LLP", "Sole Prop", "OPC", "Partnership"],
    typical_due_offset_days: 11
  },
  {
    id: "ob-gstr3b",
    name: "GSTR-3B (Summary Return)",
    category: "GST",
    frequency: "monthly",
    governing_body: "CBIC",
    applicable_entity_types: ["Pvt Ltd", "LLP", "Sole Prop", "OPC", "Partnership"],
    typical_due_offset_days: 20
  },
  {
    id: "ob-tds-chal",
    name: "TDS Challan Payment (Section 192/194)",
    category: "TDS",
    frequency: "monthly",
    governing_body: "Income Tax Dept",
    applicable_entity_types: ["Pvt Ltd", "LLP", "OPC"],
    typical_due_offset_days: 7
  },
  {
    id: "ob-tds-r1",
    name: "TDS Quarterly Return (Form 24Q/26Q) Q1",
    category: "TDS",
    frequency: "quarterly",
    governing_body: "Income Tax Dept",
    applicable_entity_types: ["Pvt Ltd", "LLP", "OPC"],
    typical_due_offset_days: 31
    // Due July 31
  },
  {
    id: "ob-tds-r2",
    name: "TDS Quarterly Return (Form 24Q/26Q) Q2",
    category: "TDS",
    frequency: "quarterly",
    governing_body: "Income Tax Dept",
    applicable_entity_types: ["Pvt Ltd", "LLP", "OPC"],
    typical_due_offset_days: 31
    // Due Oct 31
  },
  {
    id: "ob-tds-r3",
    name: "TDS Quarterly Return (Form 24Q/26Q) Q3",
    category: "TDS",
    frequency: "quarterly",
    governing_body: "Income Tax Dept",
    applicable_entity_types: ["Pvt Ltd", "LLP", "OPC"],
    typical_due_offset_days: 31
    // Due Jan 31
  },
  {
    id: "ob-tds-r4",
    name: "TDS Quarterly Return (Form 24Q/26Q) Q4",
    category: "TDS",
    frequency: "quarterly",
    governing_body: "Income Tax Dept",
    applicable_entity_types: ["Pvt Ltd", "LLP", "OPC"],
    typical_due_offset_days: 31
    // Due May 31
  },
  {
    id: "ob-advtax-q1",
    name: "Advance Tax Installment 1 (15%)",
    category: "Income Tax",
    frequency: "quarterly",
    governing_body: "Income Tax Dept",
    applicable_entity_types: ["Pvt Ltd", "LLP", "OPC", "Partnership"],
    typical_due_offset_days: 15
    // June 15
  },
  {
    id: "ob-advtax-q2",
    name: "Advance Tax Installment 2 (45%)",
    category: "Income Tax",
    frequency: "quarterly",
    governing_body: "Income Tax Dept",
    applicable_entity_types: ["Pvt Ltd", "LLP", "OPC", "Partnership"],
    typical_due_offset_days: 15
    // Sept 15
  },
  {
    id: "ob-advtax-q3",
    name: "Advance Tax Installment 3 (75%)",
    category: "Income Tax",
    frequency: "quarterly",
    governing_body: "Income Tax Dept",
    applicable_entity_types: ["Pvt Ltd", "LLP", "OPC", "Partnership"],
    typical_due_offset_days: 15
    // Dec 15
  },
  {
    id: "ob-advtax-q4",
    name: "Advance Tax Installment 4 (100%)",
    category: "Income Tax",
    frequency: "quarterly",
    governing_body: "Income Tax Dept",
    applicable_entity_types: ["Pvt Ltd", "LLP", "OPC", "Partnership"],
    typical_due_offset_days: 15
    // Mar 15
  },
  {
    id: "ob-roc-kyc",
    name: "ROC DIR-3 KYC Director Verification",
    category: "ROC",
    frequency: "annual",
    governing_body: "MCA",
    applicable_entity_types: ["Pvt Ltd", "OPC"],
    typical_due_offset_days: 30
    // Sept 30
  },
  {
    id: "ob-roc-mgt7",
    name: "ROC MGT-7 Annual Corporate Return",
    category: "ROC",
    frequency: "annual",
    governing_body: "MCA",
    applicable_entity_types: ["Pvt Ltd", "OPC"],
    typical_due_offset_days: 60
    // AGM + 60 days
  },
  {
    id: "ob-pf-monthly",
    name: "Provident Fund (PF) Monthly Return",
    category: "PF & ESIC",
    frequency: "monthly",
    governing_body: "EPFO",
    applicable_entity_types: ["Pvt Ltd", "LLP", "Partnership"],
    typical_due_offset_days: 15
  }
];
var LowDb = class {
  constructor() {
    this.state = this.getInitialState();
    this.read();
    this.write();
  }
  getInitialState() {
    const wsId = "ws-main";
    const baseEntities = [
      {
        id: "ent-alpha",
        workspace_id: wsId,
        name: "Acme Tech Digital Pvt Ltd",
        gstin: "29AAAAA0000A1Z5",
        pan: "AAAAA1234A",
        tan: "BLRA12345B",
        business_type: "Pvt Ltd",
        state_code: "KA",
        is_active: true,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "ent-beta",
        workspace_id: wsId,
        name: "Alpha Retail Traders LLP",
        gstin: "27BBBBB1111B2Z3",
        pan: "BBBBB5678B",
        tan: "MUMA56789C",
        business_type: "LLP",
        state_code: "MH",
        is_active: true,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    const indianSMBsData = [
      { name: "Zeta Cloudlabs India Pvt Ltd", type: "Pvt Ltd", state: "KA", business: "IT SaaS" },
      { name: "Karan & Sons Logistics", type: "Partnership", state: "MH", business: "Logistics" },
      { name: "Delhi Organic Farms", type: "Sole Prop", state: "DL", business: "Agri-Tech" },
      { name: "Vibrant Garments Manufacturing", type: "LLP", state: "GJ", business: "Textiles" },
      { name: "Hyderabad Agro Processing Pvt Ltd", type: "Pvt Ltd", state: "TS", business: "Food Processing" },
      { name: "Chennai Auto Components Pvt Ltd", type: "Pvt Ltd", state: "TN", business: "Auto Ancillaries" },
      { name: "Gurugram Retail Ventures", type: "LLP", state: "HR", business: "E-Commerce Retail" },
      { name: "Kolkata Book Agency", type: "Sole Prop", state: "WB", business: "Publishing" },
      { name: "Noida Precision Tools", type: "Partnership", state: "UP", business: "Manufacturing" },
      { name: "Royal Rajasthan Handicrafts", type: "OPC", state: "RJ", business: "Arts & Crafts" },
      { name: "Bengaluru Brewmasters", type: "LLP", state: "KA", business: "F&B" },
      { name: "Pune Finserve Advisories Pvt Ltd", type: "Pvt Ltd", state: "MH", business: "Financial Services" },
      { name: "Indore Sweet Palace", type: "Sole Prop", state: "MP", business: "F&B Retail" },
      { name: "Kochi Spices Export House", type: "Partnership", state: "KL", business: "Spices Export" },
      { name: "Ahmedabad Chemicals Pvt Ltd", type: "Pvt Ltd", state: "GJ", business: "Industrial Chemicals" },
      { name: "Punjab Agri Implements", type: "LLP", state: "PB", business: "Agri Machinery" },
      { name: "Guwahati Tea Estates", type: "Partnership", state: "AS", business: "Tea Processing" },
      { name: "Bhubaneswar Minerals", type: "OPC", state: "OR", business: "Mining & Logistics" },
      { name: "Patna Supermart", type: "Sole Prop", state: "BR", business: "Groceries Retail" },
      { name: "Lucknow Chikan Weavers", type: "LLP", state: "UP", business: "Textile Apparel" },
      { name: "Goa Beachside Resorts Pvt Ltd", type: "Pvt Ltd", state: "GA", business: "Hospitality" },
      { name: "Jammu Walnut Trading Corp", type: "Partnership", state: "JK", business: "Dry Fruits Trading" },
      { name: "Ranchi Steel & Alloys Pvt Ltd", type: "Pvt Ltd", state: "JH", business: "Metal Castings" },
      { name: "Dehradun Herbals & Wellness", type: "Sole Prop", state: "UT", business: "Wellness Retail" },
      { name: "Visakhapatnam Shipping Services", type: "LLP", state: "AP", business: "Maritime Logistics" }
    ];
    const generatedEntities = [];
    const generatedObligations = [];
    const makeGstin = (state, pan) => {
      const stateMap = {
        KA: "29",
        MH: "27",
        DL: "07",
        GJ: "24",
        TS: "36",
        TN: "33",
        HR: "06",
        WB: "19",
        UP: "09",
        RJ: "08",
        MP: "23",
        KL: "32",
        PB: "03",
        AS: "18",
        OR: "21",
        BR: "10",
        GA: "30",
        JK: "01",
        JH: "20",
        UT: "05",
        AP: "37"
      };
      const prefix = stateMap[state] || "29";
      return `${prefix}${pan}1Z5`;
    };
    const makePan = (name, type) => {
      const charMap = {
        "Pvt Ltd": "C",
        "LLP": "L",
        "Sole Prop": "P",
        "Partnership": "F",
        "OPC": "P"
      };
      const statusChar = charMap[type] || "F";
      const cleanName = name.replace(/[^A-Z]/ig, "").toUpperCase();
      const first4 = (cleanName + "XXXX").substring(0, 4);
      const digits = Math.floor(1e3 + Math.random() * 9e3).toString();
      const last = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      return `${first4}${statusChar}${digits}${last}`;
    };
    const makeTan = (state) => {
      const cityCodes = {
        KA: "BLR",
        MH: "MUM",
        DL: "DEL",
        GJ: "AHM",
        TS: "HYD",
        TN: "CHE",
        HR: "GUR",
        WB: "CAL",
        UP: "NOI",
        RJ: "JAI",
        MP: "IND",
        KL: "KOC",
        PB: "LUD",
        AS: "GUW",
        OR: "BHU",
        BR: "PAT",
        GA: "PAN",
        JK: "JAM",
        JH: "RAN",
        UT: "DEH",
        AP: "VIZ"
      };
      const city = cityCodes[state] || "BLR";
      const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const digits = Math.floor(1e4 + Math.random() * 9e4).toString();
      const last = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      return `${city}${char}${digits}${last}`;
    };
    indianSMBsData.forEach((smb, index) => {
      const entId = `ent-gen-${index + 1}`;
      const pan = makePan(smb.name, smb.type);
      const gstin = makeGstin(smb.state, pan);
      const tan = makeTan(smb.state);
      const bType = smb.type;
      generatedEntities.push({
        id: entId,
        workspace_id: wsId,
        name: smb.name,
        gstin,
        pan,
        tan,
        business_type: bType,
        state_code: smb.state,
        is_active: true,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      ["ob-advtax-q1", "ob-advtax-q2", "ob-advtax-q3", "ob-advtax-q4"].forEach((otId, subIdx) => {
        generatedObligations.push({
          id: `eo-gen-${index + 1}-adv-${subIdx + 1}`,
          entity_id: entId,
          obligation_type_id: otId,
          is_active: true,
          custom_due_offset: 0,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      });
      ["ob-gstr1", "ob-gstr3b"].forEach((otId, subIdx) => {
        generatedObligations.push({
          id: `eo-gen-${index + 1}-gst-${subIdx + 1}`,
          entity_id: entId,
          obligation_type_id: otId,
          is_active: true,
          custom_due_offset: 0,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      });
      if (["Pvt Ltd", "OPC", "LLP"].includes(bType)) {
        ["ob-tds-chal", "ob-tds-r1", "ob-tds-r2", "ob-tds-r3", "ob-tds-r4"].forEach((otId, subIdx) => {
          generatedObligations.push({
            id: `eo-gen-${index + 1}-tds-${subIdx + 1}`,
            entity_id: entId,
            obligation_type_id: otId,
            is_active: true,
            custom_due_offset: 0,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          });
        });
      }
      if (["Pvt Ltd", "OPC"].includes(bType)) {
        ["ob-roc-kyc", "ob-roc-mgt7"].forEach((otId, subIdx) => {
          generatedObligations.push({
            id: `eo-gen-${index + 1}-roc-${subIdx + 1}`,
            entity_id: entId,
            obligation_type_id: otId,
            is_active: true,
            custom_due_offset: 0,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          });
        });
      }
      if (["Pvt Ltd", "LLP", "Partnership"].includes(bType)) {
        generatedObligations.push({
          id: `eo-gen-${index + 1}-pf`,
          entity_id: entId,
          obligation_type_id: "ob-pf-monthly",
          is_active: true,
          custom_due_offset: 0,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    });
    const allEntities = [...baseEntities, ...generatedEntities];
    const baseObligations = [
      {
        id: "eo-1",
        entity_id: "ent-alpha",
        obligation_type_id: "ob-gstr1",
        is_active: true,
        custom_due_offset: 0,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "eo-2",
        entity_id: "ent-alpha",
        obligation_type_id: "ob-gstr3b",
        is_active: true,
        custom_due_offset: 0,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "eo-3",
        entity_id: "ent-alpha",
        obligation_type_id: "ob-roc-kyc",
        is_active: true,
        custom_due_offset: 0,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "eo-4",
        entity_id: "ent-beta",
        obligation_type_id: "ob-gstr1",
        is_active: true,
        custom_due_offset: 0,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    const allObligations = [...baseObligations, ...generatedObligations];
    return {
      workspaces: [
        {
          id: wsId,
          name: "Acme India & Associates",
          owner_user_id: "user-dev-clerk-123",
          plan_tier: "business",
          // Upgraded to premium plan to match robust scaling
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "ws-clients-cafe",
          name: "Chai Point Bangalore",
          owner_user_id: "user-customer-456",
          plan_tier: "starter",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      entities: allEntities,
      obligation_types: MASTER_OBLIGATIONS,
      entity_obligations: allObligations,
      deadlines: [],
      // Generate automatically on startup for all entities
      filing_records: [],
      documents: [
        {
          id: "doc-sample-1",
          entity_id: "ent-alpha",
          filename: "gst_certificate_2025.pdf",
          s3_key: "https://example.com/docs/gst_certificate_2025.pdf",
          document_type: "GST Registration Paper",
          uploaded_by: "adarshsinghgautam2@gmail.com",
          uploaded_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      notifications: [],
      advisor_relationships: [
        {
          id: "rel-1",
          advisor_user_id: "user-dev-clerk-123",
          client_workspace_id: "ws-clients-cafe",
          access_level: "annotate",
          status: "active",
          invited_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ]
    };
  }
  read() {
    try {
      if (import_fs.default.existsSync(DB_FILE)) {
        const fileContent = import_fs.default.readFileSync(DB_FILE, "utf-8");
        this.state = JSON.parse(fileContent);
        if (!this.state.entities || this.state.entities.length < 10) {
          console.log("[LowDb] Outdated database file detected. Force-resetting to new 27-entity portfolio.");
          this.state = this.getInitialState();
          this.write();
        } else {
          this.state.obligation_types = MASTER_OBLIGATIONS;
        }
      }
    } catch (e) {
      console.error("Failed to read Database JSON from disk, using defaults", e);
    }
  }
  write() {
    try {
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write Database JSON to disk", e);
    }
  }
  getState() {
    return this.state;
  }
};
var dbInstance = new LowDb();
var dbState = dbInstance.getState();
function isWeekendOrIndianHoliday(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  if (day === 0 || day === 6) {
    return true;
  }
  const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
  if (INDIAN_HOLIDAYS.includes(monthDay)) {
    return true;
  }
  return false;
}
function adjustDueDate(dateStr) {
  let date = new Date(dateStr);
  while (true) {
    const formattedYMD = date.toISOString().split("T")[0];
    if (isWeekendOrIndianHoliday(formattedYMD)) {
      date.setDate(date.getDate() + 1);
    } else {
      break;
    }
  }
  return date.toISOString().split("T")[0];
}
function generateDeadlinesForEntity(entityId, monthsAhead = 12) {
  const entities = dbState.entities;
  const entity = entities.find((e) => e.id === entityId);
  if (!entity) return 0;
  const entityObligations = dbState.entity_obligations.filter(
    (eo) => eo.entity_id === entityId && eo.is_active
  );
  let newDeadlinesCount = 0;
  const today = /* @__PURE__ */ new Date();
  for (let m = 0; m < monthsAhead; m++) {
    const targetMonthDate = new Date(today.getFullYear(), today.getMonth() + m, 1);
    const year = targetMonthDate.getFullYear();
    const month = targetMonthDate.getMonth();
    const monthsNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    for (const eo of entityObligations) {
      const type = dbState.obligation_types.find((ot) => ot.id === eo.obligation_type_id);
      if (!type) continue;
      let rawDueDateStr = "";
      let periodLabel = "";
      if (type.frequency === "monthly") {
        const dueMonth = (month + 1) % 12;
        const dueYear = dueMonth === 0 ? year + 1 : year;
        let dueDay = type.typical_due_offset_days;
        if (type.id === "ob-tds-chal" && month === 2) {
          dueDay = 30;
        }
        const dateMonth = String(dueMonth === 0 ? 12 : dueMonth).padStart(2, "0");
        const dateDay = String(dueDay).padStart(2, "0");
        rawDueDateStr = `${dueYear}-${dateMonth}-${dateDay}`;
        periodLabel = `${monthsNames[month]} ${year}`;
      } else if (type.frequency === "quarterly") {
        if (type.id.includes("advtax-q1") && month === 5) {
          rawDueDateStr = `${year}-06-15`;
          periodLabel = `Q1 (Apr-Jun) FY ${year}-${String(year + 1).slice(-2)}`;
        } else if (type.id.includes("advtax-q2") && month === 8) {
          rawDueDateStr = `${year}-09-15`;
          periodLabel = `Q2 (Jul-Sep) FY ${year}-${String(year + 1).slice(-2)}`;
        } else if (type.id.includes("advtax-q3") && month === 11) {
          rawDueDateStr = `${year}-12-15`;
          periodLabel = `Q3 (Oct-Dec) FY ${year}-${String(year + 1).slice(-2)}`;
        } else if (type.id.includes("advtax-q4") && month === 2) {
          rawDueDateStr = `${year}-03-15`;
          periodLabel = `Q4 (Jan-Mar) FY ${year - 1}-${String(year).slice(-2)}`;
        } else if (type.id.includes("tds-r1") && month === 6) {
          rawDueDateStr = `${year}-07-31`;
          periodLabel = `Q1 Return (Form 24Q/26Q) FY ${year}-${String(year + 1).slice(-2)}`;
        } else if (type.id.includes("tds-r2") && month === 9) {
          rawDueDateStr = `${year}-10-31`;
          periodLabel = `Q2 Return (Form 24Q/26Q) FY ${year}-${String(year + 1).slice(-2)}`;
        } else if (type.id.includes("tds-r3") && month === 0) {
          rawDueDateStr = `${year}-01-31`;
          periodLabel = `Q3 Return (Form 24Q/26Q) FY ${year - 1}-${String(year).slice(-2)}`;
        } else if (type.id.includes("tds-r4") && month === 4) {
          rawDueDateStr = `${year}-05-31`;
          periodLabel = `Q4 Return (Form 24Q/26Q) FY ${year - 1}-${String(year).slice(-2)}`;
        }
      } else if (type.frequency === "annual") {
        if (type.id === "ob-roc-kyc" && month === 8) {
          rawDueDateStr = `${year}-09-30`;
          periodLabel = `FY ${year - 1}-${String(year).slice(-2)}`;
        } else if (type.id === "ob-roc-mgt7" && month === 10) {
          rawDueDateStr = `${year}-11-29`;
          periodLabel = `FY ${year - 1}-${String(year).slice(-2)}`;
        }
      }
      if (rawDueDateStr) {
        const finalDueDate = adjustDueDate(rawDueDateStr);
        const limitDate = /* @__PURE__ */ new Date();
        limitDate.setDate(limitDate.getDate() - 30);
        if (new Date(finalDueDate) < limitDate) {
          continue;
        }
        const exists = dbState.deadlines.some(
          (d) => d.entity_obligation_id === eo.id && d.due_date === finalDueDate
        );
        if (!exists) {
          let status = "upcoming";
          const diffDays = Math.ceil(
            (new Date(finalDueDate).getTime() - today.getTime()) / (1e3 * 60 * 60 * 24)
          );
          if (diffDays < 0) {
            status = "overdue";
          } else if (diffDays <= 7) {
            status = "due_soon";
          }
          dbState.deadlines.push({
            id: `dl-${Math.random().toString(36).substr(2, 9)}`,
            entity_obligation_id: eo.id,
            due_date: finalDueDate,
            period_label: periodLabel,
            status,
            readiness_score: 40,
            // Base level score
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          newDeadlinesCount++;
        }
      }
    }
  }
  if (newDeadlinesCount > 0) {
    dbInstance.write();
  }
  return newDeadlinesCount;
}
function initializeStubDeadlines() {
  dbState.entities.forEach((ent) => {
    generateDeadlinesForEntity(ent.id, 12);
  });
  if (dbState.deadlines.length > 0 && dbState.filing_records.length === 0) {
    const pastDeadlines = dbState.deadlines.filter((d) => new Date(d.due_date) < /* @__PURE__ */ new Date());
    pastDeadlines.slice(0, 3).forEach((dl, i) => {
      dl.status = "filed";
      dbState.filing_records.push({
        id: `fr-${i}`,
        deadline_id: dl.id,
        filed_at: new Date(new Date(dl.due_date).getTime() - 2 * 24 * 3600 * 1e3).toISOString(),
        filed_by: "adarshsinghgautam2@gmail.com",
        ack_number: `ACK${Math.floor(1e8 + Math.random() * 9e8)}`,
        notes: "Filed timely on official tax portal."
      });
    });
    dbInstance.write();
  }
}
initializeStubDeadlines();
var activeWorkspaceId = "ws-main";
var aiClient = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client", err);
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "DeadlineOS-AI" });
});
app.get("/api/v1/workspaces/me", (req, res) => {
  const workspaces = dbState.workspaces;
  let ws = workspaces.find((w) => w.id === activeWorkspaceId);
  if (!ws && workspaces.length > 0) {
    ws = workspaces[0];
    activeWorkspaceId = ws.id;
  }
  res.json(ws || null);
});
app.post("/api/v1/workspaces/switch", (req, res) => {
  const { workspaceId } = req.body;
  const workspace = dbState.workspaces.find((w) => w.id === workspaceId);
  if (workspace) {
    activeWorkspaceId = workspaceId;
    res.json({ status: "success", workspace });
  } else {
    res.status(404).json({ error: "Workspace not found" });
  }
});
app.post("/api/v1/workspaces/me/plan", (req, res) => {
  const { plan_tier } = req.body;
  const workspaces = dbState.workspaces;
  const ws = workspaces.find((w) => w.id === activeWorkspaceId);
  if (!ws) {
    return res.status(404).json({ error: "Workspace not found" });
  }
  if (!["starter", "growth", "business"].includes(plan_tier)) {
    return res.status(400).json({ error: "Invalid plan tier" });
  }
  ws.plan_tier = plan_tier;
  dbInstance.write();
  res.json({ success: true, workspace: ws });
});
app.post("/api/v1/workspaces", (req, res) => {
  const { name, plan_tier } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Workspace name required" });
  }
  const newWorkspace = {
    id: `ws-${Math.random().toString(36).substr(2, 9)}`,
    name,
    owner_user_id: "user-dev-clerk-123",
    plan_tier: plan_tier || "starter",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbState.workspaces.push(newWorkspace);
  activeWorkspaceId = newWorkspace.id;
  dbInstance.write();
  res.status(201).json(newWorkspace);
});
app.patch("/api/v1/workspaces/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const ws = dbState.workspaces.find((w) => w.id === id);
  if (!ws) {
    return res.status(404).json({ error: "Workspace not found" });
  }
  if (name) ws.name = name;
  dbInstance.write();
  res.json(ws);
});
app.get("/api/v1/entities", (req, res) => {
  const results = dbState.entities.filter((e) => e.workspace_id === activeWorkspaceId && e.is_active);
  res.json(results);
});
app.post("/api/v1/entities", (req, res) => {
  const { name, business_type, state_code, gstin, pan, tan } = req.body;
  if (!name || !business_type || !state_code) {
    return res.status(400).json({ error: "Missing required business identification details" });
  }
  const currentWorkspace = dbState.workspaces.find((w) => w.id === activeWorkspaceId);
  const activeEntities = dbState.entities.filter((e) => e.workspace_id === activeWorkspaceId && e.is_active);
  if (currentWorkspace) {
    const limits = { starter: 1, growth: 3, business: 10 };
    const maxEntities = limits[currentWorkspace.plan_tier] || 1;
    if (activeEntities.length >= maxEntities) {
      return res.status(403).json({
        error: `Entity limit reached. Your '${currentWorkspace.plan_tier}' plan supports up to ${maxEntities} entities. Please upgrade in Settings.`,
        code: "LIMIT_REACHED"
      });
    }
  }
  const newEntity = {
    id: `ent-${Math.random().toString(36).substr(2, 9)}`,
    workspace_id: activeWorkspaceId,
    name,
    business_type,
    state_code,
    gstin: gstin || void 0,
    pan: pan || void 0,
    tan: tan || void 0,
    is_active: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbState.entities.push(newEntity);
  dbInstance.write();
  res.status(201).json(newEntity);
});
app.patch("/api/v1/entities/:id", (req, res) => {
  const { id } = req.params;
  const entity = dbState.entities.find((e) => e.id === id && e.workspace_id === activeWorkspaceId);
  if (!entity) {
    return res.status(404).json({ error: "Entity not found" });
  }
  const { name, state_code, gstin, pan, tan } = req.body;
  if (name) entity.name = name;
  if (state_code) entity.state_code = state_code;
  if (gstin) entity.gstin = gstin;
  if (pan) entity.pan = pan;
  if (tan) entity.tan = tan;
  dbInstance.write();
  res.json(entity);
});
app.delete("/api/v1/entities/:id", (req, res) => {
  const { id } = req.params;
  const entity = dbState.entities.find((e) => e.id === id && e.workspace_id === activeWorkspaceId);
  if (!entity) {
    return res.status(404).json({ error: "Entity not found" });
  }
  entity.is_active = false;
  dbInstance.write();
  res.json({ success: true, message: "Entity soft-deleted" });
});
app.get("/api/v1/obligations/suggest", async (req, res) => {
  const { entity_type, state_code, is_gst_registered } = req.query;
  if (!entity_type || !state_code) {
    return res.status(400).json({ error: "Missing entity_type or state_code query parameters" });
  }
  const matchingObligations = dbState.obligation_types.filter((ot) => {
    const eligibleType = ot.applicable_entity_types.includes(entity_type);
    if (!eligibleType) return false;
    if (ot.category === "GST" && is_gst_registered !== "true") {
      return false;
    }
    return true;
  });
  const suggestions = matchingObligations.map((ot) => {
    let reason = `Standard requirement for a ${entity_type} business in India.`;
    if (ot.category === "GST") {
      reason = "Applicable immediately due to active GST registration.";
    } else if (ot.category === "TDS") {
      reason = "Withholding TDS requirements applied automatically to incorporated types.";
    }
    return {
      obligation_type_id: ot.id,
      name: ot.name,
      category: ot.category,
      is_mandatory: true,
      confidence: 0.95,
      reason
    };
  });
  if (["MH", "KA", "DL", "TN", "WB"].includes(state_code)) {
    suggestions.push({
      obligation_type_id: "pt-state-monthly",
      name: `State Professional Tax (${state_code})`,
      category: "Corporate",
      is_mandatory: true,
      confidence: 0.9,
      reason: `Mandatory Professional Tax filing triggered for entity base location ${state_code}.`
    });
  }
  if (aiClient) {
    try {
      const prompt = `System: You are an Indian Tax Compliance Specialist.
Analyze this profile: Business Type: "${entity_type}", State: "${state_code}", GST Registered: "${is_gst_registered}".
Explain briefly in 2 key bullets why GSTR-1, GSTR-3B, TDS Returns, or ROC corporate filing apply specifically or if any additional niche state taxes (e.g. state-specific Shop Act) should be highlighted. Keep it human, clear, and action-oriented. Max 100 words.`;
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      if (response.text) {
        return res.json({
          suggestions,
          ai_recommendations_summary: response.text
        });
      }
    } catch (err) {
      console.error("Gemini suggestion enhancement errored, continuing with standard rules", err);
    }
  }
  res.json({
    suggestions,
    ai_recommendations_summary: `Based on your profile as a ${entity_type} located in state ${state_code}, standard CBIC and MCA rules have been applied. Custom timelines are set with weekend/public holiday buffers automatically mapped.`
  });
});
app.post("/api/v1/entity-obligations/bulk", (req, res) => {
  const { entity_id, obligation_type_ids } = req.body;
  if (!entity_id || !Array.isArray(obligation_type_ids)) {
    return res.status(400).json({ error: "entity_id and array of obligation_type_ids required" });
  }
  const entity = dbState.entities.find((e) => e.id === entity_id && e.workspace_id === activeWorkspaceId);
  if (!entity) {
    return res.status(404).json({ error: "Entity not found in active workspace" });
  }
  dbState.entity_obligations = dbState.entity_obligations.filter((eo) => eo.entity_id !== entity_id);
  obligation_type_ids.forEach((id) => {
    dbState.entity_obligations.push({
      id: `eo-${Math.random().toString(36).substr(2, 9)}`,
      entity_id,
      obligation_type_id: id,
      is_active: true,
      custom_due_offset: 0,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  const deadlinesCreated = generateDeadlinesForEntity(entity_id, 12);
  dbInstance.write();
  res.json({
    success: true,
    message: `Obligations mapped successfully. Generated ${deadlinesCreated} compliance deadlines for the upcoming year (excluding historical dates, weekends, and gazetted holidays shifted to Mon/working days).`
  });
});
app.get("/api/v1/deadlines/upcoming", (req, res) => {
  const entityId = req.query.entity_id;
  const status = req.query.status;
  const category = req.query.category;
  const daysAhead = req.query.days_ahead ? parseInt(req.query.days_ahead, 10) : null;
  const today = /* @__PURE__ */ new Date();
  const workspaceEntities = dbState.entities.filter((e) => e.workspace_id === activeWorkspaceId && e.is_active);
  const workspaceEntityIds = workspaceEntities.map((e) => e.id);
  let results = dbState.deadlines.map((dl) => {
    const eo = dbState.entity_obligations.find((o) => o.id === dl.entity_obligation_id);
    const entity = eo ? workspaceEntities.find((e) => e.id === eo.entity_id) : null;
    const type = eo ? dbState.obligation_types.find((t) => t.id === eo.obligation_type_id) : null;
    const filingRecord = dbState.filing_records.find((fr) => fr.deadline_id === dl.id);
    const diffMs = new Date(dl.due_date).getTime() - today.getTime();
    const daysUntil = Math.ceil(diffMs / (1e3 * 60 * 60 * 24));
    let statusState = dl.status;
    if (statusState !== "filed") {
      if (daysUntil < 0) {
        statusState = "overdue";
      } else if (daysUntil <= 5) {
        statusState = "due_soon";
      } else {
        statusState = "upcoming";
      }
    }
    return {
      ...dl,
      status: statusState,
      entity_name: entity ? entity.name : "N/A",
      entity_id: entity ? entity.id : null,
      obligation_name: type ? type.name : "State Tax/PT Filing",
      category: type ? type.category : "Corporate",
      governing_body: type ? type.governing_body : "State Government",
      days_until: daysUntil,
      filing_record: filingRecord
    };
  });
  results = results.filter((dl) => dl.entity_id && workspaceEntityIds.includes(dl.entity_id));
  if (entityId) {
    results = results.filter((dl) => dl.entity_id === entityId);
  }
  if (status) {
    results = results.filter((dl) => dl.status === status);
  }
  if (category && category !== "All") {
    results = results.filter((dl) => dl.category === category);
  }
  if (daysAhead !== null) {
    results = results.filter((dl) => dl.days_until >= 0 && dl.days_until <= daysAhead);
  }
  results.sort((a, b) => {
    if (a.status === "filed" && b.status !== "filed") return 1;
    if (b.status === "filed" && a.status !== "filed") return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
  res.json(results);
});
app.patch("/api/v1/deadlines/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const deadline = dbState.deadlines.find((d) => d.id === id);
  if (!deadline) {
    return res.status(404).json({ error: "Deadline not found" });
  }
  deadline.status = status;
  dbInstance.write();
  res.json(deadline);
});
app.post("/api/v1/deadlines/:id/file", (req, res) => {
  const { id } = req.params;
  const { ack_number, filed_by, notes, document_type, filename } = req.body;
  if (!ack_number || !filed_by) {
    return res.status(400).json({ error: "ack_number and filed_by are required to finalize filing" });
  }
  const deadline = dbState.deadlines.find((d) => d.id === id);
  if (!deadline) {
    return res.status(404).json({ error: "Deadline not found" });
  }
  deadline.status = "filed";
  deadline.readiness_score = 100;
  const frId = `fr-${Math.random().toString(36).substr(2, 9)}`;
  const filing = {
    id: frId,
    deadline_id: id,
    filed_at: (/* @__PURE__ */ new Date()).toISOString(),
    filed_by,
    ack_number,
    notes
  };
  dbState.filing_records.push(filing);
  const currentEO = dbState.entity_obligations.find((eo) => eo.id === deadline.entity_obligation_id);
  if (currentEO && filename) {
    dbState.documents.push({
      id: `doc-${Math.random().toString(36).substr(2, 9)}`,
      entity_id: currentEO.entity_id,
      deadline_id: id,
      filename,
      s3_key: `https://deadlineos-vault.s3.ap-south-1.amazonaws.com/${filename}`,
      document_type: document_type || "Government Challan / Acknowledgment Receipt",
      uploaded_by: filed_by,
      uploaded_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  dbState.notifications.push({
    id: `notif-${Math.random().toString(36).substr(2, 9)}`,
    workspace_id: activeWorkspaceId,
    deadline_id: id,
    channel: "in_app",
    status: "sent",
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    message_content: `Successfully generated receipt log for file ${ack_number}. Verification record created.`
  });
  dbInstance.write();
  res.json({ success: true, filing });
});
app.post("/api/v1/documents", (req, res) => {
  const { entity_id, filename, document_type, uploaded_by } = req.body;
  if (!entity_id || !filename || !document_type) {
    return res.status(400).json({ error: "entity_id, filename, and document_type are required" });
  }
  const newDoc = {
    id: `doc-${Math.random().toString(36).substr(2, 9)}`,
    entity_id,
    filename,
    s3_key: `https://deadlineos-vault.s3.ap-south-1.amazonaws.com/${filename}`,
    document_type,
    uploaded_by: uploaded_by || "User Officer",
    uploaded_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbState.documents.push(newDoc);
  dbInstance.write();
  res.status(201).json(newDoc);
});
app.get("/api/v1/documents", (req, res) => {
  const { entity_id } = req.query;
  let docs = dbState.documents;
  if (entity_id) {
    docs = docs.filter((d) => d.entity_id === entity_id);
  }
  res.json(docs);
});
app.get("/api/v1/deadlines/:id/guidance", async (req, res) => {
  const { id } = req.params;
  const deadline = dbState.deadlines.find((d) => d.id === id);
  if (!deadline) {
    return res.status(404).json({ error: "Deadline not found" });
  }
  const eo = dbState.entity_obligations.find((o) => o.id === deadline.entity_obligation_id);
  const type = eo ? dbState.obligation_types.find((t) => t.id === eo.obligation_type_id) : null;
  const entity = eo ? dbState.entities.find((e) => e.id === eo.entity_id) : null;
  const obligationName = type ? type.name : "Niche Corporate/Tax Liability";
  const entityType = entity ? entity.business_type : "Pvt Ltd";
  const cat = type ? type.category : "GST";
  if (aiClient) {
    try {
      const prompt = `System: You are an expert tax compliance AI companion for Indian SMBs.
Describe step-by-step how to file or prepare for ${obligationName} (Category: ${cat}) for a ${entityType} company.
Include:
1. Necessary pre-requisite reports (e.g. sales registry, ledger).
2. Direct Government Portal link reference context (e.g., GST portal, TRACES).
3. Critical warning about delay penalties or standard mistakes (e.g., matching GSTR2B with purchase register).
Keep it clean, beautifully formatted in Markdown bullets, and professional. Max 140 words.`;
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      if (response.text) {
        return res.json({ guidance: response.text });
      }
    } catch (err) {
      console.error("Gemini compliance counselor failed to load", err);
    }
  }
  const backups = {
    "GST": `**Filing Guidelines for ${obligationName}:**
1. Export sales invoices from your Billing software (Excel/CSV).
2. Navigate to GST portal (\`gst.gov.in\`) -> Returns Dashboard -> Select Financial Year & Month.
3. Prepare GSTR-1, upload structural invoice details, verify B2B & B2C counts, and file with DSC or EVC.
4. *Important*: Double-check and cross-match input tax credit with Form GSTR-2B before submitting GSTR-3B summary.`,
    "TDS": `**Filing Guidelines for ${obligationName}:**
1. Fetch payroll data or contract vendor expense list for tax computation.
2. Locate correct deductee codes and section codes on the Income Tax TRACES workspace.
3. Complete tax challan payment using OLTAS portal / e-payment gateway.
4. Download receipt with BSR code & Challan Serial number to map onto quarterly returns.`,
    "ROC": `**ROC Compliance Filing Guidelines:**
1. Convene annual Board Meeting & AGM; draft comprehensive board resolutions.
2. Finalize audits & balance sheets inside standard MCA XBRL layout.
3. Access MCA Portal (\`mca.gov.in\`), download DIR3-KYC or MGT-7 forms, attach Director Signatures, and upload to queue.`
  };
  const selectedBackup = backups[cat] || backups["GST"];
  res.json({ guidance: selectedBackup });
});
app.get("/api/v1/dashboard/summary", (req, res) => {
  const workspaceEntities = dbState.entities.filter((e) => e.workspace_id === activeWorkspaceId && e.is_active);
  const workspaceEntityIds = workspaceEntities.map((e) => e.id);
  const today = /* @__PURE__ */ new Date();
  const activeDeadlines = dbState.deadlines.filter((dl) => {
    const eo = dbState.entity_obligations.find((o) => o.id === dl.entity_obligation_id);
    return eo && workspaceEntityIds.includes(eo.entity_id);
  });
  let overdueCount = 0;
  let dueThisWeek = 0;
  let dueThisMonth = 0;
  let totalFiledOnTime = 0;
  let totalHistoricFilingAttempts = 0;
  activeDeadlines.forEach((dl) => {
    const diffMs = new Date(dl.due_date).getTime() - today.getTime();
    const daysUntil = Math.ceil(diffMs / (1e3 * 60 * 60 * 24));
    const isFiled = dl.status === "filed";
    const isThisMonth = new Date(dl.due_date).getMonth() === today.getMonth() && new Date(dl.due_date).getFullYear() === today.getFullYear();
    if (!isFiled) {
      if (daysUntil < 0) {
        overdueCount++;
      } else if (daysUntil <= 7) {
        dueThisWeek++;
      }
      if (isThisMonth && daysUntil >= 0) {
        dueThisMonth++;
      }
    } else {
      totalFiledOnTime++;
    }
    if (daysUntil < 0 || isFiled) {
      totalHistoricFilingAttempts++;
    }
  });
  const complianceScore = totalHistoricFilingAttempts > 0 ? Math.round(totalFiledOnTime / totalHistoricFilingAttempts * 100) : 100;
  res.json({
    overdueCount,
    dueThisWeek,
    dueThisMonth,
    complianceScore,
    activeWorkspaceId
  });
});
app.get("/api/v1/advisor/clients", (req, res) => {
  const advisorRelationships = dbState.advisor_relationships.filter(
    (rel) => rel.advisor_user_id === "user-dev-clerk-123" && rel.status === "active"
  );
  const results = advisorRelationships.map((rel) => {
    const clientWorkspace = dbState.workspaces.find((w) => w.id === rel.client_workspace_id);
    const clientWorkspaceName = clientWorkspace ? clientWorkspace.name : "Unknown SMB Client";
    const clientEntities = dbState.entities.filter((e) => e.workspace_id === rel.client_workspace_id && e.is_active);
    const clientEntityIds = clientEntities.map((e) => e.id);
    const clientDeadlines = dbState.deadlines.filter((dl) => {
      const eo = dbState.entity_obligations.find((o) => o.id === dl.entity_obligation_id);
      return eo && clientEntityIds.includes(eo.entity_id);
    });
    let overdue = 0;
    let filed = 0;
    clientDeadlines.forEach((dl) => {
      const isOverdue = new Date(dl.due_date) < /* @__PURE__ */ new Date() && dl.status !== "filed";
      if (isOverdue) overdue++;
      if (dl.status === "filed") filed++;
    });
    const complianceScore = clientDeadlines.length > 0 ? Math.round(filed / clientDeadlines.length * 100) : 100;
    const nextDl = clientDeadlines.filter((d) => d.status !== "filed" && new Date(d.due_date) >= /* @__PURE__ */ new Date()).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
    let nextDeadlineDesc = "All clear";
    if (nextDl) {
      const eo = dbState.entity_obligations.find((o) => o.id === nextDl.entity_obligation_id);
      const ot = eo ? dbState.obligation_types.find((t) => t.id === eo.obligation_type_id) : null;
      nextDeadlineDesc = ot ? `${ot.name} (${nextDl.due_date})` : nextDl.due_date;
    }
    return {
      relationship_id: rel.id,
      client_workspace_id: rel.client_workspace_id,
      client_workspace_name: clientWorkspaceName,
      entity_count: clientEntities.length,
      compliance_score: complianceScore,
      overdue_count: overdue,
      next_deadline: nextDeadlineDesc,
      last_activity: clientEntities.length > 0 ? "Soft audit completed" : "No entities registered"
    };
  });
  res.json(results);
});
app.post("/api/v1/advisor/nudge", (req, res) => {
  const { client_workspace_id, message } = req.body;
  if (!client_workspace_id) {
    return res.status(400).json({ error: "client_workspace_id is required" });
  }
  const msgContent = message || "Please review your upcoming filings immediately. Missing timelines triggers daily CBIC late penalties.";
  dbState.notifications.push({
    id: `notif-${Math.random().toString(36).substr(2, 9)}`,
    workspace_id: client_workspace_id,
    channel: "whatsapp",
    status: "sent",
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    message_content: `Nudge from your Chartered Accountant: "${msgContent}"`
  });
  dbInstance.write();
  res.json({ success: true, message: "Reminders successfully dispatched to owner's WhatsApp and inbox!" });
});
app.post("/api/v1/advisor/invite", (req, res) => {
  const { workspaceName } = req.body;
  if (!workspaceName) {
    return res.status(400).json({ error: "Client workspace name required to invite" });
  }
  const clientWsId = `ws-invited-${Math.random().toString(36).substr(2, 9)}`;
  const newClientWs = {
    id: clientWsId,
    name: workspaceName,
    owner_user_id: `user-client-${Math.random().toString(36).substr(2, 5)}`,
    plan_tier: "starter",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbState.workspaces.push(newClientWs);
  dbState.advisor_relationships.push({
    id: `rel-${Math.random().toString(36).substr(2, 9)}`,
    advisor_user_id: "user-dev-clerk-123",
    client_workspace_id: clientWsId,
    access_level: "annotate",
    status: "active",
    invited_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  dbInstance.write();
  res.json({ success: true, workspace: newClientWs });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DeadlineOS Daemon] Online and listening on port ${PORT}`);
  });
}
startServer();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateDeadlinesForEntity
});
//# sourceMappingURL=server.cjs.map
