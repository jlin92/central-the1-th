#!/usr/bin/env node
/**
 * Builds src/mock-data/catalogue.json from the supplied Dynamic Yield product
 * feed (feed/the1_offers_dy_feed_v2.csv) plus a set of generated demo offers
 * that make the personalisation stories richer (Tops store formats, coffee,
 * luxury, low-stock and expiring-soon examples).
 *
 *   node scripts/build-catalogue.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const csvPath = join(here, '..', 'feed', 'the1_offers_dy_feed_v2.csv');
const outPath = join(here, '..', 'src', 'mock-data', 'catalogue.json');

/* ---------------------------------------------------------------- CSV */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const num = (v) => (v === '' || v == null ? undefined : Number(v));
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const fmt = (n) => n.toLocaleString('en-US');

/* ----------------------------------------------------- derived fields */
const storeFormatByBrand = {
  Tops: 'Tops',
  'Tops daily': 'Tops daily',
  'Tops Wholesale': 'Tops Wholesale',
  'Tops Care': 'Tops Care',
  'Tops Online': 'Tops Online',
  'Central Food Hall': 'Central Food Hall',
};
const topsFamily = new Set(Object.keys(storeFormatByBrand));

/** Semantic keywords used by the "smart search" story (names alone don't contain them). */
const tagsByBrand = {
  Starbucks: ['coffee', 'cafe', 'drink', 'latte', 'กาแฟ'],
  'Café Amazon': ['coffee', 'cafe', 'drink', 'americano', 'กาแฟ'],
  'Brown Cafe': ['coffee', 'cafe', 'bakery', 'dessert', 'กาแฟ'],
  Segafredo: ['coffee', 'cafe', 'espresso', 'กาแฟ'],
  'Tops Coffee Corner': ['coffee', 'cafe', 'กาแฟ'],
  'After You': ['dessert', 'cafe', 'toast', 'sweet'],
  "Swensen's": ['ice cream', 'dessert', 'sweet'],
  'Cold Stone Creamery': ['ice cream', 'dessert', 'sweet'],
  'Mister Donut': ['donut', 'dessert', 'sweet', 'coffee'],
  'Major Cineplex': ['movie', 'cinema', 'film', 'date night', 'popcorn', 'หนัง'],
  'SF Cinema': ['movie', 'cinema', 'film', 'date night', 'popcorn', 'หนัง'],
  'Thai Ticket Major': ['concert', 'ticket', 'music'],
  'EDC Thailand 2026': ['concert', 'festival', 'music', 'edm'],
  Sephora: ['beauty', 'makeup', 'skincare', 'cosmetics', 'เครื่องสำอาง'],
  Boots: ['beauty', 'skincare', 'pharmacy', 'health'],
  Watsons: ['beauty', 'skincare', 'pharmacy', 'health'],
  Eveandboy: ['beauty', 'makeup', 'cosmetics', 'เครื่องสำอาง'],
  'Matsumoto Kiyoshi': ['beauty', 'skincare', 'japan', 'pharmacy'],
  'Tops Care': ['beauty', 'skincare', 'pharmacy', 'health'],
  'Central Beauty Galerie': ['beauty', 'makeup', 'skincare', 'luxury', 'perfume', 'เครื่องสำอาง'],
  'Estée Lauder': ['beauty', 'skincare', 'luxury'],
  Clinique: ['beauty', 'skincare'],
  Lancôme: ['beauty', 'skincare', 'luxury', 'perfume'],
  Shiseido: ['beauty', 'skincare', 'japan'],
  "Kiehl's": ['beauty', 'skincare'],
  'Central Chidlom Luxury Hall': ['luxury', 'bag', 'handbag', 'designer', 'premium', 'กระเป๋า'],
  Coach: ['luxury', 'bag', 'handbag', 'leather', 'กระเป๋า'],
  'Charles & Keith': ['bag', 'handbag', 'shoes', 'กระเป๋า'],
  Pandora: ['jewelry', 'gift', 'luxury'],
  Uniqlo: ['fashion', 'clothes', 'basics'],
  Nike: ['sports', 'shoes', 'running', 'sneakers'],
  Adidas: ['sports', 'shoes', 'running', 'sneakers'],
  Skechers: ['shoes', 'sneakers', 'walking'],
  Crocs: ['shoes', 'sandals', 'kids'],
  SuperSports: ['sports', 'running', 'gym', 'shoes', 'fitness'],
  'Power Buy': ['electronics', 'tv', 'phone', 'appliance', 'gadget'],
  Samsung: ['electronics', 'tv', 'phone'],
  Dyson: ['electronics', 'appliance', 'vacuum', 'hair'],
  Tefal: ['kitchen', 'appliance', 'cooking'],
  Muji: ['home', 'stationery', 'minimal', 'lifestyle'],
  'Thai Watsadu': ['home', 'diy', 'hardware', 'renovation'],
  'BnB home': ['home', 'diy', 'furniture'],
  OfficeMate: ['office', 'stationery', 'work from home'],
  B2S: ['books', 'stationery', 'kids', 'school'],
  "Pet 'N Me": ['pet', 'dog', 'cat'],
  Auto1: ['car', 'tyre', 'service', 'auto'],
  Tops: ['grocery', 'supermarket', 'fresh', 'food', 'weekly shop'],
  'Tops daily': ['grocery', 'convenience', 'snacks', 'food'],
  'Tops Online': ['grocery', 'delivery', 'online', 'food'],
  'Tops Wholesale': ['grocery', 'bulk', 'wholesale', 'food'],
  'Central Food Hall': ['grocery', 'gourmet', 'fresh', 'food', 'imported'],
  KFC: ['chicken', 'fast food', 'food', 'lunch'],
  'MK Restaurants': ['suki', 'dinner', 'family', 'food'],
  Ootoya: ['japanese', 'dinner', 'food'],
  Yayoi: ['japanese', 'lunch', 'food'],
  Shabushi: ['buffet', 'shabu', 'dinner', 'food'],
  Chabuton: ['ramen', 'japanese', 'food'],
  Katsuya: ['japanese', 'lunch', 'food'],
  'Pepper Lunch': ['lunch', 'steak', 'food'],
  "Auntie Anne's": ['snack', 'pretzel', 'food'],
  'Centara Grand Ladprao': ['hotel', 'buffet', 'dinner', 'travel'],
  'Cenvaree Spa': ['spa', 'massage', 'wellness', 'relax'],
  'COSI Samui': ['hotel', 'travel', 'beach', 'holiday'],
  'Centara Hua Hin': ['hotel', 'travel', 'beach', 'holiday', 'family'],
  'Dream World': ['kids', 'family', 'theme park', 'weekend'],
  'SEA LIFE Bangkok': ['kids', 'family', 'aquarium', 'weekend'],
  'Kidzania Bangkok': ['kids', 'family', 'weekend'],
  'Central Kids': ['kids', 'family', 'clothes', 'toys'],
  Mothercare: ['kids', 'baby', 'family'],
  'The 1 Insure': ['insurance', 'travel', 'protection'],
  'Central The 1 REDZ': ['credit card', 'card', 'points'],
  'Central Department Store': ['fashion', 'department store', 'clothes', 'beauty'],
  Robinson: ['fashion', 'department store', 'clothes', 'family'],
  'Central Online': ['fashion', 'online', 'delivery'],
  'Central App': ['fashion', 'online', 'app'],
  'The 1 Family': ['kids', 'family', 'beauty', 'fashion'],
  'Central Chidlom': ['luxury', 'fashion', 'department store'],
};

