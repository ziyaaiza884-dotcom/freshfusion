const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatPrice = (value: number) => inr.format(value);

export const formatWeight = (weight: number, unit: "g" | "ml") => {
  if (unit === "g" && weight >= 1000) return `${weight / 1000} kg`;
  if (unit === "ml" && weight >= 1000) return `${weight / 1000} L`;
  return `${weight} ${unit}`;
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** "Free delivery above ₹X" threshold used across the app */
export const FREE_DELIVERY_THRESHOLD = 799;
export const DELIVERY_FEE = 49;
export const PACKAGING_FEE = 25;
export const GST_RATE = 0;
