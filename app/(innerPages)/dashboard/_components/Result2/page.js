import ContentGenerationLoading from "@/app/_components/ContentGenerationLoading";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import {
  CareerSelectionComplete,
  IndustrySelectionComplete,
  InterestTestComplete,
} from "@/app/_components/StepCompletionNotifications";
import GlobalApi from "@/app/_services/GlobalApi";
import { useTopbar } from "@/app/context/TopbarContext";
import jsPDF from "jspdf";
import {
  ChevronsLeft,
  Sparkles,
  TrendingUp,
  Award,
  X,
  Download,
  FileText,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { LoaderIcon, Toaster } from "react-hot-toast";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AddIndustry from "./AddIndustry";
import AlertDialogue from "./AlertDialogue";
import LocationDetailsModal from "@/app/_components/LocationDetailsModal";

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_LIST = [
  "trending",
  "offbeat",
  "traditional",
  "futuristic",
  "ai-proof",
  "entrepreneurial",
  "hybrid",
  "creative",
  "sustainable and green",
  "social impact",
  "tech-driven",
  "experiential",
  "digital and online",
];

const CATEGORY_COLOR_MAP = {
  "trending":              "#f97316",
  "offbeat":               "#ef4444",
  "traditional":           "#3b82f6",
  "futuristic":            "#22c55e",
  "ai-proof":              "#f59e0b",
  "entrepreneurial":       "#10b981",
  "hybrid":                "#8b5cf6",
  "creative":              "#ec4899",
  "sustainable and green": "#22c55e",
  "social impact":         "#ef4444",
  "tech-driven":           "#06b6d4",
  "experiential":          "#a78bfa",
  "digital and online":    "#a855f7",
};

const CAREER_DESCRIPTIONS = {
  "trending":              "Currently in high demand due to new technologies, societal shifts, and evolving market needs.",
  "offbeat":               "Unconventional paths that align with passion, creativity, and unique lifestyle preferences.",
  "futuristic":            "Industries and technologies expected to grow significantly in the next 10–30 years.",
  "traditional":           "Time-tested careers with established paths, consistent demand, and clear progression.",
  "hybrid":                "Combine skills from multiple disciplines, blending traditional fields with modern tech.",
  "creative":              "Innovation, self-expression, and new ideas linked to arts, design, and storytelling.",
  "sustainable and green": "Environmental sustainability and renewable resources at the forefront.",
  "social impact":         "Roles aimed at creating a positive difference in society and community well-being.",
  "tech-driven":           "Heavily focused on AI, robotics, and automation across various industries.",
  "experiential":          "Unique experiences in travel, entertainment, or immersive hands-on work.",
  "digital and online":    "Revolve around technology and online platforms, offering flexible opportunities.",
  "entrepreneurial":       "Starting and managing businesses requiring innovation, risk-taking, and resilience.",
  "ai-proof":              "Roles relying on empathy, creativity, and critical thinking — resilient to automation.",
};

// ─── AI category config — only 3 types, subtle colors, no icons ───────────────

const AI_CFG = {
  "AI Proof":     { color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.25)"  },
  "AI Augmented": { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)"  },
  "AI Risk":      { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
};
const getAiCfg = (cat) => AI_CFG[cat] || AI_CFG["AI Augmented"];

function AiBadge({ category }) {
  const c = getAiCfg(category);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}
    >
      {category}
    </span>
  );
}

// ─── Career Card ───────────────────────────────────────────────────────────────

function CareerCard({ career, catColor, onReadMore }) {
  const ac = getAiCfg(career.ai_category);
  return (
    <div
      className="group flex flex-col rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-[2px] hover:shadow-xl"
      style={{
        background: "rgba(17,24,39,0.95)",
        borderColor: "rgba(55,65,81,0.6)",
        borderBottomColor: catColor,
        borderBottomWidth: "2px",
      }}
    >
      <div className="h-[1px]" style={{ background: `linear-gradient(90deg,${catColor}60,transparent)` }} />

      <div className="flex flex-col flex-1 p-5 gap-3">
        <h4 className="text-white font-bold text-base leading-snug">
          {career.career_name}
        </h4>

        {/* Chips — no decorative icons */}
        <div className="flex flex-wrap gap-2">
          <AiBadge category={career.ai_category} />
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ color: "#93c5fd", background: "rgba(147,197,253,0.08)", border: "1px solid rgba(147,197,253,0.20)" }}
          >
            {career.compatibility_score ?? "—"}% match
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ color: ac.color, background: ac.bg, border: `1px solid ${ac.border}` }}
          >
            {career.ai_resilience_score ?? "—"}% resilience
          </span>
        </div>

        {career.brief_overview && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{career.brief_overview}</p>
        )}

        <div className="mt-auto pt-2 flex justify-end">
          <button
            onClick={onReadMore}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ color: catColor, background: `${catColor}12`, border: `1px solid ${catColor}30` }}
          >
            Read More <FaChevronRight size={9} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detailed Report Modal — contained inside result area, not full-screen ────

