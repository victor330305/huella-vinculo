'use client';
import { useRouter } from 'next/navigation';

export function DogSelector({
  dogs,
  value,
  basePath,
}: {
  dogs: { id: string; name: string }[];
  value: string | null;
  basePath: string;
}) {
  const router = useRouter();
  return (
    <select
      value={value ?? ''}
      onChange={(e) => router.push(`${basePath}?dogId=${e.target.value}`)}
      className="border border-primary-300 rounded px-3 py-2 text-primary-700 bg-white"
    >
      {dogs.map((d) => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </select>
  );
}
