/**
 * Tasty Nest Database Layer (Dexie.js / IndexedDB)
 * Complete client-side database replacement for PostgreSQL + Prisma
 */

const db = new Dexie("TastyNestDB");

db.version(4).stores({
  recipes: 'id, title, slug, category, prepTime, cookTime, servings, imageUrl, videoUrl, author, badgeTop, badgeBottom, isHero, createdAt, updatedAt',
  ingredients: 'id, recipeId, name, amount',
  instructions: 'id, recipeId, stepNumber, description',
  nutrition: 'id, recipeId, calories, protein, carbs, fat',
  users: 'id, username, email, password, name',
  favorites: 'id, recipeId, savedAt',
  pinterestBoards: 'id, title, pinsCount, pinUrl, imageUrl, videoUrl, order'
});

db.version(5).stores({
  recipes: 'id, title, slug, category, prepTime, cookTime, servings, imageUrl, videoUrl, author, badgeTop, badgeBottom, isHero, createdAt, updatedAt',
  ingredients: 'id, recipeId, name, amount',
  instructions: 'id, recipeId, stepNumber, description',
  nutrition: 'id, recipeId, calories, protein, carbs, fat',
  users: 'id, username, email, password, name',
  favorites: 'id, recipeId, savedAt',
  pinterestBoards: 'id, title, pinsCount, pinUrl, imageUrl, videoUrl, order',
  subscribers: 'id, email, subscribedAt, source',
  reviews: 'id, recipeId, author, rating, comment, createdAt'
});

// Default Pinterest Boards with Hover Live Video support (Matches exact Pinterest showcase)
const DEFAULT_PINTEREST_BOARDS = [
  {
    id: "pboard-spices",
    title: "Caramel Apple Cheesecake",
    pinsCount: "546 Pins",
    pinUrl: "https://www.pinterest.com/tastynest917",
    imageUrl: "dessert_chocolate_lava.jpg",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    order: 1
  },
  {
    id: "pboard-bakes",
    title: "Grilled Cheese Hot Dog 🥓",
    pinsCount: "874 Pins",
    pinUrl: "https://www.pinterest.com/tastynest917",
    imageUrl: "crab_spice_prep.jpg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 2
  },
  {
    id: "pboard-dinners",
    title: "Mac and Cheese",
    pinsCount: "1,280 Pins",
    pinUrl: "https://www.pinterest.com/tastynest917",
    imageUrl: "quick_dinners_bowl.jpg",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    order: 3
  },
  {
    id: "pboard-drinks",
    title: "Juicy Chicken",
    pinsCount: "720 Pins",
    pinUrl: "https://www.pinterest.com/tastynest917",
    imageUrl: "honey_soy_salmon.jpg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 4
  }
];

// Default Featured Hero Dish Configuration
const DEFAULT_HERO_CONFIG = {
  recipeId: "rec-crab-curry",
  title: "Spicy Sri Lankan Black Pepper Crab Curry",
  subtitle: "with Fragrant Coconut Rice",
  description: "Tender blue swimmer crab simmered in roasted black pepper, crushed coriander seeds, aromatic curry leaves, and velvety thick coconut cream. An unforgettable heirloom dinner party triumph.",
  rating: "4.9",
  reviewsText: "428 Verified Reviews",
  cookTime: "35 Mins",
  cookTimeSub: "Total Cook Time",
  calories: "450 kcal",
  caloriesSub: "Nutritious / Serving",
  difficulty: "Intermediate",
  difficultySub: "One-Pot Magic",
  imageUrl: "sri_lankan_crab_curry.jpg",
  pinterestUrl: "https://www.pinterest.com/pin/create/button/?url=https://www.pinterest.com/tastynest917&media=sri_lankan_crab_curry.jpg&description=Spicy Sri Lankan Black Pepper Crab Curry with Fragrant Coconut Rice on Tasty Nest",
  flavorInitial: "TL",
  flavorBase: "Crushed Kampot Pepper & Raw Coconut",
  flavorIngredients: "9 Ingredients",
  chefName: "Dilrukshi P.",
  chefBadge: "Verified Chef",
  chefSub: "Tested 3 times in test kitchen • Pinned 8.1k times",
  seriesTag: "Heirloom Heritage Series"
};

// Default Subscriber Leads (Captured from 7-Day Recipe Book & Weekly Meal Plans)
const DEFAULT_SUBSCRIBERS = [
  {
    id: "sub-1",
    email: "kumari.perera@gmail.com",
    subscribedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    source: "7-Day Recipe Book Claim"
  },
  {
    id: "sub-2",
    email: "david.miller@gmail.com",
    subscribedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    source: "7-Day Recipe Book Claim"
  },
  {
    id: "sub-3",
    email: "anusha.fernando@yahoo.com",
    subscribedAt: new Date(Date.now() - 3600 * 1000 * 42).toISOString(),
    source: "Weekly Meal Plans"
  }
];

// Default Seed Reviews with 5-Star Ratings
const DEFAULT_REVIEWS = [
  {
    id: "rev-crab-1",
    recipeId: "rec-crab-curry",
    author: "Kavindu Wickramasinghe",
    rating: 5,
    comment: "Cooked this for Sunday family lunch! The roasted black pepper and thick mitikiri gravy was spot on - restaurant quality in a home clay pot.",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString()
  },
  {
    id: "rev-crab-2",
    recipeId: "rec-crab-curry",
    author: "Sarah Jenkins",
    rating: 5,
    comment: "I found this recipe through your Pinterest board! The step-by-step instructions made handling whole crabs so straightforward. The spice balance is majestic.",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 4).toISOString()
  },
  {
    id: "rev-crab-3",
    recipeId: "rec-crab-curry",
    author: "Nimali Fernando",
    rating: 5,
    comment: "The karapincha and rampe aroma while sauteing brought back memories of my grandmother's kitchen in Galle. 10/10 recommend!",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 7).toISOString()
  },
  {
    id: "rev-pasta-1",
    recipeId: "rec-tuscan-pasta",
    author: "Marcus Vance",
    rating: 5,
    comment: "Truly 20 minutes start to finish! The garlic butter and sun-dried tomatoes balance the cream sauce brilliantly. Added extra parmesan at the end.",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 3).toISOString()
  },
  {
    id: "rev-tea-1",
    recipeId: "rec-ceylon-tea",
    author: "Chathura Dias",
    rating: 5,
    comment: "Brewing with crushed green cardamom and Ceylon cinnamon makes this the best morning drink ever. Perfectly sweet and creamy, genuine island flavor.",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 1).toISOString()
  },
  {
    id: "rev-wat-1",
    recipeId: "rec-watalappan",
    author: "Ayesha Razik",
    rating: 5,
    comment: "Authentic kithul jaggery flavor! Steamed to perfection with a silky smooth, melt-in-the-mouth texture. My family loved every bite.",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString()
  },
  {
    id: "rev-roti-1",
    recipeId: "rec-pol-roti",
    author: "Dilshan Silva",
    rating: 5,
    comment: "Crispy on the outside, soft coconut crumb inside. Paired with lunu miris, it made the ultimate rainy day dinner!",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 6).toISOString()
  }
];

