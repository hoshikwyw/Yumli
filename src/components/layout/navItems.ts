import type { ComponentType, SVGProps } from 'react';
import { BookIcon, HeartIcon, HomeIcon, InfoIcon } from '../icons';

export interface NavItem {
  /** Translation key for the label. */
  labelKey: string;
  /** Where the link goes: a path, optionally with a query string. */
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Whether this item is the current page. */
  isActive: (pathname: string, params: URLSearchParams) => boolean;
  /** Only in the phone bottom bar: on wider screens the same thing is a filter on the Recipes page. */
  phoneOnly?: boolean;
}

/** `/recipes?saved=1` is the Saved tab; every other recipes URL belongs to Recipes. */
const isSavedView = (pathname: string, params: URLSearchParams) =>
  pathname === '/recipes' && params.get('saved') === '1';

/** The public pages, shared by the header (desktop), the bottom bar (phones) and the footer. */
export const navItems: NavItem[] = [
  { labelKey: 'nav.home', to: '/', icon: HomeIcon, isActive: (pathname) => pathname === '/' },
  {
    labelKey: 'nav.recipes',
    to: '/recipes',
    icon: BookIcon,
    isActive: (pathname, params) => pathname.startsWith('/recipes') && !isSavedView(pathname, params),
  },
  { labelKey: 'nav.saved', to: '/recipes?saved=1', icon: HeartIcon, isActive: isSavedView, phoneOnly: true },
  { labelKey: 'nav.about', to: '/about', icon: InfoIcon, isActive: (pathname) => pathname.startsWith('/about') },
];

/** The items that are pages in their own right: header and footer links. */
export const pageNavItems = navItems.filter((item) => !item.phoneOnly);
