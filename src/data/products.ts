export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  tag: string;
  rating: number;
  reviews: number;
  badge: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Kanjivaram Silk Saree",
    category: "Sarees",
    price: 8499,
    originalPrice: 10999,
    image: "/images/trending-1.webp",
    tag: "As Seen on Reels",
    rating: 4.9,
    reviews: 124,
    badge: "🔥 Trending",
  },
  {
    id: 2,
    name: "Chanderi Cotton Suit Set",
    category: "Dress Materials",
    price: 3299,
    originalPrice: 4199,
    image: "/images/trending-2.webp",
    tag: "Reel Favourite",
    rating: 4.8,
    reviews: 89,
    badge: "✨ New",
  },
  {
    id: 3,
    name: "Leheriya Anarkali Set",
    category: "Kids Wear",
    price: 1899,
    originalPrice: 2499,
    image: "/images/trending-3.webp",
    tag: "Most Loved",
    rating: 5.0,
    reviews: 67,
    badge: "💛 Loved",
  },
  {
    id: 4,
    name: "Organza Embroidered Saree",
    category: "Sarees",
    price: 6799,
    originalPrice: 8999,
    image: "/images/trending-4.webp",
    tag: "As Seen on Reels",
    rating: 4.7,
    reviews: 103,
    badge: "🎬 Reel Hit",
  },
];
