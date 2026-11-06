// PHASE 1 SAMPLE DATA, copied from the prototype so every screen has something to show.
// Phase 2 replaces this with the Supabase tables (supabase/seed.sql).
//
// Rules for this file:
// - Nothing here is verified. Every record has verified: false and last_checked: null.
// - The only real numbers from the business plan are:
//     Neelum, 3 days, 2 people ≈ Rs 38,000  and  jeep in Kel ≈ Rs 6,000 per day.
//   Every other price is null (shown as "Price not set yet").
// - Partner names are samples, not real businesses.

import type { CityCode, EmergencyContact, ItineraryDay, Partner, Place, Price, RoadUpdate, StyleCode } from './types';

const unverified = { verified: false, last_checked: null };

export const PLACES: Place[] = [
  {
    ...unverified,
    id: 'neelum',
    name: { en: 'Neelum Valley', ur: 'وادیٔ نیلم', roman: 'Neelum Valley' },
    type: 'valley',
    district: { en: 'Neelum District', ur: 'ضلع نیلم', roman: 'Neelum District' },
    blurb: {
      en: 'Riverside villages, forests and mountain views.',
      ur: 'دریا کنارے گاؤں، جنگلات اور پہاڑی نظارے۔',
      roman: 'Darya kinare gaon, jungle aur pahari nazare.',
    },
    description: {
      en: 'Green slopes, the blue Neelum river and mountain villages from Keran to Arang Kel.',
      ur: 'سرسبز ڈھلوانیں، نیلا دریائے نیلم اور کیرن سے اڑنگ کیل تک پہاڑی گاؤں۔',
      roman: 'Hari dhalwanein, neela Neelum darya aur Keran se Arang Kel tak pahari gaon.',
    },
    best_season: { en: 'May – October', ur: 'مئی تا اکتوبر', roman: 'May se October' },
    days_min: 2,
    days_max: 4,
    signal_note: { en: 'Weak after Keran', ur: 'کیرن کے بعد کمزور', roman: 'Keran ke baad kamzor' },
    stops: [
      {
        name: { en: 'Keran', ur: 'کیرن' },
        note: {
          en: 'Riverside village, first big stop',
          ur: 'دریا کنارے گاؤں، پہلا بڑا پڑاؤ',
          roman: 'Darya kinare gaon, pehla bara parao',
        },
      },
      {
        name: { en: 'Sharda', ur: 'شاردا' },
        note: {
          en: 'Old ruins, guesthouses, good night stop',
          ur: 'قدیم کھنڈرات، گیسٹ ہاؤس، رات رکنے کی اچھی جگہ',
          roman: 'Purane khandarat, guesthouse, raat rukne ki achi jagah',
        },
      },
      {
        name: { en: 'Kel', ur: 'کیل' },
        note: {
          en: 'Base for Arang Kel, jeeps start here',
          ur: 'اڑنگ کیل کا بیس، جیپیں یہیں سے چلتی ہیں',
          roman: 'Arang Kel ka base, jeepein yahin se chalti hain',
        },
      },
      {
        name: { en: 'Arang Kel', ur: 'اڑنگ کیل' },
        note: {
          en: 'Chairlift then short hike to the meadow',
          ur: 'چیئرلفٹ، پھر سبزہ زار تک مختصر چڑھائی',
          roman: 'Chairlift, phir maidan tak chhoti chadhai',
        },
      },
    ],
    tips: [
      {
        en: 'Download your plan offline before Keran. Signal drops after.',
        ur: 'کیرن سے پہلے اپنا منصوبہ آف لائن محفوظ کر لیں۔ اس کے بعد سگنل کم ہو جاتا ہے۔',
        roman: 'Keran se pehle apna plan offline save kar lein. Uske baad signal kam ho jata hai.',
      },
      {
        en: 'Book a jeep for Kel in advance, about Rs 6,000 per day.',
        ur: 'کیل کے لیے جیپ پہلے سے بُک کریں، تقریباً 6,000 روپے فی دن۔',
        roman: 'Kel ke liye jeep pehle se book karein, taqreeban Rs 6,000 per din.',
      },
      {
        en: 'Carry cash. ATMs are few after Athmuqam.',
        ur: 'نقد رقم ساتھ رکھیں۔ اٹھمقام کے بعد اے ٹی ایم کم ہیں۔',
        roman: 'Cash saath rakhein. Athmuqam ke baad ATM kam hain.',
      },
      {
        en: 'Start drives before 8 am to avoid afternoon rain.',
        ur: 'دوپہر کی بارش سے بچنے کے لیے صبح 8 بجے سے پہلے روانہ ہوں۔',
        roman: 'Dopehar ki barish se bachne ke liye subah 8 baje se pehle niklein.',
      },
    ],
    jeep_days: 1,
    lat: null,
    lon: null,
    maps_query: 'Neelum Valley, Azad Kashmir',
    image_key: 'neelum',
    image_credit: 'Photo: Ab. Waheed / Unsplash',
    sort_order: 1,
  },
  {
    ...unverified,
    id: 'banjosa',
    name: { en: 'Banjosa Lake', ur: 'بنجوسہ جھیل', roman: 'Banjosa Jheel' },
    type: 'lake',
    district: null,
    blurb: {
      en: 'Calm pine-ringed lake near Rawalakot.',
      ur: 'راولاکوٹ کے قریب چیڑ کے درختوں میں گھری پرسکون جھیل۔',
      roman: 'Rawalakot ke qareeb cheer ke darakhton mein ghiri pursukoon jheel.',
    },
    description: {
      en: 'Calm pine-ringed lake near Rawalakot.',
      ur: 'راولاکوٹ کے قریب چیڑ کے درختوں میں گھری پرسکون جھیل۔',
      roman: 'Rawalakot ke qareeb cheer ke darakhton mein ghiri pursukoon jheel.',
    },
    best_season: null,
    days_min: 1,
    days_max: 1,
    signal_note: null,
    stops: [],
    tips: [],
    jeep_days: 0,
    lat: null,
    lon: null,
    maps_query: 'Banjosa Lake, Azad Kashmir',
    image_key: null,
    image_credit: null,
    sort_order: 2,
  },
  {
    ...unverified,
    id: 'kel',
    name: { en: 'Kel & Arang Kel', ur: 'کیل اور اڑنگ کیل', roman: 'Kel aur Arang Kel' },
    type: 'valley',
    district: { en: 'Neelum District', ur: 'ضلع نیلم', roman: 'Neelum District' },
    blurb: {
      en: 'High meadows and a chairlift up to the village.',
      ur: 'اونچے سبزہ زار اور گاؤں تک چیئرلفٹ۔',
      roman: 'Oonche maidan aur gaon tak chairlift.',
    },
    description: {
      en: 'High meadows and a chairlift up to the village.',
      ur: 'اونچے سبزہ زار اور گاؤں تک چیئرلفٹ۔',
      roman: 'Oonche maidan aur gaon tak chairlift.',
    },
    best_season: null,
    days_min: 2,
    days_max: 3,
    signal_note: null,
    stops: [],
    tips: [
      {
        en: 'Book a jeep for Kel in advance, about Rs 6,000 per day.',
        ur: 'کیل کے لیے جیپ پہلے سے بُک کریں، تقریباً 6,000 روپے فی دن۔',
        roman: 'Kel ke liye jeep pehle se book karein, taqreeban Rs 6,000 per din.',
      },
    ],
    jeep_days: 1,
    lat: null,
    lon: null,
    maps_query: 'Arang Kel, Azad Kashmir',
    image_key: 'arangkel',
    image_credit: 'Photo: Abdullah Kashif / Unsplash',
    sort_order: 3,
  },
  {
    ...unverified,
    id: 'toli',
    name: { en: 'Toli Pir', ur: 'تولی پیر', roman: 'Toli Pir' },
    type: 'hilltop',
    district: null,
    blurb: {
      en: 'Open hilltop views and fresh air.',
      ur: 'کھلے پہاڑی نظارے اور تازہ ہوا۔',
      roman: 'Khule pahari nazare aur taza hawa.',
    },
    description: {
      en: 'Open hilltop views and fresh air.',
      ur: 'کھلے پہاڑی نظارے اور تازہ ہوا۔',
      roman: 'Khule pahari nazare aur taza hawa.',
    },
    best_season: null,
    days_min: 1,
    days_max: 1,
    signal_note: null,
    stops: [],
    tips: [],
    jeep_days: 0,
    lat: null,
    lon: null,
    maps_query: 'Toli Pir, Azad Kashmir',
    image_key: 'toli',
    image_credit: null,
    sort_order: 4,
  },
  {
    ...unverified,
    id: 'rawalakot',
    name: { en: 'Rawalakot', ur: 'راولاکوٹ' },
    type: 'town',
    district: null,
    blurb: {
      en: 'Handy base for hills, food and day trips.',
      ur: 'پہاڑیوں، کھانے اور ایک دن کے سفر کے لیے اچھا مرکز۔',
      roman: 'Pahariyon, khane aur din ke safar ke liye acha markaz.',
    },
    description: {
      en: 'Handy base for hills, food and day trips.',
      ur: 'پہاڑیوں، کھانے اور ایک دن کے سفر کے لیے اچھا مرکز۔',
      roman: 'Pahariyon, khane aur din ke safar ke liye acha markaz.',
    },
    best_season: null,
    days_min: 1,
    days_max: 2,
    signal_note: null,
    stops: [],
    tips: [],
    jeep_days: 0,
    lat: null,
    lon: null,
    maps_query: 'Rawalakot, Azad Kashmir',
    image_key: null,
    image_credit: null,
    sort_order: 5,
  },
  {
    ...unverified,
    id: 'muzaffarabad',
    name: { en: 'Muzaffarabad', ur: 'مظفرآباد' },
    type: 'town',
    district: null,
    blurb: {
      en: 'The capital, viewpoints and two rivers meeting.',
      ur: 'دارالحکومت، خوبصورت نظارے اور دو دریاؤں کا سنگم۔',
      roman: 'Darul hukumat, view points aur do daryaon ka sangam.',
    },
    description: {
      en: 'The capital, viewpoints and two rivers meeting.',
      ur: 'دارالحکومت، خوبصورت نظارے اور دو دریاؤں کا سنگم۔',
      roman: 'Darul hukumat, view points aur do daryaon ka sangam.',
    },
    best_season: null,
    days_min: 1,
    days_max: 2,
    signal_note: null,
    stops: [],
    tips: [],
    jeep_days: 0,
    lat: null,
    lon: null,
    maps_query: 'Muzaffarabad, Azad Kashmir',
    image_key: 'mzd',
    image_credit: null,
    sort_order: 6,
  },
];

