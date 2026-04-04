export const NAV_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Sarees", href: "/collections/sarees" },
  { label: "Dress Materials", href: "/collections/dress-materials" },
  { label: "Kids Wear", href: "/collections/kids" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];