/** Estimated THB value for points-only perks, used for the user-margin algorithm. */
const valueThbByName = {
  'EDC Thailand 2026 GA Concert Ticket': 2200,
  'EDC Thailand 2026 VIP Concert Ticket': 3900,
  'MK Restaurants New Customer ฿100 Voucher': 100,
  'Starbucks Free Tall Beverage': 145,
  'Major Cineplex Free 2D Movie Ticket': 240,
  'SF Cinema Free 2D Movie Ticket': 240,
  'Major Cineplex Popcorn Combo': 120,
  'SF Cinema Popcorn Combo': 120,
  'KFC Free 2-Piece Chicken': 89,
  'Mister Donut Free 6 Donuts': 180,
  "Auntie Anne's Free Pretzel": 75,
  'Pepper Lunch Free Beef Pepper Rice': 219,
  'Ootoya ฿200 Voucher': 200,
  'Yayoi Free Set Meal': 229,
  'Shabushi 20% Off Buffet': 110,
  'Chabuton Free Ramen': 215,
  'Katsuya Free Katsu Set': 199,
  'Cold Stone Creamery Free Like It Size': 140,
  'After You Free Shibuya Toast': 245,
  "Swensen's Free Sundae": 119,
  'Café Amazon Free Iced Americano': 65,
  'Brown Cafe Coffee + Bakery Set': 150,
  'Thai Ticket Major ฿500 Off Concert Ticket': 500,
  'Centara Grand Ladprao Seafood Buffet': 1590,
  'Cenvaree Spa 30-min Massage': 150,
  'COSI Samui 1-Night Stay': 3900,
  'Centara Hua Hin 1-Night Stay': 4800,
  'Dream World ฿300 Off Day Pass': 300,
  'SEA LIFE Bangkok 30% Off Admission': 330,
  'Kidzania Bangkok ฿400 Off Admission': 400,
};

