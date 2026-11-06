import type { Place, PlaceType } from './types';

// Destinations in Azad Jammu & Kashmir that the Plan page can plan a trip to, even when nobody has
// added them to the Places table yet: all ten districts with their towns and the main tourist spots.
// They have no photos or long descriptions (those live in the Places table). When a place with the
// same id exists in the database (neelum, banjosa, kel, toli, rawalakot, muzaffarabad…), the database
// version is used instead. Where a place is on the map is looked up from `maps_query` (see
// lib/geocode.ts), or set latitude/longitude on the place in Admin → Places.
// To add a destination here: one line in AJK, with an id that is not used yet.

type District = 'neelum' | 'hattian' | 'muzaffarabad' | 'poonch' | 'bagh' | 'haveli' | 'sudhnoti' | 'kotli' | 'mirpur' | 'bhimber';

const DISTRICTS: Record<District, { en: string; ur: string }> = {
  neelum: { en: 'Neelum', ur: 'نیلم' },
  hattian: { en: 'Hattian Bala', ur: 'ہٹیاں بالا' },
  muzaffarabad: { en: 'Muzaffarabad', ur: 'مظفرآباد' },
  poonch: { en: 'Poonch', ur: 'پونچھ' },
  bagh: { en: 'Bagh', ur: 'باغ' },
  haveli: { en: 'Haveli', ur: 'حویلی' },
  sudhnoti: { en: 'Sudhnoti', ur: 'سدھنوتی' },
  kotli: { en: 'Kotli', ur: 'کوٹلی' },
  mirpur: { en: 'Mirpur', ur: 'میرپور' },
  bhimber: { en: 'Bhimber', ur: 'بھمبر' },
};

const KIND: Record<PlaceType, { en: string; ur: string }> = {
  valley: { en: 'Valley', ur: 'وادی' },
  lake: { en: 'Lake', ur: 'جھیل' },
  hilltop: { en: 'Hill spot', ur: 'پہاڑی مقام' },
  town: { en: 'Town', ur: 'شہر' },
};

type Entry = { id: string; en: string; ur: string; district: District; type: PlaceType; jeep?: number; query?: string };
const e = (id: string, en: string, ur: string, district: District, type: PlaceType, extra: { jeep?: number; query?: string } = {}): Entry => ({ id, en, ur, district, type, ...extra });

