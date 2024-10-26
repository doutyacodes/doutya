import React from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const PricingCard = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Basic Plan */}
          <Card className="border-2 border-gray-200 relative overflow-hidden">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-xl">
                Basic Plan
                <span className="block text-sm font-normal text-gray-600 mt-1">
                  Get started with essential features
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-500" />
                  <span>Single country education & career suggestions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-500" />
                  <span>Add up to 2 careers</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <X size={20} />
                  <span>Manual career addition</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <X size={20} />
                  <span>Personalized feedback</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <X size={20} />
                  <span>Downloadable certificate</span>
                </li>
              </ul>
              <button className="w-full mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium">
                Current Plan
              </button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-blue-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm">
              RECOMMENDED
            </div>
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-xl">
                Pro Plan
                <span className="block text-sm font-normal text-gray-600 mt-1">
                  Unlock all premium features
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-500" />
                  <span>Multiple countries for education & career suggestions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-500" />
                  <span>Add up to 5 careers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-500" />
                  <span>Manual career addition beyond suggestions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-500" />
                  <span>Detailed personalized feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-green-500" />
                  <span>Premium certificate with custom design</span>
                </li>
              </ul>
              <button className="w-full mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium">
                Upgrade to Pro
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingCard;