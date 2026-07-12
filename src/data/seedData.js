// Initial Database Seed Data for Grocery & E-Commerce Admin Platform

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Organic Hass Avocados (Pack of 4)',
    sku: 'GR-AVO-001',
    barcode: '033383049102',
    category: 'Fresh Produce',
    subCategory: 'Fresh Fruits',
    brand: 'Nature Organic',
    description: 'Creamy, rich Hass avocados, high in healthy monounsaturated fats. Perfect for salads, toast, or freshly made guacamole.',
    ingredients: '100% Organic Hass Avocados',
    nutritionFacts: 'Calories: 240, Fat: 22g, Carbs: 12g, Fiber: 10g, Protein: 3g (per avocado)',
    storageInstructions: 'Store at room temperature until ripe, then refrigerate for up to 3-5 days.',
    countryOfOrigin: 'Mexico',
    images: [
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1604085792782-8d92f276d7d8?auto=format&fit=crop&q=80&w=400'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-slicing-an-avocado-in-half-39962-large.mp4',
    seoTitle: 'Buy Organic Hass Avocados Online | UK E-commerce',
    seoDescription: 'Order premium organic Hass avocados online. Perfect ripeness, rich taste, packed with nutrients. Free delivery on orders above $35.',
    status: 'Published',
    regularPrice: 6.99,
    salePrice: 4.99,
    costPrice: 2.80,
    taxClass: 'Standard (10%)',
    weight: '600g',
    packSize: '4 pieces',
    color: 'Green / Black',
    stock: 145,
    minStock: 20,
    maxStock: 500,
    reorderLevel: 30,
    warehouseLocation: 'Aisle 3, Shelf B2',
    supplier: 'EarthCare Distributors',
    rating: 4.8,
    reviewsCount: 34
  },
  {
    id: 'prod-2',
    name: 'Honeycrisp Apples (1kg)',
    sku: 'GR-APP-002',
    barcode: '400122119934',
    category: 'Fresh Produce',
    subCategory: 'Fresh Fruits',
    brand: 'Nature Organic',
    description: 'Crisp, sweet, and wonderfully juicy organic Honeycrisp apples. Grown locally in Washington orchards.',
    ingredients: '100% Organic Honeycrisp Apples',
    nutritionFacts: 'Calories: 95, Fat: 0.3g, Carbs: 25g, Sugar: 19g, Fiber: 4.4g (per medium apple)',
    storageInstructions: 'Keep refrigerated for maximum crispness and shelf life.',
    countryOfOrigin: 'USA',
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=400'
    ],
    videoUrl: '',
    seoTitle: 'Sweet Honeycrisp Apples Organic 1kg | UK E-commerce',
    seoDescription: 'Crispy Washington Honeycrisp apples, sweet and tart taste. Handpicked, organic, and delivered fresh to your door.',
    status: 'Published',
    regularPrice: 5.49,
    salePrice: 5.49,
    costPrice: 2.10,
    taxClass: 'Standard (10%)',
    weight: '1kg',
    packSize: 'Approx. 5-6 pieces',
    color: 'Red/Yellow',
    stock: 220,
    minStock: 40,
    maxStock: 600,
    reorderLevel: 50,
    warehouseLocation: 'Aisle 3, Shelf A1',
    supplier: 'Valley Fresh Farms',
    rating: 4.6,
    reviewsCount: 22
  },
  {
    id: 'prod-3',
    name: 'Organic Whole Milk 3.8% (1.89L)',
    sku: 'DY-MIL-003',
    barcode: '071100223908',
    category: 'Dairy & Eggs',
    subCategory: 'Milk & Cream',
    brand: 'Clover Meadows',
    description: 'Ultra-pasteurized organic whole milk. Rich in vitamin D and pasteurized for freshness from pasture-raised cows.',
    ingredients: 'Organic Whole Milk, Vitamin D3',
    nutritionFacts: 'Calories: 150, Fat: 8g, Cholesterol: 35mg, Sodium: 120mg, Carbs: 12g, Protein: 8g (per 240ml cup)',
    storageInstructions: 'Keep refrigerated at all times. Use within 7 days of opening.',
    countryOfOrigin: 'USA',
    images: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400'
    ],
    videoUrl: '',
    seoTitle: 'Clover Meadows Organic Whole Milk 1.89L | UK E-commerce',
    seoDescription: 'Fresh pasture-raised organic milk from Clover Meadows. High in calcium and vitamin D. Delivered cold.',
    status: 'Published',
    regularPrice: 4.89,
    salePrice: 4.29,
    costPrice: 2.05,
    taxClass: 'Standard (10%)',
    weight: '1.89L',
    packSize: 'Half Gallon carton',
    color: 'White',
    stock: 12,
    minStock: 15,
    maxStock: 120,
    reorderLevel: 25,
    warehouseLocation: 'Cold Room, Shelf D1',
    supplier: 'Clover Meadows Dairies',
    rating: 4.9,
    reviewsCount: 56
  },
  {
    id: 'prod-4',
    name: 'Freshly Baked Sourdough Bread (500g)',
    sku: 'BK-SOU-004',
    barcode: '739220038410',
    category: 'Bakery',
    subCategory: 'Breads & Buns',
    brand: 'Artisan Oven',
    description: 'Traditionally fermented sourdough loaf with a blistered, crispy crust and soft, aerated crumb.',
    ingredients: 'Unbleached Wheat Flour, Water, Wild Yeast Starter, Sea Salt',
    nutritionFacts: 'Calories: 140, Fat: 0.5g, Carbs: 28g, Fiber: 1.2g, Protein: 5g (per slice)',
    storageInstructions: 'Store in a paper bag at room temperature. Slice and freeze for longer storage.',
    countryOfOrigin: 'USA',
    images: [
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=400'
    ],
    videoUrl: '',
    seoTitle: 'Artisan Crusty Sourdough Loaf 500g | UK E-commerce',
    seoDescription: 'Traditional sourdough baked daily. Slow fermented for delicious tangy flavor and soft texture. Order now.',
    status: 'Published',
    regularPrice: 5.99,
    salePrice: 5.99,
    costPrice: 1.50,
    taxClass: 'Standard (10%)',
    weight: '500g',
    packSize: '1 Loaf',
    color: 'Golden Brown',
    stock: 0,
    minStock: 10,
    maxStock: 80,
    reorderLevel: 15,
    warehouseLocation: 'Aisle 1, Shelf C1',
    supplier: 'Artisan Oven Bakery',
    rating: 4.7,
    reviewsCount: 19
  },
  {
    id: 'prod-5',
    name: 'Almond Breeze Almond Milk (Unsweetened)',
    sku: 'DY-ALM-005',
    barcode: '025293600277',
    category: 'Dairy & Eggs',
    subCategory: 'Plant Milks',
    brand: 'Blue Diamond',
    description: 'A delicious, calcium-rich alternative milk made with real California almonds. Free of soy, lactose, and gluten.',
    ingredients: 'Almondmilk (Filtered Water, Almonds), Calcium Carbonate, Sea Salt, Potassium Citrate, Sunflower Lecithin, Gellan Gum',
    nutritionFacts: 'Calories: 30, Fat: 2.5g, Carbs: 1g, Fiber: <1g, Protein: 1g (per 240ml)',
    storageInstructions: 'Refrigerate after opening. Shake well before serving.',
    countryOfOrigin: 'USA',
    images: [
      'https://images.unsplash.com/photo-1568651343853-21986d4e2a2c?auto=format&fit=crop&q=80&w=400'
    ],
    videoUrl: '',
    seoTitle: 'Blue Diamond Unsweetened Almond Milk | UK E-commerce',
    seoDescription: 'Blue Diamond Almond Breeze Unsweetened almond milk. Low calorie, plant-based dairy alternative.',
    status: 'Draft',
    regularPrice: 3.49,
    salePrice: 2.99,
    costPrice: 1.40,
    taxClass: 'Standard (10%)',
    weight: '1L',
    packSize: '1 Carton',
    color: 'White',
    stock: 80,
    minStock: 20,
    maxStock: 300,
    reorderLevel: 40,
    warehouseLocation: 'Aisle 6, Shelf A3',
    supplier: 'Blue Diamond Foods Ltd',
    rating: 4.5,
    reviewsCount: 15
  },
  {
    id: 'prod-6',
    name: 'Gluten-Free Oats (1kg)',
    sku: 'PT-OAT-006',
    barcode: '600106201384',
    category: 'Pantry',
    subCategory: 'Cereals & Grains',
    brand: 'Nature Organic',
    description: '100% whole grain rolled oats, processed in a certified gluten-free facility. Perfect for morning oatmeal and baking.',
    ingredients: '100% Whole Grain Gluten-Free Rolled Oats',
    nutritionFacts: 'Calories: 150, Fat: 3g, Carbs: 27g, Sugar: 1g, Fiber: 4g, Protein: 5g (per 40g serving)',
    storageInstructions: 'Store in a cool, dry place in an airtight container.',
    countryOfOrigin: 'Canada',
    images: [
      'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&q=80&w=400'
    ],
    videoUrl: '',
    seoTitle: 'Certified Gluten Free Rolled Oats 1kg | UK E-commerce',
    seoDescription: 'High quality whole grain rolled oats. Certified gluten free, high fiber. Shop pantry essentials on UK E-commerce.',
    status: 'Published',
    regularPrice: 7.99,
    salePrice: 6.49,
    costPrice: 3.20,
    taxClass: 'Standard (10%)',
    weight: '1kg',
    packSize: '1 Bag',
    color: 'Beige',
    stock: 94,
    minStock: 15,
    maxStock: 200,
    reorderLevel: 25,
    warehouseLocation: 'Aisle 8, Shelf D2',
    supplier: 'Valley Farms Packing',
    rating: 4.8,
    reviewsCount: 42
  },
  {
    id: 'prod-7',
    name: 'Extra Virgin Olive Oil (500ml)',
    sku: 'PT-OIL-007',
    barcode: '800222019941',
    category: 'Pantry',
    subCategory: 'Oils & Vinegar',
    brand: 'Blue Diamond',
    description: 'Cold-pressed extra virgin olive oil imported from Tuscan estates. Excellent for dressing salads and sautéing.',
    ingredients: '100% Extra Virgin Olive Oil',
    nutritionFacts: 'Calories: 120, Fat: 14g, Saturated Fat: 2g, Monounsaturated: 10g (per tablespoon)',
    storageInstructions: 'Store in a cool dark place away from heat and light.',
    countryOfOrigin: 'Italy',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400'
    ],
    videoUrl: '',
    seoTitle: 'Italian Cold Pressed Extra Virgin Olive Oil 500ml',
    seoDescription: 'Premium Italian cold-pressed EVOO. Perfect flavor profile, dark glass container, rich antioxidants. Buy on UK E-commerce.',
    status: 'Published',
    regularPrice: 14.99,
    salePrice: 12.99,
    costPrice: 6.80,
    taxClass: 'Zero Rated',
    weight: '500ml',
    packSize: '1 Bottle',
    color: 'Golden Green',
    stock: 65,
    minStock: 10,
    maxStock: 150,
    reorderLevel: 15,
    warehouseLocation: 'Aisle 8, Shelf A4',
    supplier: 'Tuscan Groves Importing',
    rating: 4.9,
    reviewsCount: 68
  },
  {
    id: 'prod-8',
    name: 'Gourmet Chocolate Chip Cookies',
    sku: 'BK-CKI-008',
    barcode: '070200384102',
    category: 'Bakery',
    subCategory: 'Cookies & Pastries',
    brand: 'Artisan Oven',
    description: 'Decadent cookies loaded with Belgian dark chocolate chunks, baked to soft, chewy perfection with a pinch of sea salt.',
    ingredients: 'Enriched Flour, Semi-sweet Belgian Chocolate, Butter, Cane Sugar, Eggs, Sea Salt, Vanilla Extract',
    nutritionFacts: 'Calories: 180, Fat: 9g, Carbs: 24g, Sugar: 14g, Protein: 2g (per cookie)',
    storageInstructions: 'Store in a sealed jar at room temperature. Heat for 10 seconds for fresh-out-of-the-oven flavor.',
    countryOfOrigin: 'USA',
    images: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=400'
    ],
    videoUrl: '',
    seoTitle: 'Belgian Chocolate Chip Soft Cookies | UK E-commerce',
    seoDescription: 'Indulge in artisanal chocolate chip cookies baked fresh daily. Rich dark chocolate chunk filling. Fast delivery.',
    status: 'Published',
    regularPrice: 6.50,
    salePrice: 5.50,
    costPrice: 2.00,
    taxClass: 'Standard (10%)',
    weight: '300g',
    packSize: '6 Pack',
    color: 'Brown',
    stock: 45,
    minStock: 10,
    maxStock: 100,
    reorderLevel: 12,
    warehouseLocation: 'Aisle 1, Shelf C2',
    supplier: 'Artisan Oven Bakery',
    rating: 4.7,
    reviewsCount: 28
  }
];

export const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Fresh Produce', parent: null, description: 'Organic fruits and vegetables sourced directly from local farms.', icon: 'https://images.unsplash.com/photo-1610348725531-843dff163e2c?auto=format&fit=crop&q=80&w=100', displayOrder: 1, status: 'Active' },
  { id: 'cat-1-1', name: 'Fresh Fruits', parent: 'Fresh Produce', description: 'Apples, citrus, berries, and exotic tropical options.', icon: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=100', displayOrder: 1, status: 'Active' },
  { id: 'cat-1-2', name: 'Fresh Vegetables', parent: 'Fresh Produce', description: 'Leafy greens, roots, tubers, and herbs.', icon: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=100', displayOrder: 2, status: 'Active' },
  { id: 'cat-2', name: 'Dairy & Eggs', parent: null, description: 'Grass-fed dairy items, milk alternatives, cheese, and farm eggs.', icon: 'https://images.unsplash.com/photo-1527751171053-6ac5ec50000b?auto=format&fit=crop&q=80&w=100', displayOrder: 2, status: 'Active' },
  { id: 'cat-2-1', name: 'Milk & Cream', parent: 'Dairy & Eggs', description: 'Whole milk, skim milk, buttermilk, and whipping cream.', icon: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=100', displayOrder: 1, status: 'Active' },
  { id: 'cat-2-2', name: 'Plant Milks', parent: 'Dairy & Eggs', description: 'Oat milk, almond milk, soy milk, and coconut blends.', icon: 'https://images.unsplash.com/photo-1568651343853-21986d4e2a2c?auto=format&fit=crop&q=80&w=100', displayOrder: 2, status: 'Active' },
  { id: 'cat-3', name: 'Bakery', parent: null, description: 'Daily fresh sourdough, sliced bread, bagels, and sweet pastries.', icon: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=100', displayOrder: 3, status: 'Active' },
  { id: 'cat-3-1', name: 'Breads & Buns', parent: 'Bakery', description: 'Sourdough, whole wheat loaves, buns, and wraps.', icon: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=100', displayOrder: 1, status: 'Active' },
  { id: 'cat-3-2', name: 'Cookies & Pastries', parent: 'Bakery', description: 'Muffins, cookies, croissants, and celebration cakes.', icon: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=100', displayOrder: 2, status: 'Active' },
  { id: 'cat-4', name: 'Pantry', parent: null, description: 'Baking essentials, oils, vinegar, grains, beans, and canned goods.', icon: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&q=80&w=100', displayOrder: 4, status: 'Active' }
];

export const INITIAL_BRANDS = [
  { id: 'br-1', name: 'Nature Organic', logo: 'https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&q=80&w=100', description: 'Certified 100% organic products raised without synthetic inputs.', website: 'https://natureorganic.com', featured: true, status: 'Active' },
  { id: 'br-2', name: 'Clover Meadows', logo: 'https://images.unsplash.com/photo-1527751171053-6ac5ec50000b?auto=format&fit=crop&q=80&w=100', description: 'Pasture-raised, family-owned dairy farm operating since 1984.', website: 'https://clovermeadowsdairy.com', featured: true, status: 'Active' },
  { id: 'br-3', name: 'Blue Diamond', logo: 'https://images.unsplash.com/photo-1508885368104-a287c8801b7a?auto=format&fit=crop&q=80&w=100', description: 'California cooperative representing almond growers.', website: 'https://bluediamond.com', featured: false, status: 'Active' },
  { id: 'br-4', name: 'Artisan Oven', logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=100', description: 'Stone-hearth bakeries using wild yeast starters and local wheat.', website: 'https://artisanovenco.com', featured: true, status: 'Active' }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@outlook.com',
    phone: '+1 (555) 234-5678',
    address: '472 Orchard Road, apt 4B, Oregon, OR 97201',
    lifetimeValue: 1248.50,
    rewardsPoints: 340,
    wishlist: ['Organic Hass Avocados (Pack of 4)', 'Extra Virgin Olive Oil (500ml)'],
    cartItems: [
      { id: 'ci-1', name: 'Organic Whole Milk 3.8% (1.89L)', qty: 2, price: 4.29 },
      { id: 'ci-2', name: 'Honeycrisp Apples (1kg)', qty: 1, price: 5.49 }
    ],
    status: 'Active',
    joinedDate: '2025-02-14',
    savedAddresses: [
      { id: 'addr-1', label: 'Home', text: '472 Orchard Road, apt 4B, Oregon, OR 97201' },
      { id: 'addr-2', label: 'Office', text: '900 Broadway Ave, Suite 1200, Portland, OR 97205' }
    ]
  },
  {
    id: 'cust-2',
    name: 'Michael Chang',
    email: 'mchang@gmail.com',
    phone: '+1 (555) 890-1234',
    address: '89 Pine Boulevard, Seattle, WA 98101',
    lifetimeValue: 620.40,
    rewardsPoints: 120,
    wishlist: ['Gluten-Free Oats (1kg)'],
    cartItems: [
      { id: 'ci-3', name: 'Gluten-Free Oats (1kg)', qty: 1, price: 6.99 }
    ],
    status: 'Active',
    joinedDate: '2025-05-10',
    savedAddresses: [
      { id: 'addr-3', label: 'Home', text: '89 Pine Boulevard, Seattle, WA 98101' }
    ]
  },
  {
    id: 'cust-3',
    name: 'Emma Rodriguez',
    email: 'emma.r@yahoo.com',
    phone: '+1 (555) 456-7890',
    address: '12 Sweetwater Lane, Austin, TX 78701',
    lifetimeValue: 95.00,
    rewardsPoints: 45,
    wishlist: ['Gourmet Chocolate Chip Cookies', 'Freshly Baked Sourdough Bread (500g)'],
    cartItems: [],
    status: 'Active',
    joinedDate: '2026-01-20',
    savedAddresses: [
      { id: 'addr-4', label: 'Home', text: '12 Sweetwater Lane, Austin, TX 78701' }
    ]
  },
  {
    id: 'cust-4',
    name: 'David Miller',
    email: 'miller.david@mac.com',
    phone: '+1 (555) 345-6789',
    address: '601 Heather Way, Denver, CO 80202',
    lifetimeValue: 2450.00,
    rewardsPoints: 780,
    wishlist: [],
    cartItems: [
      { id: 'ci-4', name: 'Extra Virgin Olive Oil (500ml)', qty: 3, price: 12.99 },
      { id: 'ci-5', name: 'Organic Hass Avocados (Pack of 4)', qty: 2, price: 4.99 },
      { id: 'ci-6', name: 'Freshly Baked Sourdough Bread (500g)', qty: 1, price: 3.49 }
    ],
    status: 'Disabled',
    joinedDate: '2024-08-01',
    savedAddresses: [
      { id: 'addr-5', label: 'Home', text: '601 Heather Way, Denver, CO 80202' }
    ]
  }
];


export const INITIAL_ORDERS = [
  {
    id: 'ord-1001',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.jenkins@outlook.com',
    date: '2026-07-01T14:32:00Z',
    items: [
      { productId: 'prod-1', name: 'Organic Hass Avocados (Pack of 4)', qty: 2, price: 4.99 },
      { productId: 'prod-3', name: 'Organic Whole Milk 3.8% (1.89L)', qty: 1, price: 4.29 }
    ],
    subtotal: 14.27,
    discount: 2.00,
    tax: 1.23,
    deliveryFee: 3.99,
    total: 17.49,
    paymentStatus: 'Paid',
    deliveryStatus: 'Delivered',
    paymentMethod: 'Stripe Credit Card',
    trackingNumber: 'TRK-983011A',
    address: '472 Orchard Road, apt 4B, Oregon, OR 97201',
    timeline: [
      { status: 'New Order', time: '2026-07-01T14:32:00Z', desc: 'Order placed by customer via Mobile Web.' },
      { status: 'Payment Verified', time: '2026-07-01T14:33:10Z', desc: 'Stripe transaction ref txn_83401A approved.' },
      { status: 'Confirmed', time: '2026-07-01T14:40:00Z', desc: 'Order confirmed and pushed to warehouse queue.' },
      { status: 'Picking', time: '2026-07-01T15:00:00Z', desc: 'Items collected by picker Rob J. in Cold Room / Aisle 3.' },
      { status: 'Packing', time: '2026-07-01T15:15:00Z', desc: 'Packed into compostable tote bag and refrigerated storage bin.' },
      { status: 'Ready for Dispatch', time: '2026-07-01T15:30:00Z', desc: 'Staged at loading zone B.' },
      { status: 'Out for Delivery', time: '2026-07-01T16:00:00Z', desc: 'Assigned to driver Leo Green. ETA 20 mins.' },
      { status: 'Delivered', time: '2026-07-01T16:18:00Z', desc: 'Left on porch as requested. Photo upload confirmed.' }
    ]
  },
  {
    id: 'ord-1002',
    customerName: 'Michael Chang',
    customerEmail: 'mchang@gmail.com',
    date: '2026-07-01T18:15:00Z',
    items: [
      { productId: 'prod-2', name: 'Honeycrisp Apples (1kg)', qty: 1, price: 5.49 },
      { productId: 'prod-7', name: 'Extra Virgin Olive Oil (500ml)', qty: 1, price: 12.99 }
    ],
    subtotal: 18.48,
    discount: 0.00,
    tax: 1.85,
    deliveryFee: 0.00,
    total: 20.33,
    paymentStatus: 'Paid',
    deliveryStatus: 'Packing',
    paymentMethod: 'Apple Pay',
    trackingNumber: 'TRK-983012B',
    address: '89 Pine Boulevard, Seattle, WA 98101',
    timeline: [
      { status: 'New Order', time: '2026-07-01T18:15:00Z', desc: 'Order placed by customer via iOS App.' },
      { status: 'Payment Verified', time: '2026-07-01T18:16:30Z', desc: 'Apple Pay token authorized.' },
      { status: 'Confirmed', time: '2026-07-01T18:25:00Z', desc: 'Order assigned to warehouse floor.' },
      { status: 'Picking', time: '2026-07-01T19:00:00Z', desc: 'Picked by aisle assistant Sarah D.' },
      { status: 'Packing', time: '2026-07-01T19:30:00Z', desc: 'Currently being packed in Standard Box 2.' }
    ]
  },
  {
    id: 'ord-1003',
    customerName: 'Emma Rodriguez',
    customerEmail: 'emma.r@yahoo.com',
    date: '2026-07-01T21:40:00Z',
    items: [
      { productId: 'prod-6', name: 'Gluten-Free Oats (1kg)', qty: 3, price: 6.49 },
      { productId: 'prod-8', name: 'Gourmet Chocolate Chip Cookies', qty: 2, price: 5.50 }
    ],
    subtotal: 30.47,
    discount: 5.00,
    tax: 3.05,
    deliveryFee: 3.99,
    total: 32.51,
    paymentStatus: 'Paid',
    deliveryStatus: 'New Order',
    paymentMethod: 'Razorpay UPI',
    trackingNumber: 'TRK-983013C',
    address: '12 Sweetwater Lane, Austin, TX 78701',
    timeline: [
      { status: 'New Order', time: '2026-07-01T21:40:00Z', desc: 'Order registered.' },
      { status: 'Payment Verified', time: '2026-07-01T21:42:00Z', desc: 'Razorpay UPI payload captured and confirmed.' }
    ]
  },
  {
    id: 'ord-1004',
    customerName: 'David Miller',
    customerEmail: 'miller.david@mac.com',
    date: '2026-06-30T10:10:00Z',
    items: [
      { productId: 'prod-7', name: 'Extra Virgin Olive Oil (500ml)', qty: 2, price: 12.99 }
    ],
    subtotal: 25.98,
    discount: 0.00,
    tax: 0.00,
    deliveryFee: 3.99,
    total: 29.97,
    paymentStatus: 'Unpaid',
    deliveryStatus: 'Cancelled',
    paymentMethod: 'Cash On Delivery',
    trackingNumber: '',
    address: '601 Heather Way, Denver, CO 80202',
    timeline: [
      { status: 'New Order', time: '2026-06-30T10:10:00Z', desc: 'COD order initiated.' },
      { status: 'Cancelled', time: '2026-06-30T10:30:00Z', desc: 'Cancelled by customer support. Customer requested correction.' }
    ]
  }
];

export const INITIAL_COUPONS = [
  { id: 'c-1', code: 'ORGANIC20', type: 'Percentage', value: 20, usageLimit: 500, usedCount: 145, start: '2026-06-01', end: '2026-08-31', minOrder: 30.00, categories: ['Fresh Produce', 'Dairy & Eggs'], brands: [], status: 'Active' },
  { id: 'c-2', code: 'FREESHIP50', type: 'Free Shipping', value: 0, usageLimit: 1000, usedCount: 382, start: '2026-01-01', end: '2026-12-31', minOrder: 50.00, categories: [], brands: [], status: 'Active' },
  { id: 'c-3', code: 'COOKIE5OFF', type: 'Fixed Amount', value: 5.00, usageLimit: 100, usedCount: 12, start: '2026-07-01', end: '2026-07-15', minOrder: 20.00, categories: ['Bakery'], brands: ['Artisan Oven'], status: 'Active' },
  { id: 'c-4', code: 'BLUEFLASH', type: 'Buy X Get Y', value: 50, usageLimit: 50, usedCount: 4, start: '2026-06-30', end: '2026-07-02', minOrder: 0.00, categories: [], brands: ['Blue Diamond'], status: 'Expired' }
];

export const INITIAL_DRIVERS = [
  { id: 'drv-1', name: 'Leo Green', phone: '+1 (555) 901-2292', vehicle: 'Eco Van #12', status: 'Active', activeOrder: 'ord-1002', ratings: 4.9, coordinates: { lat: 30.2672, lng: -97.7431 } },
  { id: 'drv-2', name: 'Marcus Brooks', phone: '+1 (555) 789-0112', vehicle: 'Cooler Truck #3', status: 'Active', activeOrder: null, ratings: 4.7, coordinates: { lat: 30.2852, lng: -97.7341 } },
  { id: 'drv-3', name: 'Sylvia Chen', phone: '+1 (555) 345-2121', vehicle: 'Electric Trike #4', status: 'Inactive', activeOrder: null, ratings: 4.85, coordinates: { lat: 30.2452, lng: -97.7561 } }
];

export const INITIAL_ROLES_MATRIX = {
  'Super Admin': {
    dashboard: true, products: true, categories: true, brands: true, inventory: true,
    orders: true, customers: true, coupons: true, delivery: true, cms: true,
    blogs: true, recipes: true, whatsapp: true, reports: true, settings: true,
    user_management: true, security: true, notifications: true, audit_logs: true
  },
  'Store Manager': {
    dashboard: true, products: true, categories: true, brands: true, inventory: true,
    orders: true, customers: true, coupons: true, delivery: true, cms: true,
    blogs: true, recipes: true, whatsapp: false, reports: true, settings: false,
    user_management: true, security: false, notifications: true, audit_logs: true
  },
  'Customer Support': {
    dashboard: true, products: false, categories: false, brands: false, inventory: false,
    orders: true, customers: true, coupons: true, delivery: false, cms: false,
    blogs: false, recipes: false, whatsapp: true, reports: false, settings: false,
    user_management: false, security: false, notifications: true, audit_logs: false
  },
  'Warehouse Staff': {
    dashboard: false, products: true, categories: false, brands: false, inventory: true,
    orders: true, customers: false, coupons: false, delivery: true, cms: false,
    blogs: false, recipes: false, whatsapp: false, reports: false, settings: false,
    user_management: false, security: false, notifications: true, audit_logs: false
  },
  'Marketing Team': {
    dashboard: true, products: true, categories: true, brands: true, inventory: false,
    orders: false, customers: true, coupons: true, delivery: false, cms: true,
    blogs: true, recipes: true, whatsapp: true, reports: true, settings: false,
    user_management: false, security: false, notifications: true, audit_logs: false
  }
};

export const INITIAL_USERS = [
  { id: 'usr-1', name: 'Mugesh', email: 'Admin@demo.com', role: 'Super Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'usr-2', name: 'Manager Melissa', email: 'melissa.mgr@ukecommerce.com', role: 'Store Manager', status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'usr-3', name: 'Support Sam', email: 'sam.care@ukecommerce.com', role: 'Customer Support', status: 'Active', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'usr-4', name: 'Stockman Steve', email: 'steve.loader@ukecommerce.com', role: 'Warehouse Staff', status: 'Active', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'usr-5', name: 'Marketer Mary', email: 'mary.social@ukecommerce.com', role: 'Marketing Team', status: 'Inactive', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
];

export const INITIAL_CMS_DATA = {
  homepage: {
    heroTitle: 'Organic Grocery, Fresh Delivery',
    heroSubtitle: 'Handpicked fresh organic products from local crops directly to your doorsteps.',
    bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
    featuredCategories: ['Fresh Produce', 'Dairy & Eggs', 'Bakery'],
    announcementBar: 'Special Summer Deals! Use Coupon ORGANIC20 for 20% off fresh vegetables!'
  },
  faq: [
    { q: 'Where do you source your organic vegetables?', a: 'We source from certified organic community farms in California and Washington state.' },
    { q: 'How does delivery staging work?', a: 'Orders are picked and stored in specific cold-room zones before loading into temperature-controlled vans.' }
  ]
};

export const INITIAL_BLOGS = [
  { id: 'b-1', title: 'Why Organic Avocados Should Be a Daily Staple', slug: 'organic-avocados-daily-staple', author: 'Dr. Jane Smith', category: 'Health & Nutrition', featuredImage: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=300', content: 'Avocados are filled with healthy monounsaturated fatty acids, dietary fibers, and essential vitamins like potassium. In this article we explore their benefits for cardiovascular systems...', seoTitle: 'Healthy Organic Avocados Nutrition Article', seoDescription: 'Learn why eating organic avocados daily improves cardiovascular health and digestion.', status: 'Published', publishedDate: '2026-06-25' },
  { id: 'b-2', title: '5 Baking Tips for Perfect Sourdough Bread', slug: 'baking-tips-perfect-sourdough', author: 'Baker Chef Paul', category: 'Cooking Guide', featuredImage: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=300', content: 'Getting that blistered ear and airy crumb requires careful hydration management, long fermentation times, and high oven baking temperatures. Here are our top five bakers secrets...', seoTitle: 'A-Z Crusty Sourdough Baking Tips', seoDescription: 'Uncover professional secrets to baking crusty sourdough loaves at home using wild starters.', status: 'Draft', publishedDate: '' }
];

export const INITIAL_RECIPES = [
  {
    id: 'rec-1',
    title: 'Gourmet Organic Guacamole Dip',
    cookingTime: '15 mins',
    nutrition: 'Calories: 180 kcal, Protein: 2g, Fat: 16g',
    ingredientsText: '4 Organic Hass Avocados\n1/2 cup finely diced red onion\n1/2 cup fresh cilantro chopped\nJuice of 1 lime\n1 tsp sea salt',
    stepsText: '1. Slice the avocados and remove their pits.\n2. Scoop the creamy flesh into a large wooden bowl.\n3. Mash gently with a fork, leaving some chunky pieces.\n4. Fold in the red onion, chopped cilantro, lime juice, and sea salt.\n5. Serve immediately with tortilla chips.',
    linkedProducts: ['prod-1'],
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=300',
    seoTitle: 'Easy Organic Guacamole Recipe',
    seoDescription: 'Master the art of making the ultimate creamy chunky guacamole with organic Hass avocados in just 15 minutes.'
  }
];

export const INITIAL_AUDIT_LOGS = [
  { id: 'log-1', timestamp: '2026-07-01T14:32:00Z', user: 'Customer System', action: 'Order Created', module: 'Orders', detail: 'Customer Sarah Jenkins submitted order #ord-1001' },
  { id: 'log-2', timestamp: '2026-07-01T15:05:00Z', user: 'Mugesh', action: 'Product Price Adjust', module: 'Products', detail: 'Regular price for Organic Whole Milk set to $4.89' },
  { id: 'log-3', timestamp: '2026-07-01T15:30:00Z', user: 'Melissa Manager', action: 'Stock Level Adjust', module: 'Inventory', detail: 'Increased Almond Milk stock level by +20' },
  { id: 'log-4', timestamp: '2026-07-01T16:15:00Z', user: 'System Hook', action: 'WhatsApp Triggered', module: 'WhatsApp', detail: 'Out-of-delivery notifications sent to Sarah Jenkins' }
];
