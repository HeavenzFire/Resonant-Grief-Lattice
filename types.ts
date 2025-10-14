
export type ColorTheme = 'violet' | 'emerald' | 'gold';

export interface GlyphState {
  complexity: number; // A value from 0 to 1 representing organization
  color: ColorTheme; // The dominant color theme
}
