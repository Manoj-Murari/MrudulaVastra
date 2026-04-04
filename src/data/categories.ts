export type Category = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  gradient: string;
  tag: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "c1",
    title: "Sarees",
    subtitle: "Heritage Handlooms",
    image: "/images/category-sarees.webp",
    link: "/collections/sarees",
    gradient: "from-[#1A3C2E]/90 to-[#1A3C2E]/20",
    tag: "New Arrivals",
    color: "#1A3C2E",
  },
  {
    id: "c2",
    title: "Dress Materials",
    subtitle: "Premium Unstitched",
    image: "/images/category-dress.webp",
    link: "/collections/dress-materials",
    gradient: "from-[#3A2218]/90 to-[#3A2218]/20",
    tag: "Bestseller",
    color: "#2C1810",
  },
  {
    id: "c3",
    title: "Kids Wear",
    subtitle: "Festive Collection",
    image: "/images/category-kids.webp",
    link: "/collections/kids",
    gradient: "from-[#2A314A]/90 to-[#2A314A]/20",
    tag: "Featured",
    color: "#1C2B4A",
  },
];
