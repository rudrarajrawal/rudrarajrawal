/*
 * Pure vegetarian meal database — no egg, no meat, no fish.
 * Values are per standard home-cooked serving; kcal/protein/carbs/fat in g (kcal in kcal).
 * `tags` includes "high-protein" for anything >= 12g protein per serving, useful for gym goals.
 */

const MEALS = [
  // ---- Breakfast ----
  { id: "poha", name: "Poha", category: "Breakfast", kcal: 250, protein: 5, carbs: 45, fat: 7 },
  { id: "idli-sambar", name: "Idli (2) with Sambar", category: "Breakfast", kcal: 190, protein: 7, carbs: 34, fat: 3 },
  { id: "veg-upma", name: "Vegetable Upma", category: "Breakfast", kcal: 220, protein: 6, carbs: 36, fat: 6 },
  { id: "aloo-paratha", name: "Aloo Paratha with Curd", category: "Breakfast", kcal: 320, protein: 8, carbs: 46, fat: 12 },
  { id: "moong-chilla", name: "Moong Dal Chilla (2)", category: "Breakfast", kcal: 200, protein: 12, carbs: 26, fat: 6 },
  { id: "besan-chilla", name: "Besan Chilla (2)", category: "Breakfast", kcal: 180, protein: 9, carbs: 22, fat: 7 },
  { id: "oats-milk", name: "Oats with Milk & Fruit", category: "Breakfast", kcal: 250, protein: 9, carbs: 40, fat: 6 },
  { id: "dosa-sambar", name: "Plain Dosa with Sambar", category: "Breakfast", kcal: 210, protein: 6, carbs: 38, fat: 4 },

  // ---- Lunch / Dinner ----
  { id: "dal-rice-sabzi", name: "Dal, Rice, Sabzi & 2 Roti", category: "Lunch/Dinner", kcal: 550, protein: 18, carbs: 85, fat: 14 },
  { id: "rajma-chawal", name: "Rajma Chawal", category: "Lunch/Dinner", kcal: 450, protein: 16, carbs: 75, fat: 8 },
  { id: "chole-roti", name: "Chole with 2 Roti", category: "Lunch/Dinner", kcal: 480, protein: 16, carbs: 68, fat: 14 },
  { id: "paneer-butter-masala", name: "Paneer Butter Masala with 2 Roti", category: "Lunch/Dinner", kcal: 600, protein: 22, carbs: 52, fat: 32 },
  { id: "palak-paneer-roti", name: "Palak Paneer with 2 Roti", category: "Lunch/Dinner", kcal: 420, protein: 20, carbs: 44, fat: 18 },
  { id: "veg-pulao", name: "Vegetable Pulao", category: "Lunch/Dinner", kcal: 380, protein: 8, carbs: 62, fat: 10 },
  { id: "curd-rice", name: "Curd Rice", category: "Lunch/Dinner", kcal: 300, protein: 9, carbs: 48, fat: 8 },
  { id: "kadhi-chawal", name: "Kadhi Chawal", category: "Lunch/Dinner", kcal: 350, protein: 10, carbs: 55, fat: 9 },
  { id: "mixed-veg-dal-roti", name: "Mixed Veg Sabzi, Dal & 2 Roti", category: "Lunch/Dinner", kcal: 480, protein: 17, carbs: 70, fat: 12 },
  { id: "soya-chunks-curry", name: "Soya Chunks Curry with 2 Roti", category: "Lunch/Dinner", kcal: 430, protein: 28, carbs: 48, fat: 12 },
  { id: "paneer-tikka", name: "Paneer Tikka (8 pcs)", category: "Lunch/Dinner", kcal: 350, protein: 24, carbs: 10, fat: 24 },
  { id: "tofu-bhurji-roti", name: "Tofu Bhurji with 2 Roti", category: "Lunch/Dinner", kcal: 380, protein: 22, carbs: 42, fat: 14 },

  // ---- Snacks ----
  { id: "roasted-chana", name: "Roasted Chana (30g)", category: "Snacks", kcal: 130, protein: 7, carbs: 20, fat: 2 },
  { id: "sprouts-salad", name: "Sprouts Salad", category: "Snacks", kcal: 150, protein: 9, carbs: 22, fat: 3 },
  { id: "fruit-bowl", name: "Mixed Fruit Bowl", category: "Snacks", kcal: 100, protein: 1, carbs: 25, fat: 0 },
  { id: "peanut-butter-toast", name: "Peanut Butter Toast (2 slices)", category: "Snacks", kcal: 220, protein: 8, carbs: 24, fat: 11 },
  { id: "buttermilk", name: "Buttermilk (Chaas)", category: "Snacks", kcal: 60, protein: 3, carbs: 5, fat: 3 },
  { id: "mixed-nuts", name: "Mixed Nuts (30g)", category: "Snacks", kcal: 180, protein: 6, carbs: 6, fat: 15 },
  { id: "curd-bowl", name: "Curd Bowl (1 cup)", category: "Snacks", kcal: 120, protein: 7, carbs: 9, fat: 6 },
  { id: "protein-shake", name: "Whey/Plant Protein Shake", category: "Snacks", kcal: 150, protein: 24, carbs: 6, fat: 2 },
  { id: "sprouts-peanut-salad", name: "Sprouts & Peanut Salad", category: "Snacks", kcal: 210, protein: 12, carbs: 20, fat: 9 },
  { id: "paneer-cubes", name: "Grilled Paneer Cubes (100g)", category: "Snacks", kcal: 265, protein: 18, carbs: 4, fat: 20 },
];

const MEAL_CATEGORIES = ["Breakfast", "Lunch/Dinner", "Snacks"];

function isHighProtein(meal) {
  return meal.protein >= 12;
}
