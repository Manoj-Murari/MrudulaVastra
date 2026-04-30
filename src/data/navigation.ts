export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const PREFERRED_CATEGORY_ORDER = ["Sarees", "Kurtas", "Dress Materials", "Kids Wear"];

export type NavLink = (typeof NAV_LINKS)[number] | { label: string; href: string; subLinks?: { label: string; href: string }[] };
