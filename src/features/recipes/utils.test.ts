import { describe, expect, it } from 'vitest';
import type { Recipe } from '@/types';
import { filterRecipes, isQuick, parseMinutes } from './utils';

const recipe = (overrides: Partial<Recipe>): Recipe => ({
  id: 'id',
  title: 'Title',
  description: '',
  image: '',
  images: [],
  prep_time: '10 min',
  cook_time: '5 min',
  servings: 1,
  difficulty: 'Easy',
  ingredients: [],
  instructions: [],
  category: 'Breakfast',
  category_id: 'c1',
  category_slug: 'breakfast',
  is_featured: false,
  youtube_link: null,
  created_at: '',
  updated_at: '',
  ...overrides,
});

describe('parseMinutes', () => {
  it.each([
    ['10 min', 10],
    ['10', 10],
    ['5 minutes', 5],
    ['1 hr', 60],
    ['1 hr 20 min', 80],
    ['1.5 hours', 90],
    ['2h', 120],
    ['၁၀ မိနစ်', 10],
    ['၁ နာရီ', 60],
  ])('reads %s as %i minutes', (text, expected) => {
    expect(parseMinutes(text)).toBe(expected);
  });

  it.each(['', 'overnight', 'a while', null, undefined])('cannot read %s', (text) => {
    expect(parseMinutes(text)).toBeNull();
  });
});

describe('isQuick', () => {
  it('accepts ten minutes or less', () => {
    expect(isQuick(recipe({ prep_time: '10 min' }))).toBe(true);
    expect(isQuick(recipe({ prep_time: '11 min' }))).toBe(false);
  });

  it('does not mistake an hour for a minute', () => {
    expect(isQuick(recipe({ prep_time: '1 hr' }))).toBe(false);
  });

  it('is false when the time cannot be read', () => {
    expect(isQuick(recipe({ prep_time: 'overnight' }))).toBe(false);
  });
});

describe('filterRecipes', () => {
  const eggs = recipe({ id: 'eggs', title: 'Fried egg rice', ingredients: ['2 eggs', 'rice'], prep_time: '5 min' });
  const soup = recipe({ id: 'soup', title: 'Chicken soup', category: 'Soup', prep_time: '30 min' });
  const cake = recipe({ id: 'cake', title: 'Lemon cake', category: 'Dessert', description: 'Sweet and sharp', prep_time: '1 hr' });
  const all = [eggs, soup, cake];

  it('returns everything when no filter is on', () => {
    expect(filterRecipes(all, {})).toEqual(all);
  });

  it('searches title, description, category and ingredients, ignoring case', () => {
    expect(filterRecipes(all, { query: 'CHICKEN' })).toEqual([soup]);
    expect(filterRecipes(all, { query: 'sharp' })).toEqual([cake]);
    expect(filterRecipes(all, { query: 'dessert' })).toEqual([cake]);
    expect(filterRecipes(all, { query: 'eggs' })).toEqual([eggs]);
  });

  it('needs every word, in any order', () => {
    expect(filterRecipes(all, { query: 'egg fried' })).toEqual([eggs]);
    expect(filterRecipes(all, { query: 'egg soup' })).toEqual([]);
  });

  it('filters by category, quick and saved, together', () => {
    expect(filterRecipes(all, { category: 'Soup' })).toEqual([soup]);
    expect(filterRecipes(all, { quickOnly: true })).toEqual([eggs]);
    expect(filterRecipes(all, { savedIds: ['cake', 'gone'] })).toEqual([cake]);
    expect(filterRecipes(all, { savedIds: ['cake'], quickOnly: true })).toEqual([]);
  });

  it('treats an empty saved list as "nothing saved", not "no filter"', () => {
    expect(filterRecipes(all, { savedIds: [] })).toEqual([]);
  });
});
