"use client"
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Download, Share2, Badge, Calendar, XCircle, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import GlobalApi from '@/app/_services/GlobalApi';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/app/_components/LoadingOverlay';
import SelectCommunity from '@/app/(innerPages)/dashboard/_components/SelectCommunityModal/SelectCommunity';

// const CertificateDisplay = ({ params }) => {
//   const { certificationId } = params;
//   const [certificateData, setCertificateData] = useState([]);
//   const [loading, setIsLoading] = useState(false);
//   const [showCommunityModal, setShowCommunityModal] = useState(false); // Modal visibility

//   const [selectedCommunities, setSelectedCommunities] = useState({
//     global: false,
//     countrySpecific: false
//   });

//   const getCertification = async () => {
//     setIsLoading(true);
//     try {
//       const token =
//         typeof window !== "undefined" ? localStorage.getItem("token") : null;
//       if (!token) {
//         setIsLoading(false);
//         return;
//       }

//       const response = await GlobalApi.GetCertificationResult(token, certificationId);
//       if (response.status === 200) {
//         setCertificateData(response.data);
//         console.log(response.data);
//       } else {
//         toast.error("No Posts data available at the moment.");
//       }
//     } catch (err) {
//       console.log(err);
//       toast.error("Failed to Posts data. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     getCertification();
//   }, []);

//     // Handle checkbox changes
//     const handleCheckboxChange = (community, isChecked) => {
//         if (community === 'global') {
//             setSelectedCommunities((prevState) => ({ ...prevState, global: isChecked }));
//         } else if (community === 'countrySpecific') {
//             setSelectedCommunities((prevState) => ({ ...prevState, countrySpecific: isChecked }));
//         }
//     };

//   const downloadCertificate = () => {
//     const certificateElement = document.getElementById('certificate');
//     if (certificateElement) {
//       html2canvas(certificateElement).then(canvas => {
//         const image = canvas.toDataURL('image/png');
//         const link = document.createElement('a');
//         link.download = `${certificateData.certificationName}_Certificate.png`;
//         link.href = image;
//         link.click();
//       });
//     }
//   };

//   const renderStars = (count) => {
//     return (
//       <div className="flex gap-2">
//         {[1, 2, 3].map((starNumber) => (
//           <Star
//             key={starNumber}
//             className={`w-8 h-8 ${
//               starNumber <= count
//                 ? 'fill-yellow-400 text-yellow-400'
//                 : 'fill-gray-200 text-gray-200'
//             }`}
//           />
//         ))}
//       </div>
//     );
//   };

//   const handlePost = ()=>{
//     setShowCommunityModal(true);
//   }

//     if (loading ) {
//         return (
//         <div className="h-screen flex items-center justify-center text-white">
//             <div>
//             <div className="font-semibold">
//                 <LoadingOverlay loadText={"Loading..."} />
//             </div>
//             </div>
//         </div>
//         );
//     }

//   // Show ineligible message if score is 0
//   if (certificateData.ratingStars === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-8">
//         <div className="max-w-2xl mx-auto">
//           <Card className="p-8 text-center space-y-6">
//             <div className="flex justify-center">
//               <XCircle className="w-20 h-20 text-red-500" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900">Not Eligible for Certificate</h2>
//             <p className="text-gray-600">
//               Unfortunately, you haven't achieved the minimum required score to receive this certification.
//             </p>
//             <div className="space-y-2 text-sm text-gray-500">
//               <p>To earn this certificate, you need to:</p>
//               <ul className="list-disc list-inside">
//                 <li>Complete all required questions</li>
//                 <li>Achieve a passing score</li>
//                 <li>Meet all certification requirements</li>
//               </ul>
//             </div>
//             <Button 
//               variant="secondary"
//               onClick={() => window.history.back()}
//               className="mt-4"
//             >
//               Return to Previous Page
//             </Button>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   // Regular certificate display
//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//     {/* Modal for community selection */}
//     {showCommunityModal && (
//         <SelectCommunity
//         handleCheckboxChange={handleCheckboxChange}
//         selectedCommunities={selectedCommunities}
//     />
//     )}
//       <div className="max-w-4xl mx-auto space-y-6">
//         {/* Certificate Card */}
//         <Card 
//           id="certificate"
//           className="p-8 bg-white relative overflow-hidden border-8 border-double border-gray-200"
//         >
//           {/* Background Pattern */}
//           <div className="absolute inset-0 opacity-5">
//             <div className="absolute inset-0" style={{
//               backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
//             }} />
//           </div>

