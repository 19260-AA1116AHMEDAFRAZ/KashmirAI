import type { Lang } from './types';

// Cities people can start their trip from ("Starting from" on the Plan page): towns and cities all
// around Pakistan. The id goes in the address (?city=lhr), so keep ids stable once published.
// 'isb', 'mzd', 'rwk' and 'bagh' are the ids the price list (Admin → Trip prices) already uses.
// Urdu names are used when the site is in Urdu; Roman Urdu uses the English spelling.
// The order is the order of the list when the search box is empty: the biggest cities first.

export type Province = 'Punjab' | 'Sindh' | 'Khyber Pakhtunkhwa' | 'Balochistan' | 'Islamabad' | 'Azad Kashmir' | 'Gilgit-Baltistan';
export type City = { id: string; name: string; ur: string; province: Province };

const PROVINCE_UR: Record<Province, string> = {
  Punjab: 'پنجاب',
  Sindh: 'سندھ',
  'Khyber Pakhtunkhwa': 'خیبر پختونخوا',
  Balochistan: 'بلوچستان',
  Islamabad: 'اسلام آباد',
  'Azad Kashmir': 'آزاد کشمیر',
  'Gilgit-Baltistan': 'گلگت بلتستان',
};

const P: Province = 'Punjab';
const S: Province = 'Sindh';
const K: Province = 'Khyber Pakhtunkhwa';
const B: Province = 'Balochistan';
const A: Province = 'Azad Kashmir';
const G: Province = 'Gilgit-Baltistan';
const city = (id: string, name: string, ur: string, province: Province): City => ({ id, name, ur, province });