// Neelum's 3-day sample budget (decision "A": the prototype's split of the Rs 38,000
// business-plan figure). Phase 3 replaces this with the calculator + prices table.
export const NEELUM_SAMPLE = {
  placeId: 'neelum',
  days: 3,
  people: 2,
  total: 38000,
  split: { transport: 14000, stay: 12000, food: 8000, extras: 4000 },
};

export const PARTNERS: Partner[] = [
  {
    ...unverified,
    id: 's1',
    place_id: 'neelum',
    kind: 'stay',
    name: { en: 'Sample guesthouse · Keran', ur: 'نمونہ گیسٹ ہاؤس · کیرن', roman: 'Sample guesthouse · Keran' },
    description: { en: 'Keran · details to be added', ur: 'کیرن · تفصیلات جلد', roman: 'Keran · tafseelat jald' },
    price_pkr: null,
    price_unit: 'night',
    phone: null,
    featured: true,
    featured_until: null,
    active: true,
  },
  {
    ...unverified,
    id: 's2',
    place_id: 'neelum',
    kind: 'stay',
    name: { en: 'Sample inn · Sharda', ur: 'نمونہ سرائے · شاردا', roman: 'Sample inn · Sharda' },
    description: { en: 'Sharda · details to be added', ur: 'شاردا · تفصیلات جلد', roman: 'Sharda · tafseelat jald' },
    price_pkr: null,
    price_unit: 'night',
    phone: null,
    featured: false,
    featured_until: null,
    active: true,
  },
  {
    ...unverified,
    id: 's3',
    place_id: 'neelum',
    kind: 'stay',
    name: { en: 'Sample huts · Kel', ur: 'نمونہ جھونپڑیاں · کیل', roman: 'Sample huts · Kel' },
    description: { en: 'Kel · details to be added', ur: 'کیل · تفصیلات جلد', roman: 'Kel · tafseelat jald' },
    price_pkr: null,
    price_unit: 'night',
    phone: null,
    featured: false,
    featured_until: null,
    active: true,
  },
  {
    ...unverified,
    id: 'g1',
    place_id: 'neelum',
    kind: 'guide',
    name: { en: 'Sample valley guide', ur: 'نمونہ وادی گائیڈ', roman: 'Sample valley guide' },
    description: { en: 'Keran to Arang Kel', ur: 'کیرن سے اڑنگ کیل', roman: 'Keran se Arang Kel' },
    price_pkr: null,
    price_unit: 'day',
    phone: null,
    featured: true,
    featured_until: null,
    active: true,
  },
  {
    ...unverified,
    id: 'g2',
    place_id: 'neelum',
    kind: 'guide',
    name: { en: 'Sample trek guide', ur: 'نمونہ ٹریک گائیڈ', roman: 'Sample trek guide' },
    description: { en: 'Details to be added', ur: 'تفصیلات جلد', roman: 'Tafseelat jald' },
    price_pkr: null,
    price_unit: 'day',
    phone: null,
    featured: false,
    featured_until: null,
    active: true,
  },
  {
    ...unverified,
    id: 'j1',
    place_id: 'neelum',
    kind: 'jeep',
    name: { en: 'Sample jeep service · Kel', ur: 'نمونہ جیپ سروس · کیل', roman: 'Sample jeep service · Kel' },
    description: { en: 'Kel ↔ Arang Kel base', ur: 'کیل ↔ اڑنگ کیل بیس', roman: 'Kel ↔ Arang Kel base' },
    price_pkr: 6000, // business plan figure
    price_unit: 'day',
    phone: null,
    featured: true,
    featured_until: null,
    active: true,
  },
  {
    ...unverified,
    id: 'j2',
    place_id: 'neelum',
    kind: 'jeep',
    name: { en: 'Sample 4x4 · Muzaffarabad', ur: 'نمونہ فور بائی فور · مظفرآباد', roman: 'Sample 4x4 · Muzaffarabad' },
    description: { en: 'Pickup from Muzaffarabad', ur: 'مظفرآباد سے پک اپ', roman: 'Muzaffarabad se pickup' },
    price_pkr: null,
    price_unit: 'day',
    phone: null,
    featured: false,
    featured_until: null,
    active: true,
  },
];

