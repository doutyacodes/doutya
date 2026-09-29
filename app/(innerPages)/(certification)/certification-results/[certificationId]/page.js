"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, ArrowLeft, RotateCcw, XCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import GlobalApi from '@/app/_services/GlobalApi';
import toast, { Toaster } from 'react-hot-toast';
import LoadingOverlay from '@/app/_components/LoadingOverlay';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Reusable Certificate Template Component (rendered at 1200x900)
const CertificateTemplateContent = ({ certificateData, formatDate, renderStars, assetDataUris }) => {
  const schoolLogo = certificateData?.institution?.logo;
  const schoolName = certificateData?.institution?.name;
  const logoSrc = schoolLogo || assetDataUris?.logo || "/assets/images/doutya4.png";
  const signatureSrc = assetDataUris?.signature || "/assets/images/md-signature.png";
  const sealSrc = assetDataUris?.seal || "/assets/images/small-logo.png";

  return (
    <Card 
      className="w-[1200px] h-[900px] overflow-hidden border-0 relative shadow-none"
      style={{ 
        background: "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)",
        width: '1200px',
        height: '900px',
        boxSizing: 'border-box'
      }}
    >
      {/* Outer Double Border */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          border: '16px double rgba(26, 54, 93, 0.25)', 
          margin: '16px' 
        }}
      />

      {/* Decorative Corner Accents */}
      <div className="absolute left-7 top-7 w-24 h-24 border-t-4 border-l-4 border-blue-900 opacity-50"></div>
      <div className="absolute right-7 top-7 w-24 h-24 border-t-4 border-r-4 border-blue-900 opacity-50"></div>
      <div className="absolute left-7 bottom-7 w-24 h-24 border-b-4 border-l-4 border-blue-900 opacity-50"></div>
      <div className="absolute right-7 bottom-7 w-24 h-24 border-b-4 border-r-4 border-blue-900 opacity-50"></div>

      {/* Certificate Content Flex */}
      <div className="relative z-10 flex flex-col justify-between h-full p-14 pt-12 pb-14 box-border">
        {/* Header with Logo & Meta */}
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={logoSrc} 
              alt="XORTLIST" 
              className="h-20 object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-700 font-semibold tracking-wide">
              Certificate ID: <span className="font-mono text-blue-950 font-bold">{certificateData?.certificateID || 'XTC-CERT'}</span>
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              Issue Date: {formatDate(certificateData?.issueDate)}
            </p>
          </div>
        </div>

        {/* Main Body Content */}
        <div className="space-y-4 text-center w-full max-w-3xl mx-auto my-auto">
          <h1 className="text-4xl font-extrabold text-blue-950 tracking-wider uppercase font-serif">
            Certificate of Achievement
          </h1>
          
          <div className="h-0.5 w-56 mx-auto bg-gradient-to-r from-transparent via-blue-900 to-transparent my-1"></div>
          
          <p className="text-base text-gray-600 italic">This is proudly presented to</p>
          
          <h2 className="text-3xl font-bold text-blue-900 uppercase tracking-widest py-1 border-b-2 border-blue-200 inline-block px-8">
            {certificateData?.userName || certificateData?.username || "Student"}
          </h2>
          
          <p className="text-base text-gray-600">for successfully completing the requirements of</p>
          
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-blue-950 tracking-tight">
              {certificateData?.certificationName}
            </h3>
            {certificateData?.level && (
              <p className="text-lg font-semibold text-blue-700">
                {certificateData.level.charAt(0).toUpperCase() + certificateData.level.slice(1)} Level
              </p>
            )}
          </div>
          
          <p className="text-base text-gray-600">
            demonstrating domain knowledge and proficiency in
          </p>

          <p className="text-xl font-bold text-blue-900">
            {certificateData?.careerField || "Professional Development"}
          </p>
                    
          {/* Stars and Score */}
          <div className="flex flex-col items-center space-y-1 pt-1">
            {renderStars(certificateData?.ratingStars)}
            <p className="text-lg font-semibold text-blue-950">
              Score: {certificateData?.scorePercentage}%
            </p>
          </div>
        </div>

        {/* Footer with Signature & Verification */}
        <div className="w-full flex justify-between items-end pt-4">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium">Powered by</span>
              <img src="/assets/images/small-logo.png" alt="XORTLIST" className="h-4 object-contain opacity-70" />
              <span className="text-xs font-semibold text-gray-600">XORTLIST</span>
            </div>
            <p className="text-[11px] text-gray-400">Institutional Certification Program</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <img 
                src={signatureSrc} 
                alt="Digital Signature" 
                className="h-14 object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <div className="h-px w-44 bg-gray-400 mb-1 mx-auto"></div>
            <p className="text-sm font-semibold text-gray-800">Managing Director</p>
            <p className="text-xs text-gray-500">Authorized Signature</p>
          </div>
          
          <div className="text-right">
            <div className="flex justify-end items-center">
              <img 
                src={sealSrc} 
                alt="Seal" 
                className="h-16 w-16 object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const CertificateDisplay = ({ params }) => {
  const { certificationId } = params;
  const [certificateData, setCertificateData] = useState({});
  const certificateRef = useRef(null);
  const previewContainerRef = useRef(null);
  const [certificateImage, setCertificateImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.85);
  const [previewHeight, setPreviewHeight] = useState(600);
  const router = useRouter();
  const [assetDataUris, setAssetDataUris] = useState({
    logo: "/assets/images/doutya4.png",
    signature: "/assets/images/md-signature.png",
    seal: "/assets/images/small-logo.png",
    loaded: false
  });

  // Preload local image assets to base64 Data URIs to eliminate CORS/taint canvas issues
  useEffect(() => {
    const loadAssets = async () => {
      const toDataUri = async (url) => {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(url);
            reader.readAsDataURL(blob);
          });
        } catch {
          return url;
        }
      };

      try {
        const [logo, signature, seal] = await Promise.all([
          toDataUri("/assets/images/doutya4.png"),
          toDataUri("/assets/images/md-signature.png"),
          toDataUri("/assets/images/small-logo.png")
        ]);
        setAssetDataUris({ logo, signature, seal, loaded: true });
      } catch (err) {
        console.error("Error preloading asset data URIs:", err);
        setAssetDataUris((prev) => ({ ...prev, loaded: true }));
      }
    };

    loadAssets();
  }, []);

  const getCertification = async () => {
    setIsLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setIsLoading(false);
        return;
      }
      const response = await GlobalApi.GetCertificationResult(token, certificationId);
      if (response.status === 200) {
        setCertificateData(response.data);  
      } else {
        toast.error("No certificate data available at the moment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch certificate data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCertification();
  }, [certificationId]);

  // Dynamically calculate responsive scale based on current container width
  useEffect(() => {
    const updateDimensions = () => {
      if (previewContainerRef.current) {
        const width = previewContainerRef.current.offsetWidth;
        if (width > 0) {
          setPreviewScale(width / 1200);
          setPreviewHeight(Math.round(width * 0.75));
        }
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    const timer = setTimeout(updateDimensions, 100);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, [isLoading, certificateData]);

  // Robust html2canvas generator using fixed 1200x900 viewport and taint-safe data URIs
  const generateCertificateImage = useCallback(async () => {
    if (!certificateRef.current) return null;
    try {
      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: false, // Must be false so canvas.toDataURL() never throws SecurityError
        backgroundColor: '#ffffff',
        width: 1200,
        height: 900,
        windowWidth: 1200,
        windowHeight: 900,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        logging: false
      };
      const canvas = await html2canvas(certificateRef.current, options);
      const image = canvas.toDataURL('image/png', 1.0);
      setCertificateImage(image);
      return image;
    } catch (error) {
      console.error("Error generating certificate image:", error);
      return null;
    }
  }, []);

  // Generate certificate image in the background once data & assets are ready
  useEffect(() => {
    if (!isLoading && certificateData && Object.keys(certificateData).length > 0 && assetDataUris.loaded) {
      const timer = setTimeout(() => {
        generateCertificateImage();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [certificateData, isLoading, assetDataUris.loaded, generateCertificateImage]);

  const renderStars = (count) => {
    return (
      <div className="flex gap-1.5 star-container">
        {[1, 2, 3].map((starNumber) => (
          <span
            key={starNumber}
            className={`text-3xl ${
              starNumber <= count
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
            style={{
              display: 'inline-block',
              visibility: 'visible',
              opacity: 1
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const downloadCertificate = async () => {
    let img = certificateImage;
    if (!img) {
      setIsDownloading(true);
      const toastId = toast.loading("Generating certificate image...");
      img = await generateCertificateImage();
      setIsDownloading(false);
      toast.dismiss(toastId);
    }

    if (img) {
      const link = document.createElement('a');
      const studentName = (certificateData.userName || certificateData.username || 'Student').replace(/\s+/g, '_');
      link.download = `XORTLIST_${certificateData.certificationName || 'Certification'}_Certificate_${studentName}.png`;
      link.href = img;
      link.click();
      toast.success("Certificate downloaded!");
    } else {
      toast.error("Could not generate certificate image. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <LoadingOverlay loadText={"Loading Certificate..."} />
      </div>
    );
  }

  // Show ineligible message if score is below passing
  if (certificateData.ratingStars === 0 || Number(certificateData.scorePercentage) < 70) {
    const attemptsUsed = certificateData.attempts || 1;
    const remainingAttempts = certificateData.remainingAttempts != null ? certificateData.remainingAttempts : Math.max(0, 3 - attemptsUsed);
    const canRetry = remainingAttempts > 0;

    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto">
          <Card className="p-6 sm:p-8 text-center space-y-6 bg-gray-800 border-gray-700 text-gray-100 shadow-xl rounded-xl">
            <div className="flex justify-center">
              <XCircle className="w-16 h-16 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Not Eligible for Certificate</h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Unfortunately, you haven't achieved the minimum required score (70%) to receive this certification.
            </p>
            <div className="space-y-2 text-sm text-gray-400 bg-gray-900/60 p-4 rounded-lg text-left">
              <p className="font-semibold text-gray-300">To earn this certificate, you need to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Complete all required questions</li>
                <li>Achieve a passing score of at least 70%</li>
                <li>Have remaining certification attempts available</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              {canRetry && (
                <Button 
                  onClick={() => router.push(`/certification-quiz/${certificationId}?level=${certificateData.level || 'beginner'}`)}
                  className="bg-amber-600 hover:bg-amber-500 text-white gap-2 font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry ({remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} left)
                </Button>
              )}
              <Button 
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white"
                onClick={() => router.replace("/dashboard/careers/career-guide")}
              >
                Return to Career Guide
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Regular certificate display
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-3 sm:p-6 md:p-8 flex items-center justify-center">
      <Toaster position="top-center" />

      
      <div className="max-w-4xl w-full mx-auto space-y-6">

        {/* Off-screen Full-Resolution 1200x900 Template for html2canvas Export */}
        <div 
          id="certificate-template"
          ref={certificateRef}
          style={{ 
            position: 'fixed',
            left: '-9999px',
            top: '0',
            width: '1200px', 
            height: '900px', 
            zIndex: -999,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <CertificateTemplateContent 
            certificateData={certificateData} 
            formatDate={formatDate} 
            renderStars={renderStars}
            assetDataUris={assetDataUris}
          />
        </div>

        {/* Responsive Live Screen Certificate Display */}
        <div className="relative w-full">
          <div 
            ref={previewContainerRef}
            className="w-full shadow-2xl rounded-xl overflow-hidden bg-white border border-gray-700/60 relative"
            style={{ 
              height: previewHeight > 0 ? `${previewHeight}px` : 'auto',
              minHeight: '220px'
            }}
          >
            {certificateImage ? (
              <img 
                src={certificateImage} 
                alt="Your Certificate" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div 
                style={{
                  width: '1200px',
                  height: '900px',
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                  pointerEvents: 'none'
                }}
              >
                <CertificateTemplateContent 
                  certificateData={certificateData} 
                  formatDate={formatDate} 
                  renderStars={renderStars}
                  assetDataUris={assetDataUris}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-1">
          <Button 
            onClick={downloadCertificate}
            className="gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 h-10 shadow-sm"
            disabled={isDownloading}
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Generating..." : "Download Certificate"}
          </Button>

          
          <Button 
            variant="outline"
            className="gap-2 bg-transparent hover:bg-gray-800 text-gray-300 border-gray-700 h-10"
            onClick={() => router.replace("/dashboard/careers/career-guide")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Verification Info */}
        <div className="text-center text-xs sm:text-sm text-gray-400 mt-4 max-w-xl mx-auto space-y-1">
          <p>This certificate is issued by XORTLIST to verify the successful completion of the {certificateData.certificationName} program.</p>
          <p className="text-gray-500">To verify authenticity, visit <span className="text-blue-400 font-mono">xortlist.com/verify</span> with your certificate ID.</p>
        </div>
      </div>
    </div>
  );
};  

export default CertificateDisplay;
