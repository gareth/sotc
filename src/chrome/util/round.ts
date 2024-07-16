export const round = (x: number, precision: number) => {
  const factor = Math.pow(10, precision);
  return Math.round(x * factor) / factor;
};
