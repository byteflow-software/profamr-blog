"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
  categories: { id: number; slug: string; name: string }[];
  currentCategory?: string;
}

export function CategoryFilter({
  categories,
  currentCategory,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("categoria", value);
    } else {
      params.delete("categoria");
    }
    router.push(`/admin/wiki?${params.toString()}`);
  };

  return (
    <select
      className="admin-form-select"
      style={{ maxWidth: 200 }}
      defaultValue={currentCategory || ""}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="">Todas categorias</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.slug}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
