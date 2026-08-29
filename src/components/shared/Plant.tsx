// src/components/shared/Plant.tsx
import Image from "next/image";
import { getPlantImage } from "@/lib/plant/growth";

export default function Plant({
  level,
  size = 300,
  className = "",
}: {
  level: number;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={getPlantImage(level)}
      alt="Your Calmly plant"
      width={size}
      height={size}
      priority
      className={`object-contain ${className}`}
    />
  );
}