// Default Seed Recipes matching exact mockup aesthetics and dishes
const INITIAL_RECIPES = [
  {
    recipe: {
      id: "rec-crab-curry",
      title: "Spicy Sri Lankan Black Pepper Crab Curry with Fragrant Coconut Rice",
      slug: "spicy-sri-lankan-black-pepper-crab-curry",
      description: "Tender blue swimmer crab simmered in roasted black pepper, crushed coriander seeds, aromatic curry leaves, and velvety thick coconut cream. An unforgettable heirloom dinner party triumph.",
      category: "Sri Lankan Specials",
      badgeTop: "Authentic Sri Lankan",
      badgeBottom: "One-Pot Magic",
      author: "Tasty Nest Culinary Lab & Dilrukshi P.",
      isHero: true,
      prepTime: 15,
      cookTime: 35,
      servings: 4,
      imageUrl: "sri_lankan_crab_curry.jpg",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      rating: 4.9,
      reviewsCount: 428,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "Fresh Blue Swimmer / Mud Crabs, cleaned, cracked, and halved", amount: "1.2 kg (2.6 lbs)" },
      { name: "Freshly cracked whole black peppercorns, coarsely crushed", amount: "2.5 tbsp" },
      { name: "First-press thick coconut cream (Mitikiri)", amount: "1.5 cups" },
      { name: "Thin coconut milk (Diyakiri)", amount: "1 cup" },
      { name: "Fresh sprigs of Sri Lankan curry leaves (Karapincha)", amount: "3 sprigs" },
      { name: "Pandar leaves (Rampe), knotted into bundles", amount: "2-inch piece" },
      { name: "Red shallots or small onions, finely sliced", amount: "8 shallots" },
      { name: "Garlic cloves, crushed into paste", amount: "6 cloves" },
      { name: "Fresh ginger root, grated finely", amount: "1.5-inch knob" },
      { name: "Ceylon roasted curry powder (Kalu Kudu)", amount: "2 tbsp" },
      { name: "Ground turmeric & fenugreek seeds", amount: "1/2 tsp each" },
      { name: "Pure coconut oil for sautéing", amount: "2 tbsp" },
      { name: "Fresh lime juice squeezed over pot at finish", amount: "Juice of 1 lime" },
      { name: "Sea salt and cracked black pepper to finish", amount: "To taste" }
    ],
    instructions: [
      { stepNumber: 1, description: "Gently rinse cleaned crab pieces under cold water. Lightly crack the large claws with the back of a chef's knife or meat mallet so the rich gravy can penetrate the sweet claw meat." },
      { stepNumber: 2, description: "In a traditional Sri Lankan clay pot (Chatti) or heavy Dutch oven, heat pure coconut oil over medium flame. Add sliced red shallots, pandan leaf bundle, and fresh curry leaves. Sauté until shallots turn soft and translucent." },
      { stepNumber: 3, description: "Add crushed garlic, grated ginger, roasted black pepper, roasted Ceylon curry powder, turmeric, and fenugreek. Stir vigorously for 60 seconds until the spices bloom with an intoxicating roasted aroma." },
      { stepNumber: 4, description: "Add the prepared crab pieces to the pot, tossing gently to coat every shell and claw in the dark spice paste." },
      { stepNumber: 5, description: "Pour in the thin coconut milk, season with sea salt, and bring to a gentle rolling boil. Reduce heat to medium-low, cover with lid, and simmer for 15 minutes." },
      { stepNumber: 6, description: "Uncover and pour in the thick coconut cream. Simmer uncovered for another 8 to 10 minutes until the sauce thickens into a velvety, peppery glaze that clings lovingly to the crab shells." },
      { stepNumber: 7, description: "Turn off the heat, squeeze in fresh lime juice, and scatter an extra pinch of crushed black pepper and crispy fried curry leaves. Serve steaming hot with fluffy basmati coconut rice!" }
    ],
    nutrition: {
      calories: 450,
      protein: "38g",
      carbs: "22g",
      fat: "18g"
    }
  },
  {
    recipe: {
      id: "rec-tuscan-pasta",
      title: "Creamy Tuscan Garlic Butter Pasta",
      slug: "creamy-tuscan-garlic-butter-pasta",
      description: "Tossed with sweet sun-dried tomatoes, tender spinach, and shaved parmigiano reggiano. The ultimate 20-minute weeknight comfort bowl.",
      category: "15-Min Quick Dinners",
      badgeTop: "22 Mins",
      badgeBottom: "520 kcal",
      author: "Tasty Nest Team",
      isHero: false,
      prepTime: 10,
      cookTime: 12,
      servings: 4,
      imageUrl: "tuscan_garlic_pasta.jpg",
      videoUrl: "",
      rating: 4.9,
      reviewsCount: 1240,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "Rigatoni or penne pasta (bronze-cut)", amount: "12 oz (340g)" },
      { name: "Unsalted butter & extra virgin olive oil", amount: "2 tbsp each" },
      { name: "Fresh garlic cloves, thinly shaved", amount: "6 cloves" },
      { name: "Sun-dried tomatoes in oil, julienned", amount: "1/2 cup" },
      { name: "Fresh baby spinach leaves", amount: "3 packed cups" },
      { name: "Heavy whipping cream", amount: "1 cup" },
      { name: "Freshly grated Parmigiano Reggiano cheese", amount: "3/4 cup" },
      { name: "Fresh sweet basil leaves, hand-torn", amount: "1/4 cup" }
    ],
    instructions: [
      { stepNumber: 1, description: "Boil pasta in generously salted water until al dente (about 9-10 minutes). Reserve 1/2 cup pasta cooking water before draining." },
      { stepNumber: 2, description: "In a large skillet over medium heat, melt butter with olive oil. Add shaved garlic and sun-dried tomatoes; sauté for 2 minutes until fragrant." },
      { stepNumber: 3, description: "Pour in heavy cream and bring to a gentle simmer. Whisk in grated Parmigiano Reggiano until melted and creamy." },
      { stepNumber: 4, description: "Add baby spinach, stirring until just wilted into the sauce. Toss in cooked pasta, adding a splash of reserved pasta water to glaze." },
      { stepNumber: 5, description: "Garnish with fresh basil, cracked pepper, and extra parmesan. Serve immediately!" }
    ],
    nutrition: {
      calories: 520,
      protein: "18g",
      carbs: "58g",
      fat: "24g"
    }
  },
  {
    recipe: {
      id: "rec-pol-roti",
      title: "Authentic Sri Lankan Coconut Roti (Pol Roti) with Lunu Miris",
      slug: "authentic-sri-lankan-coconut-roti-pol-roti",
      description: "Handcrafted pol roti crisped in a dry skillet, paired with fiery crushed chili, shallot, lime, and Maldive fish lunu miris sambal.",
      category: "Sri Lankan Specials",
      badgeTop: "Heritage Dish",
      badgeBottom: "20 Mins",
      author: "Dilrukshi P.",
      isHero: false,
      prepTime: 10,
      cookTime: 10,
      servings: 4,
      imageUrl: "sri_lankan_pol_roti.jpg",
      videoUrl: "",
      rating: 5.0,
      reviewsCount: 980,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "Freshly grated coconut (Pol)", amount: "2 cups" },
      { name: "All-purpose unbleached wheat flour", amount: "2.5 cups" },
      { name: "Green chilies, finely minced", amount: "2 small" },
      { name: "Red shallots, finely diced", amount: "4 shallots" },
      { name: "Curry leaves, finely chopped", amount: "1 sprig" },
      { name: "Warm water (as needed to knead into dough)", amount: "3/4 cup" },
      { name: "Fine sea salt", amount: "1 tsp" },
      { name: "Lunu Miris: Dried red chili flakes, crushed shallots, Maldive fish, and lime juice", amount: "For serving" }
    ],
    instructions: [
      { stepNumber: 1, description: "In a mixing bowl, combine grated coconut, minced shallots, green chilies, chopped curry leaves, and salt. Squeeze by hand to release the sweet coconut milk and aromatics." },
      { stepNumber: 2, description: "Add the flour in batches, mixing with hands while gradually splashing warm water until a soft, pliable, non-sticky dough ball forms." },
      { stepNumber: 3, description: "Divide dough into 6 equal golf ball-sized portions. Flatten each portion on a banana leaf or parchment paper into a 1/4-inch thick round disc." },
      { stepNumber: 4, description: "Heat a dry cast-iron skillet (thachchi) over medium-high heat. Place flattened roti onto the hot pan without oil." },
      { stepNumber: 5, description: "Cook each side for 3 to 4 minutes until golden brown with beautiful charred toasted spots and crispy exterior edges." },
      { stepNumber: 6, description: "Serve warm off the griddle wrapped in a cloth, served with spicy mortar-and-pestle pounded lunu miris and creamy dhal curry!" }
    ],
    nutrition: {
      calories: 280,
      protein: "7g",
      carbs: "42g",
      fat: "10g"
    }
  },
  {
    recipe: {
      id: "rec-honey-salmon",
      title: "Crispy Air-Fryer Honey Soy Salmon",
      slug: "crispy-air-fryer-honey-soy-salmon",
      description: "Sticky honey glaze with grated ginger and toasted sesame. Cooks in 10 fast minutes with zero kitchen mess.",
      category: "15-Min Quick Dinners",
      badgeTop: "18 Mins",
      badgeBottom: "High Protein",
      author: "Tasty Nest Team",
      isHero: false,
      prepTime: 8,
      cookTime: 10,
      servings: 2,
      imageUrl: "honey_soy_salmon.jpg",
      videoUrl: "",
      rating: 4.9,
      reviewsCount: 640,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "Fresh Atlantic salmon fillets (skin-on)", amount: "2 fillets (6 oz each)" },
      { name: "Raw clover honey", amount: "2 tbsp" },
      { name: "Low-sodium tamari or soy sauce", amount: "2 tbsp" },
      { name: "Fresh ginger, grated finely", amount: "1 tsp" },
      { name: "Garlic clove, minced", amount: "1 clove" },
      { name: "Toasted sesame oil", amount: "1 tsp" },
      { name: "Toasted sesame seeds & sliced scallions", amount: "1 tbsp" }
    ],
    instructions: [
      { stepNumber: 1, description: "Preheat air fryer to 390°F (200°C) for 3 minutes." },
      { stepNumber: 2, description: "In a small ramekin, whisk together honey, soy sauce, grated ginger, minced garlic, and sesame oil." },
      { stepNumber: 3, description: "Pat salmon fillets completely dry with a paper towel. Brush generously on all sides with half of the honey soy glaze." },
      { stepNumber: 4, description: "Place fillets skin-side down in the air fryer basket. Air fry for 8 to 10 minutes until edges are caramelized and fish flakes easily with a fork." },
      { stepNumber: 5, description: "Brush with the remaining glaze, sprinkle toasted sesame seeds and fresh scallions, and serve with steamed broccoli and jasmine rice." }
    ],
    nutrition: {
      calories: 420,
      protein: "36g",
      carbs: "14g",
      fat: "22g"
    }
  },
  {
    recipe: {
      id: "rec-lava-cake",
      title: "Classic Chocolate Lava Cake with Molten Ganache",
      slug: "classic-chocolate-lava-cake-with-molten-ganache",
      description: "A fool-proof chocolate cake with a molten center that cascades effortlessly on the first fork cut.",
      category: "Baking & Desserts",
      badgeTop: "Dessert Star",
      badgeBottom: "25 Mins",
      author: "Tasty Nest Team",
      isHero: false,
      prepTime: 10,
      cookTime: 14,
      servings: 4,
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
      videoUrl: "",
      rating: 4.9,
      reviewsCount: 2400,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "High quality bittersweet dark chocolate (60-70%)", amount: "6 oz" },
      { name: "Unsalted butter", amount: "1/2 cup (1 stick)" },
      { name: "Powdered confectioners sugar", amount: "1/2 cup" },
      { name: "Large eggs + egg yolks", amount: "2 whole + 2 yolks" },
      { name: "Pure vanilla extract", amount: "1 tsp" },
      { name: "All-purpose flour", amount: "6 tbsp" },
      { name: "Fresh raspberries & vanilla ice cream for serving", amount: "For garnish" }
    ],
    instructions: [
      { stepNumber: 1, description: "Preheat oven to 425°F (218°C). Butter four 6-ounce ramekins, dust with cocoa powder, and tap out excess." },
      { stepNumber: 2, description: "Melt dark chocolate and butter together in the microwave in 20-second bursts, stirring until glossy and silky." },
      { stepNumber: 3, description: "Whisk in powdered sugar, vanilla extract, and fine salt until smooth." },
      { stepNumber: 4, description: "Whisk in eggs and egg yolks one by one. Gently fold in flour until no streaks remain." },
      { stepNumber: 5, description: "Divide batter evenly between ramekins. Bake for 12 to 14 minutes until outer edges are firm but center is softly jiggling." },
      { stepNumber: 6, description: "Invert onto plates, dust with powdered sugar, and serve with fresh tart raspberries and ice cream!" }
    ],
    nutrition: {
      calories: 440,
      protein: "7g",
      carbs: "42g",
      fat: "29g"
    }
  },
  {
    recipe: {
      id: "rec-dhal-curry",
      title: "Creamy Coconut Dhal Curry with Golden Tempered Spices",
      slug: "creamy-coconut-dhal-curry-with-golden-tempered-spices",
      description: "Sri Lankan red lentils simmered with turmeric, fenugreek, garlic, and finished with a fragrant mustard-shallot tempering.",
      category: "Plant-Based & Veggie",
      badgeTop: "Vegan Favorite",
      badgeBottom: "25 Mins",
      author: "Dilrukshi P.",
      isHero: false,
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      imageUrl: "sri_lankan_dhal_curry.jpg",
      videoUrl: "",
      rating: 4.8,
      reviewsCount: 1500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "Red split lentils (Masoor Dhal), rinsed", amount: "1.5 cups" },
      { name: "Pure coconut milk", amount: "1.5 cups" },
      { name: "Water", amount: "2 cups" },
      { name: "Turmeric powder", amount: "1/2 tsp" },
      { name: "Fenugreek seeds", amount: "1/4 tsp" },
      { name: "Tempering: Coconut oil, mustard seeds, sliced shallots, dried red chili, curry leaves", amount: "2 tbsp oil" },
      { name: "Fresh lime juice", amount: "1 tbsp" }
    ],
    instructions: [
      { stepNumber: 1, description: "In a saucepan, combine rinsed red lentils, water, turmeric, fenugreek seeds, half of the sliced shallots, and green chili. Simmer for 10 minutes until lentils soften." },
      { stepNumber: 2, description: "Pour in the coconut milk, season with salt, and simmer for another 5 minutes until creamy." },
      { stepNumber: 3, description: "In a small pan, heat coconut oil. Fry mustard seeds until they pop, then add curry leaves, remaining shallots, and dried red chili until golden and fragrant." },
      { stepNumber: 4, description: "Pour sizzling tempered oil directly over the dhal curry with a gentle sizzle. Stir in lime juice and serve with hot rice or roti." }
    ],
    nutrition: {
      calories: 290,
      protein: "14g",
      carbs: "38g",
      fat: "9g"
    }
  },
  {
    recipe: {
      id: "rec-berry-bowl",
      title: "Loaded Fresh Berry Chia Breakfast Bowl",
      slug: "loaded-fresh-berry-chia-breakfast-bowl",
      description: "Overnight almond milk chia base layered with wild berry coulis, hemp seeds, and toasted pistachios for clean energy.",
      category: "Breakfast & Brunch",
      badgeTop: "10 Mins Prep",
      badgeBottom: "Raw & Clean",
      author: "Tasty Nest Team",
      isHero: false,
      prepTime: 10,
      cookTime: 0,
      servings: 2,
      imageUrl: "wild_berry_chia_bowl.jpg",
      videoUrl: "",
      rating: 4.7,
      reviewsCount: 412,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "Black or white chia seeds", amount: "1/2 cup" },
      { name: "Unsweetened almond milk or coconut milk", amount: "1.5 cups" },
      { name: "Pure vanilla bean paste", amount: "1 tsp" },
      { name: "Wild blueberries, raspberries, strawberries", amount: "1 cup" },
      { name: "Hemp hearts & toasted sliced pistachios", amount: "2 tbsp" },
      { name: "Raw organic honey or maple syrup", amount: "1 tbsp" }
    ],
    instructions: [
      { stepNumber: 1, description: "Whisk chia seeds, almond milk, vanilla, and honey in a jar. Let sit 10 minutes, stir once more, and chill in fridge until set." },
      { stepNumber: 2, description: "Layer chia pudding into wide shallow breakfast bowls." },
      { stepNumber: 3, description: "Artfully arrange fresh berries, hemp hearts, and toasted pistachios on top. Enjoy chilled!" }
    ],
    nutrition: {
      calories: 320,
      protein: "9g",
      carbs: "46g",
      fat: "11g"
    }
  },
  {
    recipe: {
      id: "rec-ceylon-tea",
      title: "Authentic Spiced Ceylon Milk Tea (Masala Chai)",
      slug: "authentic-spiced-ceylon-milk-tea-masala-chai",
      description: "Fragrant Ceylon highland BOPF black tea slow-simmered with crushed green cardamom, cinnamon quills, cloves, fresh ginger, and rich creamy milk.",
      category: "Drinks",
      badgeTop: "Ceylon Classic",
      badgeBottom: "10 Mins",
      author: "Tasty Nest Culinary Lab",
      isHero: false,
      prepTime: 3,
      cookTime: 7,
      servings: 2,
      imageUrl: "ceylon_milk_tea.jpg",
      videoUrl: "",
      rating: 4.9,
      reviewsCount: 890,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "Ceylon Highland BOPF loose black tea", amount: "2 heaped tbsp" },
      { name: "Fresh green cardamom pods, crushed open", amount: "4 pods" },
      { name: "Ceylon true cinnamon quill", amount: "1 quill (2-inch)" },
      { name: "Cloves & fresh ginger root, bruised", amount: "3 cloves + 1-inch ginger" },
      { name: "Filtered water", amount: "1.5 cups" },
      { name: "Whole dairy milk or creamy oat milk", amount: "1 cup" },
      { name: "Brown sugar, jaggery, or sweetened condensed milk", amount: "2 tbsp" }
    ],
    instructions: [
      { stepNumber: 1, description: "In a saucepan, bring water, crushed cardamom, cinnamon quill, cloves, and sliced ginger to a rolling boil for 3 minutes to infuse the warm spices." },
      { stepNumber: 2, description: "Add Ceylon black tea leaves and simmer for 2 minutes until deep amber red in color." },
      { stepNumber: 3, description: "Pour in milk and sweetener. Bring slowly to a gentle boil, letting the frothy foam rise to the rim twice." },
      { stepNumber: 4, description: "Strain through a fine mesh tea strainer into ceramic mugs from a height (yard-glass style) to create a velvety frothy foam cap. Serve hot with ginger biscuits!" }
    ],
    nutrition: {
      calories: 140,
      protein: "5g",
      carbs: "18g",
      fat: "5g"
    }
  },
  {
    recipe: {
      id: "rec-king-coconut",
      title: "Tropical King Coconut Lime & Mint Cooler",
      slug: "tropical-king-coconut-lime-and-mint-cooler",
      description: "Pure sweet Sri Lankan king coconut (Thambili) water muddled with garden mint, fresh kaffir lime, and pink Himalayan sea salt.",
      category: "Drinks",
      badgeTop: "100% Hydration",
      badgeBottom: "5 Mins",
      author: "Tasty Nest Team",
      isHero: false,
      prepTime: 5,
      cookTime: 0,
      servings: 2,
      imageUrl: "refreshing_cooler_drink.jpg",
      videoUrl: "",
      rating: 5.0,
      reviewsCount: 520,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "Fresh King Coconut (Thambili) or pure young coconut water", amount: "2 cups" },
      { name: "Fresh lime juice", amount: "Juice of 2 limes" },
      { name: "Fresh spearmint leaves", amount: "10 leaves" },
      { name: "Tender coconut flesh (Thambili lolu), scooped", amount: "1/4 cup" },
      { name: "Pink Himalayan salt", amount: "A tiny pinch" },
      { name: "Crushed ice cubes", amount: "1 cup" }
    ],
    instructions: [
      { stepNumber: 1, description: "In a tall pitcher, lightly muddle fresh mint leaves with lime juice to release the fragrant essential oils." },
      { stepNumber: 2, description: "Pour in chilled king coconut water, tender coconut jelly, and a tiny pinch of pink salt." },
      { stepNumber: 3, description: "Fill tall glasses with crushed ice, pour cooler over, and garnish with a lime wheel and mint sprig." }
    ],
    nutrition: {
      calories: 75,
      protein: "1g",
      carbs: "16g",
      fat: "0g"
    }
  },
  {
    recipe: {
      id: "rec-passion-mojito",
      title: "Sparkling Passion Fruit Honey Mocktail",
      slug: "sparkling-passion-fruit-honey-mocktail",
      description: "Vibrant tropical passion fruit pulp shaken with raw wild bee honey, crushed mint, and chilled sparkling club soda.",
      category: "Drinks",
      badgeTop: "Mocktail Star",
      badgeBottom: "5 Mins",
      author: "Tasty Nest Team",
      isHero: false,
      prepTime: 5,
      cookTime: 0,
      servings: 2,
      imageUrl: "passion_fruit_mocktail.jpg",
      videoUrl: "",
      rating: 4.9,
      reviewsCount: 710,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "Fresh ripe passion fruit pulp with crunchy seeds", amount: "4 fruits" },
      { name: "Raw pure honey or agave syrup", amount: "2 tbsp" },
      { name: "Fresh lime, cut into wedges", amount: "1 lime" },
      { name: "Fresh garden mint leaves", amount: "12 leaves" },
      { name: "Chilled sparkling mineral water or club soda", amount: "1.5 cups" },
      { name: "Crushed ice", amount: "2 cups" }
    ],
    instructions: [
      { stepNumber: 1, description: "Muddle lime wedges, mint leaves, and honey in a cocktail shaker until juicy." },
      { stepNumber: 2, description: "Add passion fruit pulp and ice, shake vigorously for 10 seconds." },
      { stepNumber: 3, description: "Strain into iced highball glasses, top generously with effervescent sparkling soda, and stir gently with a bar spoon." }
    ],
    nutrition: {
      calories: 95,
      protein: "1g",
      carbs: "24g",
      fat: "0g"
    }
  },
  {
    recipe: {
      id: "rec-watalappan",
      title: "Traditional Sri Lankan Watalappan (Coconut Jaggery Pudding)",
      slug: "traditional-sri-lankan-watalappan-coconut-jaggery-pudding",
      description: "Silkily steamed coconut milk custard sweetened with dark Kithul jaggery, scented with nutmeg, green cardamom, and toasted cashew nuts.",
      category: "Baking & Desserts",
      badgeTop: "Heirloom Dessert",
      badgeBottom: "Steamed",
      author: "Dilrukshi P.",
      isHero: false,
      prepTime: 15,
      cookTime: 45,
      servings: 6,
      imageUrl: "sri_lankan_watalappan.jpg",
      videoUrl: "",
      rating: 5.0,
      reviewsCount: 1650,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "Pure dark Kithul jaggery or palm sugar, finely grated", amount: "300g (10.5 oz)" },
      { name: "First-press thick coconut milk (undiluted)", amount: "1.5 cups" },
      { name: "Large fresh eggs", amount: "5 eggs" },
      { name: "Ground nutmeg & freshly crushed green cardamom", amount: "1/2 tsp each" },
      { name: "Pure vanilla extract", amount: "1 tsp" },
      { name: "Raw cashew nuts, split and lightly toasted", amount: "1/2 cup" },
      { name: "Pinch of salt", amount: "1/4 tsp" }
    ],
    instructions: [
      { stepNumber: 1, description: "In a saucepan, melt grated Kithul jaggery with 3 tablespoons of coconut milk over low heat until a thick, rich dark syrup forms. Cool slightly." },
      { stepNumber: 2, description: "In a large bowl, whisk eggs gently without creating excess froth. Whisk in the thick coconut milk, cooled jaggery syrup, ground nutmeg, cardamom, vanilla, and salt." },
      { stepNumber: 3, description: "Strain the mixture through a fine muslin cloth or sieve twice into a heatproof ceramic or glass pudding bowl to ensure a velvet-smooth texture." },
      { stepNumber: 4, description: "Cover bowl tightly with foil. Place in a steamer over boiling water and steam on medium-low heat for 40 to 45 minutes until a skewer inserted in the center emerges clean." },
      { stepNumber: 5, description: "Scatter toasted cashews over the warm surface, let cool to room temperature, and chill in the refrigerator for at least 3 hours before slicing." }
    ],
    nutrition: {
      calories: 360,
      protein: "9g",
      carbs: "38g",
      fat: "19g"
    }
  },
  {
    recipe: {
      id: "rec-kottu-roti",
      title: "Street-Style Sri Lankan Vegetable & Egg Kottu Roti",
      slug: "street-style-sri-lankan-vegetable-and-egg-kottu-roti",
      description: "Shredded flaky godamba roti chopped rhythmically on a sizzling flat-top with crisp leeks, carrots, scrambled eggs, and fragrant roasted curry gravy.",
      category: "Sri Lankan Specials",
      badgeTop: "Street Food Icon",
      badgeBottom: "25 Mins",
      author: "Dilrukshi P.",
      isHero: false,
      prepTime: 12,
      cookTime: 12,
      servings: 3,
      imageUrl: "sri_lankan_kottu_roti.jpg",
      videoUrl: "",
      rating: 4.9,
      reviewsCount: 1320,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ingredients: [
      { name: "Flaky Godamba or Parotta rotis, sliced into thin ribbons", amount: "4 large rotis" },
      { name: "Free-range eggs, lightly beaten", amount: "3 eggs" },
      { name: "Sliced leeks or spring onions", amount: "1.5 cups" },
      { name: "Carrots, julienned finely", amount: "1 cup" },
      { name: "Green cabbage, shredded", amount: "1.5 cups" },
      { name: "Red onion, sliced", amount: "1 medium" },
      { name: "Green chilies & curry leaves", amount: "2 chilies + 1 sprig" },
      { name: "Rich roasted Sri Lankan curry gravy (meat or vegetable gravy)", amount: "3/4 cup" },
      { name: "Coconut oil for frying", amount: "2 tbsp" }
    ],
    instructions: [
      { stepNumber: 1, description: "Heat oil in a wide flat-bottomed wok or large cast iron griddle over high heat. Add onions, curry leaves, and green chilies; sauté for 1 minute." },
      { stepNumber: 2, description: "Add shredded cabbage, carrots, and leeks. Flash-fry on high heat for 2 minutes to keep them crisp." },
      { stepNumber: 3, description: "Push vegetables to one side, pour beaten eggs into the empty space, and scramble quickly until softly set." },
      { stepNumber: 4, description: "Add shredded roti strips and pour spicy curry gravy over the entire mixture." },
      { stepNumber: 5, description: "Using two metal spatulas (or bench scrapers), chop and toss the roti with rhythm until thoroughly mixed, steaming hot, and coated in spice. Serve with a lime wedge!" }
    ],
    nutrition: {
      calories: 480,
      protein: "16g",
      carbs: "54g",
      fat: "21g"
    }
  }
];

