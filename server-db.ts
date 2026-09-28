import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Product, User, Order, Coupon, Banner, Review, LoginHistoryEntry, ContactInquiry } from './src/types';
import { MongoClient, Db } from 'mongodb';

const DB_PATH = path.join(process.cwd(), 'database.json');

interface DatabaseSchema {
  products: Product[];
  users: User[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  reviews: Review[];
  loginHistory: LoginHistoryEntry[];
  contacts: ContactInquiry[];
}

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'THE MODERN MAN',
    subtitle: 'Effortless monochrome styling, structural tailoring, and minimal profiles. Apply coupon STYLEM10 at checkout for an exclusive 10% discount.',
    image: '/images/hero_men_banner_1784614317283.jpg',
    link: '#/shop/men',
    isActive: true,
  },
  {
    id: 'b2',
    title: 'THE MODERN WOMEN',
    subtitle: 'A quiet luxury capsule collection showcasing fine Italian silks and graceful, flowing silhouettes. Apply coupon STYLEF10 at checkout for an exclusive 10% discount.',
    image: '/images/hero_women_banner_1784614332439.jpg',
    link: '#/shop/women',
    isActive: true,
  },
  {
    id: 'b3',
    title: 'THE MODERN KIDS',
    subtitle: 'Playful designs woven from pure soft organic cotton and breathable fine linen. Apply coupon STYLEK10 at checkout for an exclusive 10% discount.',
    image: '/images/hero_kids_banner_1784614633336.jpg',
    link: '#/shop/kids',
    isActive: true,
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  { code: 'STYLEM10', discountType: 'percentage', value: 10, minOrderAmount: 0, isActive: true, targetSection: 'men' },
  { code: 'STYLEW10', discountType: 'percentage', value: 10, minOrderAmount: 0, isActive: true, targetSection: 'women' },
  { code: 'STYLEF10', discountType: 'percentage', value: 10, minOrderAmount: 0, isActive: true, targetSection: 'women' },
  { code: 'STYLEK10', discountType: 'percentage', value: 10, minOrderAmount: 0, isActive: true, targetSection: 'kids' },
  { code: 'STYLEK', discountType: 'percentage', value: 10, minOrderAmount: 0, isActive: true, targetSection: 'kids' },
  { code: 'SPHERE10', discountType: 'percentage', value: 10, minOrderAmount: 0, isActive: true, targetSection: 'all' },
  { code: 'SPHERE20', discountType: 'percentage', value: 20, minOrderAmount: 0, isActive: true, targetSection: 'all' },
  { code: 'LUXURY50', discountType: 'fixed', value: 50, minOrderAmount: 0, isActive: true, targetSection: 'all' }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    "id": "p-m1",
    "name": "Sartorial Linen Summer Blazer",
    "description": "Masterfully structured blazer crafted from pure Italian flax linen. Features a relaxed half-lined drape, premium mother-of-pearl buttons, and soft unstructured shoulders for effortless warm-weather refinement.",
    "price": 320,
    "discount": 10,
    "images": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "men",
    "category": "Topwear",
    "brand": "Atelier Sphere",
    "rating": 4.8,
    "reviewsCount": 24,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Oatmeal",
        "hex": "#EAE6DF"
      },
      {
        "name": "Midnight Navy",
        "hex": "#1E2432"
      }
    ],
    "stock": 12,
    "featured": true,
    "createdAt": "2026-07-21T05:22:20.670Z",
    "seoTitle": "Men Luxury Linen Blazer - StyleClothing",
    "seoDesc": "Shop our signature Italian linen blazer for men. Perfect for summer weddings and luxury resort wear.",
    "seoKeywords": "luxury blazer, linen blazer, mens summer blazer, structured linen"
  },
  {
    "id": "p-m2",
    "name": "Monolith Oversized Cashmere Tee",
    "description": "A luxurious take on the classic tee, knitted from ultra-soft fine-gauge Mongolian cashmere. Structured drop shoulders and a subtle mockneck collar define this sophisticated daily staple.",
    "price": 180,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "men",
    "category": "Topwear",
    "brand": "Aesthetic Core",
    "rating": 4.6,
    "reviewsCount": 18,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Chalk White",
        "hex": "#F5F5F7"
      },
      {
        "name": "Charcoal Noir",
        "hex": "#2C2C2C"
      }
    ],
    "stock": 25,
    "featured": true,
    "createdAt": "2026-07-21T05:22:20.670Z",
    "seoTitle": "Oversized Cashmere Tee - Aesthetic Core StyleClothing",
    "seoDesc": "Indulge in ultra-fine cashmere tees. Beautiful drop-shoulder fit for minimal streetwear look.",
    "seoKeywords": "cashmere t-shirt, mens cashmere tee, quiet luxury tee"
  },
  {
    "id": "p-m3",
    "name": "Atelier Relaxed-Fit Pleated Trousers",
    "description": "Double-pleated trousers tailored in a lightweight wool blend. Flowing, wide-leg cut with adjustable waist-tabs and sharp pressed creases, delivering classic bespoke styling.",
    "price": 240,
    "discount": 15,
    "images": [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "men",
    "category": "Bottomwear",
    "brand": "Atelier Sphere",
    "rating": 4.9,
    "reviewsCount": 15,
    "sizes": [
      "30",
      "32",
      "34",
      "36"
    ],
    "colors": [
      {
        "name": "Sand Taupe",
        "hex": "#C2B6A6"
      },
      {
        "name": "Obsidian Black",
        "hex": "#111111"
      }
    ],
    "stock": 8,
    "featured": false,
    "createdAt": "2026-07-21T05:22:20.670Z"
  },
  {
    "id": "p-m4",
    "name": "Minimalist Italian Leather Sneakers",
    "description": "Clean-cut low top sneakers crafted from buttery-soft full-grain Nappa leather. Set on a durable stitched Margom rubber sole with a calfskin lining for ultimate longevity and breathability.",
    "price": 290,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "men",
    "category": "Footwear",
    "brand": "Sphere Footwear",
    "rating": 4.7,
    "reviewsCount": 32,
    "sizes": [
      "41",
      "42",
      "43",
      "44"
    ],
    "colors": [
      {
        "name": "Alabaster White",
        "hex": "#F5F5F0"
      },
      {
        "name": "Raw Tan",
        "hex": "#D7C49E"
      }
    ],
    "stock": 15,
    "featured": true,
    "createdAt": "2026-07-21T05:22:20.670Z"
  },
  {
    "id": "p-m5",
    "name": "Raw Silk Premium Sherwani Jacket",
    "description": "An exquisite hand-loomed raw silk sherwani designed for discerning grand celebrations. Features a high mandarin collar, delicate matching thread work, and hand-finished metallic buttons.",
    "price": 850,
    "discount": 10,
    "images": [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "men",
    "category": "Ethnic Wear",
    "brand": "Sphere Heritage",
    "rating": 5,
    "reviewsCount": 9,
    "sizes": [
      "38",
      "40",
      "42"
    ],
    "colors": [
      {
        "name": "Champagne Ivory",
        "hex": "#F2E8DF"
      },
      {
        "name": "Midnight Navy",
        "hex": "#1E2432"
      }
    ],
    "stock": 4,
    "featured": true,
    "createdAt": "2026-07-21T05:22:20.670Z"
  },
  {
    "id": "p-w1",
    "name": "Sartorial Backless Silk Slip Dress",
    "description": "An elegant fluid evening slip dress cut from luxurious 22-momme Mulberry silk. Features a bias cut that contours beautifully to the body, a cowl neckline, and a daring low-cut open back with delicate criss-cross straps.",
    "price": 390,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "women",
    "category": "Dresses",
    "brand": "Atelier Sphere",
    "rating": 4.9,
    "reviewsCount": 42,
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Emerald",
        "hex": "#0B4F35"
      },
      {
        "name": "Champagne Gold",
        "hex": "#E7D1B1"
      },
      {
        "name": "Classic Noir",
        "hex": "#121212"
      }
    ],
    "stock": 10,
    "featured": true,
    "createdAt": "2026-07-21T05:22:20.670Z",
    "seoTitle": "Backless Silk Slip Dress - Atelier Sphere Luxury",
    "seoDesc": "Drape yourself in 100% premium Mulberry silk. Elegant cowl-neck backless evening slip dress.",
    "seoKeywords": "silk slip dress, backless slip dress, luxury evening gown"
  },
  {
    "id": "p-w2",
    "name": "Structured Silk Crepe Blouse",
    "description": "An exquisite day-to-night piece crafted in heavy-weight silk crepe de chine. Boasts a structural stand collar, architectural French cuffs, and hidden placket for a pristine, minimalist finish.",
    "price": 210,
    "discount": 5,
    "images": [
      "https://images.unsplash.com/photo-1548624149-f140c6a227c9?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "women",
    "category": "Topwear",
    "brand": "Aesthetic Core",
    "rating": 4.5,
    "reviewsCount": 12,
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Ecru Pearl",
        "hex": "#F6F3EB"
      },
      {
        "name": "Soft Sage",
        "hex": "#B2C0B2"
      }
    ],
    "stock": 20,
    "featured": false,
    "createdAt": "2026-07-21T05:22:20.670Z"
  },
  {
    "id": "p-w3",
    "name": "Flowing Wide-Leg Silk Satin Trousers",
    "description": "High-waisted trousers showcasing a beautifully fluid wide-leg drape in heavy silk satin. Elasticated back waist and discreet pockets blend ultimate comfort with luxury aesthetic.",
    "price": 260,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "women",
    "category": "Bottomwear",
    "brand": "Atelier Sphere",
    "rating": 4.7,
    "reviewsCount": 16,
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Tuscan Tan",
        "hex": "#CDB194"
      },
      {
        "name": "Caviar Black",
        "hex": "#1A1A1A"
      }
    ],
    "stock": 14,
    "featured": false,
    "createdAt": "2026-07-21T05:22:20.670Z"
  },
  {
    "id": "p-w4",
    "name": "Hand-Embroidered Chanderi Anarkali Set",
    "description": "A timeless festive ensemble celebrating heritage handcraft. Tailored in airy, fine-spun Chanderi silk with intricate Zardozi silver embroidery around the neck and cuffs. Complemented with an organza dupatta.",
    "price": 480,
    "discount": 10,
    "images": [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "women",
    "category": "Ethnic Wear",
    "brand": "Sphere Heritage",
    "rating": 5,
    "reviewsCount": 8,
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Blush Pink",
        "hex": "#F4C2C2"
      },
      {
        "name": "Mint Green",
        "hex": "#DBE9D8"
      }
    ],
    "stock": 6,
    "featured": true,
    "createdAt": "2026-07-21T05:22:20.670Z"
  },
  {
    "id": "p-w5",
    "name": "Atelier Premium Leather Tote Bag",
    "description": "Crafted from premium Italian pebble-grain leather with hand-finished edge painting. Spacious raw suede-lined interior featuring a detachable zippered clutch insert and elegant gold hardware.",
    "price": 450,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "women",
    "category": "Accessories",
    "brand": "Sphere Leather",
    "rating": 4.8,
    "reviewsCount": 19,
    "sizes": [
      "One Size"
    ],
    "colors": [
      {
        "name": "Cognac Brown",
        "hex": "#9E5B38"
      },
      {
        "name": "Noir Black",
        "hex": "#121212"
      }
    ],
    "stock": 7,
    "featured": true,
    "createdAt": "2026-07-21T05:22:20.670Z"
  },
  {
    "id": "p-k1",
    "name": "Fine Linen Smocked Puff-Sleeve Dress",
    "description": "Charming girls dress styled in lightweight, premium linen. Finished with an intricate smocked bodice, delicate elastic puff sleeves, and a sweet tiered flowing skirt. Soft, breathable, and highly comfortable.",
    "price": 85,
    "discount": 15,
    "images": [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "kids",
    "category": "Girls",
    "brand": "Sphere Petite",
    "rating": 4.8,
    "reviewsCount": 11,
    "sizes": [
      "3-4Y",
      "5-6Y",
      "7-8Y"
    ],
    "colors": [
      {
        "name": "Marigold Yellow",
        "hex": "#EAA93E"
      },
      {
        "name": "Lavender Mist",
        "hex": "#E2D8E6"
      }
    ],
    "stock": 18,
    "featured": true,
    "createdAt": "2026-07-21T05:22:20.670Z"
  },
  {
    "id": "p-k2",
    "name": "Boys Cotton Linen tailored Vest Set",
    "description": "A polished festive look for boys, pairing a structured cotton-linen vest with comfortable tailored drawstring shorts and a crisp, fine-yarn collarless shirt. Ideal for summer special occasions.",
    "price": 95,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "kids",
    "category": "Boys",
    "brand": "Sphere Petite",
    "rating": 4.6,
    "reviewsCount": 7,
    "sizes": [
      "2-3Y",
      "4-5Y",
      "6-7Y"
    ],
    "colors": [
      {
        "name": "Sage & Sand",
        "hex": "#9AA79A"
      }
    ],
    "stock": 10,
    "featured": true,
    "createdAt": "2026-07-21T05:22:20.670Z"
  },
  {
    "id": "p-k3",
    "name": "Pima Cotton Organic Hooded Romper",
    "description": "Unbelievably soft baby romper crafted from 100% GOTS certified organic Pima cotton. Features an oversized hood with playful ears, convenient nickel-free bottom snaps, and cute folded cuffs.",
    "price": 55,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "kids",
    "category": "Baby",
    "brand": "Sphere Petite",
    "rating": 4.9,
    "reviewsCount": 14,
    "sizes": [
      "0-3M",
      "3-6M",
      "6-12M",
      "12-18M"
    ],
    "colors": [
      {
        "name": "Oatmeal Heather",
        "hex": "#EAE5DB"
      },
      {
        "name": "Sage Green",
        "hex": "#CCD3C7"
      }
    ],
    "stock": 30,
    "featured": false,
    "createdAt": "2026-07-21T05:22:20.670Z"
  },
  {
    "id": "p-a1",
    "name": "Bespoke Chronograph Wristwatch",
    "description": "A classic, modern watch featuring a Japanese quartz movement, striking matte-black Onyx dial, and surgical-grade polished stainless steel casing. Secured with an interchangeable Italian tanned leather strap.",
    "price": 245,
    "discount": 10,
    "images": [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "accessories",
    "category": "Watches",
    "brand": "Sphere Chronos",
    "rating": 4.9,
    "reviewsCount": 21,
    "sizes": [
      "40mm"
    ],
    "colors": [
      {
        "name": "Matte Black / Brown",
        "hex": "#3E2E20"
      },
      {
        "name": "Silver / Navy",
        "hex": "#1C2942"
      }
    ],
    "stock": 6,
    "featured": true,
    "createdAt": "2026-07-21T05:22:20.671Z"
  },
  {
    "id": "p-a2",
    "name": "Minimalist Sculpted Acetate Sunglasses",
    "description": "Fashion-forward rectangular sunglasses crafted from premium, high-density bio-acetate. Hand-polished to a high-gloss luster, fitted with 100% UVA/UVB protective dark green Carl Zeiss lenses.",
    "price": 155,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "accessories",
    "category": "Sunglasses",
    "brand": "Atelier Sphere",
    "rating": 4.7,
    "reviewsCount": 13,
    "sizes": [
      "One Size"
    ],
    "colors": [
      {
        "name": "Gloss Obsidian",
        "hex": "#111111"
      },
      {
        "name": "Champagne Honey",
        "hex": "#DEC293"
      }
    ],
    "stock": 15,
    "featured": true,
    "createdAt": "2026-07-21T05:22:20.671Z"
  },
  {
    "id": "p-a3",
    "name": "Monogram Handcrafted Calfskin Belt",
    "description": "An elegant waist accessory cut from vegetable-tanned Italian full-grain calfskin leather. Accented with a sleek, minimalist hand-brushed brass monogram buckle.",
    "price": 95,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1624222247344-550fb805296f?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "accessories",
    "category": "Belts",
    "brand": "Sphere Leather",
    "rating": 4.4,
    "reviewsCount": 10,
    "sizes": [
      "32",
      "34",
      "36",
      "38"
    ],
    "colors": [
      {
        "name": "Cognac",
        "hex": "#874E2C"
      },
      {
        "name": "Obsidian Black",
        "hex": "#121212"
      }
    ],
    "stock": 12,
    "featured": false,
    "createdAt": "2026-07-21T05:22:20.671Z"
  },
  {
    "id": "p-m6",
    "name": "Classic Double-Breasted Wool Coat",
    "description": "Tailored double-breasted overcoat crafted from heavyweight melton wool blend. Features notch lapels, horn buttons, and deep welt pockets for refined winter layering.",
    "price": 450,
    "discount": 15,
    "images": [
      "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "men",
    "category": "Outerwear",
    "brand": "Atelier StyleClothing",
    "rating": 4.9,
    "reviewsCount": 19,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Charcoal",
        "hex": "#333333"
      },
      {
        "name": "Camel",
        "hex": "#C19A6B"
      }
    ],
    "stock": 15,
    "featured": true,
    "createdAt": "2026-07-22T05:33:08.216Z",
    "seoTitle": "Men Double Breasted Wool Coat - StyleClothing",
    "seoDesc": "Luxury mens melton wool coat with classic double-breasted styling.",
    "seoKeywords": "wool coat, mens winter coat, double breasted overcoat"
  },
  {
    "id": "p-m7",
    "name": "Egyptian Cotton Formal Oxford Shirt",
    "description": "Impeccably tailored from 100% two-ply Egyptian giza cotton. Designed with spread collar, mother-of-pearl buttons, and rounded double cuffs.",
    "price": 140,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "men",
    "category": "Topwear",
    "brand": "Aesthetic Core",
    "rating": 4.7,
    "reviewsCount": 31,
    "sizes": [
      "38",
      "40",
      "42",
      "44"
    ],
    "colors": [
      {
        "name": "Crisp White",
        "hex": "#FFFFFF"
      },
      {
        "name": "Sky Blue",
        "hex": "#87CEEB"
      }
    ],
    "stock": 22,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-m8",
    "name": "Tailored Slim-Fit Chino Trousers",
    "description": "Sophisticated flat-front chinos crafted from stretch cotton twill. Pre-washed for a supple feel with clean pressed creases.",
    "price": 160,
    "discount": 10,
    "images": [
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "men",
    "category": "Bottomwear",
    "brand": "Atelier StyleClothing",
    "rating": 4.6,
    "reviewsCount": 27,
    "sizes": [
      "30",
      "32",
      "34",
      "36"
    ],
    "colors": [
      {
        "name": "Stone Khaki",
        "hex": "#C2B280"
      },
      {
        "name": "Olive Green",
        "hex": "#556B2F"
      }
    ],
    "stock": 18,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-m9",
    "name": "Merino Wool Ribbed Turtleneck Sweater",
    "description": "Knitted from extra-fine 100% Australian merino wool. Offers superior thermal regulation with a sleek ribbed neck and cuffs.",
    "price": 220,
    "discount": 5,
    "images": [
      "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "men",
    "category": "Winterwear",
    "brand": "Nordic Thread",
    "rating": 4.8,
    "reviewsCount": 15,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Oatmeal Beige",
        "hex": "#EAE6DF"
      },
      {
        "name": "Midnight Black",
        "hex": "#111111"
      }
    ],
    "stock": 14,
    "featured": true,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-m10",
    "name": "Handcrafted Suede Chelsea Boots",
    "description": "Classic Italian calf suede chelsea boots with Goodyear welted leather soles and flexible elastic side goring for seamless wear.",
    "price": 290,
    "discount": 12,
    "images": [
      "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "men",
    "category": "Footwear",
    "brand": "Craft & Sole",
    "rating": 4.9,
    "reviewsCount": 42,
    "sizes": [
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "colors": [
      {
        "name": "Espresso Brown",
        "hex": "#3B2F2F"
      },
      {
        "name": "Sand Suede",
        "hex": "#D2B48C"
      }
    ],
    "stock": 10,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-w6",
    "name": "Cashmere Blend Wrap Trench Coat",
    "description": "An iconic luxury trench coat cut from a double-faced wool-cashmere blend. Features wide notched lapels and a detachable waist sash.",
    "price": 480,
    "discount": 10,
    "images": [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "women",
    "category": "Outerwear",
    "brand": "Atelier StyleClothing",
    "rating": 4.9,
    "reviewsCount": 38,
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Camel Tan",
        "hex": "#C19A6B"
      },
      {
        "name": "Ivory White",
        "hex": "#FFFFF0"
      }
    ],
    "stock": 12,
    "featured": true,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-w7",
    "name": "Pleated Silk Midi Skirt",
    "description": "Hand-pleated pure silk crepe midi skirt designed with a comfortable elasticated satin waist and fluid movement.",
    "price": 210,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "women",
    "category": "Bottomwear",
    "brand": "Maison Silk",
    "rating": 4.7,
    "reviewsCount": 20,
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Champagne Gold",
        "hex": "#F7E7CE"
      },
      {
        "name": "Emerald Green",
        "hex": "#50C878"
      }
    ],
    "stock": 16,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-w8",
    "name": "Tailored Double-Breasted Linen Blazer",
    "description": "Structured double-breasted summer blazer woven from premium Italian flax. Fully lined with breathable Bemberg cupro.",
    "price": 340,
    "discount": 15,
    "images": [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "women",
    "category": "Topwear",
    "brand": "Atelier StyleClothing",
    "rating": 4.8,
    "reviewsCount": 22,
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Blush Pink",
        "hex": "#FFD1DC"
      },
      {
        "name": "Cream White",
        "hex": "#FFFDD0"
      }
    ],
    "stock": 10,
    "featured": true,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-w9",
    "name": "Fine Knit Cashmere Cardigan",
    "description": "Lightweight button-down cardigan spun from ultra-fine 100% Mongolian cashmere. Features horn buttons and seamless armholes.",
    "price": 240,
    "discount": 5,
    "images": [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "women",
    "category": "Winterwear",
    "brand": "Aesthetic Core",
    "rating": 4.6,
    "reviewsCount": 17,
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Heather Grey",
        "hex": "#D3D3D3"
      },
      {
        "name": "Soft Lavender",
        "hex": "#E6E6FA"
      }
    ],
    "stock": 22,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-w10",
    "name": "Handmade Pointed Leather Mules",
    "description": "Pointed-toe leather mules handmade in Florence with cushioned leather footbeds and sculptured kitten heels.",
    "price": 260,
    "discount": 20,
    "images": [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "women",
    "category": "Footwear",
    "brand": "Craft & Sole",
    "rating": 4.9,
    "reviewsCount": 29,
    "sizes": [
      "36",
      "37",
      "38",
      "39",
      "40"
    ],
    "colors": [
      {
        "name": "Nude Beige",
        "hex": "#E3C2B0"
      },
      {
        "name": "Onyx Black",
        "hex": "#0F0F0F"
      }
    ],
    "stock": 14,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-k4",
    "name": "Organic Cotton Breton Stripe Sweater",
    "description": "Classic nautical striped knit sweater crafted from 100% GOTS certified organic cotton for sensitive skin.",
    "price": 75,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "kids",
    "category": "Topwear",
    "brand": "Petit Atelier",
    "rating": 4.8,
    "reviewsCount": 14,
    "sizes": [
      "2-3Y",
      "4-5Y",
      "6-7Y",
      "8-9Y"
    ],
    "colors": [
      {
        "name": "Navy Stripe",
        "hex": "#000080"
      },
      {
        "name": "Red Stripe",
        "hex": "#8B0000"
      }
    ],
    "stock": 30,
    "featured": true,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-k5",
    "name": "Soft Denim Dungarees & Tee Set",
    "description": "Durable lightweight cotton denim overalls paired with a soft organic jersey inner t-shirt.",
    "price": 95,
    "discount": 10,
    "images": [
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "kids",
    "category": "Sets",
    "brand": "Petit Atelier",
    "rating": 4.7,
    "reviewsCount": 19,
    "sizes": [
      "2-3Y",
      "4-5Y",
      "6-7Y"
    ],
    "colors": [
      {
        "name": "Indigo Blue",
        "hex": "#2E473B"
      },
      {
        "name": "Washed Blue",
        "hex": "#708090"
      }
    ],
    "stock": 20,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-k6",
    "name": "Linen Blend Party Dress with Bow",
    "description": "A whimsical fit-and-flare dress woven from breathable flax linen blend with a delicate back bow sash.",
    "price": 110,
    "discount": 15,
    "images": [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "kids",
    "category": "Dresses",
    "brand": "Petit Atelier",
    "rating": 4.9,
    "reviewsCount": 23,
    "sizes": [
      "3-4Y",
      "5-6Y",
      "7-8Y"
    ],
    "colors": [
      {
        "name": "Rose Pink",
        "hex": "#FFC0CB"
      },
      {
        "name": "Sage Green",
        "hex": "#9DC183"
      }
    ],
    "stock": 15,
    "featured": true,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-k7",
    "name": "Quilted Winter Puffer Jacket for Kids",
    "description": "Water-repellent insulated winter coat with plush faux-fur hood lining and sturdy zip closure.",
    "price": 135,
    "discount": 10,
    "images": [
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "kids",
    "category": "Outerwear",
    "brand": "Nordic Kids",
    "rating": 4.8,
    "reviewsCount": 18,
    "sizes": [
      "4-5Y",
      "6-7Y",
      "8-9Y",
      "10-11Y"
    ],
    "colors": [
      {
        "name": "Mustard Yellow",
        "hex": "#FFDB58"
      },
      {
        "name": "Forest Navy",
        "hex": "#1C2833"
      }
    ],
    "stock": 18,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-k8",
    "name": "Handcrafted Soft Leather Baby Shoes",
    "description": "Ultra-flexible genuine leather crib shoes with non-slip suede soles designed to support healthy foot growth.",
    "price": 60,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1560506840-ec148e82a604?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "kids",
    "category": "Footwear",
    "brand": "Petit Sole",
    "rating": 4.9,
    "reviewsCount": 31,
    "sizes": [
      "18-19",
      "20-21",
      "22-23"
    ],
    "colors": [
      {
        "name": "Cognac Tan",
        "hex": "#9A463D"
      },
      {
        "name": "Pearl White",
        "hex": "#FDFDFD"
      }
    ],
    "stock": 25,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-k9",
    "name": "Cable-Knit Wool Cardigan for Toddlers",
    "description": "Cozy cable-knit button sweater made from non-scratchy fine merino wool yarn.",
    "price": 85,
    "discount": 5,
    "images": [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "kids",
    "category": "Winterwear",
    "brand": "Petit Atelier",
    "rating": 4.6,
    "reviewsCount": 11,
    "sizes": [
      "2-3Y",
      "4-5Y",
      "6-7Y"
    ],
    "colors": [
      {
        "name": "Cream Wool",
        "hex": "#FFFDD0"
      },
      {
        "name": "Muted Blue",
        "hex": "#7B92A8"
      }
    ],
    "stock": 16,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-k10",
    "name": "Breathable Organic Pajama Set",
    "description": "Two-piece organic cotton sleepwear featuring flatlock seams and gentle stretch cuffs.",
    "price": 55,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "kids",
    "category": "Sleepwear",
    "brand": "Organic Bloom",
    "rating": 4.7,
    "reviewsCount": 22,
    "sizes": [
      "2-3Y",
      "4-5Y",
      "6-7Y",
      "8-9Y"
    ],
    "colors": [
      {
        "name": "Cloud Grey",
        "hex": "#E5E7E9"
      },
      {
        "name": "Soft Mint",
        "hex": "#98FF98"
      }
    ],
    "stock": 35,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-a4",
    "name": "Hand-Woven Pure Silk Scarf",
    "description": "Generously proportioned pure silk twill scarf decorated with abstract architectural motifs and hand-rolled hems.",
    "price": 120,
    "discount": 10,
    "images": [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "accessories",
    "category": "Scarves",
    "brand": "Atelier StyleClothing",
    "rating": 4.8,
    "reviewsCount": 16,
    "sizes": [
      "One Size"
    ],
    "colors": [
      {
        "name": "Burgundy Motif",
        "hex": "#800020"
      },
      {
        "name": "Navy Gold",
        "hex": "#000080"
      }
    ],
    "stock": 20,
    "featured": true,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-a5",
    "name": "Italian Calfskin Structured Crossbody Bag",
    "description": "Architectural handbag constructed from full-grain Florentine calfskin with polished brass turnlock closure.",
    "price": 310,
    "discount": 15,
    "images": [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "accessories",
    "category": "Bags",
    "brand": "Craft & Sole",
    "rating": 4.9,
    "reviewsCount": 35,
    "sizes": [
      "One Size"
    ],
    "colors": [
      {
        "name": "Chestnut Brown",
        "hex": "#954535"
      },
      {
        "name": "Jet Black",
        "hex": "#0A0A0A"
      }
    ],
    "stock": 12,
    "featured": true,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-a6",
    "name": "Minimalist Sterling Silver Cuff Bangle",
    "description": "Solid 925 sterling silver cuff featuring a hand-brushed matte finish and subtle geometric engraving.",
    "price": 150,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1611591475168-e4b958c2794c?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "accessories",
    "category": "Jewelry",
    "brand": "Maison Sterling",
    "rating": 4.7,
    "reviewsCount": 21,
    "sizes": [
      "One Size"
    ],
    "colors": [
      {
        "name": "Brushed Silver",
        "hex": "#C0C0C0"
      }
    ],
    "stock": 18,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-a7",
    "name": "Fine Felt Wool Fedora Hat",
    "description": "Hand-molded Australian wool felt fedora featuring a wide flat brim and genuine leather headband.",
    "price": 135,
    "discount": 5,
    "images": [
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "accessories",
    "category": "Hats",
    "brand": "Atelier StyleClothing",
    "rating": 4.8,
    "reviewsCount": 19,
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Charcoal Wool",
        "hex": "#36454F"
      },
      {
        "name": "Sand Tan",
        "hex": "#C2B280"
      }
    ],
    "stock": 14,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-a8",
    "name": "Full-Grain Leather Cardholder & Wallet",
    "description": "Ultra-slim bi-fold cardholder with RFID protection and six dedicated card slots.",
    "price": 85,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "accessories",
    "category": "Wallets",
    "brand": "Craft & Sole",
    "rating": 4.6,
    "reviewsCount": 28,
    "sizes": [
      "One Size"
    ],
    "colors": [
      {
        "name": "Dark Walnut",
        "hex": "#5C4033"
      },
      {
        "name": "Midnight Navy",
        "hex": "#1A2530"
      }
    ],
    "stock": 30,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-a9",
    "name": "Cashmere Knit Beanie & Glove Gift Set",
    "description": "Matching 100% cashmere ribbed beanie hat and touch-screen compatible knit gloves.",
    "price": 165,
    "discount": 10,
    "images": [
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "accessories",
    "category": "Winter Accessories",
    "brand": "Nordic Thread",
    "rating": 4.9,
    "reviewsCount": 15,
    "sizes": [
      "One Size"
    ],
    "colors": [
      {
        "name": "Oatmeal Melange",
        "hex": "#D6C6B6"
      },
      {
        "name": "Black Charcoal",
        "hex": "#222222"
      }
    ],
    "stock": 16,
    "featured": false,
    "createdAt": "2026-07-22T05:33:08.216Z"
  },
  {
    "id": "p-a10",
    "name": "Gold-Plated Architectural Drop Earrings",
    "description": "Sculptural drop earrings crafted from 18k yellow gold-plated brass with hypoallergenic titanium posts.",
    "price": 125,
    "discount": 0,
    "images": [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop"
    ],
    "section": "accessories",
    "category": "Jewelry",
    "brand": "Maison Sterling",
    "rating": 4.8,
    "reviewsCount": 24,
    "sizes": [
      "One Size"
    ],
    "colors": [
      {
        "name": "18K Gold",
        "hex": "#FFD700"
      }
    ],
    "stock": 22,
    "featured": true,
    "createdAt": "2026-07-22T05:33:08.216Z"
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'r1',
    productId: 'p-m1',
    userId: 'u2',
    userName: 'Alexander V.',
    rating: 5,
    comment: 'The drape and texture of this linen blazer are extraordinary. It wears beautifully even in high humidity and fits like bespoke tailoring.',
    createdAt: '2026-07-16T05:22:20.671Z'
  },
  {
    id: 'r2',
    productId: 'p-m1',
    userId: 'u3',
    userName: 'Charles M.',
    rating: 4,
    comment: 'Excellent linen quality. Half-lined back is a huge plus. Just needed a quick steam upon unboxing.',
    createdAt: '2026-07-09T05:22:20.671Z'
  },
  {
    id: 'r3',
    productId: 'p-w1',
    userId: 'u4',
    userName: 'Genevieve S.',
    rating: 5,
    comment: 'Absolutely gorgeous slip dress. The 22-momme silk is heavy, luxurious, and feels incredible against the skin. The cowl neck and low back are designed to perfection.',
    createdAt: '2026-07-18T05:22:20.671Z'
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'StyleClothing Administrator',
    email: 'admin@styleclothing.com',
    role: 'admin',
    addresses: [],
    createdAt: '2026-07-01T08:00:00.000Z',
    lastLoginAt: '2026-08-19T03:10:00.000Z',
    loginCount: 18
  },
  {
    id: 'cust-1',
    name: 'Rishi Savaliya',
    email: 'rishi123@gmail.com',
    role: 'customer',
    addresses: [
      {
        id: 'addr-1',
        fullName: 'Rishi Savaliya',
        street: '742 Luxury Avenue, Apt 4B',
        city: 'New York',
        state: 'NY',
        zip: '10021',
        country: 'INDIA',
        phone: '+1 555-839-2010',
        isDefault: true
      }
    ],
    createdAt: '2026-07-10T12:00:00.000Z',
    lastLoginAt: '2026-08-19T02:45:00.000Z',
    loginCount: 12
  }
];

const DEFAULT_LOGIN_HISTORY: LoginHistoryEntry[] = [
  {
    id: 'lh-1',
    userId: 'admin-1',
    userName: 'StyleClothing Administrator',
    userEmail: 'admin@styleclothing.com',
    role: 'admin',
    timestamp: '2026-08-19T03:10:00.000Z',
    status: 'Success',
    method: 'Quick Login',
    ipAddress: '127.0.0.1',
    device: 'Desktop Chrome / MacOS'
  },
  {
    id: 'lh-2',
    userId: 'cust-1',
    userName: 'Rishi Savaliya',
    userEmail: 'rishi123@gmail.com',
    role: 'customer',
    timestamp: '2026-08-19T02:45:00.000Z',
    status: 'Success',
    method: 'Password',
    ipAddress: '192.168.1.104',
    device: 'Web Client / Safari'
  }
];

const DEFAULT_CONTACTS: ContactInquiry[] = [
  {
    id: 'cnt-1',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@example.com',
    type: 'Bespoke Fitting',
    message: 'Requesting a private consultation for a bespoke silk evening gown fitting.',
    status: 'New',
    createdAt: '2026-08-20T10:30:00.000Z'
  },
  {
    id: 'cnt-2',
    name: 'Arthur Pendelton',
    email: 'arthur.p@atelier.co',
    type: 'Fabric & Sourcing',
    message: 'Inquiring about bulk Italian linen textile imports for upcoming seasonal capsule.',
    status: 'Read',
    createdAt: '2026-08-18T14:15:00.000Z'
  }
];

type CollectionName = keyof DatabaseSchema;

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'styleclothing';

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let initialized = false;

const cache: DatabaseSchema = {
  products: [],
  users: [],
  orders: [],
  coupons: [],
  banners: [],
  reviews: [],
  loginHistory: [],
  contacts: []
};

function clone<T>(value: T): T {
  if (value === undefined) return undefined as any;
  if (value === null) return null as any;
  return JSON.parse(JSON.stringify(value));
}

function stripMongoId<T extends Record<string, any>>(doc: T): Omit<T, '_id'> {
  const copy = { ...doc };
  delete copy._id;
  return copy;
}

function loadLegacySeed(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) as Partial<DatabaseSchema>;
      return {
        products: parsed.products?.length ? parsed.products : DEFAULT_PRODUCTS,
        users: parsed.users?.length ? parsed.users : DEFAULT_USERS,
        orders: parsed.orders || [],
        coupons: parsed.coupons?.length ? parsed.coupons : DEFAULT_COUPONS,
        banners: parsed.banners?.length ? parsed.banners : DEFAULT_BANNERS,
        reviews: parsed.reviews?.length ? parsed.reviews : DEFAULT_REVIEWS,
        loginHistory: parsed.loginHistory?.length ? parsed.loginHistory : DEFAULT_LOGIN_HISTORY,
        contacts: parsed.contacts?.length ? parsed.contacts : DEFAULT_CONTACTS
      };
    }
  } catch (error) {
    console.warn('Could not read legacy database.json; using built-in seed data.', error);
  }

  return {
    products: DEFAULT_PRODUCTS,
    users: DEFAULT_USERS,
    orders: [],
    coupons: DEFAULT_COUPONS,
    banners: DEFAULT_BANNERS,
    reviews: DEFAULT_REVIEWS,
    loginHistory: DEFAULT_LOGIN_HISTORY,
    contacts: DEFAULT_CONTACTS
  };
}

function sanitizeSeed(seed: DatabaseSchema): DatabaseSchema {
  const mockEmails = ['elena.rostova@luxury.com', 'marcus.vance@atelier.co', 'genevieve@hautecouture.fr'];
  return {
    products: seed.products || [],
    users: (seed.users || []).filter(u => u.email && !mockEmails.includes(u.email.toLowerCase())),
    orders: seed.orders || [],
    coupons: seed.coupons || [],
    banners: seed.banners || [],
    reviews: seed.reviews || [],
    loginHistory: (seed.loginHistory || []).filter(l => l.userEmail && !mockEmails.includes(l.userEmail.toLowerCase())),
    contacts: seed.contacts || []
  };
}

async function replaceCollection(name: CollectionName, documents: any[]): Promise<void> {
  if (!mongoDb) return;
  const collection = mongoDb.collection(name);
  await collection.deleteMany({});
  if (!documents.length) return;
  await collection.insertMany(clone(documents).map((doc: any) => {
    const copy = { ...doc };
    delete copy._id;
    return copy;
  }));
}

async function persistCollection(name: CollectionName): Promise<void> {
  if (!mongoDb) return;
  await replaceCollection(name, cache[name]);
}

function persistCollectionSafely(name: CollectionName): void {
  if (!mongoDb) return;
  persistCollection(name).catch(error => {
    console.error(`MongoDB write failed for ${name}:`, error);
  });
}

async function loadCollection<T>(name: CollectionName): Promise<T[]> {
  if (!mongoDb) return [];
  const docs = await mongoDb.collection(name).find({}).toArray();
  return docs.map(doc => stripMongoId(doc)) as T[];
}

export async function initializeDatabase(): Promise<void> {
  if (initialized) return;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Create a .env file and add your MongoDB Atlas connection string.');
  }

  mongoClient = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    appName: 'StyleClothing'
  });

  await mongoClient.connect();
  mongoDb = mongoClient.db(MONGODB_DB);
  await mongoDb.command({ ping: 1 });

  const seed = sanitizeSeed(loadLegacySeed());

  
  
  const names: CollectionName[] = ['products', 'users', 'orders', 'coupons', 'banners', 'reviews', 'loginHistory', 'contacts'];
  for (const name of names) {
    const existing = await loadCollection<any>(name);
    if (existing.length > 0) {
      (cache as any)[name] = existing;
    } else {
      (cache as any)[name] = clone((seed as any)[name] || []);
      if ((cache as any)[name].length > 0) {
        await replaceCollection(name, (cache as any)[name]);
      }
    }
  }

  
  if (!cache.users.some(u => u.id === 'admin-1' || u.role === 'admin')) {
    cache.users.unshift(clone(DEFAULT_USERS[0]));
    await persistCollection('users');
  }

  
  for (const def of DEFAULT_COUPONS) {
    const existing = cache.coupons.find(c => c.code.toUpperCase() === def.code.toUpperCase());
    if (!existing) cache.coupons.push(clone(def));
    else existing.targetSection = def.targetSection;
  }
  await persistCollection('coupons');

  initialized = true;
  console.log(`MongoDB connected: ${MONGODB_DB}`);
  console.log('Collections: products, users, orders, coupons, banners, reviews, contacts');
}

