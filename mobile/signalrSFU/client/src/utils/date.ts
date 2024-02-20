// convert a Date timestamp to ISO format but keeping it in the local timezone
export const getLocalTimestampISOString = (timestamp: Date): string => {
  timestamp.setTime(
    timestamp.getTime() + -1 * timestamp.getTimezoneOffset() * 60 * 1000,
  );
  return timestamp.toISOString();
};
