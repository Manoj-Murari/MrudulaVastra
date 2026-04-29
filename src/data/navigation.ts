export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { 
    label: "Sarees", 
    href: "/collections/sarees",
    subLinks: []
  },
  { 
    label: "Kurtas", 
    href: "/collections/kurtas",
    subLinks: []
  },
  { 
    label: "Dress Materials", 
    href: "/collections/dress-materials",
    subLinks: []
  },
  { 
    label: "Kids Wear", 
    href: "/collections/kids",
    subLinks: []
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];
