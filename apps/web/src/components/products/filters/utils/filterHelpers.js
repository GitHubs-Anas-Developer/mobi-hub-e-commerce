export const normalizePrice = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? String(parsed) : "";
};

export const getActiveFilterCount = ({
  category = "",
  brand = "",
  minPrice = "",
  maxPrice = "",
}) => {
  let count = 0;

  if (category) count += 1;
  if (brand) count += 1;
  if (minPrice !== "" || maxPrice !== "") count += 1;

  return count;
};

export const updateMinPrice = (raw, maxPrice, setMinPrice, setMaxPrice) => {
  if (raw === "") {
    setMinPrice("");
    return;
  }

  const numericValue = Math.max(0, Number(raw) || 0);
  setMinPrice(String(numericValue));

  if (maxPrice !== "" && numericValue > Number(maxPrice)) {
    setMaxPrice(String(numericValue));
  }
};

export const updateMaxPrice = (raw, minPrice, setMinPrice, setMaxPrice) => {
  if (raw === "") {
    setMaxPrice("");
    return;
  }

  const numericValue = Math.max(0, Number(raw) || 0);
  setMaxPrice(String(numericValue));

  if (minPrice !== "" && numericValue < Number(minPrice)) {
    setMinPrice(String(numericValue));
  }
};
