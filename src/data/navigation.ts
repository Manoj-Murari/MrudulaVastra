export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "Sarees", href: "/collections/sarees" },
  { label: "Kurtas", href: "/collections/kurtas" },
  { label: "Dress Materials", href: "/collections/dress-materials" },
  { label: "Kids Wear", href: "/collections/kids" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];
