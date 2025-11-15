export const patients = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Patient ${i + 1}`,
  bed: `Bed ${i + 1}`,
}));