// Database Management Operations
const CATEGORY_MAP = {
  'quick dinners': ['quick dinners', '15-min quick dinners'],
  '15-min quick dinners': ['quick dinners', '15-min quick dinners'],
  'desserts': ['desserts', 'baking & desserts', 'baking'],
  'baking & desserts': ['desserts', 'baking & desserts', 'baking'],
  'healthy eats': ['healthy eats', 'plant-based & veggie', 'plant-based', 'healthy'],
  'plant-based & veggie': ['healthy eats', 'plant-based & veggie', 'plant-based', 'healthy'],
  'sri lankan & asian': ['sri lankan & asian', 'sri lankan specials', 'sri lankan', 'asian'],
  'sri lankan specials': ['sri lankan & asian', 'sri lankan specials', 'sri lankan', 'asian'],
  'drinks': ['drinks', 'beverages', 'tropical drinks', 'tea', 'mocktail', 'drinks & beverages'],
  'breakfast & brunch': ['breakfast & brunch', 'breakfast', 'brunch']
};

function matchesCategory(recipeCat, filterCat) {
  if (!filterCat || filterCat === 'All Popular' || filterCat === 'All') return true;
  const rc = (recipeCat || '').toLowerCase().trim();
  const fc = (filterCat || '').toLowerCase().trim();
  if (rc === fc) return true;
  
  const aliases = CATEGORY_MAP[fc] || [fc];
  if (aliases.some(a => rc.includes(a) || a.includes(rc))) return true;

  const rAliases = CATEGORY_MAP[rc] || [rc];
  if (rAliases.some(a => fc.includes(a) || a.includes(fc))) return true;

  return false;
}

