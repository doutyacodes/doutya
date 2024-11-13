"use client"
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Download, Share2, Badge, Calendar, XCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import GlobalApi from '@/app/_services/GlobalApi';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/app/_components/LoadingOverlay';
import SelectCommunity from '@/app/(innerPages)/dashboard/_components/SelectCommunityModal/SelectCommunity';

const CertificateDisplay = ({ params }) => {
  const { certificationId } = params;
  const [certificateData, setCertificateData] = useState([]);
  const [loading, setIsLoading] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false); // Modal visibility

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
        console.log(response.data);
      } else {
        toast.error("No Posts data available at the moment.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to Posts data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCertification();
  }, []);

    // Handle checkbox changes
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
      html2canvas(certificateElement).then(canvas => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${certificateData.certificationName}_Certificate.png`;
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
            className={`w-8 h-8 ${
              starNumber <= count
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const handlePost = ()=>{
    setShowCommunityModal(true);
  }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

    if (loading ) {
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

  // Regular certificate display
  return (
    <div className="min-h-screen bg-gray-50 p-8">
    {/* Modal for community selection */}
    {showCommunityModal && (
        <SelectCommunity
        handleCheckboxChange={handleCheckboxChange}
        selectedCommunities={selectedCommunities}
    />
    )}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Certificate Card */}
        <Card 
          id="certificate"
          className="p-8 bg-white relative overflow-hidden border-8 border-double border-gray-200"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }} />
          </div>

          {/* Certificate Content */}
          <div className="relative z-10 text-center space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <Badge className="w-16 h-16 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Certificate of Achievement</h1>
              <div className="h-px bg-gray-200 max-w-sm mx-auto" />
            </div>

            {/* Main Content */}
            <div className="space-y-6 py-8">
              <p className="text-lg text-gray-600">This is to certify that</p>
              <p className="text-3xl font-bold text-blue-600">{certificateData.userName}</p>
              <p className="text-lg text-gray-600">has successfully completed</p>
              <p className="text-2xl font-bold text-gray-900">{certificateData.certificationName}</p>
              
              {/* Stars and Score */}
              <div className="flex flex-col items-center space-y-4 py-4">
                {renderStars(certificateData.ratingStars)}
                <p className="text-xl font-semibold text-gray-700">
                  Score: {certificateData.scorePercentage}%
                </p>
              </div>

              {/* Date and Certificate ID */}
              <div className="flex justify-between text-sm text-gray-500 max-w-md mx-auto">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {certificateData.updatedAt}
                </div>
                <div>
                  Certificate ID: {certificateData.certificateId}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex justify-center">
                <img 
                  src="/api/placeholder/120/60" 
                  alt="Digital Signature" 
                  className="opacity-80"
                />
              </div>
              <p className="text-gray-600 mt-2">Authorized Signature</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button 
            onClick={downloadCertificate}
            className="gap-2"
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
            Post to Community
          </Button>
        </div>

        {/* Additional Information */}
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>This certificate verifies the completion of the {certificateData.certificationName} course.</p>
          <p>To verify this certificate's authenticity, please visit our verification portal.</p>
        </div>
      </div>
    </div>
  );
};

export default CertificateDisplay;