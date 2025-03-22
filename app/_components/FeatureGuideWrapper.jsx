import React, { useState } from 'react';
import FeatureGuideModal from './FeatureGuideModal';
import { featureGuides } from './featureGuides';

const FeatureGuideWrapper = ({ featureKey, children }) => {
  const [showGuide, setShowGuide] = useState(true);
  
  // Get the guide data for this feature
  const guideData = featureGuides[featureKey];
  
  if (!guideData) {
    console.warn(`No guide data found for feature key: ${featureKey}`);
    return children;
  }
  
  const handleGuideClose = () => {
    setShowGuide(false);
  };
  
  return (
    <>
      {showGuide && (
        <FeatureGuideModal
          featureKey={featureKey}
          title={guideData.title}
          content={guideData.content}
          onClose={handleGuideClose}
        />
      )}
      {children}
    </>
  );
};

export default FeatureGuideWrapper;