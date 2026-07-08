import type { Allergen, Category, DietBase } from './types';

export const dietLabels: Record<DietBase, string> = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  pescatarian: 'Pescatarian',
  meat: 'Contains meat',
};

export const dietColorVar: Record<DietBase, string> = {
  vegan: 'var(--diet-vegan)',
  vegetarian: 'var(--diet-vegetarian)',
  pescatarian: 'var(--diet-pescatarian)',
  meat: 'var(--diet-meat)',
};

/** AA-safe text color for a diet pill sitting on a light tint of its own color. */
export const dietInkVar: Record<DietBase, string> = {
  vegan: 'var(--diet-vegan-ink)',
  vegetarian: 'var(--diet-vegetarian-ink)',
  pescatarian: 'var(--diet-pescatarian-ink)',
  meat: 'var(--diet-meat-ink)',
};

export const dietShort: Record<DietBase, string> = {
  vegan: 'Vegan',
  vegetarian: 'Veg',
  pescatarian: 'Fish',
  meat: 'Meat',
};

export const allergenLabels: Record<Allergen, string> = {
  gluten: 'Gluten',
  dairy: 'Dairy',
  egg: 'Egg',
  nuts: 'Nuts',
  shellfish: 'Shellfish',
  soy: 'Soy',
};

export const allergenGlyph: Record<Allergen, string> = {
  gluten: '🌾',
  dairy: '🥛',
  egg: '🥚',
  nuts: '🥜',
  shellfish: '🦐',
  soy: '🫘',
};

export const categoryLabels: Record<Category, string> = {
  noodles: 'Noodles',
  curry: 'Curry',
  grilled: 'Grilled',
  dumpling: 'Dumplings',
  soup: 'Soup',
  rice: 'Rice',
  bread: 'Bread',
  stew: 'Stew',
  salad: 'Salad',
  seafood: 'Seafood',
  dessert: 'Dessert',
  streetfood: 'Street food',
  sandwich: 'Sandwich',
  beverage: 'Beverage',
  pastry: 'Pastry',
};

export const spiceLabels = ['No spice', 'Mild', 'Medium', 'Hot'] as const;
