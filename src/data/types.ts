export type Category = "pickles" | "spices" | "specialty" | "pulses" | "rice";
export type Dietary = "veg" | "nonveg";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  dietary: Dietary;
  /** price in INR for the default pack */
  price: number;
  weight: number;
  unit: "g" | "ml";
  /** short one-liner for cards */
  blurb: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  inStock: boolean;
  isHot: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  madeOn: string; // ISO date — "home-cooked, made-on" freshness cue
  /** tailwind gradient classes used for the placeholder art */
  art: string;
  /** related product slugs for cross-sell */
  related: string[];
}

export const CATEGORY_LABELS: Record<Category, string> = {
  pickles: "Pickles",
  spices: "Spices",
  specialty: "Specialty",
  pulses: "Pulses",
  rice: "Rice",
};

export const DIETARY_LABELS: Record<Dietary, string> = {
  veg: "Vegetarian",
  nonveg: "Non-veg",
};
