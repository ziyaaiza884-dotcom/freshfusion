/**
 * FAQ content — rendered on /faq and turned into FAQPage JSON-LD.
 * Answers containing "TODO-JAMSH" are placeholders waiting for real details;
 * they still show on the page but are left out of the structured data so
 * placeholder text never reaches Google.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export const FAQ: FaqGroup[] = [
  {
    title: "Freshness & storage",
    items: [
      {
        q: "How long do your pickles last?",
        a: "Unopened jars keep for TODO-JAMSH months from the batch date printed on the label. Once opened, keep the jar refrigerated and use within 3 months for the best taste.",
      },
      {
        q: "How should I store pickles after opening?",
        a: "Keep the jar refrigerated after opening, always use a clean, dry spoon, and make sure the oil covers the pickle. Moisture is what spoils a pickle, so never put a wet spoon in the jar.",
      },
      {
        q: "How fresh are the spices?",
        a: "Spices are packed in small batches so they reach you fragrant. Store them in an airtight container away from sunlight and heat. Whole spices keep their aroma for TODO-JAMSH months; ground spices for TODO-JAMSH months.",
      },
    ],
  },
  {
    title: "Ordering & delivery",
    items: [
      {
        q: "Which areas do you deliver to?",
        a: "We currently deliver to TODO-JAMSH (list cities / pin codes / states). Message us on WhatsApp if you're not sure whether we reach you.",
      },
      {
        q: "How long does delivery take?",
        a: "Every order is packed fresh within 48 hours. Delivery then takes TODO-JAMSH days depending on your location.",
      },
      {
        q: "How do I place an order?",
        a: "Add products to your cart and check out — your order opens in WhatsApp with everything filled in, and we confirm it with you there. You can also message us on WhatsApp or call to order directly.",
      },
      {
        q: "What is your return or refund policy?",
        a: "TODO-JAMSH (e.g. what happens if a jar arrives damaged or leaking, and how to contact you within how many days).",
      },
    ],
  },
  {
    title: "Ingredients & safety",
    items: [
      {
        q: "Is your kitchen FSSAI-approved?",
        a: "Yes. Fresh Fusion is an FSSAI-approved home kitchen. FSSAI licence number: TODO-JAMSH.",
      },
      {
        q: "Which products are vegetarian and which are non-veg?",
        a: "Beef and fish pickles are non-vegetarian. All other pickles, spices, dals, rice and specialty products are vegetarian. Every product page is labelled Vegetarian or Non-veg, and you can filter by diet in the shop.",
      },
      {
        q: "What about ingredients and allergens?",
        a: "Every product page lists its full ingredients and declared allergens. Our kitchen also handles mustard, sesame and tree nuts, so traces may be present in any product.",
      },
      {
        q: "Do you use preservatives?",
        a: "TODO-JAMSH (say whether you use any added preservatives, or only salt, oil and vinegar).",
      },
    ],
  },
];

export const isAnswered = (item: FaqItem) => !item.a.includes("TODO-JAMSH");
