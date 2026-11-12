import type { ComponentType, SVGProps } from 'react';
import { BookIcon, HomeIcon, InfoIcon } from '../icons';

export interface NavItem {
  /** Translation key for the label. */
  labelKey: string;
  path: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Match the path exactly: needed for "/" so it is not active on every page. */
  end?: boolean;
}

/** The public pages, shared by the header (desktop), the bottom bar (phones) and the footer. */
export const navItems: NavItem[] = [
  { labelKey: 'nav.home', path: '/', icon: HomeIcon, end: true },
  { labelKey: 'nav.recipes', path: '/recipes', icon: BookIcon },
  { labelKey: 'nav.about', path: '/about', icon: InfoIcon },
];
