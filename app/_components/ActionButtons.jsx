import React from 'react';

const ActionButtons = ({ 
  showViewReport = true, 
  showGetCertificate = true, 
  onViewReportClick = null,
  onCertificateClick = null,
  className = '',
  buttonSize = 'default' // 'small', 'default', 'large'
}) => {

  const handleViewReportClick = () => {
    if (onViewReportClick) {
      onViewReportClick();
    } else {
      console.log('View Report clicked - no handler provided');
    }
  };

  const handleCertificateClick = () => {
    if (onCertificateClick) {
      onCertificateClick();
    } else {
      // Default action - you can add default behavior here later
      console.log('Get Certificate clicked');
    }
  };

  // Size variants
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    default: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const buttonBaseClasses = `font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${sizeClasses[buttonSize]}`;

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {showViewReport && (
        <button 
          onClick={handleViewReportClick}
          className={`${buttonBaseClasses} bg-[#7824f6] hover:bg-[#6420d4] text-white`}
        >
          View Report
        </button>
      )}
      
      {showGetCertificate && (
        <button 
          onClick={handleCertificateClick}
          className={`${buttonBaseClasses} bg-transparent border-2 border-[#7824f6] text-[#7824f6] hover:bg-[#7824f6] hover:text-white`}
        >
          Get Certificate
        </button>
      )}
    </div>
  );
};

export default ActionButtons;