/** Brands whose offers make sense as a gift — feeds the gifting search story. */
const giftBrands = new Set([
  'Pandora', 'Charles & Keith', 'Coach', 'Central Chidlom Luxury Hall', 'Sephora', 'Central Beauty Galerie', 'Estée Lauder', 'Lancôme', 'Clinique', 'Shiseido', "Kiehl's",
  'Starbucks', 'Mister Donut', 'After You', 'Cold Stone Creamery', "Swensen's", 'Brown Cafe', 'Segafredo',
  'Muji', 'B2S', 'Central Kids', 'Mothercare', 'Kidzania Bangkok', 'SEA LIFE Bangkok', 'Dream World',
  'Cenvaree Spa', 'Centara Grand Ladprao', 'COSI Samui', 'Centara Hua Hin', 'Major Cineplex', 'SF Cinema', 'Thai Ticket Major', 'EDC Thailand 2026',
  'Central Department Store', 'Central Online', 'Robinson', 'Power Buy', 'Dyson', 'Samsung', 'Lyn', 'Jaspal',
]);

function deriveTitle(r) {
  const name = r.name;
  const brand = r.brand;
  switch (r.offer_type) {
    case 'Coupon':
    case 'Phrom Pay Coupon':
      return { title: `฿${fmt(Number(r.discount_thb))} Off`, subtitle: r.min_spend_thb ? `Min. spend ฿${fmt(Number(r.min_spend_thb))}` : undefined };
    case 'Redeem Cash':
      return { title: `฿${fmt(Number(r.discount_thb))} Cash Coupon`, subtitle: `Use like cash at ${brand}` };
    case 'Challenge': {
      const after = name.split(':').slice(1).join(':').trim();
      const m = after.match(/^(.*?)\s*\((Shop [^)]+)\)\s*$/);
      if (m) return { title: m[1].trim(), subtitle: m[2].trim() };
      const pb = after.replace(/^Point Boost - /, '');
      return { title: pb || after, subtitle: 'Point Boost' };
    }
    case 'Redeem Points': {
      const title = name.startsWith(brand) ? name.slice(brand.length).trim() : name;
      const sub = { 'EDC Thailand 2026': 'Receive ticket for edc Thailand 2026' }[brand];
      return { title, subtitle: sub ?? `At ${brand}` };
    }
    case 'Central App Deal': {
      const title = name.split(':').slice(1).join(':').trim();
      return { title, subtitle: 'Central App only' };
    }
    case 'Card Offer': {
      const after = name.split(':').slice(1).join(':').trim();
      const [t, s] = after.split(' - ');
      return { title: t.trim(), subtitle: s ? s.trim() : 'Central The 1 REDZ' };
    }
    case 'Insurance': {
      const parts = name.split(':');
      return parts.length > 1 ? { title: parts.slice(1).join(':').trim(), subtitle: parts[0].trim() } : { title: name, subtitle: 'The 1 Insure' };
    }
    default:
      return { title: name };
  }
}

