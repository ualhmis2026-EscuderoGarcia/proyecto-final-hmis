export const calculateDaysPassed = (dateString) => {
  if (!dateString) return 0;
  const createdDate = new Date(dateString).getTime();
  const today = new Date().getTime();
  const diffTime = today - createdDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
