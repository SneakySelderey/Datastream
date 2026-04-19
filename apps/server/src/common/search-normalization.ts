const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const compactText = (value: string) => value.replace(/\s+/g, '');

export const normalizeSearchQuery = (query?: string | null) => {
  if (!query) return '';

  return normalizeText(query);
};

export const matchesNormalizedSearch = (
  values: Array<string | null | undefined>,
  normalizedQuery: string,
) => {
  if (!normalizedQuery) return true;

  const compactQuery = compactText(normalizedQuery);

  return values.some((value) => {
    if (!value) return false;

    const normalizedValue = normalizeText(value);

    return (
      normalizedValue.includes(normalizedQuery) ||
      compactText(normalizedValue).includes(compactQuery)
    );
  });
};