/** Deterministic, plausible 30-day redemption counts by offer type and value. */
function popularity(r) {
  const h = hash(r.sku) % 1000;
  const disc = Number(r.discount_thb || 0);
  const price = Number(r.price || 0);
  switch (r.offer_type) {
    case 'Coupon':
      return Math.round(26000 / (1 + disc / 60) + h * 4);
    case 'Phrom Pay Coupon':
      return Math.round(9000 / (1 + disc / 20) + h * 2);
    case 'Redeem Cash':
      return Math.round(7000 / (1 + price / 1500) + h);
    case 'Challenge':
      return Math.round(12000 / (1 + Number(r.min_spend_thb || 2000) / 2500) + h * 3);
    case 'Redeem Points':
      return Math.round(9000 / (1 + price / 700) + h);
    case 'Central App Deal':
      return 1500 + h * 3;
    case 'Card Offer':
      return 600 + h;
    case 'Insurance':
      return 300 + h;
    default:
      return 1000 + h;
  }
}

function dateAdded(r) {
  // Spread creation dates over the past 60 days, deterministic per SKU.
  const d = new Date('2026-11-02T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - (hash(r.sku + 'd') % 60));
  return d.toISOString().slice(0, 10);
}

function toOffer(r, overrides = {}) {
  const { title, subtitle } = deriveTitle(r);
  const brandId = slug(r.brand);
  const cats = r.categories.split('|').map((s) => s.trim());
  const category = cats[1] ?? cats[0];
  const base = {
    id: r.sku,
    name: r.name,
    title,
    subtitle,
    brand: r.brand,
    brandId,
    image: r.image_url,
    pointsCost: Number(r.price || 0),
    inStock: String(r.in_stock).toUpperCase() === 'TRUE',
    stockLevel: 'normal',
    category,
    offerType: r.offer_type,
    cta: r.cta_label,
    section: r.app_section,
    discountThb: num(r.discount_thb),
    minSpendThb: num(r.min_spend_thb),
    rewardPoints: num(r.reward_points),
    multiplier: num(r.points_multiplier),
    memberLevel: r.member_level,
    channel: r.redemption_channel,
    validUntil: r.valid_until,
    storeFormat: storeFormatByBrand[r.brand],
    topsFamily: topsFamily.has(r.brand),
    tags: [...(tagsByBrand[r.brand] ?? [category.toLowerCase()]), ...(giftBrands.has(r.brand) ? ['gift'] : [])],
    valueThb: valueThbByName[r.name],
    redemptions: popularity(r),
    dateAdded: dateAdded(r),
  };
  return { ...base, ...overrides };
}

/* ------------------------------------------------------ extra offers */
/** Shorthand to synthesise a feed row for generated offers. */
function row(sku, fields) {
  return {
    sku: String(sku),
    group_id: String(sku),
    url: `https://www.the1.co.th/en/offers/${sku}`,
    image_url: `https://www.the1.co.th/assets/offers/${slug(fields.brand)}/${sku}.jpg`,
    price: '0',
    in_stock: 'TRUE',
    cta_label: 'Get',
    member_level: 'All',
    redemption_channel: 'In-store & Online',
    discount_thb: '',
    min_spend_thb: '',
    reward_points: '',
    points_multiplier: '',
    ...fields,
  };
}

const coupon = (sku, brand, cat, disc, min, extra = {}) =>
  row(sku, {
    name: `${brand} ฿${disc} Off`,
    brand,
    categories: `Offers|${cat}|Coupon`,
    offer_type: 'Coupon',
    app_section: 'Search - Coupons',
    discount_thb: String(disc),
    min_spend_thb: String(min),
    valid_until: '2026-12-31',
    ...extra,
  });

const extraRows = [
  /* Tops store formats — the brand-hub sorting story (Tops Online newest = top of "today" sort). */
  coupon(300001, 'Tops Online', 'Grocery', 50, 500, { redemption_channel: 'Online', valid_until: '2026-12-31' }),
  coupon(300002, 'Tops Online', 'Grocery', 100, 1000, { redemption_channel: 'Online' }),
  coupon(300003, 'Tops Online', 'Grocery', 200, 2000, { redemption_channel: 'Online' }),
  row(300004, { name: 'Tops Online Free Delivery', brand: 'Tops Online', categories: 'Offers|Grocery|Coupon', offer_type: 'Coupon', app_section: 'Search - Coupons', discount_thb: '49', min_spend_thb: '800', redemption_channel: 'Online', valid_until: '2026-12-31' }),
  coupon(300005, 'Tops', 'Grocery', 30, 500, { redemption_channel: 'In-store' }),
  coupon(300006, 'Tops', 'Grocery', 60, 800, { redemption_channel: 'In-store' }),
  coupon(300007, 'Tops', 'Grocery', 150, 1500, { redemption_channel: 'In-store' }),
  row(300008, { name: 'Tops x2 Points on Tops Own Brand', brand: 'Tops', categories: 'Offers|Grocery|Coupon', offer_type: 'Coupon', app_section: 'Search - Coupons', points_multiplier: '2', min_spend_thb: '300', redemption_channel: 'In-store', valid_until: '2026-11-30' }),
  coupon(300009, 'Tops daily', 'Grocery', 15, 150, { redemption_channel: 'In-store' }),
  coupon(300010, 'Tops daily', 'Grocery', 30, 300, { redemption_channel: 'In-store' }),
  coupon(300011, 'Central Food Hall', 'Grocery', 80, 1000, { redemption_channel: 'In-store' }),
  row(300012, { name: 'Tops Coffee Corner Free Upsize', brand: 'Tops Coffee Corner', categories: 'Offers|Food & Beverage|Coupon', offer_type: 'Coupon', app_section: 'Search - Coupons', discount_thb: '15', min_spend_thb: '55', redemption_channel: 'In-store', valid_until: '2026-11-30' }),

  /* Coffee — the semantic-search story ("coffee" / "กาแฟ"). */
  coupon(300013, 'Café Amazon', 'Food & Beverage', 10, 60),
  coupon(300014, 'Brown Cafe', 'Food & Beverage', 20, 150),
  coupon(300015, 'Segafredo', 'Food & Beverage', 25, 150),
  row(300016, { name: 'Starbucks Buy 1 Get 1 Free (Level 2+)', brand: 'Starbucks', categories: 'Offers|Food & Beverage|Coupon', offer_type: 'Coupon', app_section: 'Search - Coupons', discount_thb: '145', min_spend_thb: '145', member_level: 'Level 2', valid_until: '2026-11-15' }),
  row(300017, { name: 'Starbucks ฿100 Off', brand: 'Starbucks', categories: 'Offers|Food & Beverage|Coupon', offer_type: 'Coupon', app_section: 'Search - Coupons', discount_thb: '100', min_spend_thb: '600', valid_until: '2026-11-04' }),

  /* Beauty & luxury — affinity and "luxury bag" search. */
  coupon(300018, 'Central Beauty Galerie', 'Beauty', 300, 3000),
  coupon(300019, 'Central Beauty Galerie', 'Beauty', 500, 5000),
  row(300020, { name: 'Central Chidlom Luxury Hall ฿2,000 Off', brand: 'Central Chidlom Luxury Hall', categories: 'Offers|Fashion|Coupon', offer_type: 'Coupon', app_section: 'Search - Coupons', discount_thb: '2000', min_spend_thb: '20000', valid_until: '2026-12-31' }),
  row(300021, { name: 'Coach ฿1,500 Off', brand: 'Coach', categories: 'Offers|Fashion|Coupon', offer_type: 'Coupon', app_section: 'Search - Coupons', discount_thb: '1500', min_spend_thb: '12000', valid_until: '2026-12-15' }),
  coupon(300022, 'Charles & Keith', 'Fashion', 200, 1500),
  coupon(300023, 'Pandora', 'Fashion', 300, 2500),

  /* Kids & family. */
  coupon(300024, 'Central Kids', 'Kids', 200, 1500),
  coupon(300025, 'Mothercare', 'Kids', 300, 2500),

  /* Stock / expiry edge cases for merchandising-rule stories. */
  row(300026, { name: "Swensen's Buy 1 Get 1 Free", brand: "Swensen's", categories: 'Offers|Food & Beverage|Coupon', offer_type: 'Coupon', app_section: 'Search - Coupons', discount_thb: '119', min_spend_thb: '119', in_stock: 'FALSE', valid_until: '2026-11-30' }),
  row(300027, { name: 'After You ฿50 Off', brand: 'After You', categories: 'Offers|Food & Beverage|Coupon', offer_type: 'Coupon', app_section: 'Search - Coupons', discount_thb: '50', min_spend_thb: '300', valid_until: '2026-11-03' }),
  row(300028, { name: 'Major Cineplex ฿60 Off Ticket', brand: 'Major Cineplex', categories: 'Offers|Entertainment|Coupon', offer_type: 'Coupon', app_section: 'Search - Coupons', discount_thb: '60', min_spend_thb: '240', valid_until: '2026-12-31' }),
  row(300029, { name: 'SF Cinema ฿50 Off Ticket', brand: 'SF Cinema', categories: 'Offers|Entertainment|Coupon', offer_type: 'Coupon', app_section: 'Search - Coupons', discount_thb: '50', min_spend_thb: '220', valid_until: '2026-12-31' }),

  /* Tops / grocery challenges that reference weekly shopping. */
  row(300030, { name: 'Tops Challenge: Weekly Shopper - Get 300 Points (Shop ฿1,500 twice)', brand: 'Tops', categories: 'Offers|Challenge|Challenge', offer_type: 'Challenge', cta_label: 'Join', app_section: 'Challenge', min_spend_thb: '3000', reward_points: '300', valid_until: '2026-11-30' }),
  row(300031, { name: 'Sephora Challenge: Get 300 Points (Shop ฿3,000)', brand: 'Sephora', categories: 'Offers|Challenge|Challenge', offer_type: 'Challenge', cta_label: 'Join', app_section: 'Challenge', min_spend_thb: '3000', reward_points: '300', valid_until: '2026-12-15' }),
  row(300032, { name: 'Starbucks Challenge: Get 100 Points (Buy 3 drinks)', brand: 'Starbucks', categories: 'Offers|Challenge|Challenge', offer_type: 'Challenge', cta_label: 'Join', app_section: 'Challenge', min_spend_thb: '450', reward_points: '100', valid_until: '2026-11-30' }),
  row(300033, { name: 'The 1 Challenge: First Coupon - Get 50 Points (Use any coupon)', brand: 'The 1', categories: 'Offers|Challenge|Challenge', offer_type: 'Challenge', cta_label: 'Join', app_section: 'Challenge', min_spend_thb: '0', reward_points: '50', valid_until: '2026-12-31' }),

  /* Redeem-points perks with strong user margin. */
  row(300034, { name: 'Segafredo Free Cappuccino', brand: 'Segafredo', categories: 'Offers|Food & Beverage|Redeem Points', offer_type: 'Redeem Points', cta_label: 'Redeem', app_section: 'Free Entertainment & Food Perks', price: '520', valid_until: '2027-02-28' }),
  row(300035, { name: 'Tops ฿50 Cash Coupon (Redeem Points)', brand: 'Tops', categories: 'Offers|Grocery|Redeem Cash', offer_type: 'Redeem Cash', cta_label: 'Redeem', app_section: 'Redeem Cash', price: '400', discount_thb: '50', valid_until: '2026-12-31' }),
  row(300036, { name: 'Universal ฿100 Cash Coupon (Redeem Points)', brand: 'The 1', categories: 'Offers|Universal|Redeem Cash', offer_type: 'Redeem Cash', cta_label: 'Redeem', app_section: 'Redeem Cash', price: '800', discount_thb: '100', valid_until: '2026-12-31' }),
  row(300037, { name: 'Universal ฿500 Cash Coupon (Redeem Points)', brand: 'The 1', categories: 'Offers|Universal|Redeem Cash', offer_type: 'Redeem Cash', cta_label: 'Redeem', app_section: 'Redeem Cash', price: '4000', discount_thb: '500', valid_until: '2026-12-31' }),
];

const extraOverrides = {
  300001: { dateAdded: '2026-11-02', tags: tagsByBrand['Tops Online'] },
  300002: { dateAdded: '2026-11-01', tags: tagsByBrand['Tops Online'] },
  300003: { dateAdded: '2026-10-31', tags: tagsByBrand['Tops Online'] },
  300004: { dateAdded: '2026-11-02', title: 'Free Delivery', subtitle: 'Min. spend ฿800 · Tops Online', tags: tagsByBrand['Tops Online'] },
  300005: { dateAdded: '2026-10-12' },
  300006: { dateAdded: '2026-10-05' },
  300007: { dateAdded: '2026-09-28' },
  300008: { dateAdded: '2026-10-20', title: 'x2 Points', subtitle: 'Tops Own Brand · Min. spend ฿300' },
  300009: { dateAdded: '2026-10-22' },
  300010: { dateAdded: '2026-10-15' },
  300011: { dateAdded: '2026-10-18' },
  300012: { title: 'Free Upsize', subtitle: 'Any hot or iced coffee', tags: tagsByBrand['Tops Coffee Corner'] },
  300013: { tags: tagsByBrand['Café Amazon'] },
  300014: { tags: tagsByBrand['Brown Cafe'] },
  300015: { tags: tagsByBrand.Segafredo },
  300016: { title: 'Buy 1 Get 1 Free', subtitle: 'Level 2 and above · Any handcrafted drink', stockLevel: 'low', redemptions: 38900 },
  300017: { stockLevel: 'low', subtitle: 'Min. spend ฿600 · Ends 4 Nov', redemptions: 24100 },
  300020: { title: '฿2,000 Off', subtitle: 'Min. spend ฿20,000 · Luxury Hall' },
  300021: { title: '฿1,500 Off', subtitle: 'Min. spend ฿12,000' },
  300026: { title: 'Buy 1 Get 1 Free', subtitle: 'Sundae · Out of stock' },
  300027: { subtitle: 'Min. spend ฿300 · Ends tomorrow', stockLevel: 'low' },
  300028: { title: '฿60 Off', subtitle: 'Any 2D movie ticket' },
  300029: { title: '฿50 Off', subtitle: 'Any 2D movie ticket' },
  300030: { title: 'Get 300 Points', subtitle: 'Shop ฿1,500 twice this month' },
  300031: { title: 'Get 300 Points', subtitle: 'Shop ฿3,000' },
  300032: { title: 'Get 100 Points', subtitle: 'Buy 3 drinks this month' },
  300033: { title: 'Get 50 Points', subtitle: 'Use your first coupon' },
  300034: { title: 'Free Cappuccino', subtitle: 'Any size · Segafredo Zanetti', valueThb: 95, tags: tagsByBrand.Segafredo },
  300035: { title: '฿50 Cash Coupon', subtitle: 'Use like cash at Tops' },
  300036: { title: '฿100 Universal Cash Coupon', subtitle: 'Any Central Group store' },
  300037: { title: '฿500 Universal Cash Coupon', subtitle: 'Any Central Group store' },
};

/* ------------------------------------------------------------- build */
const feedRows = parseCsv(readFileSync(csvPath, 'utf8'));
const feedOverrides = {
  // Feed items given low-stock / expiry colour for the merchandising stories.
  200117: { stockLevel: 'low' }, // MK new-customer voucher
  200181: { redemptions: 29800 }, // KFC ฿30
  200179: { redemptions: 33400 }, // Starbucks ฿30
  200042: { redemptions: 25600 }, // Tops ฿20
  200001: { redemptions: 21900 }, // Central ฿20
  200006: { redemptions: 18200 }, // Robinson ฿20
  200188: { redemptions: 11300 }, // Sephora ฿100
  200085: { redemptions: 15800 }, // Central App challenge
  200087: { redemptions: 17200 }, // Robinson point boost
  200088: { redemptions: 16100 }, // Central point boost
  200118: { redemptions: 12400 }, // Starbucks free tall
};
const offers = [
  ...feedRows.map((r) => toOffer(r, feedOverrides[r.sku] ?? {})),
  ...extraRows.map((r) => toOffer(r, extraOverrides[r.sku] ?? {})),
];

const ids = new Set();
for (const o of offers) {
  if (ids.has(o.id)) throw new Error(`Duplicate SKU ${o.id}`);
  ids.add(o.id);
}

writeFileSync(outPath, JSON.stringify(offers, null, 2) + '\n');
console.log(`Wrote ${offers.length} offers (${feedRows.length} from feed + ${extraRows.length} generated) → ${outPath}`);
