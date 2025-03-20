// export const formattedAge = (birthDateString) => {
//     const birthDate = new Date(birthDateString);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDifference = today.getMonth() - birthDate.getMonth();
//     if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
//         age--;
//     }
    
//     // Calculate the exact age in years and months
//     const months = today.getMonth() - birthDate.getMonth() + (12 * (today.getFullYear() - birthDate.getFullYear()));
//     const exactAge = months / 12;
    
//     // Determine the rounded age
//     const integerPart = Math.floor(exactAge);
//     const decimalPart = exactAge - integerPart;
    
//     let roundedAge;
//     if (decimalPart < 0.5) {
//         roundedAge = integerPart;
//     } else if (decimalPart < 0.75) {
//         roundedAge = integerPart + 0.5;
//     } else {
//         roundedAge = integerPart + 0.5;
//     }
    
//     return roundedAge;
// };


export const formattedAge = (birthDateString) => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    
    // Calculate age in years
    let years = today.getFullYear() - birthDate.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        years--;
    }
    
    // Calculate exact months since birth
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) {
        months += 12;
    }
    
    // Account for day difference
    if (today.getDate() < birthDate.getDate()) {
        months--;
        if (months < 0) {
            months = 11;
        }
    }
    
    // Format the age according to the specified requirements
    if (months === 0 || months === 1) {
        return years; // Return just the years if 0 or 1 month
    } else if (months === 2 || months === 3) {
        return years + 0.2; // 2-3 months = .2
    } else if (months === 4 || months === 5) {
        return years + 0.4; // 4-5 months = .4
    } else if (months === 6 || months === 7) {
        return years + 0.6; // 6-7 months = .6
    } else if (months === 8 || months === 9) {
        return years + 0.8; // 8-9 months = .8
    } else {
        return years + 0.10; // 10-11 months = .10
    }
};