export const PAKISTAN_CITIES: City[] = [
  // Biggest cities and the usual starting points for Kashmir trips
  city('isb', 'Islamabad', 'اسلام آباد', 'Islamabad'),
  city('rwp', 'Rawalpindi', 'راولپنڈی', P),
  city('lhr', 'Lahore', 'لاہور', P),
  city('khi', 'Karachi', 'کراچی', S),
  city('psh', 'Peshawar', 'پشاور', K),
  city('fsd', 'Faisalabad', 'فیصل آباد', P),
  city('mul', 'Multan', 'ملتان', P),
  city('gjw', 'Gujranwala', 'گوجرانوالہ', P),
  city('skt', 'Sialkot', 'سیالکوٹ', P),
  city('gjt', 'Gujrat', 'گجرات', P),
  city('jhm', 'Jhelum', 'جہلم', P),
  city('abt', 'Abbottabad', 'ایبٹ آباد', K),
  city('hyd', 'Hyderabad', 'حیدرآباد', S),
  city('qta', 'Quetta', 'کوئٹہ', B),
  city('sgd', 'Sargodha', 'سرگودھا', P),
  city('bwp', 'Bahawalpur', 'بہاولپور', P),
  // Azad Kashmir
  city('mzd', 'Muzaffarabad', 'مظفرآباد', A),
  city('mirpur', 'Mirpur', 'میرپور', A),
  city('kotli', 'Kotli', 'کوٹلی', A),
  city('rwk', 'Rawalakot', 'راولاکوٹ', A),
  city('bagh', 'Bagh', 'باغ', A),
  city('bhimber', 'Bhimber', 'بھمبر', A),
  city('pallandri', 'Pallandri', 'پلندری', A),
  city('athmuqam', 'Athmuqam', 'اٹھمقام', A),
  // Punjab
  city('sheikhupura', 'Sheikhupura', 'شیخوپورہ', P),
  city('jhang', 'Jhang', 'جھنگ', P),
  city('kasur', 'Kasur', 'قصور', P),
  city('rahimyarkhan', 'Rahim Yar Khan', 'رحیم یار خان', P),
  city('sahiwal', 'Sahiwal', 'ساہیوال', P),
  city('okara', 'Okara', 'اوکاڑہ', P),
  city('wah', 'Wah Cantonment', 'واہ کینٹ', P),
  city('dgkhan', 'Dera Ghazi Khan', 'ڈیرہ غازی خان', P),
  city('mandibahauddin', 'Mandi Bahauddin', 'منڈی بہاؤالدین', P),
  city('chiniot', 'Chiniot', 'چنیوٹ', P),
  city('hafizabad', 'Hafizabad', 'حافظ آباد', P),
  city('narowal', 'Narowal', 'نارووال', P),
  city('attock', 'Attock', 'اٹک', P),
  city('chakwal', 'Chakwal', 'چکوال', P),
  city('khanewal', 'Khanewal', 'خانیوال', P),
  city('vehari', 'Vehari', 'وہاڑی', P),
  city('muzaffargarh', 'Muzaffargarh', 'مظفرگڑھ', P),
  city('layyah', 'Layyah', 'لیہ', P),
  city('bhakkar', 'Bhakkar', 'بھکر', P),
  city('khushab', 'Khushab', 'خوشاب', P),
  city('mianwali', 'Mianwali', 'میانوالی', P),
  city('tobateksingh', 'Toba Tek Singh', 'ٹوبہ ٹیک سنگھ', P),
  city('pakpattan', 'Pakpattan', 'پاکپتن', P),
  city('lodhran', 'Lodhran', 'لودھراں', P),
  city('bahawalnagar', 'Bahawalnagar', 'بہاولنگر', P),
  city('murree', 'Murree', 'مری', P),
  city('taxila', 'Taxila', 'ٹیکسلا', P),
  city('gojra', 'Gojra', 'گوجرہ', P),
  city('kamoke', 'Kamoke', 'کاموکے', P),
  city('burewala', 'Burewala', 'بورے والا', P),
  city('daska', 'Daska', 'ڈسکہ', P),
  city('wazirabad', 'Wazirabad', 'وزیرآباد', P),
  city('sadiqabad', 'Sadiqabad', 'صادق آباد', P),
  city('jaranwala', 'Jaranwala', 'جڑانوالہ', P),
  // Sindh
  city('sukkur', 'Sukkur', 'سکھر', S),
  city('larkana', 'Larkana', 'لاڑکانہ', S),
  city('nawabshah', 'Nawabshah', 'نواب شاہ', S),
  city('mirpurkhas', 'Mirpur Khas', 'میرپور خاص', S),
  city('jacobabad', 'Jacobabad', 'جیکب آباد', S),
  city('shikarpur', 'Shikarpur', 'شکارپور', S),
  city('khairpur', 'Khairpur', 'خیرپور', S),
  city('dadu', 'Dadu', 'دادو', S),
  city('thatta', 'Thatta', 'ٹھٹھہ', S),
  city('badin', 'Badin', 'بدین', S),
  city('umerkot', 'Umerkot', 'عمرکوٹ', S),
  city('tandoallahyar', 'Tando Allahyar', 'ٹنڈو الہ یار', S),
  city('tandoadam', 'Tando Adam', 'ٹنڈو آدم', S),
  city('ghotki', 'Ghotki', 'گھوٹکی', S),
  city('kotri', 'Kotri', 'کوٹری', S),
  // Khyber Pakhtunkhwa
  city('mardan', 'Mardan', 'مردان', K),
  city('mingora', 'Mingora (Swat)', 'مینگورہ (سوات)', K),
  city('kohat', 'Kohat', 'کوہاٹ', K),
  city('mansehra', 'Mansehra', 'مانسہرہ', K),
  city('swabi', 'Swabi', 'صوابی', K),
  city('charsadda', 'Charsadda', 'چارسدہ', K),
  city('nowshera', 'Nowshera', 'نوشہرہ', K),
  city('dikhan', 'Dera Ismail Khan', 'ڈیرہ اسماعیل خان', K),
  city('bannu', 'Bannu', 'بنوں', K),
  city('haripur', 'Haripur', 'ہری پور', K),
  city('dir', 'Dir', 'دیر', K),
  city('chitral', 'Chitral', 'چترال', K),
  city('battagram', 'Battagram', 'بٹگرام', K),
  city('timergara', 'Timergara', 'تیمرگرہ', K),
  city('hangu', 'Hangu', 'ہنگو', K),
  city('karak', 'Karak', 'کرک', K),
  city('lakkimarwat', 'Lakki Marwat', 'لکی مروت', K),
  city('parachinar', 'Parachinar', 'پاراچنار', K),
  city('balakot', 'Balakot', 'بالاکوٹ', K),
  // Balochistan
  city('gwadar', 'Gwadar', 'گوادر', B),
  city('turbat', 'Turbat', 'تربت', B),
  city('khuzdar', 'Khuzdar', 'خضدار', B),
  city('chaman', 'Chaman', 'چمن', B),
  city('sibi', 'Sibi', 'سبی', B),
  city('zhob', 'Zhob', 'ژوب', B),
  city('loralai', 'Loralai', 'لورالائی', B),
  city('hub', 'Hub', 'حب', B),
  city('dmjamali', 'Dera Murad Jamali', 'ڈیرہ مراد جمالی', B),
  city('nushki', 'Nushki', 'نوشکی', B),
  city('panjgur', 'Panjgur', 'پنجگور', B),
  city('kalat', 'Kalat', 'قلات', B),
  // Gilgit-Baltistan
  city('gilgit', 'Gilgit', 'گلگت', G),
  city('skardu', 'Skardu', 'سکردو', G),
  city('hunza', 'Karimabad (Hunza)', 'کریم آباد (ہنزہ)', G),
  city('chilas', 'Chilas', 'چلاس', G),
  city('khaplu', 'Khaplu', 'خپلو', G),
];

const BY_ID = new Map(PAKISTAN_CITIES.map((c) => [c.id, c]));

export const findCity = (id: string | undefined | null): City | undefined => (id ? BY_ID.get(id) : undefined);

// The name to show: Urdu in Urdu, otherwise the English spelling (also what Roman Urdu uses).
export function cityName(id: string, lang: Lang): string {
  const c = findCity(id);
  if (!c) return id;
  return lang === 'ur' ? c.ur : c.name;
}

export const provinceName = (province: Province, lang: Lang): string => (lang === 'ur' ? PROVINCE_UR[province] : province);
