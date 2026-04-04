export const NAV_LINKS = [
  "Collections",
  "Sarees",
  "Dress Materials",
  "Kids Wear",
  "About",
  "Contact",
] as const;

export type NavLink = (typeof NAV_LINKS)[number];
