
"use strict";

// HealthyBudget: estimated nutrition and food prices per 100 g.
const foods = [
  {
    id: "chicken",
    name: "Chicken breast",
    category: "Protein",
    icon: "🍗",
    calories: 120,
    protein: 23,
    carbs: 0,
    fat: 2.6,
    price: 18
  },
  {
    id: "egg",
    name: "Whole egg",
    category: "Protein",
    icon: "🥚",
    calories: 143,
    protein: 12.6,
    carbs: 0.7,
    fat: 9.5,
    price: 16
  },
  {
    id: "rice",
    name: "Cooked white rice",
    category: "Carbohydrate",
    icon: "🍚",
    calories: 130,
    protein: 2.7,
    carbs: 28.2,
    fat: 0.3,
    price: 5
  },
  {
    id: "tofu",
    name: "Firm tofu",
    category: "Protein",
    icon: "🧊",
    calories: 76,
    protein: 8,
    carbs: 1.9,
    fat: 4.8,
    price: 8
  },
  {
    id: "oats",
    name: "Rolled oats (dry)",
    category: "Carbohydrate",
    icon: "🥣",
    calories: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9,
    price: 12
  },
  {
    id: "banana",
    name: "Banana (edible portion)",
    category: "Fruit",
    icon: "🍌",
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    price: 5
  },
  {
    id: "tuna",
    name: "Canned tuna (drained)",
    category: "Protein",
    icon: "🐟",
    calories: 116,
    protein: 25.5,
    carbs: 0,
    fat: 0.8,
    price: 25
  },
  {
    id: "monggo",
    name: "Cooked mung beans",
    category: "Protein",
    icon: "🫘",
    calories: 105,
    protein: 7,
    carbs: 19,
    fat: 0.4,
    price: 7
  }
];

// Temporary defaults. We will make these configurable later.
const targets = {
  calories: 2400,
  protein: 160,
  carbs: 280,
  fat: 70,
  budget: 250
};

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];


const STORAGE_KEY = "healthybudget-v1";

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mealEntries, targets })
    );
  } catch (error) {
    console.error("Could not save HealthyBudget data:", error);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const data = JSON.parse(saved);

    if (data.targets && typeof data.targets === "object") {
      for (const key of ["calories", "protein", "carbs", "fat", "budget"]) {
        const value = Number(data.targets[key]);

        if (Number.isFinite(value) && value > 0) {
          targets[key] = value;
        }
      }
    }

    if (Array.isArray(data.mealEntries)) {
      mealEntries = data.mealEntries
        .filter((entry) =>
          entry &&
          foods.some((food) => food.id === entry.foodId) &&
          mealTypes.includes(entry.meal) &&
          Number.isFinite(entry.grams) &&
          entry.grams >= 1 &&
          entry.grams <= 3000 &&
          Number.isInteger(entry.entryId) &&
          entry.entryId > 0
        );

      nextEntryId = mealEntries.reduce(
        (max, entry) => Math.max(max, entry.entryId),
        0
      ) + 1;
    }
  } catch (error) {
    console.error("Could not load HealthyBudget data:", error);
  }
}

function populateTargetInputs() {
  $("#target-calories").value = targets.calories;
  $("#target-protein").value = targets.protein;
  $("#target-carbs").value = targets.carbs;
  $("#target-fat").value = targets.fat;
  $("#target-budget").value = targets.budget;
}

// Every entry represents one food added to a meal.
let mealEntries = [];
let nextEntryId = 1;

const $ = (selector) => document.querySelector(selector);

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric"
});

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP"
});

function formatNumber(value, decimals = 0) {
  return Number(value.toFixed(decimals)).toLocaleString("en-PH", {
    maximumFractionDigits: decimals
  });
}

function formatPeso(value) {
  return pesoFormatter.format(value);
}

// Calculate the nutrition and cost for an entered serving size.
function calculateFood(food, grams) {
  const multiplier = grams / 100;

  return {
    calories: food.calories * multiplier,
    protein: food.protein * multiplier,
    carbs: food.carbs * multiplier,
    fat: food.fat * multiplier,
    cost: food.price * multiplier
  };
}

function getTotals(entries = mealEntries) {
  return entries.reduce(
    (totals, entry) => {
      const food = foods.find((item) => item.id === entry.foodId);

      if (!food) return totals;

      const nutrition = calculateFood(food, entry.grams);

      totals.calories += nutrition.calories;
      totals.protein += nutrition.protein;
      totals.carbs += nutrition.carbs;
      totals.fat += nutrition.fat;
      totals.cost += nutrition.cost;

      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 }
  );
}

