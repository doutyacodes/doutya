"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Download, Share2, Badge, Calendar, XCircle, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import GlobalApi from '@/app/_services/GlobalApi';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/app/_components/LoadingOverlay';
import SelectCommunity from '@/app/(innerPages)/dashboard/_components/SelectCommunityModal/SelectCommunity';
import { useRouter } from 'next/navigation';


const CertificateDisplay = ({ params }) => {
  const { certificationId } = params;
  const [certificateData, setCertificateData] = useState({});
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const certificateRef = useRef(null);
  const [certificateImage, setCertificateImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCertificateLoading, setCertificateIsLoading] = useState(true);
  const router = useRouter();
  const [selectedCommunities, setSelectedCommunities] = useState({
    global: false,
    countrySpecific: false
  });

  const getCertification = async () => {
    console.log("Starting getCertification");
    setIsLoading(true);
    setCertificateIsLoading(true)
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        console.log("No token found");
        setIsLoading(false);
        setCertificateIsLoading(false)
        return;
      }
      const response = await GlobalApi.GetCertificationResult(token, certificationId);
      if (response.status === 200) {
        setCertificateData(response.data);  
      } else {
        toast.error("No certificate data available at the moment.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch certificate data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCertification();
  }, []);

  useEffect(() => {
    const generateCertificate = async () => {
      setCertificateIsLoading(true)
      if (!certificateData || Object.keys(certificateData).length === 0 || !certificateRef.current) {
        console.log("No certificate data yet, skipping generation");
        return;
      }
      
      if (!certificateRef.current) {
        console.log("Certificate ref not attached yet, skipping generation");
        return;
      }
          
      // First make sure all images are loaded
      await preloadImages();
      
      // Wait for DOM to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 1500));
            
      try {
        const options = {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: true, // Enable logging
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('#certificate-template');
            if (clonedElement) {
              // Make the cloned element visible for rendering
              clonedElement.style.opacity = '1';
              clonedElement.style.visibility = 'visible';
              clonedElement.style.position = 'absolute';
              clonedElement.style.left = '0';
              clonedElement.style.top = '0';

            } else {
              console.error("Could not find cloned element");
            }
          }
        };
        const canvas = await html2canvas(certificateRef.current, options);
        const image = canvas.toDataURL('image/png', 1.0);
        console.log("image Ready",)
        setCertificateImage(image);
        console.log("image", image)
        setCertificateIsLoading(false);
      } catch (error) {
        console.error("Error generating certificate:", error);
        setCertificateIsLoading(false);
      }
    };
    
    if (!isLoading && certificateData && Object.keys(certificateData).length > 0) {
      // Allow DOM to fully render before generating
      const timer = setTimeout(generateCertificate, 3000);
      return () => clearTimeout(timer);
    }
  }, [certificateData, isLoading]);

  const handleCheckboxChange = (community, isChecked) => {
    if (community === 'global') {
      setSelectedCommunities((prevState) => ({ ...prevState, global: isChecked }));
    } else if (community === 'countrySpecific') {
      setSelectedCommunities((prevState) => ({ ...prevState, countrySpecific: isChecked }));
    }
  };

  // Add this function at the beginning of your component
  const preloadImages = async () => {
    console.log("Preloading images...");
    const imagePaths = [
      "/assets/images/doutya4.png",
      "/assets/images/small-logo.png"
    ];
    
    const promises = imagePaths.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          console.log(`Image loaded: ${src}`);
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${src}`);
          reject();
        };
        img.src = src;
      });
    });
    
    try {
      await Promise.all(promises);
      console.log("All images preloaded successfully");
      return true;
    } catch (err) {
      console.error("Error preloading images:", err);
      return false;
    }
  };

  const renderStars = (count) => {
    return (
      <div className="flex gap-2 star-container">
        {[1, 2, 3].map((starNumber) => (
          <span
            key={starNumber}
            className={`text-4xl ${
              starNumber <= count
                ? 'text-yellow-400'
                : 'text-gray-200'
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

  const handlePost = () => {
    setShowCommunityModal(true);
  };

  const downloadCertificate = () => {
    // Use the already generated image
    if (certificateImage) {
      const link = document.createElement('a');
      link.download = `XORTCURT_${certificateData.certificationName}_Certificate_${(certificateData.userName || certificateData.username).replace(/\s+/g, '_')}.png`;
      link.href = certificateImage;
      link.click();
    }
  };

  // Format the date in a more formal way
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // if (isLoading) {
  //   return (
  //     <div className="h-screen flex items-center justify-center text-white">
  //       <div>
  //         <div className="font-semibold">
  //           <LoadingOverlay loadText={"Loading..."} />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Show ineligible message if score is 0
  if (certificateData.ratingStars === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <XCircle className="w-20 h-20 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Not Eligible for Certificate</h2>
            <p className="text-gray-600">
              Unfortunately, you haven't achieved the minimum required score to receive this certification.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>To earn this certificate, you need to:</p>
              <ul className="list-disc list-inside">
                <li>Complete all required questions</li>
                <li>Achieve a passing score</li>
                <li>Meet all certification requirements</li>
              </ul>
            </div>
            <Button 
              variant="secondary"
              onClick={() => router.replace("/dashboard/careers/career-guide")}
              className="mt-4"
            >
              Return to Career Guide
            </Button>
          </Card>
        </div>
      </div>
    );
  }


  // Regular certificate display
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center">

      {/* Modal for community selection */}
      {showCommunityModal && (
        <SelectCommunity
          handleCheckboxChange={handleCheckboxChange}
          selectedCommunities={selectedCommunities}
        />
      )}
      
      <div className="max-w-5xl w-full mx-auto space-y-6">

        <div 
          id="certificate-template"
          ref={certificateRef} 
          className="absolute left-0 top-0 opacity-0"
          style={{ 
            width: '1200px', 
            height: '900px', 
            zIndex: -1,
            position: 'absolute',
            visibility: 'hidden',
            overflow: 'hidden',
          }}
        >
          <Card 
            className="w-full h-full overflow-hidden border-0"
            style={{ 
              background: "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)"
            }}
          >
            {/* Border Design */}
            <div className="absolute inset-0 border-16 border-double border-opacity-20 pointer-events-none" style={{ borderColor: '#1a365d', padding: "24px" }}></div>
          
            {/* Background Pattern */} {/* for now its set to opacity 0 */}
            <div className="absolute inset-0 opacity-0">
              <div className="absolute inset-0" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%231a365d' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
                backgroundSize: "120px 120px"
              }} />
            </div>

            {/* Decorative Corner Designs */}
            <div className="absolute left-0 top-0 w-24 h-24 border-t-4 border-l-4 border-blue-800 opacity-40"></div>
            <div className="absolute right-0 top-0 w-24 h-24 border-t-4 border-r-4 border-blue-800 opacity-40"></div>
            <div className="absolute left-0 bottom-0 w-24 h-24 border-b-4 border-l-4 border-blue-800 opacity-40"></div>
            <div className="absolute right-0 bottom-0 w-24 h-24 border-b-4 border-r-4 border-blue-800 opacity-40"></div>

            {/* Certificate Content */}
            <div className="relative z-10 flex flex-col h-full p-10 pt-8 pb-12"
                style={{ justifyContent: "space-between" }}>
              {/* Header with Logo */}
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center">
                  {/* Company Logo */}
                  <img 
                      src="/assets/images/doutya4.png" 
                      alt="XORTCURT" 
                      className="h-24 object-contain"
                    />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 font-semibold">Certificate ID: {certificateData.certificateID}</p>
                  <p className="text-sm text-gray-600">Issue Date: {formatDate(certificateData.issuedAt)}</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-6 text-center w-full max-w-3xl mx-auto" 
                style={{ marginTop: "-140px" }}>
                <h1 className="text-4xl font-bold text-blue-900 tracking-tight">
                  CERTIFICATE OF ACHIEVEMENT
                </h1>
                
                <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-blue-900 to-transparent"></div>
                
                <p className="text-lg text-gray-700">This certifies that</p>
                
                <h2 className="text-3xl font-bold text-blue-800 uppercase tracking-wider py-2">
                  {certificateData.userName || certificateData.username}
                </h2>
                
                <p className="text-lg text-gray-700">has successfully completed the</p>
                
                <h3 className="text-2xl font-bold text-blue-900 tracking-tight">
                  {certificateData.certificationName}
                </h3>
                
                <p className="text-lg text-gray-700">
                  and is recognized for demonstrating proficiency in the field of
                </p>
                
                <p className="text-xl font-semibold text-blue-800">
                  {certificateData.careerField || "Professional Development"}
                </p>
                
                {/* Stars and Score */}
                <div className="flex flex-col items-center space-y-2 py-3">
                  {renderStars(certificateData.ratingStars)}
                  <p className="text-xl font-semibold text-blue-900">
                    With a score of {certificateData.scorePercentage}%
                  </p>
                </div>
              </div>

              {/* Footer with Signature */}
              <div className="w-full flex justify-between items-end">
                <div className="text-left">
                  <p className="text-sm text-gray-600">
                    Verify this certificate at:<br />
                    <span className="font-medium">xortcurt.com/verify</span>
                  </p>
                </div>
                
                <div className="text-center me-16">
                  <div className="flex justify-center mb-2">
                    <img 
                      src="/assets/images/md-signature.png" 
                      alt="Digital Signature" 
                      className="h-16 object-contain"
                    />
                  </div>
                  <div className="h-px w-40 bg-gray-400 mb-2"></div>
                  <p className="text-sm font-medium text-gray-700">Managing Director</p>
                </div>
                
                <div className="text-right">
                  <div className="flex justify-end mb-1">
                    {/* Company seal/emblem */}
                    <div className="w-16 h-16 flex items-center">
                      <img 
                        src="/assets/images/small-logo.png" 
                        alt="XORTCURT" 
                        className="h-16 object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Certificate Display as Image */}
        <div className="relative w-full mb-8">
          {isCertificateLoading ? (
            // <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ aspectRatio: "4/3" }}>
            //   <div className="text-gray-600 animate-pulse">Generating Certificate...</div>
            // </div>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ aspectRatio: "4/3" }}>
              {/* Certificate skeleton */}
              <div className="w-full h-full bg-gray-100 p-6 animate-pulse">
                {/* Header skeleton */}
                <div className="flex justify-between mb-8">
                  <div className="h-16 w-32 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
                
                {/* Title skeleton */}
                <div className="flex flex-col items-center space-y-6 mb-8">
                  <div className="h-8 w-72 bg-gray-300 rounded mx-auto"></div>
                  <div className="h-1 w-32 bg-gray-200 rounded"></div>
                  
                  {/* Name and content skeleton */}
                  <div className="space-y-4 w-full max-w-md mx-auto">
                    <div className="h-4 w-40 bg-gray-200 rounded mx-auto"></div>
                    <div className="h-8 w-64 bg-gray-300 rounded mx-auto"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
                    <div className="h-6 w-80 bg-gray-200 rounded mx-auto"></div>
                    <div className="h-4 w-56 bg-gray-200 rounded mx-auto"></div>
                    <div className="h-6 w-40 bg-gray-300 rounded mx-auto"></div>
                  </div>
                  
                  {/* Stars skeleton */}
                  <div className="flex justify-center space-x-2 mt-4">
                    <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                
                {/* Footer skeleton */}
                <div className="flex justify-between items-end mt-12">
                  <div className="h-12 w-24 bg-gray-200 rounded"></div>
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-1 w-24 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="shadow-2xl rounded-lg overflow-hidden">
              <img 
                src={certificateImage} 
                alt="Your Certificate" 
                className="w-full h-auto object-contain"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onClick={downloadCertificate}
            className="gap-2 bg-blue-700 hover:bg-blue-800"
            disabled={isCertificateLoading}
          >
            <Download className="w-4 h-4" />
            Download Certificate
          </Button>
          <Button 
            variant="secondary"
            className="gap-2"
            onClick={handlePost}
            disabled={isCertificateLoading}
          >
            <Share2 className="w-4 h-4" />
            Share to Community
          </Button>
          <Button 
            variant="outline"
            className="gap-2"
            onClick={() => router.replace("/dashboard/careers/career-guide")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Additional Information */}
        <div className="text-center text-sm text-gray-600 mt-4 max-w-2xl mx-auto">
          <p className="mb-2">This certificate is issued by XORTCURT to verify the successful completion and proficiency in the {certificateData.certificationName} program.</p>
          <p>To verify the authenticity of this certificate, please visit xortcurt.com/verify and enter the certificate ID shown on the document.</p>
        </div>
      </div>
    </div>
  );
};  

export default CertificateDisplay;