import type { ReactNode } from "react";
import MealServiceShell from "@/components/meal-service/MealServiceShell";

export default function MealServiceLayout({ children }: { children: ReactNode }) {
  return <MealServiceShell>{children}</MealServiceShell>;
}
