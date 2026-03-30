export const f = "'DM Sans',sans-serif";
export const pf = "'Playfair Display',serif";

export const CAT_COLORS = {
  packing: '#6B8AFF',
  food: '#FF6B6B',
  sights: '#4ECDC4',
  nightlife: '#A855F7',
  monaco: '#FFD93D',
};

export const getCatColor = (catKey, cityColor) =>
  CAT_COLORS[catKey] || cityColor;

export const COLOR_PALETTE = [
  '#E63946','#2A9D8F','#457B9D','#F4A261',
  '#264653','#9B2226','#E9C46A','#8338EC',
  '#06D6A0','#FFB703','#FB8500','#3A86FF',
];