export const ROAD_UPDATES: RoadUpdate[] = [
  {
    ...unverified,
    id: 'r1',
    place_id: 'neelum',
    segment: { en: 'Muzaffarabad → Keran', ur: 'مظفرآباد ← کیرن', roman: 'Muzaffarabad → Keran' },
    status: 'open',
    note: null,
    source: 'sample',
    updated_at: '2026-11-03T09:10:00+05:00',
  },
  {
    ...unverified,
    id: 'r2',
    place_id: 'neelum',
    segment: { en: 'Keran → Sharda', ur: 'کیرن ← شاردا', roman: 'Keran → Sharda' },
    status: 'open',
    note: null,
    source: 'sample',
    updated_at: '2026-11-03T09:10:00+05:00',
  },
  {
    ...unverified,
    id: 'r3',
    place_id: 'neelum',
    segment: { en: 'Sharda → Kel', ur: 'شاردا ← کیل', roman: 'Sharda → Kel' },
    status: 'slow',
    note: {
      en: 'Open to Kel. Slow after Sharda, start early.',
      ur: 'کیل تک کھلی ہے۔ شاردا کے بعد سست، جلدی نکلیں۔',
      roman: 'Kel tak khuli hai. Sharda ke baad slow, jaldi niklein.',
    },
    source: 'sample',
    updated_at: '2026-11-03T09:10:00+05:00',
  },
];

