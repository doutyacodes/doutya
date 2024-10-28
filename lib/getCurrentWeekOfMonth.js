export const getCurrentWeekOfMonth = ()=> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const weekNumber = Math.ceil((today.getDate() + firstDayOfMonth.getDay()) / 7);
    return weekNumber;
}
