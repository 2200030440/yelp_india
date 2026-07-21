// prisma/seed/index.ts
// Yelp India — Real Authentic Indian Restaurants (Google Maps coordinates)
// Starts with 0 seeded reviews so all reviews are written new by users in the browser.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Yelp India database seeding...");

  // ── 1. Categories ─────────────────────────────────────────────────────
  const categories = [
    { name: "North Indian",      slug: "north-indian",      description: "Tandoori, Butter Chicken, Naan & Mughlai delights",           icon: "Soup" },
    { name: "South Indian",      slug: "south-indian",      description: "Crispy Dosa, Idli, Vada & Filter Coffee",                     icon: "CookingPot" },
    { name: "Biryani & Kebabs",  slug: "biryani-specialty", description: "Aromatic Hyderabadi, Lucknowi & Kolkata Biryanis",            icon: "Flame" },
    { name: "Fine Dining",       slug: "fine-dining",       description: "Luxury gourmet menus & exceptional ambiance",                 icon: "UtensilsCrossed" },
    { name: "Cafes & Bakeries",  slug: "cafes-bakeries",    description: "Artisanal coffee, fresh pastries & relaxed vibes",            icon: "Coffee" },
    { name: "Street Food",       slug: "street-food",       description: "Pani Puri, Chaat, Pav Bhaji, Vada Pav & Momos",              icon: "Sandwich" },
    { name: "Coastal Seafood",   slug: "coastal-seafood",   description: "Fresh catch — prawn, crab, pomfret & coastal curries",        icon: "Fish" },
    { name: "Continental",       slug: "continental",       description: "European classics, steaks, pasta & international cuisine",    icon: "Globe" },
  ];

  console.log("→ Seeding categories...");
  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: cat,
      create: cat,
    });
    catMap[cat.slug] = c.id;
  }

  // ── 2. Amenities ──────────────────────────────────────────────────────
  const amenities = [
    { name: "Free Wi-Fi",          slug: "wifi",          icon: "Wifi" },
    { name: "Valet Parking",       slug: "valet",         icon: "Car" },
    { name: "Air Conditioned",     slug: "ac",            icon: "Wind" },
    { name: "Full Bar",            slug: "bar",           icon: "Wine" },
    { name: "Table Reservations",  slug: "reservations",  icon: "CalendarCheck" },
    { name: "Outdoor Seating",     slug: "outdoor",       icon: "Trees" },
    { name: "Private Dining",      slug: "private",       icon: "Lock" },
    { name: "Live Music",          slug: "live-music",    icon: "Music" },
    { name: "Rooftop View",        slug: "rooftop",       icon: "Building2" },
    { name: "Pet Friendly",        slug: "pet-friendly",  icon: "PawPrint" },
  ];

  console.log("→ Seeding amenities...");
  const amenityMap: Record<string, string> = {};
  for (const a of amenities) {
    const am = await prisma.amenity.upsert({
      where:  { slug: a.slug },
      update: a,
      create: a,
    });
    amenityMap[a.slug] = am.id;
  }

  // ── 3. Admin User ─────────────────────────────────────────────────────
  console.log("→ Seeding admin user...");
  const passwordHash = await bcrypt.hash("Admin@1234", 10);

  const admin = await prisma.user.upsert({
    where:  { email: "admin@yelpindia.com" },
    update: {},
    create: {
      name:         "Yelp Admin",
      email:        "admin@yelpindia.com",
      passwordHash,
      role:         "ADMIN",
      city:         "Mumbai",
      bio:          "Yelp India platform administrator",
    },
  });

  // Clear existing reviews to ensure clean state as requested
  await prisma.review.deleteMany({});
  console.log("→ Cleared existing reviews (places start clean for new user reviews).");

  // ── 4. Real Indian Restaurants (Google Maps Data & Coordinates) ───────
  const places = [
    // ── New Delhi ──────────────────────────────────────────────────────
    {
      name: "Bukhara - ITC Maurya",
      slug: "bukhara-delhi",
      description: "World-renowned Bukhara brings alive the rustic charm of traditional North-West Frontier dining. Master chefs cook succulent kebabs and overnight slow-cooked Dal Bukhara over traditional charcoal clay tandoors.",
      address: "ITC Maurya, Diplomatic Enclave, Chanakyapuri",
      city: "New Delhi", state: "Delhi",
      latitude: 28.5985, longitude: 77.1870,
      priceLevel: 4, phone: "+91 11 2611 2233",
      website: "https://www.itchotels.com/bukhara",
      categorySlug: "north-indian",
      isVerified: true, isFeatured: true,
      amenitySlugs: ["valet","ac","bar","reservations","private"],
      photos: [
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "12:30", close: "14:45", closed: false },
        { day: "TUESDAY",   open: "12:30", close: "14:45", closed: false },
        { day: "WEDNESDAY", open: "12:30", close: "14:45", closed: false },
        { day: "THURSDAY",  open: "12:30", close: "14:45", closed: false },
        { day: "FRIDAY",    open: "12:30", close: "14:45", closed: false },
        { day: "SATURDAY",  open: "12:30", close: "14:45", closed: false },
        { day: "SUNDAY",    open: "12:30", close: "14:45", closed: false },
      ],
    },
    {
      name: "Indian Accent",
      slug: "indian-accent-delhi",
      description: "Indian Accent reinterprets Indian food with global techniques and local ingredients. An extraordinary fine dining experience that has earned its place among Asia's 50 best restaurants.",
      address: "The Lodhi, Lodhi Road",
      city: "New Delhi", state: "Delhi",
      latitude: 28.5919, longitude: 77.2219,
      priceLevel: 4, phone: "+91 11 2611 6666",
      website: "https://indianaccent.com",
      categorySlug: "fine-dining",
      isVerified: true, isFeatured: true,
      amenitySlugs: ["valet","ac","bar","reservations","private","wifi"],
      photos: [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
        "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "12:00", close: "14:30", closed: false },
        { day: "TUESDAY",   open: "12:00", close: "14:30", closed: false },
        { day: "WEDNESDAY", open: "12:00", close: "14:30", closed: false },
        { day: "THURSDAY",  open: "12:00", close: "14:30", closed: false },
        { day: "FRIDAY",    open: "12:00", close: "14:30", closed: false },
        { day: "SATURDAY",  open: "12:00", close: "15:00", closed: false },
        { day: "SUNDAY",    open: "12:00", close: "15:00", closed: false },
      ],
    },
    {
      name: "Karim's Historic Mughlai",
      slug: "karims-old-delhi",
      description: "Established in 1913 near Jama Masjid, Karim's is Old Delhi's legendary Mughlai destination. World-famous Mutton Burra Kebabs and Shahi Nihari cooked according to royal Mughal recipes.",
      address: "16, Gali Kababian, Jama Masjid, Chandni Chowk",
      city: "New Delhi", state: "Delhi",
      latitude: 28.6507, longitude: 77.2334,
      priceLevel: 2, phone: "+91 11 2326 4981",
      website: "https://karimshotels.com",
      categorySlug: "biryani-specialty",
      isVerified: true, isFeatured: true,
      amenitySlugs: ["ac"],
      photos: [
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "11:00", close: "23:30", closed: false },
        { day: "TUESDAY",   open: "11:00", close: "23:30", closed: false },
        { day: "WEDNESDAY", open: "11:00", close: "23:30", closed: false },
        { day: "THURSDAY",  open: "11:00", close: "23:30", closed: false },
        { day: "FRIDAY",    open: "11:00", close: "23:30", closed: false },
        { day: "SATURDAY",  open: "11:00", close: "23:30", closed: false },
        { day: "SUNDAY",    open: "11:00", close: "23:30", closed: false },
      ],
    },
    {
      name: "Saravana Bhavan CP",
      slug: "saravana-bhavan-delhi",
      description: "Iconic South Indian vegetarian chain serving authentic Ghee Roast Dosa, Idli-Vada combos, and piping hot South Indian Filter Coffee in the heart of Connaught Place.",
      address: "P-13, Connaught Circus, Connaught Place",
      city: "New Delhi", state: "Delhi",
      latitude: 28.6315, longitude: 77.2167,
      priceLevel: 1, phone: "+91 11 2331 7755",
      website: "https://saravanabhavan.com",
      categorySlug: "south-indian",
      isVerified: true, isFeatured: false,
      amenitySlugs: ["ac"],
      photos: [
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&q=80",
        "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "08:00", close: "23:00", closed: false },
        { day: "TUESDAY",   open: "08:00", close: "23:00", closed: false },
        { day: "WEDNESDAY", open: "08:00", close: "23:00", closed: false },
        { day: "THURSDAY",  open: "08:00", close: "23:00", closed: false },
        { day: "FRIDAY",    open: "08:00", close: "23:00", closed: false },
        { day: "SATURDAY",  open: "08:00", close: "23:00", closed: false },
        { day: "SUNDAY",    open: "08:00", close: "23:00", closed: false },
      ],
    },

    // ── Mumbai ─────────────────────────────────────────────────────────
    {
      name: "Trishna Coastal Dining",
      slug: "trishna-mumbai",
      description: "Trishna has been the definitive address for coastal seafood in Mumbai since 1981. Their Butter Garlic Crab is legendary worldwide — cooked fresh to order with generous lashings of butter.",
      address: "7, Sai Baba Marg, Kala Ghoda, Fort",
      city: "Mumbai", state: "Maharashtra",
      latitude: 18.9322, longitude: 72.8324,
      priceLevel: 3, phone: "+91 22 2270 3213",
      website: "https://trishna.in",
      categorySlug: "coastal-seafood",
      isVerified: true, isFeatured: true,
      amenitySlugs: ["ac","reservations"],
      photos: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
        "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "12:00", close: "15:30", closed: false },
        { day: "TUESDAY",   open: "12:00", close: "15:30", closed: false },
        { day: "WEDNESDAY", open: "12:00", close: "15:30", closed: false },
        { day: "THURSDAY",  open: "12:00", close: "15:30", closed: false },
        { day: "FRIDAY",    open: "12:00", close: "15:30", closed: false },
        { day: "SATURDAY",  open: "12:00", close: "16:00", closed: false },
        { day: "SUNDAY",    open: "12:00", close: "16:00", closed: false },
      ],
    },
    {
      name: "The Bombay Canteen",
      slug: "bombay-canteen-mumbai",
      description: "A contemporary Indian restaurant inspired by the flavours and culture of India's diverse regions. Innovative cocktails meet regional cuisine in a beautifully designed industrial chic space.",
      address: "Unit 1, Process House, Kamala Mills, Lower Parel",
      city: "Mumbai", state: "Maharashtra",
      latitude: 19.0057, longitude: 72.8295,
      priceLevel: 3, phone: "+91 22 4966 6666",
      website: "https://thebombaycanteen.com",
      categorySlug: "fine-dining",
      isVerified: true, isFeatured: false,
      amenitySlugs: ["ac","bar","reservations","outdoor","wifi"],
      photos: [
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "12:00", close: "23:30", closed: false },
        { day: "TUESDAY",   open: "12:00", close: "23:30", closed: false },
        { day: "WEDNESDAY", open: "12:00", close: "23:30", closed: false },
        { day: "THURSDAY",  open: "12:00", close: "23:30", closed: false },
        { day: "FRIDAY",    open: "12:00", close: "00:00", closed: false },
        { day: "SATURDAY",  open: "12:00", close: "00:00", closed: false },
        { day: "SUNDAY",    open: "12:00", close: "23:30", closed: false },
      ],
    },
    {
      name: "Bademiya Street Kebabs",
      slug: "bademiya-mumbai",
      description: "Mumbai's famous midnight street food destination behind Taj Mahal Hotel. Juicy Chicken Baida Roti, Seekh Kebabs, and Mutton Roll grilled over glowing coal fires.",
      address: "Tulloch Road, Apollo Bunder, Colaba",
      city: "Mumbai", state: "Maharashtra",
      latitude: 18.9218, longitude: 72.8317,
      priceLevel: 2, phone: "+91 22 2284 8038",
      website: "https://bademiya.com",
      categorySlug: "street-food",
      isVerified: true, isFeatured: false,
      amenitySlugs: ["outdoor"],
      photos: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "19:00", close: "03:00", closed: false },
        { day: "TUESDAY",   open: "19:00", close: "03:00", closed: false },
        { day: "WEDNESDAY", open: "19:00", close: "03:00", closed: false },
        { day: "THURSDAY",  open: "19:00", close: "03:00", closed: false },
        { day: "FRIDAY",    open: "19:00", close: "04:00", closed: false },
        { day: "SATURDAY",  open: "19:00", close: "04:00", closed: false },
        { day: "SUNDAY",    open: "19:00", close: "03:00", closed: false },
      ],
    },

    // ── Hyderabad ──────────────────────────────────────────────────────
    {
      name: "Paradise Biryani House",
      slug: "paradise-hyderabad",
      description: "Paradise is synonymous with Hyderabad biryani since 1953. Their legendary Dum Biryani — slow-cooked in a sealed pot — is the gold standard of Hyderabadi cuisine.",
      address: "M.G. Road, Paradise Circle, Secunderabad",
      city: "Hyderabad", state: "Telangana",
      latitude: 17.4435, longitude: 78.4990,
      priceLevel: 2, phone: "+91 40 2784 7700",
      website: "https://www.paradisebiryani.com",
      categorySlug: "biryani-specialty",
      isVerified: true, isFeatured: true,
      amenitySlugs: ["ac","reservations"],
      photos: [
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=80",
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "11:00", close: "23:00", closed: false },
        { day: "TUESDAY",   open: "11:00", close: "23:00", closed: false },
        { day: "WEDNESDAY", open: "11:00", close: "23:00", closed: false },
        { day: "THURSDAY",  open: "11:00", close: "23:00", closed: false },
        { day: "FRIDAY",    open: "11:00", close: "23:30", closed: false },
        { day: "SATURDAY",  open: "11:00", close: "23:30", closed: false },
        { day: "SUNDAY",    open: "11:00", close: "23:00", closed: false },
      ],
    },
    {
      name: "Bawarchi Restaurant",
      slug: "bawarchi-hyderabad",
      description: "Famous RTC X Roads biryani hub, celebrated for spicy Hyderabadi Mutton Biryani served with Mirchi Ka Salan and Raita.",
      address: "RTC X Roads, Chikkadpally, Musheerabad",
      city: "Hyderabad", state: "Telangana",
      latitude: 17.4042, longitude: 78.4984,
      priceLevel: 2, phone: "+91 40 2763 4494",
      website: "https://bawarchibiryani.com",
      categorySlug: "biryani-specialty",
      isVerified: true, isFeatured: false,
      amenitySlugs: ["ac"],
      photos: [
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=80",
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "11:30", close: "23:30", closed: false },
        { day: "TUESDAY",   open: "11:30", close: "23:30", closed: false },
        { day: "WEDNESDAY", open: "11:30", close: "23:30", closed: false },
        { day: "THURSDAY",  open: "11:30", close: "23:30", closed: false },
        { day: "FRIDAY",    open: "11:30", close: "23:30", closed: false },
        { day: "SATURDAY",  open: "11:30", close: "23:30", closed: false },
        { day: "SUNDAY",    open: "11:30", close: "23:30", closed: false },
      ],
    },

    // ── Bengaluru ──────────────────────────────────────────────────────
    {
      name: "Karavalli Heritage Kitchen",
      slug: "karavalli-bengaluru",
      description: "Karavalli is a culinary journey into the coastal kitchens of Karnataka, Kerala, Goa and Chettinad. Award-winning restaurant in a heritage bungalow setting with a lush garden.",
      address: "Gateway Hotel, 66 Residency Road",
      city: "Bengaluru", state: "Karnataka",
      latitude: 12.9716, longitude: 77.5946,
      priceLevel: 3, phone: "+91 80 6660 4545",
      website: "https://karavalli.com",
      categorySlug: "coastal-seafood",
      isVerified: true, isFeatured: true,
      amenitySlugs: ["valet","ac","bar","reservations","outdoor","private"],
      photos: [
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "12:30", close: "15:00", closed: false },
        { day: "TUESDAY",   open: "12:30", close: "15:00", closed: false },
        { day: "WEDNESDAY", open: "12:30", close: "15:00", closed: false },
        { day: "THURSDAY",  open: "12:30", close: "15:00", closed: false },
        { day: "FRIDAY",    open: "12:30", close: "15:00", closed: false },
        { day: "SATURDAY",  open: "12:30", close: "15:30", closed: false },
        { day: "SUNDAY",    open: "12:30", close: "15:30", closed: false },
      ],
    },
    {
      name: "Vidyarthi Bhavan",
      slug: "vidyarthi-bhavan-bengaluru",
      description: "Historic South Indian tiffin room in Gandhi Bazaar since 1943. World-famous Crispy Butter Masala Dosa served with thick coconut chutney.",
      address: "32, Gandhi Bazaar Main Road, Basavanagudi",
      city: "Bengaluru", state: "Karnataka",
      latitude: 12.9461, longitude: 77.5708,
      priceLevel: 1, phone: "+91 80 2667 7588",
      website: "https://vidyarthibhavan.in",
      categorySlug: "south-indian",
      isVerified: true, isFeatured: true,
      amenitySlugs: [],
      photos: [
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&q=80",
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "06:30", close: "11:30", closed: false },
        { day: "TUESDAY",   open: "06:30", close: "11:30", closed: false },
        { day: "WEDNESDAY", open: "06:30", close: "11:30", closed: false },
        { day: "THURSDAY",  open: "06:30", close: "11:30", closed: false },
        { day: "FRIDAY",    open: "00:00", close: "00:00", closed: true },
        { day: "SATURDAY",  open: "06:30", close: "12:00", closed: false },
        { day: "SUNDAY",    open: "06:30", close: "12:00", closed: false },
      ],
    },

    // ── Chennai ────────────────────────────────────────────────────────
    {
      name: "Murugan Idli Shop",
      slug: "murugan-idli-chennai",
      description: "The legendary Murugan Idli Shop serves the softest, most authentic South Indian breakfast in Tamil Nadu. Their mini idlis with sambar and podi have been perfected over decades.",
      address: "77, Gandhi Irwin Road, Egmore",
      city: "Chennai", state: "Tamil Nadu",
      latitude: 13.0786, longitude: 80.2646,
      priceLevel: 1, phone: "+91 44 2819 4170",
      website: "https://muruganidlishop.com",
      categorySlug: "south-indian",
      isVerified: true, isFeatured: true,
      amenitySlugs: ["ac"],
      photos: [
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&q=80",
        "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "06:00", close: "22:00", closed: false },
        { day: "TUESDAY",   open: "06:00", close: "22:00", closed: false },
        { day: "WEDNESDAY", open: "06:00", close: "22:00", closed: false },
        { day: "THURSDAY",  open: "06:00", close: "22:00", closed: false },
        { day: "FRIDAY",    open: "06:00", close: "22:00", closed: false },
        { day: "SATURDAY",  open: "06:00", close: "22:30", closed: false },
        { day: "SUNDAY",    open: "06:00", close: "22:30", closed: false },
      ],
    },

    // ── Kolkata ────────────────────────────────────────────────────────
    {
      name: "Peter Cat",
      slug: "peter-cat-kolkata",
      description: "Peter Cat is Kolkata's most iconic restaurant — home to the legendary Chelo Kebab since 1975. This timeless Park Street institution serves Persian-inspired food in a sophisticated retro setting.",
      address: "18A, Park Street, Kolkata",
      city: "Kolkata", state: "West Bengal",
      latitude: 22.5462, longitude: 88.3525,
      priceLevel: 2, phone: "+91 33 2229 8841",
      website: "https://petercatkolkata.com",
      categorySlug: "continental",
      isVerified: true, isFeatured: false,
      amenitySlugs: ["ac","bar","reservations"],
      photos: [
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "12:00", close: "22:30", closed: false },
        { day: "TUESDAY",   open: "12:00", close: "22:30", closed: false },
        { day: "WEDNESDAY", open: "12:00", close: "22:30", closed: false },
        { day: "THURSDAY",  open: "12:00", close: "22:30", closed: false },
        { day: "FRIDAY",    open: "12:00", close: "23:00", closed: false },
        { day: "SATURDAY",  open: "12:00", close: "23:00", closed: false },
        { day: "SUNDAY",    open: "12:00", close: "22:30", closed: false },
      ],
    },
    {
      name: "Arsalan Biryani Park Circus",
      slug: "arsalan-kolkata",
      description: "Famous Kolkata Biryani destination, legendary for fragrant long-grain rice biryani with tender mutton, boiled egg, and slow-cooked potato.",
      address: "191, Park Street, Park Circus Crossing",
      city: "Kolkata", state: "West Bengal",
      latitude: 22.5441, longitude: 88.3664,
      priceLevel: 2, phone: "+91 33 2289 1234",
      website: "https://arsalanbiryani.in",
      categorySlug: "biryani-specialty",
      isVerified: true, isFeatured: true,
      amenitySlugs: ["ac"],
      photos: [
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=80",
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "11:00", close: "23:30", closed: false },
        { day: "TUESDAY",   open: "11:00", close: "23:30", closed: false },
        { day: "WEDNESDAY", open: "11:00", close: "23:30", closed: false },
        { day: "THURSDAY",  open: "11:00", close: "23:30", closed: false },
        { day: "FRIDAY",    open: "11:00", close: "23:30", closed: false },
        { day: "SATURDAY",  open: "11:00", close: "23:30", closed: false },
        { day: "SUNDAY",    open: "11:00", close: "23:30", closed: false },
      ],
    },

    // ── Pune ───────────────────────────────────────────────────────────
    {
      name: "Vaishali Restaurant",
      slug: "vaishali-pune",
      description: "A Pune institution since 1936, Vaishali on FC Road is where generations of Punekars have enjoyed authentic Maharashtrian breakfast. Known for the crispiest dosas and thickest shira in the city.",
      address: "1206, FC Road, Deccan Gymkhana",
      city: "Pune", state: "Maharashtra",
      latitude: 18.5140, longitude: 73.8324,
      priceLevel: 1, phone: "+91 20 2553 0421",
      website: "https://vaishalipune.com",
      categorySlug: "south-indian",
      isVerified: true, isFeatured: false,
      amenitySlugs: ["outdoor"],
      photos: [
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&q=80",
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "07:00", close: "23:00", closed: false },
        { day: "TUESDAY",   open: "07:00", close: "23:00", closed: false },
        { day: "WEDNESDAY", open: "07:00", close: "23:00", closed: false },
        { day: "THURSDAY",  open: "07:00", close: "23:00", closed: false },
        { day: "FRIDAY",    open: "07:00", close: "23:30", closed: false },
        { day: "SATURDAY",  open: "07:00", close: "23:30", closed: false },
        { day: "SUNDAY",    open: "07:00", close: "23:00", closed: false },
      ],
    },

    // ── Jaipur ─────────────────────────────────────────────────────────
    {
      name: "Suvarna Mahal",
      slug: "suvarna-mahal-jaipur",
      description: "Dining in a gilded royal banquet hall from the 18th century at Rambagh Palace. Suvarna Mahal offers an unparalleled Rajasthani culinary journey paired with royal opulence.",
      address: "Rambagh Palace, Bhawani Singh Road",
      city: "Jaipur", state: "Rajasthan",
      latitude: 26.8955, longitude: 75.8067,
      priceLevel: 4, phone: "+91 141 221 1919",
      website: "https://www.tajhotels.com/jaipur/rambagh-palace",
      categorySlug: "fine-dining",
      isVerified: true, isFeatured: true,
      amenitySlugs: ["valet","ac","bar","reservations","private","wifi"],
      photos: [
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&q=80",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "19:00", close: "23:00", closed: false },
        { day: "TUESDAY",   open: "19:00", close: "23:00", closed: false },
        { day: "WEDNESDAY", open: "19:00", close: "23:00", closed: false },
        { day: "THURSDAY",  open: "19:00", close: "23:00", closed: false },
        { day: "FRIDAY",    open: "19:00", close: "23:30", closed: false },
        { day: "SATURDAY",  open: "19:00", close: "23:30", closed: false },
        { day: "SUNDAY",    open: "12:30", close: "15:00", closed: false },
      ],
    },

    // ── Goa ────────────────────────────────────────────────────────────
    {
      name: "Fisherman's Wharf",
      slug: "fishermans-wharf-goa",
      description: "A beloved Goa institution on the Cavelossim riverside, Fisherman's Wharf serves fresh catch daily in a relaxed waterfront setting. The Goan Fish Curry with red rice is the definitive dish.",
      address: "Cavelossim Beach Road, Salcette",
      city: "Goa", state: "Goa",
      latitude: 15.1719, longitude: 73.9485,
      priceLevel: 2, phone: "+91 832 651 3733",
      website: "https://fishermanswharf.in",
      categorySlug: "coastal-seafood",
      isVerified: true, isFeatured: false,
      amenitySlugs: ["bar","outdoor","wifi","live-music"],
      photos: [
        "https://images.unsplash.com/photo-1559847844-5315695dadae?w=1200&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "11:00", close: "23:00", closed: false },
        { day: "TUESDAY",   open: "11:00", close: "23:00", closed: false },
        { day: "WEDNESDAY", open: "11:00", close: "23:00", closed: false },
        { day: "THURSDAY",  open: "11:00", close: "23:00", closed: false },
        { day: "FRIDAY",    open: "11:00", close: "23:30", closed: false },
        { day: "SATURDAY",  open: "11:00", close: "23:30", closed: false },
        { day: "SUNDAY",    open: "11:00", close: "23:00", closed: false },
      ],
    },

    // ── Amritsar ───────────────────────────────────────────────────────
    {
      name: "Kesar Da Dhaba",
      slug: "kesar-dhaba-amritsar",
      description: "Founded in 1916, Kesar Da Dhaba is Amritsar's most celebrated diner. Home to the most buttery Dal Makhani and Amritsari Kulcha slow-cooked over 24 hours.",
      address: "Chowk Passian, near Golden Temple",
      city: "Amritsar", state: "Punjab",
      latitude: 31.6195, longitude: 74.8795,
      priceLevel: 1, phone: "+91 183 255 2103",
      website: "https://kesardadhaba.com",
      categorySlug: "north-indian",
      isVerified: true, isFeatured: false,
      amenitySlugs: [],
      photos: [
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80",
        "https://images.unsplash.com/photo-1605619958761-d8c49de024b4?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "07:00", close: "23:00", closed: false },
        { day: "TUESDAY",   open: "07:00", close: "23:00", closed: false },
        { day: "WEDNESDAY", open: "07:00", close: "23:00", closed: false },
        { day: "THURSDAY",  open: "07:00", close: "23:00", closed: false },
        { day: "FRIDAY",    open: "07:00", close: "23:30", closed: false },
        { day: "SATURDAY",  open: "07:00", close: "23:30", closed: false },
        { day: "SUNDAY",    open: "07:00", close: "23:00", closed: false },
      ],
    },

    // ── Lucknow ────────────────────────────────────────────────────────
    {
      name: "Tundey Kababi",
      slug: "tundey-kababi-lucknow",
      description: "Lucknow's historic 100-year-old kebabi shop famous for melt-in-the-mouth Galouti Kebabs made with 160 secret spices.",
      address: "Phool Wali Gali, Chowk, Lucknow",
      city: "Lucknow", state: "Uttar Pradesh",
      latitude: 26.8437, longitude: 80.9262,
      priceLevel: 1, phone: "+91 522 225 6116",
      website: "https://tundeykababi.com",
      categorySlug: "biryani-specialty",
      isVerified: true, isFeatured: true,
      amenitySlugs: ["ac"],
      photos: [
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "12:00", close: "23:00", closed: false },
        { day: "TUESDAY",   open: "12:00", close: "23:00", closed: false },
        { day: "WEDNESDAY", open: "12:00", close: "23:00", closed: false },
        { day: "THURSDAY",  open: "12:00", close: "23:00", closed: false },
        { day: "FRIDAY",    open: "12:00", close: "23:00", closed: false },
        { day: "SATURDAY",  open: "12:00", close: "23:00", closed: false },
        { day: "SUNDAY",    open: "12:00", close: "23:00", closed: false },
      ],
    },

    // ── Ahmedabad ──────────────────────────────────────────────────────
    {
      name: "Manek Chowk Night Market",
      slug: "manek-chowk-ahmedabad",
      description: "Ahmedabad's legendary night food street market serving Gwalior Dosa, Pineapple Cheese Sandwich, and Kulfi Falooda till 2 AM.",
      address: "Manek Chowk Road, Khadia, Ahmedabad",
      city: "Ahmedabad", state: "Gujarat",
      latitude: 23.0232, longitude: 72.5891,
      priceLevel: 1, phone: "+91 79 2214 0000",
      website: "https://manekchowk.in",
      categorySlug: "street-food",
      isVerified: true, isFeatured: false,
      amenitySlugs: ["outdoor"],
      photos: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
      ],
      hours: [
        { day: "MONDAY",    open: "20:00", close: "02:00", closed: false },
        { day: "TUESDAY",   open: "20:00", close: "02:00", closed: false },
        { day: "WEDNESDAY", open: "20:00", close: "02:00", closed: false },
        { day: "THURSDAY",  open: "20:00", close: "02:00", closed: false },
        { day: "FRIDAY",    open: "20:00", close: "02:30", closed: false },
        { day: "SATURDAY",  open: "20:00", close: "02:30", closed: false },
        { day: "SUNDAY",    open: "20:00", close: "02:00", closed: false },
      ],
    },
  ] as const;

  // ── 5. Create Places, Photos, Hours, Amenities ────────────────────────
  console.log(`→ Seeding ${places.length} real Indian restaurants...`);

  for (const p of places) {
    const place = await prisma.place.upsert({
      where:  { slug: p.slug },
      update: {
        averageRating: 0.0,
        reviewCount:   0,
      },
      create: {
        name:          p.name,
        slug:          p.slug,
        description:   p.description,
        address:       p.address,
        city:          p.city,
        state:         p.state,
        country:       "India",
        latitude:      p.latitude,
        longitude:     p.longitude,
        priceLevel:    p.priceLevel,
        phone:         p.phone || null,
        website:       p.website || null,
        isVerified:    p.isVerified,
        isFeatured:    p.isFeatured,
        averageRating: 0.0,
        reviewCount:   0,
        categoryId:    catMap[p.categorySlug],
      },
    });

    // Photos
    for (let i = 0; i < p.photos.length; i++) {
      const photoUrl = p.photos[i];
      const exists = await prisma.photo.findFirst({ where: { placeId: place.id, url: photoUrl } });
      if (!exists) {
        await prisma.photo.create({
          data: {
            url:       photoUrl,
            isPrimary: i === 0,
            userId:    admin.id,
            placeId:   place.id,
          },
        });
      }
    }

    // Opening Hours (upsert)
    for (const h of p.hours) {
      await prisma.openingHour.upsert({
        where:  { placeId_dayOfWeek: { placeId: place.id, dayOfWeek: h.day as import("@prisma/client").DayOfWeek } },
        update: { openTime: h.open, closeTime: h.close, isClosed: h.closed },
        create: {
          placeId:   place.id,
          dayOfWeek: h.day as import("@prisma/client").DayOfWeek,
          openTime:  h.open,
          closeTime: h.close,
          isClosed:  h.closed,
        },
      });
    }

    // Amenities
    for (const slug of p.amenitySlugs) {
      if (amenityMap[slug]) {
        await prisma.placeAmenity.upsert({
          where:  { placeId_amenityId: { placeId: place.id, amenityId: amenityMap[slug] } },
          update: {},
          create: { placeId: place.id, amenityId: amenityMap[slug] },
        });
      }
    }

    console.log(`  ✓ ${p.name} (${p.city}, ${p.state})`);
  }

  console.log("\n✅ Yelp India database seeded with real restaurants & 0 pre-seeded reviews!");
  console.log(`   ${places.length} restaurants | ${categories.length} categories | ${amenities.length} amenities`);
  console.log(`\n🔐 Admin login: admin@yelpindia.com / Admin@1234`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
