export const getCurrentWeekOfAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const today = new Date();

    // Calculate the current age in years
    let age = today.getFullYear() - birthDate.getFullYear();
    
    // Adjust if birthday hasn't happened yet this year
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (today < thisYearBirthday) {
        age -= 1;
    }

    // Calculate the most recent birthday
    const lastBirthday = new Date(today.getFullYear() - (today < thisYearBirthday ? 1 : 0), birthDate.getMonth(), birthDate.getDate());
    
    // Calculate the difference in days between last birthday and today
    const diffInDays = Math.floor((today - lastBirthday) / (1000 * 60 * 60 * 24));

    // Convert days to weeks (starting from 1)
    const weekOfAge = Math.floor(diffInDays / 7) + 1;

    return weekOfAge;
}