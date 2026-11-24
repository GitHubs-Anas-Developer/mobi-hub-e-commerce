export function normalizePrice(value) {
  if (value === "") return "";

  const number = Number(value);

  if (!Number.isFinite(number)) return "";

  return String(Math.max(0, number));
}

export function updateMinPrice(value, maxPrice, setMinPrice, setMaxPrice) {
  const nextMin = normalizePrice(value);

  setMinPrice(nextMin);

  if (nextMin !== "" && maxPrice !== "" && Number(nextMin) > Number(maxPrice)) {
    setMaxPrice(nextMin);
  }
}

export function updateMaxPrice(value, minPrice, setMinPrice, setMaxPrice) {
  const nextMax = normalizePrice(value);

  setMaxPrice(nextMax);

  if (nextMax !== "" && minPrice !== "" && Number(nextMax) < Number(minPrice)) {
    setMinPrice(nextMax);
  }
}

export function getActiveFilterCount({ category, brand, minPrice, maxPrice }) {
  return [
    Boolean(category),
    Boolean(brand),
    Boolean(minPrice || maxPrice),
  ].filter(Boolean).length;
}
