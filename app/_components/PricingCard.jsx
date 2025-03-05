import React from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const PricingCard = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full overflow-hidden text-gray-50">
        <div className="p-6 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Basic Plan */}
          <Card className="border-2 border-gray-600 relative overflow-hidden bg-gray-800">
            <CardHeader className="bg-gray-800">
              <CardTitle className="text-xl text-white">
                Basic Plan
                <span className="block text-sm font-normal text-gray-300 mt-1">
                  Get started with essential features
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-center gap-2 text-gray-100">
                  <Check size={20} className="text-emerald-400" />
                  <span>Single country education & career suggestions</span>
                </li>
                <li className="flex items-center gap-2 text-gray-100">
                  <Check size={20} className="text-emerald-400" />
                  <span>Add up to 2 careers from the career suggestion</span>
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
              <button className="w-full mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                Current Plan
              </button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-blue-400 relative overflow-hidden bg-gray-800">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
              RECOMMENDED
            </div>
            <CardHeader className="bg-gray-800">
              <CardTitle className="text-xl text-white">
                Pro Plan
                <span className="block text-sm font-normal text-gray-300 mt-1">
                  Unlock all premium features
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-center gap-2 text-gray-100">
                  <Check size={20} className="text-emerald-400" />
                  <span>Multiple countries for education & career suggestions</span>
                </li>
                <li className="flex items-center gap-2 text-gray-100">
                  <Check size={20} className="text-emerald-400" />
                  <span>Add up to 5 careers</span>
                </li>
                <li className="flex items-center gap-2 text-gray-100">
                  <Check size={20} className="text-emerald-400" />
                  <span>Manual career addition beyond suggestions</span>
                </li>
                <li className="flex items-center gap-2 text-gray-100">
                  <Check size={20} className="text-emerald-400" />
                  <span>Detailed personalized feedback</span>
                </li>
                <li className="flex items-center gap-2 text-gray-100">
                  <Check size={20} className="text-emerald-400" />
                  <span>Premium certificate with custom design</span>
                </li>
              </ul>
              <button className="w-full mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
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