//           {/* Certificate Content */}
//           <div className="relative z-10 text-center space-y-6">
//             {/* Header */}
//             <div className="space-y-4">
//               <div className="flex justify-center">
//                 <Badge className="w-16 h-16 text-blue-600" />
//               </div>
//               <h1 className="text-3xl font-bold text-gray-900">Certificate of Achievement</h1>
//               <div className="h-px bg-gray-200 max-w-sm mx-auto" />
//             </div>

//             {/* Main Content */}
//             <div className="space-y-6 py-8">
//               <p className="text-lg text-gray-600">This is to certify that</p>
//               <p className="text-3xl font-bold text-blue-600">{certificateData.userName}</p>
//               <p className="text-lg text-gray-600">has successfully completed</p>
//               <p className="text-2xl font-bold text-gray-900">{certificateData.certificationName}</p>
              
//               {/* Stars and Score */}
//               <div className="flex flex-col items-center space-y-4 py-4">
//                 {renderStars(certificateData.ratingStars)}
//                 <p className="text-xl font-semibold text-gray-700">
//                   Score: {certificateData.scorePercentage}%
//                 </p>
//               </div>

//               {/* Date and Certificate ID */}
//               <div className="flex justify-center text-sm text-gray-500 max-w-md mx-auto">
//                 <div className="flex items-center gap-1">
//                   <Calendar className="w-4 h-4" />
//                   {certificateData.updatedAt}
//                 </div>
//                 {/* <div>
//                   Certificate ID: {certificateData.certificateId}
//                 </div> */}
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="pt-8 border-t border-gray-200">
//               <div className="flex justify-center">
//                 <img 
//                   src="/api/placeholder/120/60" 
//                   alt="Digital Signature" 
//                   className="opacity-80"
//                 />
//               </div>
//               <p className="text-gray-600 mt-2">Authorized Signature</p>
//             </div>
//           </div>
//         </Card>

//         {/* Action Buttons */}
//         <div className="flex justify-center gap-4">
//           <Button 
//             onClick={downloadCertificate}
//             className="gap-2"
//           >
//             <Download className="w-4 h-4" />
//             Download Certificate
//           </Button>
//           <Button 
//             variant="secondary"
//             className="gap-2"
//             onClick={handlePost}
//           >
//             <Share2 className="w-4 h-4" />
//             Post to Community
//           </Button>
//         </div>

//         {/* Additional Information */}
//         <div className="text-center text-sm text-gray-500 mt-4">
//           <p>This certificate verifies the completion of the {certificateData.certificationName} course.</p>
//           <p>To verify this certificate's authenticity, please visit our verification portal.</p>
//         </div>
//       </div>
//     </div>
//   );
// };

