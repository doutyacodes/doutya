export const calculateAcademicPercentage = (academicYearStart, academicYearEnd) => {
    // Parse the start and end dates
    const [startYear, startMonth] = academicYearStart.split("-").map(Number);
    const [endYear, endMonth] = academicYearEnd.split("-").map(Number);
    
    // Get the current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1 for 1-12
  
    // Calculate total duration in months
    const totalDurationMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
  
    // Calculate elapsed months from start to current date
    const elapsedMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth);
  
    // Ensure elapsedMonths is capped at totalDurationMonths (100% complete)
    const completedMonths = Math.min(elapsedMonths, totalDurationMonths);
  
    // Calculate percentage completed
    const percentageCompleted = (completedMonths / totalDurationMonths) * 100;
  
    return percentageCompleted.toFixed(2); // Returns a string with two decimal places
  }