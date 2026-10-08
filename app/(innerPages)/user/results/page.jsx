"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Download, Share2, X, Copy, Check } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import html2canvas from "html2canvas";
import toast, { Toaster } from "react-hot-toast";
import GlobalApi from "@/app/_services/GlobalApi";
import { useRouter } from "next/navigation";
import { formatSectorDisplay, enrichSectorItem, getSectorCanonicalInfo } from "@/lib/sectorCanonical";
import "../_components/styles.css";

const AssessmentResultsPage = () => {
  const [resultData, setResultData] = useState(null);
  const [institutionData, setInstitutionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const printRef = useRef();
  const router = useRouter();

  // Share Modal & Image Generation States
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareableImageUri, setShareableImageUri] = useState(null);
  const [shareableBlob, setShareableBlob] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const shareCardRef = useRef(null);

  const handleOpenShareModal = () => {
    setShareableImageUri(null);
    setShareableBlob(null);
    setShowShareModal(true);
  };

  // Preloaded Base64 Image Assets for CORS-safe html2canvas export
  const [assetUris, setAssetUris] = useState({
    logoFull: "/assets/images/logo-full.png",
    smallLogo: "/assets/images/small-logo.png",
    schoolLogo: null,
    loaded: false
  });

  // Preload local and remote assets into base64 Data URIs
  useEffect(() => {
    const toDataUri = async (url) => {
      if (!url) return null;
      try {
        // If remote URL, route through local proxy to bypass CORS restrictions
        const fetchUrl = url.startsWith("http")
          ? `/api/proxy-image?url=${encodeURIComponent(url)}`
          : url;

        const res = await fetch(fetchUrl);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(url);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Error converting to data URI:", url, err);
        return url;
      }
    };

    const loadAllAssets = async () => {
      try {
        const [logoFull, smallLogo] = await Promise.all([
          toDataUri("/assets/images/logo-full.png"),
          toDataUri("/assets/images/small-logo.png")
        ]);

        let schoolLogoUri = null;
        const currentSchoolLogo = institutionData?.logo || resultData?.user_profile?.institution?.logo;
        if (currentSchoolLogo) {
          schoolLogoUri = await toDataUri(currentSchoolLogo);
        }

        setAssetUris({
          logoFull: logoFull || "/assets/images/logo-full.png",
          smallLogo: smallLogo || "/assets/images/small-logo.png",
          schoolLogo: schoolLogoUri,
          loaded: true
        });
      } catch (err) {
        console.error("Asset preload error:", err);
        setAssetUris(prev => ({ ...prev, loaded: true }));
      }
    };

    loadAllAssets();
  }, [institutionData, resultData]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const language = localStorage.getItem("language") || "en";
      
      const [resResults, resUserData] = await Promise.allSettled([
        GlobalApi.GetUserId(token, language),
        token ? GlobalApi.GetUserData(token) : Promise.reject("No token")
      ]);

      if (resUserData.status === "fulfilled" && resUserData.value?.data?.institution) {
        setInstitutionData(resUserData.value.data.institution);
      }

      if (resResults.status === "fulfilled") {
        const response = resResults.value;
        if (response.status === 200) {
          let data = Array.isArray(response.data) ? response.data[0] : response.data;
          data = parseResultData(data);
          setResultData(data);
          if (data.user_profile?.institution) {
            setInstitutionData(data.user_profile.institution);
          }
        } else if (response.status === 202) {
          setAlertMessage(response.data.message || "Please complete your assessment to view results.");
        }
      } else {
        throw resResults.reason;
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setAlertMessage("Unable to load assessment report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const parseResultData = (data) => {
    if (!data) return data;

    try {
      let parsed = data;
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      } else if (typeof parsed === "object" && parsed[0] !== undefined) {
        const str = Object.values(parsed).join("");
        parsed = JSON.parse(str);
      }

      if (parsed.detailed_results?.personality_analysis && typeof parsed.detailed_results.personality_analysis === "string") {
        try {
          parsed.detailed_results.personality_analysis = JSON.parse(parsed.detailed_results.personality_analysis);
        } catch (e) {
          // ignore
        }
      }

      if (parsed.scope_data?.matching_sectors && Array.isArray(parsed.scope_data.matching_sectors)) {
        parsed.scope_data.matching_sectors = parsed.scope_data.matching_sectors.map(s => enrichSectorItem(s));
      }

      return parsed;
    } catch (error) {
      console.error("Error parsing result data:", error);
      return data;
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Direct Multi-Page PDF Download (No browser print dialog, full report guaranteed)
  const handleDownloadPDF = async () => {
    if (!printRef.current || isExportingPDF) return;
    setIsExportingPDF(true);
    const toastId = toast.loading("Preparing full multi-page PDF report...");

    try {
      const { jsPDF } = await import("jspdf");
      const element = printRef.current;

      // Temporarily apply clean print theme class to ensure crisp institutional colors
      element.classList.add("pdf-export-mode");
      // Wait for DOM styles and layout to stabilize
      await new Promise((r) => setTimeout(r, 200));

      const canvas = await html2canvas(element, {
        scale: 2, // Ultra-sharp 2x resolution
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1100
      });

      // Remove the export mode class immediately after capture
      element.classList.remove("pdf-export-mode");

      // Dimensions for A4 portrait in pt (72 points/inch)
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const marginX = 20;
      const marginY = 24;
      const printableWidth = pageWidth - marginX * 2;
      const printableHeight = pageHeight - marginY * 2;

      // Calculate slice height in canvas pixels that matches 1 printable PDF page
      const sliceHeight = Math.floor(printableHeight * (canvas.width / printableWidth));
      const totalPages = Math.ceil(canvas.height / sliceHeight);

      for (let i = 0; i < totalPages; i++) {
        const sliceStartY = i * sliceHeight;
        const currentSliceHeight = Math.min(sliceHeight, canvas.height - sliceStartY);

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = currentSliceHeight;
        const pageCtx = pageCanvas.getContext("2d");

        // Crisp white background
        pageCtx.fillStyle = "#ffffff";
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Draw this page's vertical slice from main canvas
        pageCtx.drawImage(
          canvas,
          0, sliceStartY, canvas.width, currentSliceHeight,
          0, 0, canvas.width, currentSliceHeight
        );

        const imgData = pageCanvas.toDataURL("image/jpeg", 0.96);
        const renderHeight = (currentSliceHeight * printableWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "JPEG", marginX, marginY, printableWidth, renderHeight);

        // Institutional footer on every page
        pdf.setFontSize(8);
        pdf.setTextColor(140, 145, 160);
        pdf.text(
          `Page ${i + 1} of ${totalPages}  •  Xortlist Career Discovery Report`,
          pageWidth / 2,
          pageHeight - 12,
          { align: "center" }
        );
      }

      const candidateName = resultData?.user_profile?.name || "Student";
      const cleanName = candidateName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      pdf.save(`${cleanName}-career-report.pdf`);

      toast.success("Complete assessment report downloaded!", { id: toastId });
    } catch (err) {
      console.error("Direct PDF generation failed:", err);
      if (printRef.current) {
        printRef.current.classList.remove("pdf-export-mode");
      }
      toast.error("Could not generate PDF. Please try again.", { id: toastId });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleGoBack = () => {
    const storedUrl = typeof window !== "undefined" ? localStorage.getItem("dashboardUrl") : null;
    if (storedUrl) {
      router.push(storedUrl);
    } else {
      router.push("/dashboard");
    }
  };

  // Robust html2canvas generator using fixed 900x1200 resolution at 2x scale (1800x2400)
  const generateShareableImage = useCallback(async () => {
    if (!shareCardRef.current) return null;
    setIsGeneratingImage(true);
    try {
      // Small delay to ensure all DOM styles and font glyphs are fully laid out
      await new Promise(r => setTimeout(r, 120));

      const cardEl = shareCardRef.current;
      const actualHeight = cardEl ? cardEl.offsetHeight : 1200;

      const options = {
        scale: 2, // Razor-sharp high resolution output
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 900,
        height: actualHeight,
        windowWidth: 900,
        windowHeight: actualHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        logging: false
      };

      const canvas = await html2canvas(shareCardRef.current, options);
      const dataUri = canvas.toDataURL("image/png", 1.0);
      
      const blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png", 1.0);
      });

      setShareableImageUri(dataUri);
      setShareableBlob(blob);
      return { dataUri, blob };
    } catch (err) {
      console.error("Error generating shareable report card image:", err);
      toast.error("Failed to generate image. Please try again.");
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);

  // When modal is opened, generate the high-res image if not already cached
  useEffect(() => {
    if (showShareModal && !shareableImageUri) {
      generateShareableImage();
    }
  }, [showShareModal, shareableImageUri, generateShareableImage]);

  // Direct PNG Download
  const handleDownloadImage = async () => {
    let imgData = shareableImageUri;
    if (!imgData) {
      const gen = await generateShareableImage();
      if (!gen) return;
      imgData = gen.dataUri;
    }

    const candidateName = resultData?.user_profile?.name || "Student";
    const cleanName = candidateName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const link = document.createElement("a");
    link.download = `${cleanName}-career-report-card.png`;
    link.href = imgData;
    link.click();
    toast.success("High-resolution report card downloaded!");
  };

  // WhatsApp & Social Share
  const handleShareWhatsApp = async () => {
    const candidateName = resultData?.user_profile?.name || "Student";
    const sectors = resultData?.scope_data?.matching_sectors || [];
    const sectorNames = sectors.slice(0, 3).map(s => s.canonical_name || s.name).join(", ");
    const schoolName = institutionData?.name || resultData?.user_profile?.institution?.name || "";

    const shareText = `🎓 *Career Discovery Report - ${candidateName}*` +
      (schoolName ? `
🏫 *${schoolName}*` : "") +
      (sectorNames ? `

✨ *Top Recommended Sectors:*
${sectors.slice(0, 3).map((s, i) => `${i + 1}. ${s.canonical_name || s.name}`).join("\n")}` : "") +
      `

Verified by Xortlist AI Assessment Platform.` +
      `
Explore your career pathway: https://doutya.com`;

    // Attempt Native File Sharing on mobile devices if supported
    let imgBlob = shareableBlob;
    if (!imgBlob) {
      const gen = await generateShareableImage();
      if (gen) imgBlob = gen.blob;
    }

    if (imgBlob && navigator.canShare && typeof navigator.share === "function") {
      try {
        const file = new File([imgBlob], `${candidateName}-career-report.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${candidateName}'s Career Report`,
            text: shareText,
            files: [file]
          });
          toast.success("Shared successfully!");
          return;
        }
      } catch (shareErr) {
        if (shareErr.name === "AbortError") return;
      }
    }

    // Direct WhatsApp Web / App intent fallback
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank");

    if (imgBlob) {
      handleDownloadImage();
      toast.success("Opening WhatsApp! Card downloaded to attach to your chat.");
    }
  };

  const handleCopyShareText = () => {
    const candidateName = resultData?.user_profile?.name || "Student";
    const sectors = resultData?.scope_data?.matching_sectors || [];
    const sectorNames = sectors.slice(0, 3).map(s => s.canonical_name || s.name).join(", ");
    const schoolName = institutionData?.name || resultData?.user_profile?.institution?.name || "";

    const text = `🎓 Career Discovery Report - ${candidateName}` +
      (schoolName ? ` (${schoolName})` : "") +
      (sectorNames ? `
Top Career Sectors: ${sectorNames}` : "") +
      `
Verified by Xortlist AI Assessment: https://doutya.com`;

    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    toast.success("Summary & link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#131620] text-slate-300 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Preparing your assessment report...</p>
        </div>
      </div>
    );
  }

  if (alertMessage) {
    return (
      <div className="min-h-screen bg-[#131620] text-slate-300 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1b1e2a] border border-slate-700/60 rounded-2xl p-8 text-center space-y-6 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Assessment Pending</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{alertMessage}</p>
          </div>
          <button
            onClick={handleGoBack}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-[#131620] text-slate-300 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-slate-400 text-sm">Assessment data is currently unavailable.</p>
          <button
            onClick={handleGoBack}
            className="text-xs text-blue-400 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { user_profile, assessment_overview, detailed_results, scope_data } = resultData;
  const isSectorScope = user_profile?.career_focus === "sector" || Boolean(scope_data?.matching_sectors);
  const isClusterScope = user_profile?.career_focus === "cluster" && Array.isArray(scope_data);
  const isCareerScope = user_profile?.career_focus === "career" && Array.isArray(scope_data);

  const schoolName = institutionData?.name || user_profile?.institution?.name || "";
  const schoolLogo = assetUris.schoolLogo || institutionData?.logo || user_profile?.institution?.logo || null;

  const parseIncludesList = (includesStr) => {
    if (!includesStr || typeof includesStr !== "string") return [];
    return includesStr
      .replace(/\.$/, "")
      .split(/,\s*(?:and\s+)?|\s+and\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  };

  const getCuratedStrengths = () => {
    const rawStrengths = detailed_results?.personality_analysis?.strengths || [];
    const rawAdvantages = detailed_results?.personality_analysis?.advantages || [];
    const combined = [...rawStrengths, ...rawAdvantages];
    const unique = Array.from(new Set(combined.map(s => s.trim()))).filter(Boolean);
    return unique.slice(0, 4);
  };

  const getCuratedGrowthAreas = () => {
    const rawWeaknesses = detailed_results?.personality_analysis?.weaknesses || [];
    const rawDisadvantages = detailed_results?.personality_analysis?.disadvantages || [];
    const combined = [...rawWeaknesses, ...rawDisadvantages];
    const unique = Array.from(new Set(combined.map(s => s.trim()))).filter(Boolean);
    return unique.slice(0, 4);
  };

  const curatedStrengths = getCuratedStrengths();
  const curatedGrowth = getCuratedGrowthAreas();

  // Top sectors data for the card
  const topSectors = (scope_data?.matching_sectors || []).slice(0, 3).map(s => enrichSectorItem(s));
  const candidateName = user_profile?.name || "Student";
  const assessmentDateStr = user_profile?.assessment_date 
    ? new Date(user_profile.assessment_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const recommendedStreamSummary = topSectors[0]?.recommended_stream || "Engineering, Science, Mathematics & Technology";
  const futurePotentialSummary = topSectors[0]?.future_potential || "High-growth fields propelled by technology, innovation, and global infrastructure development.";

  const personalitySummaryText = detailed_results?.personality_analysis?.overview ||
    "Demonstrates strong logical analysis, methodical execution, and pragmatic problem-solving across technical and organizational domains.";

  return (
    <div className="min-h-screen bg-[#131620] text-slate-200 antialiased relative">
      <Toaster position="top-center" />

      {/* Soft Ambient Radial Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 print:hidden" 
        style={{
          background: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(59, 130, 246, 0.09), transparent 70%), radial-gradient(ellipse 70% 50% at 85% 100%, rgba(99, 102, 241, 0.05), transparent 70%)"
        }}
      />

      {/* Sticky Header with Share & Export actions */}
      <nav className="sticky top-0 z-40 bg-[#151824]/90 backdrop-blur-md border-b border-slate-700/60 print:hidden relative">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/70 px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-sm font-semibold text-white tracking-tight">
              Assessment Report
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Share Card Trigger Button */}
            <button
              onClick={handleOpenShareModal}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-emerald-900/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Report</span>
            </button>

            {/* Export PDF Button */}
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-blue-900/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Report Content */}
      <main ref={printRef} className="max-w-6xl mx-auto px-6 py-10 print:p-0 print:max-w-none print:m-0 space-y-8 relative z-10 print-report-container">

        {/* Print Cover Header */}
        <header className="hidden print:block print-cover-header border-b-2 border-slate-300 pb-6 mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
            <div className="flex items-center gap-3">
              {schoolLogo ? (
                <img src={schoolLogo} alt={schoolName} className="h-10 max-w-[200px] object-contain" />
              ) : null}
              <span className="font-bold text-slate-800 text-sm">{schoolName || "Institutional Assessment"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">POWERED BY XORTLIST</span>
              <img src="/assets/images/small-logo.png" alt="Xortlist" className="w-6 h-6 object-contain" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Comprehensive Career Discovery Report
            </h1>
            <p className="text-slate-600 text-xs mt-1">
              Cognitive Aptitude, Recommended Career Sectors & Academic Direction
            </p>
            <p className="text-slate-500 text-xs mt-2 font-medium">
              Candidate: <strong className="text-slate-900">{user_profile?.name || "Student"}</strong> • Class Level: {user_profile?.age ? `${user_profile.age} Years` : "Foundational Stage"} • Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </header>

        {/* 1. Executive Summary Profile Card */}
        <section className="bg-[#1b1e2a] border border-slate-700/60 rounded-2xl p-7 md:p-8 shadow-xl shadow-black/10 page-break-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-700/60">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Executive Profile
              </span>
              <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mt-1">
                {user_profile?.name || "Student Assessment Profile"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenShareModal}
                className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition print:hidden"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Summary Card</span>
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Assessment Completed</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Candidate</span>
              <p className="text-sm font-semibold text-white mt-1 truncate">{user_profile?.name || "Candidate"}</p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Age / Stage</span>
              <p className="text-sm font-semibold text-white mt-1">
                {user_profile?.age ? `${user_profile.age} Years` : "Foundational"}
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Focus Domain</span>
              <p className="text-sm font-semibold text-white mt-1 capitalize">
                {user_profile?.career_focus === "sector" ? "Career Sectors" : 
                 user_profile?.career_focus === "cluster" ? "Career Clusters" : 
                 user_profile?.career_focus || "Career Scope"}
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Assessment Date</span>
              <p className="text-sm font-semibold text-white mt-1">
                {user_profile?.assessment_date ? new Date(user_profile.assessment_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Verified"}
              </p>
            </div>
          </div>
        </section>

        {/* 2. HERO: SECTOR RECOMMENDATIONS (Spacious, Rich, Full Width) */}
        {isSectorScope && scope_data?.matching_sectors && scope_data.matching_sectors.length > 0 && (
          <section className="space-y-6 page-break-section">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Primary Recommendations
              </span>
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Recommended Career Sectors
              </h2>
              <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
                Based on your cognitive preferences and natural problem-solving tendencies, these foundational sectors provide the highest developmental alignment and long-term potential.
              </p>
            </div>

            {/* List of Full-Width Spacious Sector Cards */}
            <div className="space-y-6">
              {scope_data.matching_sectors.map((sectorRaw, index) => {
                const sector = enrichSectorItem(sectorRaw);
                const includesBadges = parseIncludesList(sector.what_it_includes);

                return (
                  <article
                    key={sector.id || index}
                    className="bg-[#1b1e2a] border border-slate-700/60 rounded-2xl p-7 md:p-8 shadow-xl shadow-black/10 transition hover:border-slate-600/80 page-break-section"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-700/60">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
                          Sector #{index + 1}
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                          {sector.name}
                        </h3>
                        {sector.legacy_name && sector.legacy_name.toLowerCase() !== sector.name.toLowerCase() && (
                          <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700/60">
                            {sector.legacy_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Primary Purpose Lead Quote */}
                    {sector.primary_purpose && (
                      <div className="mt-5 p-4 rounded-xl bg-slate-800/50 border-l-2 border-blue-500 text-slate-300 text-sm md:text-base leading-relaxed">
                        <span className="font-semibold text-white mr-2">Core Purpose:</span>
                        {sector.primary_purpose}
                      </div>
                    )}

                    {/* What It Includes Disciplines */}
                    {includesBadges.length > 0 && (
                      <div className="mt-5 space-y-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                          Fields & Sub-Disciplines
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {includesBadges.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* In-Depth 2-Column Grid */}
                    <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column: Why This Fits You */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                          Why This Fits Your Profile
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-5 rounded-xl border border-slate-700/40">
                          {sector.why_suitable || sector.brief_overview}
                        </p>
                      </div>

                      {/* Right Column: Academic Streams & Future Potential */}
                      <div className="space-y-5">
                        {sector.recommended_stream && (
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                              Recommended Subjects & Streams
                            </h4>
                            <p className="text-sm text-slate-200 bg-slate-800/30 p-4 rounded-xl border border-slate-700/40 font-medium">
                              {sector.recommended_stream}
                            </p>
                          </div>
                        )}

                        {sector.future_potential && (
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                              Industry Growth & Outlook
                            </h4>
                            <p className="text-xs md:text-sm text-slate-400 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-slate-700/40">
                              {sector.future_potential}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* 2b. CLUSTERS */}
        {isClusterScope && (
          <section className="space-y-6 page-break-section">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Primary Recommendations
              </span>
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Recommended Career Clusters
              </h2>
            </div>

            <div className="space-y-6">
              {scope_data.map((clusterItem, index) => (
                <article
                  key={clusterItem.cluster_details?.id || index}
                  className="bg-[#1b1e2a] border border-slate-700/60 rounded-2xl p-7 md:p-8 shadow-xl shadow-black/10 page-break-section"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
                        Rank #{clusterItem.rank || index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {clusterItem.cluster}
                      </h3>
                    </div>
                    {clusterItem.suitability_score && (
                      <span className="text-xs font-medium px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {clusterItem.suitability_score}% Alignment
                      </span>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Why This Fits You</h4>
                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-5 rounded-xl border border-slate-700/40">
                        {clusterItem.reasoning || clusterItem.cluster_details?.why_suitable}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {clusterItem.cluster_details?.brief_overview && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Overview</h4>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {clusterItem.cluster_details.brief_overview}
                          </p>
                        </div>
                      )}

                      {clusterItem.cluster_details?.ideal_stream && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Recommended Stream</h4>
                          <p className="text-xs text-slate-200 bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/50">
                            {clusterItem.cluster_details.ideal_stream}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2c. CAREERS */}
        {isCareerScope && (
          <section className="space-y-6 page-break-section">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Primary Recommendations
              </span>
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Recommended Career Specializations
              </h2>
            </div>

            <div className="space-y-6">
              {scope_data.map((career, index) => (
                <article
                  key={index}
                  className="bg-[#1b1e2a] border border-slate-700/60 rounded-2xl p-7 md:p-8 shadow-xl shadow-black/10 page-break-section"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-700/60">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {career.career_name}
                    </h3>
                    {career.type && (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                        {career.type}
                      </span>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Role Description & Fit</h4>
                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-5 rounded-xl border border-slate-700/40">
                        {career.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">What It Involves</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {career.brief_overview}
                        </p>
                      </div>

                      {career.future_potential && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Growth Potential</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {career.future_potential}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 3. STRATEGIC GUIDANCE */}
        {(detailed_results?.scope_specific_recommendations || detailed_results?.combined_insights) && (
          <section className="bg-[#1b1e2a] border border-slate-700/60 rounded-2xl p-7 md:p-8 shadow-xl shadow-black/10 space-y-6 page-break-section">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Actionable Strategy
              </span>
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Development Roadmap & Guidance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 space-y-2">
                <h3 className="text-sm font-semibold text-white">Strategic Alignment</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {detailed_results?.scope_specific_recommendations?.relevant_options ||
                   detailed_results?.combined_insights?.alignment ||
                   detailed_results?.combined_insights?.career_fit_summary}
                </p>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 space-y-2">
                <h3 className="text-sm font-semibold text-white">Recommended Growth Steps</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {detailed_results?.scope_specific_recommendations?.development_areas ||
                   detailed_results?.combined_insights?.guidance}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 4. CURATED PERSONALITY PROFILE */}
        {detailed_results?.personality_analysis && (
          <section className="bg-[#1b1e2a] border border-slate-700/60 rounded-2xl p-7 md:p-8 shadow-xl shadow-black/10 space-y-6 page-break-section">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Cognitive & Behavioral Analysis
              </span>
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Personality & Behavioral Profile
              </h2>
            </div>

            {detailed_results.personality_analysis.overview && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {detailed_results.personality_analysis.overview}
                </p>
                {detailed_results.personality_analysis.behavioral_tendencies && (
                  <p className="text-sm text-slate-400 leading-relaxed mt-3 pt-3 border-t border-slate-700/50">
                    {detailed_results.personality_analysis.behavioral_tendencies}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {curatedStrengths.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Signature Strengths
                  </h3>
                  <div className="space-y-2">
                    {curatedStrengths.map((str, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed"
                      >
                        {str}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {curatedGrowth.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Opportunities for Growth
                  </h3>
                  <div className="space-y-2">
                    {curatedGrowth.map((area, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-3.5 text-xs text-slate-400 leading-relaxed"
                      >
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. WORK & LEARNING PREFERENCES */}
        {detailed_results?.career_analysis?.work_style_preferences && (
          <section className="bg-[#1b1e2a] border border-slate-700/60 rounded-2xl p-7 md:p-8 shadow-xl shadow-black/10 space-y-4 page-break-section">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Learning & Collaboration Style
              </span>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Work Style & Learning Environment
              </h2>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <p className="text-sm text-slate-300 leading-relaxed">
                {detailed_results.career_analysis.work_style_preferences}
              </p>
            </div>
          </section>
        )}

        {/* Professional Footer */}
        <footer className="text-center py-10 border-t border-slate-800 space-y-3 page-break-section">
          <img
            src="/assets/images/logo-full.png"
            alt="Xortlist"
            className="h-9 mx-auto object-contain opacity-80"
          />
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} Xortlist Assessment & Career Guidance Systems. All rights reserved.
          </p>
          <p className="text-slate-600 text-[11px]">
            Report generated securely for candidate reference.
          </p>
        </footer>

      </main>

      {/* =========================================================================
          OFFSCREEN SHAREABLE CARD: PREMIER LIGHT INSTITUTIONAL CREDENTIAL
          (Rendered at fixed 900x1200px for 2x crisp html2canvas export)
          ========================================================================= */}
      <div 
        className="print:hidden"
        style={{ 
          position: "fixed", 
          top: "-9999px", 
          left: "-9999px", 
          width: "900px", 
          height: "1200px",
          zIndex: -100,
          overflow: "hidden"
        }}
      >
                <div
          ref={shareCardRef}
          id="xortlist-share-card-canvas"
          style={{
            width: "900px",
            minHeight: "1200px",
            background: "#ffffff",
            color: "#0f172a",
            boxSizing: "border-box"
          }}
          className="relative p-12 flex flex-col justify-between overflow-hidden font-sans border-2 border-slate-200 shadow-2xl"
        >
          {/* Top Institutional Header: School Info on Left + POWERED BY XORTLIST on Right */}
          <div className="pb-6 border-b border-slate-200 flex items-center justify-between">
            {/* School / Institution Info */}
            <div className="flex items-center gap-4">
              {schoolLogo ? (
                <img
                  src={schoolLogo}
                  alt={schoolName}
                  crossOrigin="anonymous"
                  className="h-12 max-w-[240px] object-contain rounded"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-lg shadow-xs">
                  {schoolName ? schoolName.charAt(0).toUpperCase() : "🎓"}
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-0.5">
                  INSTITUTIONAL ASSESSMENT
                </span>
                <p className="text-base font-bold text-slate-900 tracking-tight leading-tight max-w-[380px]">
                  {schoolName || "Academic Career Guidance Program"}
                </p>
              </div>
            </div>

            {/* POWERED BY XORTLIST on Right */}
            <div className="flex items-center gap-2.5">
              <div className="text-right leading-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                  POWERED BY
                </span>
                <span className="text-xs font-black text-slate-900 tracking-wider block">
                  XORTLIST
                </span>
              </div>
              <img
                src={assetUris.smallLogo || "/assets/images/small-logo.png"}
                alt="Xortlist"
                crossOrigin="anonymous"
                className="w-7 h-7 object-contain"
              />
            </div>
          </div>

          {/* Candidate Title Block (Clean typography, NO weird rounded outline pill) */}
          <div className="pt-6 pb-4 border-b border-slate-100">
            <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase block mb-1">
              CAREER SECTOR DISCOVERY REPORT
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {candidateName}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {user_profile?.age ? `Class Level: ${user_profile.age} Years` : "Student Aptitude Assessment"}
              {" • "}
              <span>Career Sectors & Academic Pathways</span>
            </p>
          </div>

          {/* Sectors Hero Section (Rich, Detailed, Clean Alignment — NO numbers, NO weird button boxes) */}
          <div className="py-4 space-y-2 flex-1">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                RECOMMENDED CAREER SECTORS
              </span>
              <span className="text-[11px] font-semibold text-emerald-700">
                Validated Developmental Fit
              </span>
            </div>

            <div className="space-y-1">
              {topSectors.map((sec, idx) => {
                const domainsList = sec.key_domains && sec.key_domains.length > 0 
                  ? sec.key_domains.join(" • ")
                  : parseIncludesList(sec.what_it_includes).join(" • ");

                return (
                  <div
                    key={idx}
                    className={`py-5 ${idx !== topSectors.length - 1 ? "border-b border-slate-200/80" : ""} space-y-2`}
                  >
                    {/* Sector Title & Track Name */}
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {sec.canonical_name || sec.name}
                      </h3>
                      {sec.legacy_name && sec.legacy_name.toLowerCase() !== (sec.canonical_name || sec.name).toLowerCase() && (
                        <span className="text-[11px] font-medium text-slate-400">
                          Sector Track: {sec.legacy_name}
                        </span>
                      )}
                    </div>

                    {/* Primary Mission & Purpose */}
                    {sec.primary_purpose && (
                      <p className="text-[13px] text-slate-700 leading-relaxed font-normal">
                        {sec.primary_purpose}
                      </p>
                    )}

                    {/* Key Disciplines & Sub-Fields */}
                    {domainsList && (
                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-800 mr-1.5">Key Domains:</span>
                        {domainsList}
                      </p>
                    )}

                    {/* Aptitude Alignment / Why Suitable */}
                    {sec.why_suitable && (
                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-800 mr-1.5">Aptitude Fit:</span>
                        {sec.why_suitable}
                      </p>
                    )}

                    {/* Academic Streams & Industry Outlook */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-6 text-[12px] pt-1">
                      {sec.recommended_stream && (
                        <p className="text-slate-600">
                          <span className="font-semibold text-blue-700 mr-1.5">Academic Streams:</span>
                          {sec.recommended_stream}
                        </p>
                      )}
                      {sec.future_potential && (
                        <p className="text-slate-600">
                          <span className="font-semibold text-emerald-700 mr-1.5">Growth Outlook:</span>
                          {sec.future_potential}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Footer: Clean, Dignified, No Verify Links or Codes */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <img
                src={assetUris.smallLogo || "/assets/images/small-logo.png"}
                alt="Xortlist"
                crossOrigin="anonymous"
                className="w-4 h-4 object-contain opacity-80"
              />
              <span className="font-semibold text-slate-700">
                Xortlist Career Assessment Services
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">
                Assessment Date: {assessmentDateStr}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in print:hidden">
          <div className="bg-[#181b26] border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row shadow-2xl overflow-hidden">
            
            {/* LEFT COLUMN: Ultra-Clean Responsive Image Showcase (No Scroll) */}
            <div className="flex-1 bg-[#0e1017] p-4 sm:p-6 flex items-center justify-center min-h-[260px] md:min-h-0 border-b md:border-b-0 md:border-r border-slate-800">
              {shareableImageUri ? (
                <img
                  src={shareableImageUri}
                  alt="Career Discovery Card"
                  className="max-h-[46vh] md:max-h-[76vh] max-w-full h-auto w-auto object-contain rounded-xl shadow-2xl border border-slate-700/60 transition-all duration-300"
                />
              ) : (
                <div className="text-center space-y-3 py-12">
                  <div className="w-10 h-10 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium text-slate-300">Rendering high-resolution credential...</p>
                  <p className="text-xs text-slate-500">Preparing institutional format</p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Header & Action Controls (Always Visible, Zero Scroll) */}
            <div className="w-full md:w-[350px] flex-shrink-0 bg-[#161924] p-5 sm:p-6 flex flex-col justify-between gap-6">
              
              {/* Header & Candidate Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Share Report Card
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Official career credential ready to share directly with parents, teachers, and friends.
                </p>

                {/* Candidate Info */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Candidate:</span>
                    <span className="font-semibold text-slate-200">{candidateName}</span>
                  </div>
                  {schoolName && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">School:</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[190px]">{schoolName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Clean & Focused (Only WhatsApp & Download PNG) */}
              <div className="space-y-3 pt-2">
                {/* 1. Primary WhatsApp Share */}
                <button
                  onClick={handleShareWhatsApp}
                  disabled={isGeneratingImage}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] transition flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/20 disabled:opacity-60 text-sm"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  <span>{isGeneratingImage ? "Rendering..." : "Share to WhatsApp"}</span>
                </button>

                {/* 2. Download PNG (Clean, No resolution text) */}
                <button
                  onClick={handleDownloadImage}
                  disabled={isGeneratingImage}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-60"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Global CSS for Print */}
      <style jsx global>{`
        
        /* =========================================================================
           DIRECT PDF EXPORT STYLES (Enforces pristine light institutional report)
           ========================================================================= */
        .pdf-export-mode {
          background-color: #ffffff !important;
          color: #0f172a !important;
          max-width: 1000px !important;
          width: 1000px !important;
          padding: 28px !important;
          margin: 0 auto !important;
        }

        .pdf-export-mode .print-cover-header {
          display: block !important;
        }

        .pdf-export-mode section,
        .pdf-export-mode article {
          background-color: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 12px !important;
          box-shadow: none !important;
          color: #0f172a !important;
          padding: 20px !important;
          margin-bottom: 20px !important;
        }

        .pdf-export-mode h1,
        .pdf-export-mode h2,
        .pdf-export-mode h3,
        .pdf-export-mode h4,
        .pdf-export-mode strong {
          color: #0f172a !important;
        }

        .pdf-export-mode p,
        .pdf-export-mode span,
        .pdf-export-mode li,
        .pdf-export-mode td,
        .pdf-export-mode th {
          color: #334155 !important;
        }

        .pdf-export-mode [class*="bg-slate-800"],
        .pdf-export-mode [class*="bg-slate-900"],
        .pdf-export-mode [class*="bg-slate-700"] {
          background-color: #f8fafc !important;
          border-color: #e2e8f0 !important;
          color: #1e293b !important;
        }

        .pdf-export-mode [class*="bg-blue"] {
          background-color: #eff6ff !important;
          color: #1d4ed8 !important;
          border-color: #bfdbfe !important;
        }

        .pdf-export-mode [class*="bg-emerald"],
        .pdf-export-mode [class*="bg-green"] {
          background-color: #f0fdf4 !important;
          color: #15803d !important;
          border-color: #bbf7d0 !important;
        }

        .pdf-export-mode [class*="text-blue"] {
          color: #1d4ed8 !important;
        }

        .pdf-export-mode [class*="text-emerald"] {
          color: #15803d !important;
        }

        .pdf-export-mode [class*="text-slate-400"],
        .pdf-export-mode [class*="text-slate-500"] {
          color: #64748b !important;
        }

        .pdf-export-mode [class*="border-slate"] {
          border-color: #e2e8f0 !important;
        }

        .pdf-export-mode button {
          display: none !important;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 14mm;
          }

          /* Ensure html, body, and all wrappers expand infinitely across pages */
          html, body, #__next, div[class*="min-h-screen"] {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            position: static !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 10pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide on print */
          .print\\:hidden,
          nav,
          button,
          .fixed {
            display: none !important;
          }

          /* Show on print */
          .print\\:block {
            display: block !important;
          }

          /* Main container resets */
          .print-report-container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }

          /* Turn every dark container into a clean, crisp, bordered white card */
          .print-report-container section,
          .print-report-container article {
            background-color: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            padding: 16pt !important;
            margin-bottom: 14pt !important;
            break-inside: auto !important;
            page-break-inside: auto !important;
          }

          /* Articles (individual sector / career items) avoid awkward split where possible */
          .print-report-container article {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Remove ALL forced page-break-after: always so pages flow naturally without being clipped */
          .page-break-section {
            break-inside: auto !important;
            page-break-inside: auto !important;
            break-after: auto !important;
            page-break-after: auto !important;
            margin-bottom: 12pt !important;
          }

          /* Ensure high-contrast dark text everywhere */
          .print-report-container h1,
          .print-report-container h2,
          .print-report-container h3,
          .print-report-container h4,
          .print-report-container strong {
            color: #0f172a !important;
          }

          .print-report-container p,
          .print-report-container span,
          .print-report-container li,
          .print-report-container td,
          .print-report-container th {
            color: #334155 !important;
          }

          /* Inner cards, badges & quote boxes */
          .print-report-container [class*="bg-slate-800"],
          .print-report-container [class*="bg-slate-900"],
          .print-report-container [class*="bg-slate-700"] {
            background-color: #f8fafc !important;
            border-color: #e2e8f0 !important;
            color: #1e293b !important;
          }

          /* Light badge tints with clear readable text */
          .print-report-container [class*="bg-blue"] {
            background-color: #eff6ff !important;
            color: #1d4ed8 !important;
            border-color: #bfdbfe !important;
          }

          .print-report-container [class*="bg-emerald"],
          .print-report-container [class*="bg-green"] {
            background-color: #f0fdf4 !important;
            color: #15803d !important;
            border-color: #bbf7d0 !important;
          }

          .print-report-container [class*="text-blue"] {
            color: #1d4ed8 !important;
          }

          .print-report-container [class*="text-emerald"] {
            color: #15803d !important;
          }

          .print-report-container [class*="text-slate-400"],
          .print-report-container [class*="text-slate-500"] {
            color: #64748b !important;
          }

          .print-report-container [class*="border-slate"] {
            border-color: #e2e8f0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AssessmentResultsPage;
