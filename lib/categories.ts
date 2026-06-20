// Delad kategorilista — används av både spara- och redigera-formulären.
export type CategoryOption = { value: string; label: string };

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "", label: "Kategori (frivillig)" },
  { value: "Bröd", label: "Bröd" },
  { value: "Pasta", label: "Pasta" },
  { value: "Mjöl/Bakning", label: "Mjöl/Bakning" },
  { value: "Godis/Snacks", label: "Godis/Snacks" },
  { value: "Mejeri", label: "Mejeri" },
  { value: "Flingor/Müsli", label: "Flingor/Müsli" },
  { value: "Såser/Kryddor", label: "Såser/Kryddor" },
  { value: "Färdigmat", label: "Färdigmat" },
  { value: "Dryck", label: "Dryck" },
  { value: "Övrigt", label: "Övrigt" },
];