function updateProgress(fillId, value, target) {
  const percentage = target > 0 ? (value / target) * 100 : 0;

  // Cap the visual bar at 100%, while showing the actual total separately.
  $(fillId).style.width = `${Math.min(percentage, 100)}%`;
}

function renderNutrition() {
  const totals = getTotals();

  $("#calories-total").innerHTML =
    `${formatNumber(totals.calories)} <span>kcal</span>`;

  $("#protein-total").innerHTML =
    `${formatNumber(totals.protein, 1)} <span>g</span>`;

  $("#carbs-total").innerHTML =
    `${formatNumber(totals.carbs, 1)} <span>g</span>`;

  $("#fat-total").innerHTML =
    `${formatNumber(totals.fat, 1)} <span>g</span>`;

  $("#calories-target").textContent =
    `Target: ${formatNumber(targets.calories)} kcal`;

  $("#protein-target").textContent =
    `Target: ${formatNumber(targets.protein)} g`;

  $("#carbs-target").textContent =
    `Target: ${formatNumber(targets.carbs)} g`;

  $("#fat-target").textContent =
    `Target: ${formatNumber(targets.fat)} g`;

  updateProgress("#calories-progress", totals.calories, targets.calories);
  updateProgress("#protein-progress", totals.protein, targets.protein);
  updateProgress("#carbs-progress", totals.carbs, targets.carbs);
  updateProgress("#fat-progress", totals.fat, targets.fat);

  $("#daily-cost").textContent = formatPeso(totals.cost);
  $("#budget-amount").textContent = formatPeso(targets.budget);

  const remaining = targets.budget - totals.cost;
  const remainingElement = $("#budget-remaining");

  remainingElement.textContent = formatPeso(remaining);
  remainingElement.style.color = remaining < 0
    ? "var(--danger)"
    : "var(--text)";

  const budgetPercentage = targets.budget > 0
    ? (totals.cost / targets.budget) * 100
    : 0;

  $("#budget-progress").style.width =
    `${Math.min(budgetPercentage, 100)}%`;

  $("#budget-progress").classList.toggle(
    "over-budget",
    totals.cost > targets.budget
  );

  if (totals.cost === 0) {
    $("#budget-message").textContent =
      "Add foods to estimate your daily spending.";
  } else if (remaining < 0) {
    $("#budget-message").textContent =
      `You are ${formatPeso(Math.abs(remaining))} over budget.`;
  } else {
    $("#budget-message").textContent =
      `${formatPeso(remaining)} left in your daily budget.`;
  }

  const proteinPer100Pesos = totals.cost > 0
    ? (totals.protein / totals.cost) * 100
    : 0;

  $("#protein-efficiency").textContent = totals.cost > 0
    ? `${formatNumber(proteinPer100Pesos, 1)} g`
    : "—";

  $("#meal-count").textContent =
    `${mealEntries.length} ${mealEntries.length === 1 ? "food" : "foods"}`;
}

function renderMeals() {
  const container = $("#meal-list");
  container.replaceChildren();

  if (mealEntries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent =
      "Your meal plan is empty. Add a food to get started.";
    container.append(empty);
    return;
  }

  for (const mealType of mealTypes) {
    const entries = mealEntries.filter(
      (entry) => entry.meal === mealType
    );

    if (entries.length === 0) continue;

    const group = document.createElement("section");
    group.className = "meal-group";

    const heading = document.createElement("div");
    heading.className = "meal-group-heading";

    const title = document.createElement("span");
    title.textContent = mealType;

    const subtotal = document.createElement("span");
    subtotal.textContent = formatPeso(getTotals(entries).cost);

    heading.append(title, subtotal);
    group.append(heading);

    for (const entry of entries) {
      const food = foods.find((item) => item.id === entry.foodId);
      if (!food) continue;

      const nutrition = calculateFood(food, entry.grams);

      const row = document.createElement("div");
      row.className = "meal-item";

      const symbol = document.createElement("div");
      symbol.className = "food-symbol";
      symbol.textContent = food.icon;
      symbol.setAttribute("aria-hidden", "true");

      const info = document.createElement("div");
      info.className = "meal-item-info";

      const name = document.createElement("strong");
      name.textContent = food.name;

      const serving = document.createElement("span");
      serving.textContent =
        `${formatNumber(entry.grams)} g · ${formatNumber(nutrition.calories)} kcal`;

      info.append(name, serving);

      const values = document.createElement("div");
      values.className = "meal-item-values";

      const protein = document.createElement("strong");
      protein.textContent = `${formatNumber(nutrition.protein, 1)} g protein`;

      const cost = document.createElement("span");
      cost.textContent = formatPeso(nutrition.cost);

      values.append(protein, cost);

      const removeButton = document.createElement("button");
      removeButton.className = "remove-food";
      removeButton.type = "button";
      removeButton.textContent = "×";
      removeButton.setAttribute(
        "aria-label",
        `Remove ${food.name} from ${mealType}`
      );

      removeButton.addEventListener("click", () => {
        mealEntries = mealEntries.filter(
          (item) => item.entryId !== entry.entryId
        );

        saveState();
        renderApp();
      });

      row.append(symbol, info, values, removeButton);
      group.append(row);
    }

    container.append(group);
  }
}