const TastyDB = {
  /**
   * Helper to normalize image paths - strips any leading 'images/' or './images/'
   */
  normalizeImagePath(url) {
    if (!url || typeof url !== 'string') return '';
    url = url.trim();
    if (/^(\.\/|\/)?images\//i.test(url)) {
      return url.replace(/^(\.\/|\/)?images\//i, '');
    }
    return url;
  },
  async init() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = (async () => {
      try {
      const count = await db.recipes.count();
      const drinksCount = await db.recipes.where('category').equals('Drinks').count();
      
      // If empty or missing drinks/full collection, seed fresh
      if (count === 0 || drinksCount === 0 || count < 11) {
        console.log("Seeding Tasty Nest database with complete recipe collections across all 5 categories...");
        await this.seed();
      }

      // Ensure Pinterest Boards table is populated with video boards
      const boardCount = await db.pinterestBoards.count();
      if (boardCount === 0) {
        await db.pinterestBoards.bulkPut(DEFAULT_PINTEREST_BOARDS);
      } else {
        // Upgrade board poster images & titles to match current showcase
        for (const b of DEFAULT_PINTEREST_BOARDS) {
          const existing = await db.pinterestBoards.get(b.id);
          if (existing) {
            await db.pinterestBoards.update(b.id, {
              title: b.title,
              pinsCount: b.pinsCount,
              imageUrl: this.normalizeImagePath(b.imageUrl)
            });
          } else {
            await db.pinterestBoards.put(b);
          }
        }
      }

      // Ensure Subscriber leads are initialized
      try {
        const subCount = await db.subscribers.count();
        if (subCount === 0) {
          await db.subscribers.bulkPut(DEFAULT_SUBSCRIBERS);
        }
      } catch (subErr) {
        console.warn("Subscribers init warning:", subErr);
      }

      // Ensure Community Reviews are initialized
      try {
        const revCount = await db.reviews.count();
        if (revCount === 0) {
          await db.reviews.bulkPut(DEFAULT_REVIEWS);
        }
      } catch (revErr) {
        console.warn("Reviews init warning:", revErr);
      }

      // Sanitize & migrate any legacy 'images/' paths in Dexie
        try {
          const storedRecipes = await db.recipes.toArray();
          for (const r of storedRecipes) {
            let changed = false;
            let normImg = this.normalizeImagePath(r.imageUrl);
            if (normImg !== r.imageUrl) changed = true;
            let normImgs = Array.isArray(r.images) ? r.images.map(img => this.normalizeImagePath(img)) : [normImg];
            if (JSON.stringify(normImgs) !== JSON.stringify(r.images)) changed = true;
            if (changed) {
              await db.recipes.update(r.id, { imageUrl: normImg, images: normImgs });
            }
          }
          const storedBoards = await db.pinterestBoards.toArray();
          for (const b of storedBoards) {
            let normB = this.normalizeImagePath(b.imageUrl);
            if (normB !== b.imageUrl) {
              await db.pinterestBoards.update(b.id, { imageUrl: normB });
            }
          }
          const heroSt = localStorage.getItem('tastynest_hero_config');
          if (heroSt) {
            try {
              const hObj = JSON.parse(heroSt);
              if (hObj.imageUrl) {
                const normH = this.normalizeImagePath(hObj.imageUrl);
                if (normH !== hObj.imageUrl) {
                  hObj.imageUrl = normH;
                  localStorage.setItem('tastynest_hero_config', JSON.stringify(hObj));
                }
              }
            } catch (e) {}
          }
        } catch (mErr) {
          console.warn("[TastyDB] Local image path migration note:", mErr);
        }

        // Ensure all recipes have a rich 5-photo gallery
      try {
        const allR = await db.recipes.toArray();
        const defaultGalleryMap = {
          'rec-crab-curry': [
            'sri_lankan_crab_curry.jpg',
            'crab_curry_simmering.jpg',
            'crab_spice_prep.jpg',
            'sri_lankan_pol_roti.jpg',
            'sri_lankan_dhal_curry.jpg'
          ],
          'rec-tuscan-pasta': [
            'tuscan_garlic_pasta.jpg',
            'quick_dinners_bowl.jpg',
            'honey_soy_salmon.jpg',
            'crab_spice_prep.jpg',
            'refreshing_cooler_drink.jpg'
          ],
          'rec-pol-roti': [
            'sri_lankan_pol_roti.jpg',
            'sri_lankan_dhal_curry.jpg',
            'sri_lankan_crab_curry.jpg',
            'crab_spice_prep.jpg',
            'ceylon_milk_tea.jpg'
          ],
          'rec-ceylon-tea': [
            'ceylon_milk_tea.jpg',
            'crab_spice_prep.jpg',
            'sri_lankan_watalappan.jpg',
            'dessert_chocolate_lava.jpg',
            'sri_lankan_pol_roti.jpg'
          ],
          'rec-watalappan': [
            'sri_lankan_watalappan.jpg',
            'dessert_chocolate_lava.jpg',
            'ceylon_milk_tea.jpg',
            'crab_spice_prep.jpg',
            'wild_berry_chia_bowl.jpg'
          ],
          'rec-dhal-curry': [
            'sri_lankan_dhal_curry.jpg',
            'sri_lankan_pol_roti.jpg',
            'crab_spice_prep.jpg',
            'sri_lankan_crab_curry.jpg',
            'ceylon_milk_tea.jpg'
          ],
          'rec-kottu-roti': [
            'sri_lankan_kottu_roti.jpg',
            'sri_lankan_pol_roti.jpg',
            'sri_lankan_crab_curry.jpg',
            'crab_spice_prep.jpg',
            'refreshing_cooler_drink.jpg'
          ],
          'rec-honey-salmon': [
            'honey_soy_salmon.jpg',
            'quick_dinners_bowl.jpg',
            'tuscan_garlic_pasta.jpg',
            'passion_fruit_mocktail.jpg',
            'crab_spice_prep.jpg'
          ],
          'rec-lava-cake': [
            'dessert_chocolate_lava.jpg',
            'sri_lankan_watalappan.jpg',
            'ceylon_milk_tea.jpg',
            'wild_berry_chia_bowl.jpg',
            'passion_fruit_mocktail.jpg'
          ],
          'rec-berry-bowl': [
            'wild_berry_chia_bowl.jpg',
            'refreshing_cooler_drink.jpg',
            'passion_fruit_mocktail.jpg',
            'dessert_chocolate_lava.jpg',
            'ceylon_milk_tea.jpg'
          ],
          'rec-passion-mojito': [
            'passion_fruit_mocktail.jpg',
            'refreshing_cooler_drink.jpg',
            'wild_berry_chia_bowl.jpg',
            'ceylon_milk_tea.jpg',
            'honey_soy_salmon.jpg'
          ],
          'rec-king-coconut': [
            'refreshing_cooler_drink.jpg',
            'passion_fruit_mocktail.jpg',
            'sri_lankan_pol_roti.jpg',
            'ceylon_milk_tea.jpg',
            'sri_lankan_dhal_curry.jpg'
          ]
        };

        for (const r of allR) {
          const localSeed = defaultGalleryMap[r.id];
          if (localSeed) {
            // Auto migrate any existing records from Unsplash to crisp local images
            if (!r.imageUrl || r.imageUrl.includes('unsplash.com') || !r.images || r.images.length < 3 || r.images[0].includes('unsplash.com')) {
              await db.recipes.update(r.id, { images: localSeed, imageUrl: localSeed[0] });
            }
          }
        }
      } catch (galleryErr) {
        console.warn("Gallery init warning:", galleryErr);
      }

      // Ensure default admin user exists with credentials Supun@admin / 1999$#@
      const adminUser = await db.users.where('username').equalsIgnoreCase('Supun@admin').first();
      if (!adminUser) {
        await db.users.put({
          id: "usr-admin-supun",
          username: "Supun@admin",
          email: "supun@tastynest.com",
          password: "1999$#@",
          name: "Supun (Admin)"
        });
      } else {
        await db.users.update(adminUser.id, {
          username: "Supun@admin",
          password: "1999$#@",
          name: "Supun (Admin)"
        });
      }

      // Initialize Firebase sync if configured
      if (typeof TastyConfig !== 'undefined' && TastyConfig.isFirebaseConfigured()) {
        TastyConfig.initFirebase();
        this.setupFirestoreSync();
      }
    } catch (err) {
      console.error("Dexie init error:", err);
      }
    })();
    return this._initPromise;
  },
/**
   * Sets up real-time listener for Firestore recipes collection
   */
  setupFirestoreSync() {
    if (!window.db_firestore || this._firestoreSyncInitialized) return;
    this._firestoreSyncInitialized = true;
    console.log("[TastyDB] 🔄 Setting up real-time Firestore sync listener on 'recipes' collection...");

    // Auto-seed Firestore silently in the background if the collection is currently empty
    try {
      window.db_firestore.collection('recipes').limit(1).get().then(async (snap) => {
        if (snap.empty) {
          console.log("[TastyDB] Firestore recipes collection is empty. Auto-uploading recipes to Firestore...");
          await this.syncLocalToFirestore();
        }
      }).catch(err => {
        console.warn("[TastyDB] Auto-sync to Firestore note:", err.message);
      });
    } catch (e) {}

    try {
      window.db_firestore.collection('recipes').onSnapshot(async (snapshot) => {
        if (!snapshot || snapshot.empty) return;
        let hasChanges = false;
        for (const change of snapshot.docChanges()) {
          const data = change.doc.data();
          if (change.type === 'added' || change.type === 'modified') {
            await this._cacheFirestoreRecipeLocally(data);
            hasChanges = true;
          } else if (change.type === 'removed') {
            const remId = data.id || change.doc.id;
            await db.recipes.delete(remId);
            await db.ingredients.where('recipeId').equals(remId).delete();
            await db.instructions.where('recipeId').equals(remId).delete();
            await db.nutrition.where('recipeId').equals(remId).delete();
            hasChanges = true;
          }
        }

        if (hasChanges && typeof window.onFirestoreRecipesUpdated === 'function') {
          window.onFirestoreRecipesUpdated();
        }
      }, (error) => {
        console.warn("[TastyDB] Firestore onSnapshot error:", error);
      });
    } catch (e) {
      console.warn("[TastyDB] Error setting up snapshot listener:", e);
    }
  },

  /**
   * Caches a Firestore recipe document into local Dexie IndexedDB
   */
  async _cacheFirestoreRecipeLocally(data) {
    if (!data || !data.id) return;
    const recipeId = data.id;

    let rawImages = [];
    if (Array.isArray(data.images) && data.images.length > 0) {
      rawImages = data.images.filter(img => typeof img === 'string' && img.trim().length > 0);
    } else if (data.imageUrl && data.imageUrl.trim().length > 0) {
      rawImages = [data.imageUrl.trim()];
    } else {
      rawImages = ['sri_lankan_crab_curry.jpg'];
    }
    const images = rawImages.map(img => this.normalizeImagePath(img));

    const recipeRecord = {
      id: recipeId,
      title: data.title || 'Untitled Recipe',
      slug: data.slug || (data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : recipeId),
      description: data.description || '',
      category: data.category || 'Quick Dinners',
      badgeTop: data.badgeTop || 'Quick & Easy',
      badgeBottom: data.badgeBottom || `${data.servings || 4} Servings`,
      author: data.author || 'Tasty Nest Team',
      isHero: !!data.isHero,
      prepTime: parseInt(data.prepTime) || 15,
      cookTime: parseInt(data.cookTime) || 20,
      servings: parseInt(data.servings) || 4,
      imageUrl: images[0],
      images: images,
      videoUrl: data.videoUrl || '',
      rating: data.rating || 4.9,
      reviewsCount: data.reviewsCount || 120,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };

    await db.recipes.put(recipeRecord);

    // Sync ingredients
    await db.ingredients.where('recipeId').equals(recipeId).delete();
    if (Array.isArray(data.ingredients)) {
      for (const ing of data.ingredients) {
        if (ing && (ing.name || typeof ing === 'string')) {
          await db.ingredients.put({
            id: ing.id || ('ing-' + Math.random().toString(36).substr(2, 9)),
            recipeId,
            name: (ing.name || ing).toString().trim(),
            amount: ing.amount ? ing.amount.toString().trim() : ''
          });
        }
      }
    }

    // Sync instructions
    await db.instructions.where('recipeId').equals(recipeId).delete();
    if (Array.isArray(data.instructions)) {
      let stepNum = 1;
      for (const inst of data.instructions) {
        if (inst && (inst.description || typeof inst === 'string')) {
          await db.instructions.put({
            id: inst.id || ('inst-' + Math.random().toString(36).substr(2, 9)),
            recipeId,
            stepNumber: inst.stepNumber || stepNum++,
            description: (inst.description || inst).toString().trim()
          });
        }
      }
    }

    // Sync nutrition
    await db.nutrition.where('recipeId').equals(recipeId).delete();
    if (data.nutrition) {
      await db.nutrition.put({
        id: 'nut-' + recipeId,
        recipeId,
        calories: parseInt(data.nutrition.calories) || 450,
        protein: (data.nutrition.protein || '20g').toString(),
        carbs: (data.nutrition.carbs || '35g').toString(),
        fat: (data.nutrition.fat || '18g').toString()
      });
    }
  },

  /**
   * One-click tool to migrate all existing local recipes to Firestore
   */
  async syncLocalToFirestore() {
    if (!window.isFirestoreActive || !window.db_firestore) {
      throw new Error("Firebase Firestore is not connected yet. Please configure your Firebase keys in Cloud Settings.");
    }

    const allLocalRecipes = await db.recipes.toArray();
    let syncedCount = 0;

    for (const r of allLocalRecipes) {
      const full = await this.getRecipe(r.id);
      if (full) {
        await window.db_firestore.collection('recipes').doc(r.id).set(full, { merge: true });
        syncedCount++;
      }
    }

    console.log(`[TastyDB] Synced ${syncedCount} recipes to Firebase Firestore!`);
    return syncedCount;
  },

  async seed() {
    await db.recipes.clear();
    await db.ingredients.clear();
    await db.instructions.clear();
    await db.nutrition.clear();
    try {
      await db.reviews.clear();
      await db.reviews.bulkPut(DEFAULT_REVIEWS);
    } catch (e) {
      console.warn("Reviews seed warning:", e);
    }

    for (const item of INITIAL_RECIPES) {
      await db.recipes.put(item.recipe);
      for (const ing of item.ingredients) {
        await db.ingredients.put({
          id: 'ing-' + Math.random().toString(36).substr(2, 9),
          recipeId: item.recipe.id,
          name: ing.name,
          amount: ing.amount
        });
      }
      for (const inst of item.instructions) {
        await db.instructions.put({
          id: 'inst-' + Math.random().toString(36).substr(2, 9),
          recipeId: item.recipe.id,
          stepNumber: inst.stepNumber,
          description: inst.description
        });
      }
      await db.nutrition.put({
        id: 'nut-' + item.recipe.id,
        recipeId: item.recipe.id,
        calories: item.nutrition.calories,
        protein: item.nutrition.protein,
        carbs: item.nutrition.carbs,
        fat: item.nutrition.fat
      });
    }
  },

  async getHeroRecipe() {
    return (await db.recipes.get('rec-crab-curry')) || (await db.recipes.first());
  },

  async getAllRecipes(filters = {}) {
    // If Firebase Firestore is active, fetch from cloud and refresh local cache
    if (window.isFirestoreActive && window.db_firestore) {
      try {
        const snap = await window.db_firestore.collection('recipes').get();
        if (!snap.empty) {
          for (const doc of snap.docs) {
            await this._cacheFirestoreRecipeLocally(doc.data());
          }
        }
      } catch (fe) {
        console.warn("[TastyDB] Firestore fetch failed, serving from local cache:", fe);
      }
    }

    let recipes = await db.recipes.toArray();

    // Attach nutrition info to list items
    const enriched = await Promise.all(recipes.map(async r => {
      const nut = await db.nutrition.where('recipeId').equals(r.id).first();
      return { ...r, nutrition: nut };
    }));

    // Filter by category with alias matching
    let result = enriched;
    if (filters.category && filters.category !== "All Popular" && filters.category !== "All") {
      result = result.filter(r => matchesCategory(r.category, filters.category));
    }

    // Filter by query (title, description, category, author)
    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.author && r.author.toLowerCase().includes(q))
      );
    }

    // Filter by max prep/cook time
    if (filters.maxTime && !isNaN(filters.maxTime) && filters.maxTime > 0) {
      result = result.filter(r => (r.prepTime + r.cookTime) <= filters.maxTime);
    }

    // Sort order
    if (filters.sort === "quickest") {
      result.sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
    } else if (filters.sort === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sort === "pinned") {
      result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else {
      // Default: exclude hero or order nicely
      result.sort((a, b) => {
        if (a.isHero) return 1;
        if (b.isHero) return -1;
        return (b.rating || 0) - (a.rating || 0);
      });
    }

    return result.map(r => ({
      ...r,
      imageUrl: this.normalizeImagePath(r.imageUrl),
      images: Array.isArray(r.images) ? r.images.map(img => this.normalizeImagePath(img)) : [this.normalizeImagePath(r.imageUrl)]
    }));
  },