export async function closeDatabase(): Promise<void> {
  if (mongoClient) await mongoClient.close();
  mongoClient = null;
  mongoDb = null;
  initialized = false;
}

export const DB = {
  
  getProducts: (): Product[] => clone(cache.products),
  getProductById: (id: string): Product | undefined => clone(cache.products.find(p => p.id === id)),
  addProduct: (product: Product): Product => {
    cache.products.unshift(clone(product));
    persistCollectionSafely('products');
    return product;
  },
  updateProduct: (id: string, updated: Partial<Product>): Product | undefined => {
    const idx = cache.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    cache.products[idx] = { ...cache.products[idx], ...clone(updated) } as Product;
    persistCollectionSafely('products');
    return clone(cache.products[idx]);
  },
  deleteProduct: (id: string): boolean => {
    const before = cache.products.length;
    cache.products = cache.products.filter(p => p.id !== id);
    if (cache.products.length === before) return false;
    persistCollectionSafely('products');
    return true;
  },

  
  getUsers: (): User[] => clone(cache.users),
  getUserById: (id: string): User | undefined => clone(cache.users.find(u => u.id === id)),
  getUserByEmail: (email: string): User | undefined => clone(cache.users.find(u => u.email && email && u.email.toLowerCase() === email.toLowerCase())),
  addUser: (user: User): User => {
    if (!cache.users.some(u => u.id === user.id || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()))) {
      cache.users.unshift(clone(user));
      persistCollectionSafely('users');
    }
    return user;
  },
  updateUser: (id: string, updated: Partial<User>): User | undefined => {
    const idx = cache.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    cache.users[idx] = { ...cache.users[idx], ...clone(updated) } as User;
    persistCollectionSafely('users');
    return clone(cache.users[idx]);
  },
  deleteUser: (id: string): boolean => {
    const before = cache.users.length;
    cache.users = cache.users.filter(u => u.id !== id);
    if (cache.users.length === before) return false;
    persistCollectionSafely('users');
    return true;
  },

  
  getLoginHistory: (): LoginHistoryEntry[] => clone(cache.loginHistory).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  addLoginHistory: (entry: LoginHistoryEntry): LoginHistoryEntry => {
    cache.loginHistory.unshift(clone(entry));
    cache.loginHistory = cache.loginHistory.slice(0, 250);
    persistCollectionSafely('loginHistory');
    return entry;
  },
  clearLoginHistory: (): boolean => {
    cache.loginHistory = [];
    persistCollectionSafely('loginHistory');
    return true;
  },

  
  getOrders: (): Order[] => clone(cache.orders),
  getOrderById: (id: string): Order | undefined => clone(cache.orders.find(o => o.id === id)),
  getOrdersByUserId: (userId: string): Order[] => clone(cache.orders.filter(o => o.userId === userId)),
  createOrder: (order: Order): Order => {
    cache.orders.unshift(clone(order));
    persistCollectionSafely('orders');
    return order;
  },
  updateOrder: (id: string, updated: Partial<Order>): Order | undefined => {
    const idx = cache.orders.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    cache.orders[idx] = { ...cache.orders[idx], ...clone(updated) } as Order;
    persistCollectionSafely('orders');
    return clone(cache.orders[idx]);
  },

  
  getCoupons: (): Coupon[] => clone(cache.coupons),
  addCoupon: (coupon: Coupon): Coupon => {
    cache.coupons.push(clone(coupon));
    persistCollectionSafely('coupons');
    return coupon;
  },
  updateCoupon: (code: string, updated: Partial<Coupon>): Coupon | undefined => {
    const idx = cache.coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    if (idx === -1) return undefined;
    cache.coupons[idx] = { ...cache.coupons[idx], ...clone(updated) } as Coupon;
    persistCollectionSafely('coupons');
    return clone(cache.coupons[idx]);
  },
  deleteCoupon: (code: string): boolean => {
    const before = cache.coupons.length;
    cache.coupons = cache.coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
    if (cache.coupons.length === before) return false;
    persistCollectionSafely('coupons');
    return true;
  },

  
  getBanners: (): Banner[] => clone(cache.banners),
  updateBanner: (id: string, updated: Partial<Banner>): Banner | undefined => {
    const idx = cache.banners.findIndex(b => b.id === id);
    if (idx === -1) return undefined;
    cache.banners[idx] = { ...cache.banners[idx], ...clone(updated) } as Banner;
    persistCollectionSafely('banners');
    return clone(cache.banners[idx]);
  },

  
  getReviews: (productId?: string): Review[] => clone(productId ? cache.reviews.filter(x => x.productId === productId) : cache.reviews),
  addReview: (review: Review): Review => {
    cache.reviews.unshift(clone(review));

    const prodReviews = cache.reviews.filter(r => r.productId === review.productId);
    const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const prodIdx = cache.products.findIndex(p => p.id === review.productId);
    if (prodIdx !== -1) {
      cache.products[prodIdx].rating = Number(avgRating.toFixed(1));
      cache.products[prodIdx].reviewsCount = prodReviews.length;
      persistCollectionSafely('products');
    }

    persistCollectionSafely('reviews');
    return review;
  },

  
  getContacts: (): ContactInquiry[] => clone(cache.contacts).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  getContactById: (id: string): ContactInquiry | undefined => clone(cache.contacts.find(c => c.id === id)),
  addContact: (contact: ContactInquiry): ContactInquiry => {
    cache.contacts.unshift(clone(contact));
    persistCollectionSafely('contacts');
    return contact;
  },
  updateContact: (id: string, updated: Partial<ContactInquiry>): ContactInquiry | undefined => {
    const idx = cache.contacts.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    cache.contacts[idx] = { ...cache.contacts[idx], ...clone(updated) } as ContactInquiry;
    persistCollectionSafely('contacts');
    return clone(cache.contacts[idx]);
  },
  deleteContact: (id: string): boolean => {
    const before = cache.contacts.length;
    cache.contacts = cache.contacts.filter(c => c.id !== id);
    if (cache.contacts.length === before) return false;
    persistCollectionSafely('contacts');
    return true;
  }
};
