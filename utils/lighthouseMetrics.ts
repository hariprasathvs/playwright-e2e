export const extractLightHouseMetrics = (audits: any) => {
    return {
        First_Contentful_Paint: audits['first-contentful-paint']?.displayValue,
        Largest_Contentful_Paint: audits['largest-contentful-paint']?.displayValue,
        Speed_Index: audits['speed-index']?.displayValue,
        Time_to_Interactive: audits['interactive']?.displayValue,
        Cumulative_Layout_Shift: audits['cumulative-layout-shift']?.displayValue,
        Total_Blocking_Time: audits['total-blocking-time']?.displayValue,
    };
};