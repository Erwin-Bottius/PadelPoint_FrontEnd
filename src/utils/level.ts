import { Palette } from "@/constants/theme";

export function getLevelLabel(
  levelMin: number | null,
  levelMax: number | null,
): string {
  if (!levelMin && !levelMax) return "Ouvert à tous";
  if (levelMin && levelMax) return `Niv. ${levelMin}–${levelMax}`;
  return `Niv. ${levelMin ?? levelMax}`;
}

export function getLevelColors(levelMax: number | null): {
  bg: string;
  color: string;
} {
  if (!levelMax) return { bg: Palette.successLight, color: Palette.success };
  if (levelMax >= 8) return { bg: Palette.levelEliteLight, color: Palette.levelElite };
  if (levelMax >= 6) return { bg: Palette.levelAdvancedLight, color: Palette.levelAdvanced };
  if (levelMax >= 4) return { bg: Palette.levelIntermediateLight, color: Palette.levelIntermediate };
  return { bg: Palette.levelBeginnerLight, color: Palette.levelBeginner };
}
