const BURMESE = /[က-႟]/;

/**
 * The `lang` attribute for a piece of content the admin typed, such as a
 * recipe title. Recipes can be written in Burmese while the site is being
 * read in English (or the other way round), so the page's own language says
 * nothing about them. Marking Burmese text as `my` gives it the taller line
 * spacing its stacked letters need and tells screen readers how to read it.
 * Returns undefined for anything else, which leaves the page language in force.
 */
export const textLang = (text: string | null | undefined): 'my' | undefined =>
  text && BURMESE.test(text) ? 'my' : undefined;
