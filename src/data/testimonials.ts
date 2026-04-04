export interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Priya Sharma",
    location: "Hyderabad",
    text: "The Kanjivaram I ordered was absolutely breathtaking. The quality surpassed every expectation. Will definitely order again!",
    rating: 5,
  },
  {
    name: "Ananya Reddy",
    location: "Bengaluru",
    text: "My daughter looked like a little princess in her leheriya set. The fabric, the finish — everything was perfect. Thank you Mrudula Vastra!",
    rating: 5,
  },
  {
    name: "Meera Krishnan",
    location: "Chennai",
    text: "I've been searching for quality dress materials for years. Found my forever brand. The chanderi collection is stunning.",
    rating: 5,
  },
];
