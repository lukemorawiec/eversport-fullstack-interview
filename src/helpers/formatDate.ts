export const formatDate = (date: Date): string => date.toISOString();
// legacy endpoint creates date formats "2025-03-17T12:34:56.789Z", that's why I used formatting to maintain consistency.