const CertificateDisplay = ({ params }) => {
  const { certificationId } = params;
  const [certificateData, setCertificateData] = useState({});
  const [loading, setIsLoading] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [certificateIdFormatted, setCertificateIdFormatted] = useState("");

  const [selectedCommunities, setSelectedCommunities] = useState({
    global: false,
    countrySpecific: false
  });

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
        
        // Generate a certificate ID format: XCT-[user first 3 chars]-[certification first 3 chars]-[certificationId]
        const userInitials = response.data.userName ? response.data.userName.substring(0, 3).toUpperCase() : "XXX";
        const certInitials = response.data.certificationName ? response.data.certificationName.substring(0, 3).toUpperCase() : "XXX";
        const formattedId = `XCT-${userInitials}-${certInitials}-${certificationId}`;
        setCertificateIdFormatted(formattedId);
        
        console.log(response.data);
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

  const handleCheckboxChange = (community, isChecked) => {
    if (community === 'global') {
      setSelectedCommunities((prevState) => ({ ...prevState, global: isChecked }));
    } else if (community === 'countrySpecific') {
      setSelectedCommunities((prevState) => ({ ...prevState, countrySpecific: isChecked }));
    }
  };

  const downloadCertificate = () => {
    const certificateElement = document.getElementById('certificate');
    if (certificateElement) {
      // Create a fixed size canvas to maintain aspect ratio
      const options = {
        width: 1754, // Fixed width for consistent quality
        height: 1240, // Maintaining 16:9 aspect ratio approximately
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      };
      
      html2canvas(certificateElement, options).then(canvas => {
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `XORTCURT_${certificateData.certificationName}_Certificate_${certificateData.userName.replace(/\s+/g, '_')}.png`;
        link.href = image;
        link.click();
      });
    }
  };

  const renderStars = (count) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((starNumber) => (
          <Star
            key={starNumber}
            className={`w-6 h-6 ${
              starNumber <= count
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const handlePost = () => {
    setShowCommunityModal(true);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <div>
          <div className="font-semibold">
            <LoadingOverlay loadText={"Loading..."} />
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => window.history.back()}
              className="mt-4"
            >
              Return to Previous Page
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Format the date in a more formal way
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
      {/* Certificate Preview Wrapper - using more flexible containment */}
      <div className="relative w-full mb-8">
        {/* Certificate Card - With more responsive sizing */}
        <Card 
          id="certificate"
          className="w-full overflow-hidden border-0 shadow-2xl"
          style={{ 
            background: "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)",
            minHeight: "700px" // Minimum height to ensure content fits
          }}
        >
          {/* Border Design */}
          <div className="absolute inset-0 border-16 border-double border-opacity-20 pointer-events-none" style={{ borderColor: '#1a365d', padding: "24px" }}></div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
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

          {/* Certificate Content - Using more flexible spacing */}
          <div className="relative z-10 flex flex-col items-center justify-between h-full p-6 md:p-10 py-8 md:py-12">
            {/* Header with Logo */}
            <div className="w-full flex justify-between items-center mb-6">
              <div className="flex items-center">
                {/* Company Logo */}
                <img 
                  src="/assets/images/doutya4.png" 
                  alt="XORTCURT" 
                  className="h-12 md:h-16 object-contain"
                />
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-gray-600 font-semibold">Certificate ID: {certificateIdFormatted}</p>
                <p className="text-xs md:text-sm text-gray-600">Issue Date: {formatDate(certificateData.updatedAt)}</p>
              </div>
            </div>

            {/* Main Content - More adaptive sizing */}
            <div className="space-y-4 md:space-y-5 py-4 text-center w-full max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">
                CERTIFICATE OF ACHIEVEMENT
              </h1>
              
              <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-blue-900 to-transparent"></div>
              
              <p className="text-base md:text-lg text-gray-700">This certifies that</p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-blue-800 uppercase tracking-wider py-1 md:py-2">
                {certificateData.userName || certificateData.username}
              </h2>
              
              <p className="text-base md:text-lg text-gray-700">has successfully completed the</p>
              
              <h3 className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight">
                {certificateData.certificationName}
              </h3>
              
              <p className="text-base md:text-lg text-gray-700">
                and is recognized for demonstrating proficiency in the field of
              </p>
              
              <p className="text-lg md:text-xl font-semibold text-blue-800">
                {certificateData.careerField || "Professional Development"}
              </p>
              
              {/* Stars and Score */}
              <div className="flex flex-col items-center space-y-2 py-3">
                {renderStars(certificateData.ratingStars)}
                <p className="text-lg md:text-xl font-semibold text-blue-900">
                  With a score of {certificateData.scorePercentage}%
                </p>
              </div>
            </div>

            {/* Footer with Signature - More adaptive layout */}
            <div className="w-full flex justify-between items-end mt-4">
              <div className="text-left">
                <p className="text-xs md:text-sm text-gray-600">
                  Verify this certificate at:<br />
                  <span className="font-medium">xortcurt.com/verify</span>
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <img 
                    src="/api/placeholder/120/60" 
                    alt="Digital Signature" 
                    className="h-12 md:h-16 object-contain"
                  />
                </div>
                <div className="h-px w-32 md:w-40 bg-gray-400 mb-2"></div>
                <p className="text-xs md:text-sm font-medium text-gray-700">Program Director</p>
              </div>
              
              <div className="text-right">
                <div className="flex justify-end mb-1">
                  {/* Company seal/emblem */}
                  <div className="w-12 h-12 md:w-16 md:h-16 flex items-center">
                      {/* Company Logo */}
                      <img 
                        src="/assets/images/small-logo.png" 
                        alt="XORTCURT" 
                        className="h-12 md:h-16 object-contain"
                      />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button 
          onClick={downloadCertificate}
          className="gap-2 bg-blue-700 hover:bg-blue-800"
        >
          <Download className="w-4 h-4" />
          Download Certificate
        </Button>
        <Button 
          variant="secondary"
          className="gap-2"
          onClick={handlePost}
        >
          <Share2 className="w-4 h-4" />
          Share to Community
        </Button>
        <Button 
          variant="outline"
          className="gap-2"
          onClick={() => window.history.back()}
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