function DetailedReportModal({ careers, onClose }) {
  const [downloading, setDownloading] = useState(false);

  const grouped = CATEGORY_LIST
    .map((cat) => ({ cat, items: careers.filter((c) => c.type === cat) }))
    .filter((g) => g.items.length > 0);

  function h2r(hex) {
    if (!hex || !hex.startsWith("#")) return [200, 200, 200];
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const PW = doc.internal.pageSize.getWidth();
      const PH = doc.internal.pageSize.getHeight();
      const M = 50;
      const CW = PW - M * 2;
      let y = M;

      const drawPageChrome = () => {
        doc.setFillColor(249, 115, 22);
        doc.rect(0, 0, PW, 4, "F");
        doc.setDrawColor(45, 50, 65);
        doc.setLineWidth(0.5);
        doc.line(M, PH - 30, PW - M, PH - 30);
        doc.setFontSize(7.5);
        doc.setTextColor(90, 95, 115);
        doc.text("XortCut Career Report", M, PH - 18);
        doc.text(`Page ${doc.internal.getNumberOfPages()}  |  Confidential`, PW - M, PH - 18, { align: "right" });
      };

      const ensureSpace = (needed) => {
        if (y + needed > PH - M - 40) {
          doc.addPage();
          doc.setFillColor(14, 18, 28);
          doc.rect(0, 0, PW, PH, "F");
          drawPageChrome();
          y = M + 20;
        }
      };

      // ── Cover ────────────────────────────────────────────────────────────────
      doc.setFillColor(14, 18, 28);
      doc.rect(0, 0, PW, PH, "F");
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, PW, 5, "F");

      doc.setFontSize(32); doc.setFont("helvetica", "bold"); doc.setTextColor(249, 115, 22);
      doc.text("XortCut", M, 90);
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(110, 115, 135);
      doc.text("Career Intelligence Platform", M, 108);
      doc.setDrawColor(249, 115, 22); doc.setLineWidth(1);
      doc.line(M, 118, PW - M, 118);

      doc.setFontSize(36); doc.setFont("helvetica", "bold"); doc.setTextColor(235, 238, 255);
      doc.text("Career Discovery Report", M, 190);

      doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(130, 135, 155);
      doc.text("Personalised career suggestions based on your personality,", M, 220);
      doc.text("interests, and AI-resilience compatibility profile.", M, 238);

      const totalCareers = careers.length;
      const avgCompat = Math.round(careers.reduce((a, c) => a + (c.compatibility_score || 0), 0) / totalCareers);
      const aiProofN = careers.filter(c => c.ai_proof).length;
      const statsArr = [
        { label: "Careers", value: totalCareers },
        { label: "Categories", value: grouped.length },
        { label: "Avg. Match", value: `${avgCompat}%` },
        { label: "AI-Proof Roles", value: aiProofN },
      ];
      const tw = (CW - 18) / 4;
      statsArr.forEach((s, i) => {
        const tx = M + i * (tw + 6), ty = 290;
        doc.setFillColor(20, 26, 42); doc.setDrawColor(46, 52, 68);
        doc.roundedRect(tx, ty, tw, 68, 6, 6, "FD");
        doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(249, 115, 22);
        doc.text(String(s.value), tx + tw / 2, ty + 30, { align: "center" });
        doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(110, 115, 135);
        doc.text(s.label, tx + tw / 2, ty + 48, { align: "center" });
      });

      doc.setFontSize(8.5); doc.setTextColor(80, 85, 105);
      doc.text(`Generated ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, M, PH - 42);
      drawPageChrome();

      // ── Category pages ────────────────────────────────────────────────────────
      grouped.forEach(({ cat, items }) => {
        doc.addPage();
        doc.setFillColor(14, 18, 28); doc.rect(0, 0, PW, PH, "F");
        drawPageChrome();
        y = M + 10;

        const catColor = CATEGORY_COLOR_MAP[cat] || "#f97316";
        const [cr, cg, cb] = h2r(catColor);

        // Category heading
        doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(cr, cg, cb);
        const catTitle = cat.charAt(0).toUpperCase() + cat.slice(1) + " Careers";
        doc.text(catTitle, M, y);
        y += 8;
        doc.setDrawColor(cr, cg, cb); doc.setLineWidth(0.8);
        doc.line(M, y, PW - M, y);
        y += 10;

        // Category description
        doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(140, 145, 165);
        const descLines = doc.splitTextToSize(CAREER_DESCRIPTIONS[cat] || "", CW);
        doc.text(descLines, M, y);
        y += descLines.length * 11 + 16;

        items.forEach((career) => {
          const ac = getAiCfg(career.ai_category);
          const [ar, ag, ab] = h2r(ac.color);

          // Collect fields
          const fields = [
            { label: "Description", text: career.description, lc: [170, 120, 240] },
            { label: "Brief Overview", text: career.brief_overview, lc: [96, 165, 250] },
            { label: `Why ${career.ai_category || "AI"}`, text: career["Why AI Proof/ Augments/ Replaces"], lc: [210, 170, 60] },
            { label: "Future Potential", text: career.future_potential, lc: [100, 210, 140] },
          ].filter(f => f.text);

          // Estimate card height accurately
          let estH = 22; // top padding
          estH += 16;    // career name line
          estH += 14;    // chips line
          estH += 2;     // small gap
          estH += 1;     // divider
          estH += 10;    // gap after divider

          fields.forEach(f => {
            const lines = doc.splitTextToSize(f.text, CW - 32);
            estH += 10;               // label
            estH += lines.length * 12 + 10; // text + spacing
          });
          estH += 14; // bottom padding

          ensureSpace(estH);

          const cx = M, cy2 = y;

          // Card background
          doc.setFillColor(20, 25, 40);
          doc.setDrawColor(46, 52, 68);
          doc.setLineWidth(0.4);
          doc.roundedRect(cx, cy2, CW, estH, 6, 6, "FD");

          // Left accent bar
          doc.setFillColor(cr, cg, cb);
          doc.rect(cx, cy2, 3, estH, "F");

          let cy = cy2 + 20;

          // Career name
          doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(235, 238, 255);
          doc.text(career.career_name, cx + 14, cy);
          cy += 16;

          // Score chips as plain text
          doc.setFontSize(8); doc.setFont("helvetica", "normal");
          let chipX = cx + 14;

          doc.setTextColor(ar, ag, ab);
          const aiText = career.ai_category || "—";
          doc.text(aiText, chipX, cy);
          chipX += doc.getTextWidth(aiText) + 16;

          doc.setTextColor(96, 165, 250);
          const matchText = `${career.compatibility_score ?? "—"}% match`;
          doc.text(matchText, chipX, cy);
          chipX += doc.getTextWidth(matchText) + 16;

          doc.setTextColor(ar, ag, ab);
          doc.text(`${career.ai_resilience_score ?? "—"}% resilience`, chipX, cy);
          cy += 12;

          // Divider
          doc.setDrawColor(38, 44, 58); doc.setLineWidth(0.3);
          doc.line(cx + 12, cy, cx + CW - 12, cy);
          cy += 10;

          // Fields
          fields.forEach(({ label, text, lc }) => {
            const lines = doc.splitTextToSize(text, CW - 32);
            doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...lc);
            doc.text(label.toUpperCase(), cx + 14, cy);
            cy += 11;
            doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(182, 186, 206);
            doc.text(lines, cx + 14, cy);
            cy += lines.length * 12 + 10;
          });

          y = cy2 + estH + 12;
        });
      });

      // ── Back cover ─────────────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(14, 18, 28); doc.rect(0, 0, PW, PH, "F");
      doc.setFillColor(249, 115, 22); doc.rect(0, PH - 5, PW, 5, "F");
      doc.setFontSize(28); doc.setFont("helvetica", "bold"); doc.setTextColor(249, 115, 22);
      doc.text("XortCut", PW / 2, PH / 2 - 28, { align: "center" });
      doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(110, 115, 135);
      doc.text("Career Intelligence Platform", PW / 2, PH / 2, { align: "center" });
      doc.text("This report is generated based on your unique profile.", PW / 2, PH / 2 + 22, { align: "center" });
      doc.text("Explore, reflect, and choose with confidence.", PW / 2, PH / 2 + 40, { align: "center" });
      drawPageChrome();

      doc.save("XortCut_Career_Report.pdf");
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    // Contained overlay — sits inside the result area, not full-screen covering sidebar
    <div
      className="absolute inset-0 z-40 flex flex-col rounded-xl overflow-hidden"
      style={{ background: "#0d1117" }}
    >
      {/* Header bar */}
      <div
        className="shrink-0 flex items-center justify-between px-5 py-3 border-b"
        style={{ background: "#111827", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-orange-400" />
          <div>
            <h2 className="text-white font-bold text-sm leading-tight">Full Career Report</h2>
            <p className="text-xs" style={{ color: "#4b5563" }}>
              {careers.length} careers · {grouped.length} categories
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 text-white font-semibold px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}
          >
            {downloading ? <LoaderIcon className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {downloading ? "Generating…" : "Download PDF"}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all text-gray-400 hover:text-white"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-12">
        {grouped.map(({ cat, items }) => {
          const catColor = CATEGORY_COLOR_MAP[cat] || "#f97316";
          return (
            <section key={cat}>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold capitalize" style={{ color: catColor }}>
                  {cat} Careers
                </h3>
                <div className="h-px flex-1" style={{ background: `linear-gradient(90deg,${catColor}40,transparent)` }} />
                <span className="text-xs shrink-0" style={{ color: "#4b5563" }}>
                  {items.length} career{items.length > 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-sm mb-6" style={{ color: "#6b7280" }}>{CAREER_DESCRIPTIONS[cat]}</p>

              <div className="space-y-4">
                {items.map((career, idx) => {
                  const ac = getAiCfg(career.ai_category);
                  return (
                    <div
                      key={idx}
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: "linear-gradient(155deg,rgba(22,28,46,0.98),rgba(14,18,28,0.98))",
                        border: `1px solid rgba(55,65,81,0.5)`,
                        borderLeft: `3px solid ${catColor}`,
                      }}
                    >
                      {/* Card header */}
                      <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(55,65,81,0.4)" }}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <h4 className="text-white font-bold text-lg tracking-tight">{career.career_name}</h4>
                            {career.brief_overview && (
                              <p className="text-sm mt-1 leading-relaxed" style={{ color: "#9ca3af" }}>{career.brief_overview}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0 pt-0.5">
                            <AiBadge category={career.ai_category} />
                          </div>
                        </div>
                        {/* Score strip — no decorative icons */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs font-medium">
                          <span style={{ color: "#93c5fd" }}>Compatibility: {career.compatibility_score ?? "—"}%</span>
                          <span style={{ color: "#374151" }}>·</span>
                          <span style={{ color: ac.color }}>AI Resilience: {career.ai_resilience_score ?? "—"}%</span>
                          <span style={{ color: "#374151" }}>·</span>
                          <span style={{ color: "#9ca3af" }}>
                            Category: <span className="font-semibold" style={{ color: catColor }}>{cat}</span>
                          </span>
                        </div>
                      </div>

                      {/* Detail grid */}
                      <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {career.description && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#a78bfa" }}>Description</p>
                            <p className="text-sm leading-relaxed" style={{ color: "#d1d5db" }}>{career.description}</p>
                          </div>
                        )}
                        {career["Why AI Proof/ Augments/ Replaces"] && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: ac.color }}>
                              AI Impact — {career.ai_category}
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: "#d1d5db" }}>
                              {career["Why AI Proof/ Augments/ Replaces"]}
                            </p>
                          </div>
                        )}
                        {career.future_potential && (
                          <div className="md:col-span-2 pt-3 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#34d399" }}>Future Potential</p>
                            <p className="text-sm leading-relaxed" style={{ color: "#d1d5db" }}>{career.future_potential}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Results2({ step, setStep }) {
  const [resultData, setResultData]           = useState(null);
  const [selectedCareers, setSelectedCareers] = useState([]);
  const [prevSelectCount, setPrevSelectCount] = useState(null);
  const [singleCareer, setSingleCareer]       = useState(null);
  const [careerIndex, setCareerIndex]         = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [fetchingIndustry, setFetchingIndustry] = useState(false);
  const [fetchingCareer, setFetchingCareer]   = useState(false);
  const [industries, setIndustries]           = useState([]);
  const [saveResultloading, setSaveResultLoading] = useState(false);
  const [showDialogue, setShowDialogue]       = useState(false);
  const [showAlert, setShowAlert]             = useState(false);
  const [showCareerSelectionComplete, setShowCareerSelectionComplete] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pendingCareerData, setPendingCareerData] = useState(null);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [activeTab, setActiveTab]             = useState("trending");

  const { triggerTopbarRefresh } = useTopbar();
  const t        = useTranslations("Result2");
  const router   = useRouter();
  const language = typeof window !== "undefined" ? (localStorage.getItem("language") || "en") : "en";

  useEffect(() => {
    setSelectedCareers(JSON.parse(localStorage.getItem("selectedCareers")) || []);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedCareers", JSON.stringify(selectedCareers));
  }, [selectedCareers]);

  const getAvailableCats = () =>
    CATEGORY_LIST.filter(cat => resultData && Array.isArray(resultData) && resultData.some(c => c.type === cat));

  const handleCategoryNav = (dir) => {
    const cats = getAvailableCats();
    const idx  = cats.indexOf(activeTab);
    setActiveTab(dir === "next" ? cats[(idx + 1) % cats.length] : cats[(idx - 1 + cats.length) % cats.length]);
  };

  const getAdjacentCat = (dir) => {
    const cats = getAvailableCats();
    if (!cats.length) return "";
    const idx = cats.indexOf(activeTab);
    return dir === "next" ? cats[(idx + 1) % cats.length] : cats[(idx - 1 + cats.length) % cats.length];
  };

  const fetchResults = async (selectedIndustry = "") => {
    setFetchingCareer(true);
    try {
      const token    = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.GetResult2(token, selectedIndustry, language);
      if (response.status === 200) {
        const parsed = JSON.parse(response.data.result);
        setResultData(parsed);
        // Set activeTab to first available category
        const firstCat = CATEGORY_LIST.find(cat => parsed.some(c => c.type === cat));
        if (firstCat) setActiveTab(firstCat);
        setStep(2);
      } else if (response.status === 204) {
        setStep(1);
        fetchIndustry();
      }
      const status = await GlobalApi.CheckFeedback(token);
      setPrevSelectCount(status.data.savedCareerCount);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setFetchingCareer(false);
    }
  };

  const fetchCareer = async (career_name) => {
    setLoading(true);
    try {
      const token    = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.getResult2Career(token, career_name, language);
      if (response.status === 200 && Array.isArray(response.data.result) && response.data.result.length > 0) {
        setSingleCareer(response.data.result[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndustry = async () => {
    setFetchingIndustry(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const data  = await GlobalApi.GetIndustry(token, language);
      setIndustries(JSON.parse(data.data.result));
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingIndustry(false);
    }
  };

  const handleSaveResult = (idx, name) => {
    setPendingCareerData({ careerIndex: idx, careerName: name, selectedCareerObjects: [resultData[idx]] });
    setShowLocationModal(true);
  };

  const handleSaveWithLocationData = async (locationData) => {
    if (!pendingCareerData) return;
    setSaveResultLoading(true);
    try {
      const token    = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.SaveCarrerData(token, { results: pendingCareerData.selectedCareerObjects, locationData });
      if (response.status === 200) {
        toast.success("Career Data Saved Successfully");
        if (response.data.isFirstTime) router.push("/dashboard/careers/career-guide");
        triggerTopbarRefresh();
        setShowCareerSelectionComplete(true);
        setShowLocationModal(false);
        setPendingCareerData(null);
      }
    } catch (err) {
      if (err.response?.data?.message) { toast.error(err.response.data.message); setShowCareerSelectionComplete(true); }
      else toast.error("Failed to save career data. Please try again later.");
    } finally {
      setSaveResultLoading(false);
      if (pendingCareerData) fetchCareer(pendingCareerData.careerName);
    }
  };

  const getColorByIndex = (i) =>
    ["#f97316", "#ef4444", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#06b6d4"][i] || "#f97316";

  useEffect(() => { fetchResults(""); }, []);

  if (loading) return (
    <div className="h-full flex items-center justify-center text-white">
      <LoadingOverlay loadText="Loading..." />
    </div>
  );

  return (
    // relative so the contained modal can use absolute positioning
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white max-md:pb-7">
      <Toaster position="top-center" reverseOrder={false} />

      {fetchingIndustry && <ContentGenerationLoading isOpen={fetchingIndustry} onClose={() => setFetchingIndustry(false)} page="industrySelection" showDelay={1000} />}
      {fetchingCareer   && <ContentGenerationLoading isOpen={fetchingCareer}   onClose={() => setFetchingCareer(false)}   page="careerSuggestions" showDelay={1000} />}

      {/* Contained report modal — absolute inside this component, doesn't cover sidebar */}
      {showDetailedReport && resultData && (
        <DetailedReportModal careers={resultData} onClose={() => setShowDetailedReport(false)} />
      )}

      {/* ── Step 1 header ── */}
      {step === 1 && industries.length > 0 && (
        <>
          <InterestTestComplete />
          <div className="relative mx-4 mb-6">
            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-full"><Sparkles className="w-8 h-8 text-orange-400" /></div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">SELECT INDUSTRY</h1>
              </div>
              <div className="w-20 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mt-4" />
            </div>
          </div>
        </>
      )}

      {step === 2 && (showCareerSelectionComplete ? <CareerSelectionComplete /> : <IndustrySelectionComplete />)}

      {/* ── Step 2 top bar ── */}
      {step === 2 && !singleCareer && (
        <div className="relative mx-4 mb-6">
          <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 lg:p-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-full"><TrendingUp className="w-5 h-5 text-blue-400" /></div>
                <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  DISCOVER YOUR IDEAL CAREER PATH
                </h1>
              </div>
              {resultData && (
                <button
                  onClick={() => setShowDetailedReport(true)}
                  className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all shrink-0"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
                >
                  <FileText className="w-4 h-4" /> Full Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Single career header ── */}
      {singleCareer?.career_name && (
        <div className="relative mx-4 mb-6">
          <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 lg:p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <button
                onClick={() => { setCareerIndex(null); setSingleCareer(null); }}
                className="group flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-orange-500/50 text-white font-medium py-2 px-4 rounded-xl transition-all w-fit"
              >
                <ChevronsLeft className="w-5 h-5 group-hover:text-orange-400 transition-colors" />
                <span className="font-semibold">BACK TO CAREERS</span>
              </button>
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-full"><Award className="w-6 h-6 text-green-400" /></div>
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {singleCareer.career_name.toUpperCase()}
                  </h1>
                </div>
                <div className="w-16 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mt-2" />
              </div>
              <div className="hidden lg:block w-44 opacity-0 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:px-6 lg:px-12 gap-6 w-full">

        {/* ── STEP 1: Industry grid ── */}
        {step === 1 && industries.length > 0 && (
          <div className="p-6 rounded-lg text-white mt-6 w-full max-sm:pb-24">
            <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
              {showAlert && <AlertDialogue fetchResults={fetchResults} setShowAlert={setShowAlert} />}

              <div className="sm:col-span-6 md:col-span-6 col-span-12 cursor-pointer" onClick={() => setShowAlert(true)}>
                <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 hover:border-orange-500/50 rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                      <Sparkles className="w-4 h-4" />{t("industryAgnostic")}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                    <p className="text-gray-200 text-sm text-center leading-relaxed">Explore career suggestions across various industries</p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6 md:col-span-6 col-span-12 cursor-pointer" onClick={() => setShowDialogue(true)}>
                <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 hover:border-green-500/50 rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                      <TrendingUp className="w-4 h-4" />{t("industrySpecific")}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                    <p className="text-gray-200 text-sm text-center leading-relaxed">Enter your preferred industry to discover tailored career options</p>
                  </div>
                </div>
                <AddIndustry isOpen={showDialogue} onClose={() => setShowDialogue(false)} fetchResults={fetchResults} />
              </div>

              <div className="col-span-12 text-center py-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                  {t("selectBelowIndustry")}
                </h2>
                <div className="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto" />
              </div>

              {industries.map((industry, index) => {
                const color = getColorByIndex(index);
                return (
                  <div
                    key={index}
                    className="sm:col-span-6 md:col-span-4 col-span-6 cursor-pointer"
                    onClick={() => fetchResults(industry.industry_name)}
                  >
                    <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 hover:border-gray-600/50 rounded-2xl p-4 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
                      <div className="text-center mb-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ backgroundColor: `${color}20` }}>
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                        </div>
                      </div>
                      <div className="bg-gray-700/50 rounded-xl p-4 min-h-[100px] flex items-center justify-center">
                        <p className="text-gray-200 text-sm text-center font-medium leading-relaxed">{industry.industry_name}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="max-md:w-screen">
            <div className="mt-4">
              {resultData && !singleCareer && (
                <>
                  {/* Mobile tab strip */}
                  <div className="md:hidden px-4 mb-6">
                    <div className="flex overflow-x-auto pb-2 gap-2">
                      {CATEGORY_LIST.map(cat =>
                        resultData.some(c => c.type === cat) ? (
                          <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap uppercase transition-all ${
                              activeTab === cat ? "text-white" : "text-gray-400 border border-gray-700/50"
                            }`}
                            style={
                              activeTab === cat
                                ? { background: `${CATEGORY_COLOR_MAP[cat]}bb` }
                                : { background: "rgba(31,41,55,0.6)" }
                            }
                          >
                            {cat}
                          </button>
                        ) : null
                      )}
                    </div>
                  </div>

                  {/* Mobile floating nav */}
                  <div className="md:hidden">
                    <button
                      onClick={() => handleCategoryNav("prev")}
                      className="fixed left-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl px-3 py-2 shadow-lg z-50 flex items-center border border-orange-400/50"
                    >
                      <FaChevronLeft size={14} color="white" className="mr-1" />
                      <span className="text-white text-[10px] font-medium capitalize max-w-[55px] truncate">{getAdjacentCat("prev")}</span>
                    </button>
                    <button
                      onClick={() => handleCategoryNav("next")}
                      className="fixed right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl px-3 py-2 shadow-lg z-50 flex items-center border border-orange-400/50"
                    >
                      <span className="text-white text-[10px] font-medium capitalize max-w-[55px] truncate mr-1">{getAdjacentCat("next")}</span>
                      <FaChevronRight size={14} color="white" />
                    </button>
                  </div>

                  {/* Desktop: all 13 categories */}
                  <div className="hidden md:block px-4">
                    {CATEGORY_LIST.map(cat => {
                      const careersInCat = resultData
                        .map((c, i) => ({ career: c, originalIndex: i }))
                        .filter(({ career }) => career.type === cat);
                      if (!careersInCat.length) return null;
                      const catColor = CATEGORY_COLOR_MAP[cat] || "#f97316";
                      return (
                        <div key={cat} className="mb-14">
                          <div className="flex items-center mb-1">
                            <h2 className="text-xl font-bold capitalize tracking-tight" style={{ color: catColor }}>
                              {cat} Careers
                            </h2>
                            <div className="h-px flex-grow ml-4 rounded-full" style={{ background: `linear-gradient(90deg,${catColor}40,transparent)` }} />
                          </div>
                          <p className="text-sm text-gray-500 mb-5 max-w-3xl">{CAREER_DESCRIPTIONS[cat]}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {careersInCat.map(({ career, originalIndex }) => (
                              <CareerCard
                                key={originalIndex}
                                career={career}
                                catColor={catColor}
                                onReadMore={() => { setCareerIndex(originalIndex); fetchCareer(career.career_name); }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile: active tab only */}
                  <div className="md:hidden px-4">
                    {CATEGORY_LIST.map(cat => {
                      if (activeTab !== cat) return null;
                      const careersInCat = resultData
                        .map((c, i) => ({ career: c, originalIndex: i }))
                        .filter(({ career }) => career.type === cat);
                      if (!careersInCat.length) return null;
                      const catColor = CATEGORY_COLOR_MAP[cat] || "#f97316";
                      return (
                        <div key={cat} className="mb-12">
                          <h2 className="text-xl font-bold capitalize mb-1" style={{ color: catColor }}>{cat} Careers</h2>
                          <p className="text-sm text-gray-500 mb-5">{CAREER_DESCRIPTIONS[cat]}</p>
                          <div className="grid grid-cols-1 gap-4">
                            {careersInCat.map(({ career, originalIndex }) => (
                              <CareerCard
                                key={originalIndex}
                                career={career}
                                catColor={catColor}
                                onReadMore={() => { setCareerIndex(originalIndex); fetchCareer(career.career_name); }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Single career detail */}
              {singleCareer && (
                <div className="space-y-8 px-4 md:px-10">
                  <div className="grid grid-cols-12 gap-6">
                    {/* Score strip */}
                    {(singleCareer.ai_category || singleCareer.compatibility_score != null) && (
                      <div className="col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: "Compatibility",  value: `${singleCareer.compatibility_score ?? "—"}%`,  color: "#93c5fd" },
                          { label: "AI Resilience",  value: `${singleCareer.ai_resilience_score ?? "—"}%`, color: getAiCfg(singleCareer.ai_category).color },
                          { label: "AI Category",    value: singleCareer.ai_category || "—",               color: "#e2e8f0" },
                          { label: "AI Proof",       value: singleCareer.ai_proof ? "Yes" : "No",          color: singleCareer.ai_proof ? "#4ade80" : "#f87171" },
                        ].map(s => (
                          <div key={s.label} className="bg-gray-800/70 border border-gray-700/50 rounded-xl p-4 text-center">
                            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                            <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {singleCareer?.reason_for_recommendation && (
                      <div className="col-span-12">
                        <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 border-l-4 border-green-500 rounded-xl shadow-xl overflow-hidden">
                          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 border-b border-gray-700/50">
                            <h3 className="text-white font-bold text-lg text-center">{t("careerSuitability")}</h3>
                          </div>
                          <div className="p-6"><p className="text-gray-200 leading-relaxed">{singleCareer.reason_for_recommendation}</p></div>
                        </div>
                      </div>
                    )}

                    <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {singleCareer?.present_trends && (
                        <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 border-l-4 border-orange-500 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                          <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 p-3 border-b border-gray-700/50">
                            <h3 className="text-white font-bold text-sm text-center">{t("presentTrends")}</h3>
                          </div>
                          <div className="p-4 min-h-[180px]"><p className="text-gray-200 text-sm leading-relaxed">{singleCareer.present_trends}</p></div>
                        </div>
                      )}
                      {singleCareer?.future_prospects && (
                        <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 border-l-4 border-purple-500 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-3 border-b border-gray-700/50">
                            <h3 className="text-white font-bold text-sm text-center">{t("futureProspects")} ({singleCareer.currentYear} – {singleCareer.tillYear})</h3>
                          </div>
                          <div className="p-4 min-h-[180px]"><p className="text-gray-200 text-sm leading-relaxed">{singleCareer.future_prospects}</p></div>
                        </div>
                      )}
                      {singleCareer?.beyond_prospects && (
                        <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 border-l-4 border-pink-500 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                          <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 p-3 border-b border-gray-700/50">
                            <h3 className="text-white font-bold text-sm text-center">{t("futureProspects")} ({(singleCareer.tillYear ?? 0) + 1} and beyond)</h3>
                          </div>
                          <div className="p-4 min-h-[180px]"><p className="text-gray-200 text-sm leading-relaxed">{singleCareer.beyond_prospects}</p></div>
                        </div>
                      )}
                      {singleCareer?.salary && (
                        <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 border-l-4 border-cyan-500 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-3 border-b border-gray-700/50">
                            <h3 className="text-white font-bold text-sm text-center">Salary</h3>
                          </div>
                          <div className="p-4 min-h-[180px]"><p className="text-gray-200 text-sm leading-relaxed">{singleCareer.salary}</p></div>
                        </div>
                      )}
                    </div>

                    {singleCareer?.expenses && (
                      <div className="col-span-12">
                        <div className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 border-l-4 border-red-500 rounded-xl overflow-hidden shadow-xl">
                          <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 p-4 border-b border-gray-700/50">
                            <h3 className="text-white font-bold text-lg text-center">{t("expenses")}</h3>
                          </div>
                          <div className="p-6"><p className="text-gray-200 leading-relaxed">{singleCareer.expenses}</p></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center pb-8">
                    <button
                      className={`font-bold py-3 px-8 text-sm uppercase rounded-xl shadow-lg transition-all ${
                        saveResultloading || singleCareer?.isCareerMoved
                          ? "bg-gray-600/60 cursor-not-allowed text-gray-400"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:-translate-y-0.5 hover:shadow-xl"
                      }`}
                      onClick={() => handleSaveResult(careerIndex, singleCareer.career_name)}
                      disabled={saveResultloading || singleCareer?.isCareerMoved}
                    >
                      {saveResultloading
                        ? <div className="flex items-center gap-2"><LoaderIcon className="w-5 h-5 animate-spin" />{t("saving")}</div>
                        : singleCareer?.isCareerMoved ? t("alreadyMoved") : t("moveCareer")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <LocationDetailsModal
        isOpen={showLocationModal}
        onClose={() => { setShowLocationModal(false); setPendingCareerData(null); setSaveResultLoading(false); }}
        onSave={handleSaveWithLocationData}
        selectedCareers={singleCareer ? [singleCareer.career_name] : []}
        loading={saveResultloading}
      />
    </div>
  );
}