// Neelum template from the prototype (prices removed except the Rs 6,000 figures).
export const ITINERARY: ItineraryDay[] = [
  {
    place_id: 'neelum',
    day_number: 1,
    title: { en: 'To Keran', ur: 'کیرن کی طرف', roman: 'Keran ki taraf' },
    steps: [
      {
        time: '06:00',
        title: { en: 'Leave your city', ur: 'اپنے شہر سے روانگی', roman: 'Apne shehar se rawangi' },
        note: { en: 'Early start for the long drive', ur: 'لمبے سفر کے لیے صبح سویرے', roman: 'Lambe safar ke liye subah sawere' },
      },
      {
        time: '11:00',
        title: { en: 'Lunch in Muzaffarabad', ur: 'مظفرآباد میں دوپہر کا کھانا', roman: 'Muzaffarabad mein dopehar ka khana' },
        note: { en: 'Daal chawal and chai', ur: 'دال چاول اور چائے', roman: 'Daal chawal aur chai' },
      },
      {
        time: '17:00',
        title: { en: 'Check in at Keran', ur: 'کیرن میں قیام', roman: 'Keran mein check in' },
        note: { en: 'Riverside guesthouse', ur: 'دریا کنارے گیسٹ ہاؤس', roman: 'Darya kinare guesthouse' },
      },
    ],
  },
  {
    place_id: 'neelum',
    day_number: 2,
    title: { en: 'Keran to Kel', ur: 'کیرن سے کیل', roman: 'Keran se Kel' },
    steps: [
      {
        time: '07:30',
        title: { en: 'Drive to Sharda', ur: 'شاردا کی طرف سفر', roman: 'Sharda ki taraf safar' },
        note: { en: 'Stop at the old ruins and the river bridge', ur: 'قدیم کھنڈرات اور دریا کے پل پر رکیں', roman: 'Purane khandarat aur darya ke pul par rukein' },
      },
      {
        time: '13:00',
        title: { en: 'Lunch at Sharda', ur: 'شاردا میں دوپہر کا کھانا', roman: 'Sharda mein dopehar ka khana' },
        note: { en: 'Trout if available', ur: 'ٹراؤٹ اگر دستیاب ہو', roman: 'Trout agar dastiyab ho' },
      },
      {
        time: '17:30',
        title: { en: 'Check in at Kel', ur: 'کیل میں قیام', roman: 'Kel mein check in' },
        note: { en: 'Guesthouse', ur: 'گیسٹ ہاؤس', roman: 'Guesthouse' },
      },
    ],
  },
  {
    place_id: 'neelum',
    day_number: 3,
    title: { en: 'Arang Kel and home', ur: 'اڑنگ کیل اور واپسی', roman: 'Arang Kel aur wapsi' },
    steps: [
      {
        time: '07:00',
        title: { en: 'Chairlift to Arang Kel', ur: 'اڑنگ کیل کے لیے چیئرلفٹ', roman: 'Arang Kel ke liye chairlift' },
        note: { en: 'Then a short hike up to the meadow', ur: 'پھر سبزہ زار تک مختصر چڑھائی', roman: 'Phir maidan tak chhoti chadhai' },
      },
      {
        time: '11:00',
        title: { en: 'Jeep back down the valley', ur: 'جیپ کے ذریعے وادی سے واپسی', roman: 'Jeep se wadi se wapsi' },
        note: { en: 'Booked jeep, about Rs 6,000 for the day', ur: 'بُک شدہ جیپ، تقریباً 6,000 روپے فی دن', roman: 'Booked jeep, taqreeban Rs 6,000 din ka' },
      },
      {
        time: '21:30',
        title: { en: 'Back home', ur: 'گھر واپسی', roman: 'Ghar wapsi' },
        note: { en: 'Long drive, share driving if you can', ur: 'لمبا سفر، ممکن ہو تو باری باری گاڑی چلائیں', roman: 'Lamba safar, mumkin ho to baari baari gaari chalayein' },
      },
    ],
  },
];