async getRecipe(id) {
    if (window.isFirestoreActive && window.db_firestore) {
      try {
        const doc = await window.db_firestore.collection('recipes').doc(id).get();
        if (doc.exists) {
          const cloudData = doc.data();
          await this._cacheFirestoreRecipeLocally(cloudData);
        }
      } catch (e) {
        console.warn("[TastyDB] Firestore getRecipe fallback to local:", e);
      }
    }

    const recipe = await db.recipes.get(id);
    if (!recipe) return null;

    const ingredients = await db.ingredients.where('recipeId').equals(id).toArray();
    const instructions = await db.instructions.where('recipeId').equals(id).sortBy('stepNumber');
    const nutrition = await db.nutrition.where('recipeId').equals(id).first();

    const images = Array.isArray(recipe.images) && recipe.images.length > 0
      ? recipe.images
      : (recipe.imageUrl ? [recipe.imageUrl] : ['https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80']);

    return {
      ...recipe,
      images: images.map(img => this.normalizeImagePath(img)),
      imageUrl: this.normalizeImagePath(images[0] || recipe.imageUrl),
      ingredients,
      instructions,
      nutrition
    };
  },

  async saveRecipe(data) {
    const isEdit = !!data.id;
    const recipeId = isEdit ? data.id : 'rec-' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    let rawImages = [];
    if (Array.isArray(data.images) && data.images.length > 0) {
      rawImages = data.images.filter(img => typeof img === 'string' && img.trim().length > 0);
    } else if (data.imageUrl && data.imageUrl.trim().length > 0) {
      rawImages = [data.imageUrl.trim()];
    } else {
      rawImages = ['sri_lankan_crab_curry.jpg'];
    }
    const images = rawImages.slice(0, 5).map(img => this.normalizeImagePath(img));

    const recipeRecord = {
      id: recipeId,
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: data.description || '',
      category: data.category || '15-Min Quick Dinners',
      badgeTop: data.badgeTop || 'Quick & Easy',
      badgeBottom: data.badgeBottom || `${data.servings || 4} Servings`,
      author: data.author || 'Tasty Nest Team',
      isHero: !!data.isHero,
      prepTime: parseInt(data.prepTime) || 15,
      cookTime: parseInt(data.cookTime) || 20,
      servings: parseInt(data.servings) || 4,
      imageUrl: images[0],
      images: images,
      videoUrl: data.videoUrl || '',
      rating: data.rating || 4.9,
      reviewsCount: data.reviewsCount || 120,
      createdAt: data.createdAt || now,
      updatedAt: now
    };

    await db.recipes.put(recipeRecord);
    await db.ingredients.where('recipeId').equals(recipeId).delete();
    await db.instructions.where('recipeId').equals(recipeId).delete();
    await db.nutrition.where('recipeId').equals(recipeId).delete();

    // Insert Ingredients
    if (Array.isArray(data.ingredients)) {
      for (const ing of data.ingredients) {
        if (ing.name && ing.name.trim()) {
          await db.ingredients.add({
            id: 'ing-' + Math.random().toString(36).substr(2, 9),
            recipeId,
            name: ing.name.trim(),
            amount: ing.amount ? ing.amount.trim() : ''
          });
        }
      }
    }

    // Insert Instructions
    if (Array.isArray(data.instructions)) {
      let stepNum = 1;
      for (const inst of data.instructions) {
        if (inst.description && inst.description.trim()) {
          await db.instructions.add({
            id: 'inst-' + Math.random().toString(36).substr(2, 9),
            recipeId,
            stepNumber: stepNum++,
            description: inst.description.trim()
          });
        }
      }
    }

    // Insert Nutrition
    await db.nutrition.put({
        id: 'nut-' + recipeId,
        recipeId,
      calories: parseInt(data.nutrition?.calories) || 450,
      protein: data.nutrition?.protein ? data.nutrition.protein.toString() : '20g',
      carbs: data.nutrition?.carbs ? data.nutrition.carbs.toString() : '35g',
      fat: data.nutrition?.fat ? data.nutrition.fat.toString() : '18g'
    });

    // Save to Firebase Firestore so ALL users across devices can see it instantly
    if (window.isFirestoreActive && window.db_firestore) {
      try {
        const fullFirestoreRecord = {
          ...recipeRecord,
          ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
          instructions: Array.isArray(data.instructions) ? data.instructions.map((ins, idx) => ({
            stepNumber: idx + 1,
            description: (ins.description || ins).toString()
          })) : [],
          nutrition: {
            calories: parseInt(data.nutrition?.calories) || 450,
            protein: data.nutrition?.protein ? data.nutrition.protein.toString() : '20g',
            carbs: data.nutrition?.carbs ? data.nutrition.carbs.toString() : '35g',
            fat: data.nutrition?.fat ? data.nutrition.fat.toString() : '18g'
          }
        };

        await window.db_firestore.collection('recipes').doc(recipeId).set(fullFirestoreRecord, { merge: true });
        console.log("[TastyDB] 🔥 Recipe published to Firebase Firestore! Everyone can now view it! ID:", recipeId);
      } catch (fsErr) {
        console.error("[TastyDB] Error publishing recipe to Firestore:", fsErr);
      }
    }

    return recipeId;
  },

  async deleteRecipe(id) {
    await db.recipes.delete(id);
    await db.ingredients.where('recipeId').equals(id).delete();
    await db.instructions.where('recipeId').equals(id).delete();
    await db.nutrition.where('recipeId').equals(id).delete();
    await db.favorites.where('recipeId').equals(id).delete();

    // Also delete from Firebase Firestore
    if (window.isFirestoreActive && window.db_firestore) {
      try {
        await window.db_firestore.collection('recipes').doc(id).delete();
        console.log("[TastyDB] Recipe deleted from Firebase Firestore! ID:", id);
      } catch (fsErr) {
        console.error("[TastyDB] Error deleting recipe from Firestore:", fsErr);
      }
    }
  },

  async toggleFavorite(recipeId) {
    const existing = await db.favorites.where('recipeId').equals(recipeId).first();
    if (existing) {
      await db.favorites.delete(existing.id);
      return false;
    } else {
      await db.favorites.add({
        id: 'fav-' + Math.random().toString(36).substr(2, 9),
        recipeId,
        savedAt: new Date().toISOString()
      });
      return true;
    }
  },

  async isFavorite(recipeId) {
    const existing = await db.favorites.where('recipeId').equals(recipeId).first();
    return !!existing;
  },

  async getFavoriteRecipes() {
    const favs = await db.favorites.toArray();
    const recipeIds = favs.map(f => f.recipeId);
    const recipes = await db.recipes.where('id').anyOf(recipeIds).toArray();
    return Promise.all(recipes.map(async r => {
      const nut = await db.nutrition.where('recipeId').equals(r.id).first();
      return { ...r, nutrition: nut };
    }));
  },

  async exportJSON() {
    const recipes = await db.recipes.toArray();
    const ingredients = await db.ingredients.toArray();
    const instructions = await db.instructions.toArray();
    const nutrition = await db.nutrition.toArray();
    const subscribers = await db.subscribers ? await db.subscribers.toArray() : [];
    const reviews = await db.reviews ? await db.reviews.toArray() : [];
    return JSON.stringify({ recipes, ingredients, instructions, nutrition, subscribers, reviews }, null, 2);
  },

  async importJSON(jsonStr) {
    const data = JSON.parse(jsonStr);
    if (!data.recipes) throw new Error("Invalid recipe backup format");
    await db.recipes.bulkPut(data.recipes);
    if (data.ingredients) await db.ingredients.bulkPut(data.ingredients);
    if (data.instructions) await db.instructions.bulkPut(data.instructions);
    if (data.nutrition) await db.nutrition.bulkPut(data.nutrition);
    if (data.subscribers && db.subscribers) await db.subscribers.bulkPut(data.subscribers);
    if (data.reviews && db.reviews) await db.reviews.bulkPut(data.reviews);
  },

  // Subscriber Leads Management
  async saveSubscriber(email, source = "7-Day Recipe Book Claim") {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error("Please enter a valid email address");
    }
    const existing = await db.subscribers.where('email').equals(cleanEmail).first();
    if (existing) {
      await db.subscribers.update(existing.id, {
        subscribedAt: new Date().toISOString(),
        source: source || existing.source
      });
      return { id: existing.id, email: cleanEmail, isNew: false };
    }
    const newSub = {
      id: 'sub-' + Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
      source: source || "7-Day Recipe Book Claim"
    };
    await db.subscribers.add(newSub);
    return { ...newSub, isNew: true };
  },

  async getSubscribers() {
    try {
      const subs = await db.subscribers.toArray();
      return subs.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));
    } catch (e) {
      console.warn("getSubscribers error:", e);
      return [];
    }
  },

  async deleteSubscriber(id) {
    await db.subscribers.delete(id);
  },

  // 5-Star Reviews & Ratings System
  async getRecipeReviews(recipeId) {
    try {
      const reviews = await db.reviews.where('recipeId').equals(recipeId).toArray();
      return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
      console.warn("getRecipeReviews error:", e);
      return [];
    }
  },

  async getAllReviews() {
    try {
      const reviews = await db.reviews.toArray();
      const recipes = await db.recipes.toArray();
      const recipeMap = new Map(recipes.map(r => [r.id, r]));
      
      const enriched = reviews.map(rev => ({
        ...rev,
        recipeTitle: recipeMap.get(rev.recipeId)?.title || "Unknown Recipe",
        recipeCategory: recipeMap.get(rev.recipeId)?.category || "Recipe"
      }));

      return enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
      console.warn("getAllReviews error:", e);
      return [];
    }
  },

  async addRecipeReview({ recipeId, author, rating, comment }) {
    if (!recipeId) throw new Error("Recipe ID is required");
    const parsedRating = Math.min(5, Math.max(1, parseInt(rating) || 5));
    const cleanAuthor = (author || '').trim() || 'Verified Home Cook';
    const cleanComment = (comment || '').trim();

    if (!cleanComment) {
      throw new Error("Please write a short review or cooking note");
    }

    const review = {
      id: 'rev-' + Math.random().toString(36).substr(2, 9),
      recipeId,
      author: cleanAuthor,
      rating: parsedRating,
      comment: cleanComment,
      createdAt: new Date().toISOString()
    };

    await db.reviews.add(review);

    // Recalculate average rating & reviews count
    const allForRecipe = await db.reviews.where('recipeId').equals(recipeId).toArray();
    const sum = allForRecipe.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = allForRecipe.length > 0 ? (sum / allForRecipe.length).toFixed(1) : "5.0";
    const count = allForRecipe.length;

    await db.recipes.update(recipeId, {
      rating: parseFloat(avg),
      reviewsCount: count
    });

    return { review, newRating: parseFloat(avg), newCount: count };
  },

  async deleteReview(id) {
    const rev = await db.reviews.get(id);
    if (!rev) return;
    await db.reviews.delete(id);

    // Recalculate for the recipe
    const recipeId = rev.recipeId;
    const allForRecipe = await db.reviews.where('recipeId').equals(recipeId).toArray();
    const sum = allForRecipe.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = allForRecipe.length > 0 ? (sum / allForRecipe.length).toFixed(1) : "5.0";
    const count = allForRecipe.length;

    await db.recipes.update(recipeId, {
      rating: parseFloat(avg),
      reviewsCount: count
    });
  },

  async getPinterestBoards() {
    let boards = await db.pinterestBoards.orderBy('order').toArray();
    if (!boards || boards.length === 0) {
      await db.pinterestBoards.bulkPut(DEFAULT_PINTEREST_BOARDS);
      boards = await db.pinterestBoards.orderBy('order').toArray();
    }
    return (boards || []).map(b => ({ ...b, imageUrl: this.normalizeImagePath(b.imageUrl) }));
  },
  async savePinterestBoard(board) {
    if (board && board.imageUrl) {
      board.imageUrl = this.normalizeImagePath(board.imageUrl);
    }
    await db.pinterestBoards.put(board);
    if (window.isFirestoreActive && window.db_firestore) {
      try {
        await window.db_firestore.collection('pinterestBoards').doc(board.id).set(board, { merge: true });
      } catch(e) {}
    }
  },

  async deletePinterestBoard(id) {
    await db.pinterestBoards.delete(id);
    if (window.isFirestoreActive && window.db_firestore) {
      try {
        await window.db_firestore.collection('pinterestBoards').doc(id).delete();
      } catch(e) {}
    }
  },

  async resetPinterestBoards() {
    await db.pinterestBoards.clear();
    await db.pinterestBoards.bulkPut(DEFAULT_PINTEREST_BOARDS);
  },

  async getHeroConfig() {
    try {
      const stored = localStorage.getItem('tastynest_hero_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.imageUrl = this.normalizeImagePath(parsed.imageUrl);
        return parsed;
      }
      if (window.isFirestoreActive && window.db_firestore) {
        const doc = await window.db_firestore.collection('config').doc('hero').get();
        if (doc.exists) {
          const data = doc.data();
          localStorage.setItem('tastynest_hero_config', JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn("Could not load hero config:", e);
    }
    const resCfg = { ...DEFAULT_HERO_CONFIG };
    resCfg.imageUrl = this.normalizeImagePath(resCfg.imageUrl);
    return resCfg;
  },
async saveHeroConfig(config) {
    const merged = { ...DEFAULT_HERO_CONFIG, ...config };
    localStorage.setItem('tastynest_hero_config', JSON.stringify(merged));
    if (window.isFirestoreActive && window.db_firestore) {
      try {
        await window.db_firestore.collection('config').doc('hero').set(merged, { merge: true });
      } catch (e) {
        console.warn("Could not sync hero config to Firestore:", e);
      }
    }
    return merged;
  },

  async resetHeroConfig() {
    localStorage.removeItem('tastynest_hero_config');
    if (window.isFirestoreActive && window.db_firestore) {
      try {
        await window.db_firestore.collection('config').doc('hero').set(DEFAULT_HERO_CONFIG);
      } catch (e) {}
    }
    return { ...DEFAULT_HERO_CONFIG };
  },

  async authenticateUser(loginInput, password) {
    const q = (loginInput || '').toLowerCase().trim();
    if (!q || !password) return null;

    try {
      const allUsers = await db.users.toArray();
      const found = allUsers.find(u => 
        (u.username && u.username.toLowerCase() === q) || 
        (u.email && u.email.toLowerCase() === q)
      );
      if (found && found.password === password) {
        return found;
      }
    } catch (e) {
      console.warn("DB user lookup fallback", e);
    }

    // Direct fallback for Supun@admin with password 1999$#@
    if ((q === 'supun@admin' || q === 'supun@tastynest.com') && password === '1999$#@') {
      return { id: 'usr-admin-supun', username: 'Supun@admin', email: 'supun@tastynest.com', name: 'Supun (Admin)' };
    }

    // Legacy fallback
    if ((q === 'admin' || q === 'admin@tastynest.com') && password === 'admin123') {
      return { id: 'usr-admin-1', username: 'admin', email: 'admin@tastynest.com', name: 'Tasty Nest Head Chef' };
    }
    return null;
  }
};

TastyDB.init();

window.normalizeImagePath = function (url) {
  if (!url || typeof url !== 'string') return '';
  url = url.trim();
  if (/^(\.\/|\/)?images\//i.test(url)) {
    return url.replace(/^(\.\/|\/)?images\//i, '');
  }
  return url;
};
