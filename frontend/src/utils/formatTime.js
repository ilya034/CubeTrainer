export const formatTime = (ms) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor((ms % 1000) / 10);
  return `${s}.${m.toString().padStart(2, '0')}`;
};