// These two numbers come from your brief and are also bundled for offline use.
export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'rescue', number: '1122', kind: 'rescue', label: { en: 'Rescue & ambulance', ur: 'ریسکیو اور ایمبولینس', roman: 'Rescue aur ambulance' } },
  { id: 'police', number: '15', kind: 'police', label: { en: 'Police', ur: 'پولیس', roman: 'Police' } },
];

// The budget calculator's price list, set up like supabase/seed.sql: one line per combination,
// all "not set yet" except the business-plan numbers for Neelum (they add up to Rs 38,000 for
// 3 days, 2 people, budget, from Islamabad) and the Rs 6,000 jeep in Kel.
const CITY_CODES: CityCode[] = ['isb', 'mzd', 'rwk', 'bagh'];
const STYLE_CODES: StyleCode[] = ['budget', 'comfort', 'premium'];
let priceId = 0;
const price = (p: Pick<Price, 'place_id' | 'category' | 'unit'> & Partial<Price>): Price => ({
  ...unverified,
  id: ++priceId,
  from_city: null,
  style: null,
  amount_pkr: null,
  notes: null,
  ...p,
});

export const PRICES: Price[] = PLACES.flatMap(({ id }) => {
  const neelum = id === 'neelum';
  return [
    ...CITY_CODES.map((city) => price({ place_id: id, category: 'transport', unit: 'per_vehicle_round_trip', from_city: city, amount_pkr: neelum && city === 'isb' ? 8000 : null })),
    price({ place_id: id, category: 'jeep', unit: 'per_vehicle_day', amount_pkr: neelum || id === 'kel' ? 6000 : null }),
    ...STYLE_CODES.flatMap((style) => [
      price({ place_id: id, category: 'stay', unit: 'per_room_night', style, amount_pkr: neelum && style === 'budget' ? 6000 : null }),
      price({ place_id: id, category: 'food', unit: 'per_person_day', style, amount_pkr: neelum && style === 'budget' ? 1333 : null }),
    ]),
    price({ place_id: id, category: 'extras', unit: 'per_person_trip', amount_pkr: neelum ? 2000 : null }),
  ];
});