const AJK: Entry[] = [
  // Neelum
  e('neelum', 'Neelum Valley', 'وادیٔ نیلم', 'neelum', 'valley', { jeep: 1 }),
  e('keran', 'Keran', 'کیرن', 'neelum', 'town'),
  e('sharda', 'Sharda', 'شاردا', 'neelum', 'town'),
  e('kel', 'Kel & Arang Kel', 'کیل اور اڑنگ کیل', 'neelum', 'valley', { jeep: 1, query: 'Arang Kel, Azad Kashmir' }),
  e('athmuqam', 'Athmuqam', 'اٹھمقام', 'neelum', 'town'),
  e('dowarian', 'Dowarian', 'ڈاؤریاں', 'neelum', 'town'),
  e('kundal-shahi', 'Kundal Shahi', 'کنڈل شاہی', 'neelum', 'town'),
  e('taobat', 'Taobat', 'تاؤبٹ', 'neelum', 'town'),
  e('jagran', 'Jagran Valley', 'جاگراں ویلی', 'neelum', 'valley'),
  e('ratti-gali', 'Ratti Gali Lake', 'رتی گلی جھیل', 'neelum', 'lake', { jeep: 1 }),
  e('chitta-katha', 'Chitta Katha Lake', 'چٹا کٹھا جھیل', 'neelum', 'lake', { jeep: 1 }),
  e('satbara', 'Satbara Lake', 'ستبارہ جھیل', 'neelum', 'lake', { jeep: 1 }),
  e('halmat', 'Halmat', 'ہلمت', 'neelum', 'town'),
  e('lawat', 'Lawat', 'لوات', 'neelum', 'town'),
  e('surgan', 'Surgan', 'سرگن', 'neelum', 'town'),
  e('nagdar', 'Nagdar', 'ناگدر', 'neelum', 'town'),
  e('sardari', 'Sardari', 'سرداری', 'neelum', 'town'),
  e('janawai', 'Janawai', 'جنوائی', 'neelum', 'town'),
  e('kutton', 'Kutton', 'کٹن', 'neelum', 'town'),
  e('shontar', 'Shontar Valley', 'وادیٔ شونٹھر', 'neelum', 'valley', { jeep: 1, query: 'Shounter Valley, Azad Kashmir' }),
  e('dudhnial', 'Dudhnial', 'دودھنیال', 'neelum', 'valley', { jeep: 1 }),
  // Hattian Bala
  e('leepa', 'Leepa Valley', 'وادیٔ لیپہ', 'hattian', 'valley'),
  e('chakothi', 'Chakothi', 'چکوٹھی', 'hattian', 'town'),
  e('hattian-bala', 'Hattian Bala', 'ہٹیاں بالا', 'hattian', 'town'),
  e('chikar', 'Chikar', 'چکار', 'hattian', 'town'),
  e('chinari', 'Chinari', 'چناری', 'hattian', 'town'),
  // Muzaffarabad
  e('muzaffarabad', 'Muzaffarabad', 'مظفرآباد', 'muzaffarabad', 'town'),
  e('pir-chinasi', 'Pir Chinasi', 'پیر چناسی', 'muzaffarabad', 'hilltop'),
  e('red-fort', 'Red Fort (Muzaffarabad)', 'ریڈ فورٹ مظفرآباد', 'muzaffarabad', 'town', { query: 'Red Fort, Muzaffarabad, Azad Kashmir' }),
  e('patika', 'Patika', 'پٹیکا', 'muzaffarabad', 'hilltop'),
  e('chehla-bandi', 'Chehla Bandi', 'چہلہ بانڈی', 'muzaffarabad', 'town'),
  e('domel', 'Domel', 'دومیل', 'muzaffarabad', 'town'),
  e('kohala', 'Kohala', 'کوہالہ', 'muzaffarabad', 'town'),
  e('garhi-dupatta', 'Garhi Dupatta', 'گڑھی دوپٹہ', 'muzaffarabad', 'town'),
  e('naseerabad', 'Naseerabad', 'نصیرآباد', 'muzaffarabad', 'town'),
  e('langerpura', 'Langerpura', 'لنگرپورہ', 'muzaffarabad', 'town'),
  e('sathra', 'Sathra', 'ساتھرا', 'muzaffarabad', 'town'),
  // Poonch
  e('rawalakot', 'Rawalakot', 'راولاکوٹ', 'poonch', 'town'),
  e('banjosa', 'Banjosa Lake', 'بنجوسہ جھیل', 'poonch', 'lake'),
  e('toli', 'Toli Pir', 'تولی پیر', 'poonch', 'hilltop'),
  e('hajira', 'Hajira', 'ہجیرہ', 'poonch', 'town'),
  e('abbaspur', 'Abbaspur', 'عباس پور', 'poonch', 'town'),
  e('khaigala', 'Khaigala', 'کھائی گلہ', 'poonch', 'town'),
  e('hillan', 'Hillan', 'ہلاں', 'poonch', 'town'),
  e('dothan', 'Dothan', 'دوتھان', 'poonch', 'town'),
  e('thorar', 'Thorar', 'تھوراڑ', 'poonch', 'town'),
  e('ali-sojal', 'Ali Sojal', 'علی سوجل', 'poonch', 'town'),
  e('paniola', 'Paniola', 'پانیولہ', 'poonch', 'town'),
  // Bagh
  e('bagh', 'Bagh', 'باغ', 'bagh', 'town'),
  e('dhirkot', 'Dhirkot', 'دھیرکوٹ', 'bagh', 'hilltop'),
  e('sudhan-gali', 'Sudhan Gali', 'سدھن گلی', 'bagh', 'hilltop'),
  e('ganga-choti', 'Ganga Choti', 'گنگا چوٹی', 'bagh', 'hilltop'),
  e('harighel', 'Harighel', 'ہریگہل', 'bagh', 'valley'),
  // Haveli
  e('forward-kahuta', 'Forward Kahuta', 'فارورڈ کہوٹہ', 'haveli', 'town'),
  // Sudhnoti
  e('pallandri', 'Pallandri', 'پلندری', 'sudhnoti', 'town'),
  e('trarkhal', 'Trarkhal', 'ترارکھل', 'sudhnoti', 'town'),
  e('baloch', 'Baloch', 'بلوچ', 'sudhnoti', 'town'),
  e('mang', 'Mang', 'مانگ', 'sudhnoti', 'town'),
  e('azad-pattan', 'Azad Pattan', 'آزاد پتن', 'sudhnoti', 'town'),
  // Kotli
  e('kotli', 'Kotli', 'کوٹلی', 'kotli', 'town'),
  e('tatta-pani', 'Tatta Pani', 'تتہ پانی', 'kotli', 'town'),
  e('nakyal', 'Nakyal', 'نکیال', 'kotli', 'town'),
  e('gulpur', 'Gulpur', 'گلپور', 'kotli', 'town'),
  e('sehnsa', 'Sehnsa', 'سہنسہ', 'kotli', 'town'),
  e('fatehpur-thakiala', 'Fatehpur Thakiala', 'فتح پور تھکیالہ', 'kotli', 'town'),
  e('charhoi', 'Charhoi', 'چڑھوئی', 'kotli', 'town'),
  e('khuiratta', 'Khuiratta', 'کھوئی رٹہ', 'kotli', 'town'),
  // Mirpur
  e('mirpur', 'Mirpur', 'میرپور', 'mirpur', 'town'),
  e('mangla', 'Mangla Dam', 'منگلا ڈیم', 'mirpur', 'lake'),
  e('ramkot', 'Ramkot Fort', 'رام کوٹ قلعہ', 'mirpur', 'town'),
  e('dadyal', 'Dadyal', 'دادیال', 'mirpur', 'town'),
  e('khari-sharif', 'Khari Sharif', 'کھاری شریف', 'mirpur', 'town'),
  e('chakswari', 'Chakswari', 'چکسواری', 'mirpur', 'town'),
  e('islamgarh', 'Islamgarh', 'اسلام گڑھ', 'mirpur', 'town'),
  e('jatlan', 'Jatlan', 'جاٹلاں', 'mirpur', 'town'),
  e('afzalpur', 'Afzalpur', 'افضل پور', 'mirpur', 'town'),
  // Bhimber
  e('bhimber', 'Bhimber', 'بھمبر', 'bhimber', 'town'),
  e('samahni', 'Samahni', 'سماہنی', 'bhimber', 'town'),
  e('barnala', 'Barnala', 'برنالہ', 'bhimber', 'town'),
];

// The same shape as a row of the Places table, so the planner, trip page, estimate and day plan work with it.
function toPlace(a: Entry, index: number): Place {
  const d = DISTRICTS[a.district];
  const kind = KIND[a.type];
  return {
    id: a.id,
    name: { en: a.en, ur: a.ur, roman: a.en },
    type: a.type,
    district: { en: `${d.en} District`, ur: `ضلع ${d.ur}`, roman: `${d.en} District` },
    blurb: { en: `${kind.en} in ${d.en} District`, ur: `${kind.ur} · ضلع ${d.ur}` },
    description: { en: `${a.en}, ${d.en} District, Azad Kashmir.`, ur: `${a.ur}، ضلع ${d.ur}، آزاد کشمیر۔` },
    best_season: null,
    days_min: null,
    days_max: null,
    signal_note: null,
    stops: [],
    tips: [],
    jeep_days: a.jeep ?? 0,
    lat: null,
    lon: null,
    maps_query: a.query ?? `${a.en}, Azad Kashmir`,
    image_key: null,
    image_credit: null,
    sort_order: 1000 + index,
    verified: false,
    last_checked: null,
  };
}

export const AJK_PLACES: Place[] = AJK.map(toPlace);