function renderFoodLibrary() {
  const container = $("#food-library-list");
  const searchTerm = $("#food-search").value.trim().toLowerCase();
  const selectedCategory = $("#food-category").value;

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "All" || food.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  container.replaceChildren();

  if (filteredFoods.length === 0) {
    container.textContent = "No foods match your search.";
    return;
  }

  filteredFoods.forEach((food) => {
    const card = document.createElement("article");
    card.className = "food-card";

    const icon = document.createElement("span");
    icon.className = "food-icon";
    icon.textContent = food.icon;

    const details = document.createElement("div");
    details.className = "food-details";

    const name = document.createElement("h3");
    name.textContent = food.name;

    const category = document.createElement("p");
    category.textContent = food.category;

    const price = document.createElement("p");
    price.textContent = `${formatPeso(food.price)} per 100 g`;

    details.append(name, category, price);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "button button-secondary";
    addButton.textContent = "Add";
    addButton.addEventListener("click", () => openFoodDialog(food.id));

    card.append(icon, details, addButton);
    container.appendChild(card);
  });
}


function populateFoodSelect() {
  const select = $("#food-select");
  select.replaceChildren();

  for (const food of foods) {
    const option = document.createElement("option");
    option.value = food.id;
    option.textContent =
      `${food.name} — ${formatPeso(food.price)} / 100 g`;
    select.append(option);
  }
}

function openFoodDialog(foodId) {
  if (foodId) {
    $("#food-select").value = foodId;
  }

  $("#food-dialog").showModal();
  $("#food-grams").focus();
}

function renderApp() {
  renderNutrition();
  renderMeals();
}

function initializeApp() {
  loadState();
  populateTargetInputs();

  $("#current-date").textContent = dateFormatter.format(new Date());
  $("#food-search").addEventListener("input", renderFoodLibrary);
  $("#food-category").addEventListener("change", renderFoodLibrary);

  populateFoodSelect();
  renderFoodLibrary();
  renderApp();

  $("#add-food-button").addEventListener("click", () => {
    openFoodDialog();
  });

  $("#close-dialog").addEventListener("click", () => {
    $("#food-dialog").close();
  });

  $("#food-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const foodId = $("#food-select").value;
    const meal = $("#meal-select").value;
    const grams = Number($("#food-grams").value);

    const foodExists = foods.some((food) => food.id === foodId);
    const validMeal = mealTypes.includes(meal);

    if (
      !foodExists ||
      !validMeal ||
      !Number.isFinite(grams) ||
      grams < 1 ||
      grams > 3000
    ) {
      return;
    }

    mealEntries.push({
      entryId: nextEntryId++,
      foodId,
      meal,
      grams
    });
    saveState();
    renderApp();
    $("#food-dialog").close();
    $("#food-grams").value = "100";
  });
  
  $("#targets-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const fields = {
      calories: $("#target-calories"),
      protein: $("#target-protein"),
      carbs: $("#target-carbs"),
      fat: $("#target-fat"),
      budget: $("#target-budget")
    };

    const limits = {
      calories: [500, 10000],
      protein: [1, 500],
      carbs: [1, 1000],
      fat: [1, 300],
      budget: [1, 10000]
    };

    const newTargets = {};

    for (const [key, field] of Object.entries(fields)) {
      const value = Number(field.value);
      const [min, max] = limits[key];

      if (
        !Number.isFinite(value) ||
        value < min ||
        value > max
      ) {
        field.focus();
        return;
      }

      newTargets[key] = value;
    }

    Object.assign(targets, newTargets);

    saveState();
    renderApp();
  });

}

document.addEventListener("DOMContentLoaded", initializeApp);
