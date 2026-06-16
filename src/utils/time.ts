
export const TODAY = new Date();

TODAY.setDate(1);
TODAY.setHours(0, 0, 0, 0);

export const MONTHS = Array.from({ length: 18 }, (_, i) => {
  const d = new Date(TODAY);
  d.setMonth(TODAY.getMonth() + i);
  return {
    value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    label: d.toLocaleDateString("en-CA", { month: "short", year: "numeric" }),
  };
});