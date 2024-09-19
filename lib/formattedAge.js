export const formattedAge = (birthDateString) => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    // Calculate the exact age in years and months
    const months = today.getMonth() - birthDate.getMonth() + (12 * (today.getFullYear() - birthDate.getFullYear()));
    const exactAge = months / 12;
    
    // Determine the rounded age
    const integerPart = Math.floor(exactAge);
    const decimalPart = exactAge - integerPart;
    
    let roundedAge;
    if (decimalPart < 0.5) {
        roundedAge = integerPart;
    } else if (decimalPart < 0.75) {
        roundedAge = integerPart + 0.5;
    } else {
        roundedAge = integerPart + 0.5;
    }
    
    return roundedAge;
};
