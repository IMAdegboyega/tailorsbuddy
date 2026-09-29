/**
 * Static atelier data ported verbatim from Atelier Vaux.dc.html.
 */

export type MeasKey =
  | 'bust' | 'underbust' | 'waist' | 'hip' | 'shoulder' | 'back' | 'nape'
  | 'arm' | 'bicep' | 'wrist' | 'thigh' | 'knee' | 'inseam';

export type GarmentName = 'Gown' | 'Blouse' | 'Trousers' | 'Skirt' | 'Two-piece';

export type Measurements = Partial<Record<MeasKey, string>>;

/** A single user-editable measurement (label + value). */
export interface MField {
  id: string;
  label: string;
  value: string;
}

/** A user-created measurement section (e.g. "Torso") holding fields. */
export interface MSection {
  id: string;
  label: string;
  fields: MField[];
}

export interface DesignEntry {
  title: string;
  garment: string; // display label, e.g. 'GOWN'
  date: string;
  p: number; // index into DPATHS
}

export interface Client {
  id: number;
  name: string;
  contact: string;
  lastDesign: string;
  updated: string;
  m: Measurements;
  sections?: MSection[]; // dynamic per-client measurement structure
  designs: DesignEntry[];
  references?: string[]; // reference/inspiration image URIs
  notes?: string; // free-text brief / special requests
}

/** Random-ish stable id for runtime-created sections / fields / invoices. */
let _uid = 0;
export const genId = (p = 'id'): string => `${p}-${Date.now().toString(36)}-${(_uid++).toString(36)}`;

// [key, label] — full ordered list of measurement fields.
export const FIELDS: [MeasKey, string][] = [
  ['bust', 'Bust'],
  ['underbust', 'Underbust'],
  ['waist', 'Waist'],
  ['hip', 'Hip'],
  ['shoulder', 'Shoulder width'],
  ['back', 'Back width'],
  ['nape', 'Nape-to-waist'],
  ['arm', 'Arm length'],
  ['bicep', 'Bicep'],
  ['wrist', 'Wrist'],
  ['thigh', 'Thigh'],
  ['knee', 'Knee'],
  ['inseam', 'Inseam'],
];

// Measurement fields grouped into couture sections for a cleaner layout.
export const MEAS_GROUPS: { label: string; keys: MeasKey[] }[] = [
  { label: 'Torso', keys: ['bust', 'underbust', 'waist', 'hip'] },
  { label: 'Frame', keys: ['shoulder', 'back', 'nape'] },
  { label: 'Arm', keys: ['arm', 'bicep', 'wrist'] },
  { label: 'Leg', keys: ['thigh', 'knee', 'inseam'] },
];

export const FIELD_LABEL: Record<MeasKey, string> = FIELDS.reduce((acc, [k, label]) => {
  acc[k] = label;
  return acc;
}, {} as Record<MeasKey, string>);

/** Build the default section structure from a legacy Measurements record. */
export function buildSections(m: Measurements): MSection[] {
  return MEAS_GROUPS.map((g, gi) => ({
    id: `sec-${gi}`,
    label: g.label,
    fields: g.keys.map((k) => ({
      id: `f-${k}`,
      label: FIELD_LABEL[k],
      value: m[k] != null && m[k] !== '—' ? String(m[k]) : '',
    })),
  }));
}

/** Fresh, empty default sections for a brand-new client. */
export function blankSections(): MSection[] {
  return MEAS_GROUPS.map((g) => ({
    id: genId('sec'),
    label: g.label,
    fields: g.keys.map((k) => ({ id: genId('f'), label: FIELD_LABEL[k], value: '' })),
  }));
}

// Which measurement keys each garment template requires.
export const TEMPLATES: Record<GarmentName, MeasKey[]> = {
  Gown: ['bust', 'underbust', 'waist', 'hip', 'shoulder', 'back', 'nape', 'arm'],
  Blouse: ['bust', 'underbust', 'waist', 'shoulder', 'back', 'nape', 'arm', 'bicep', 'wrist'],
  Trousers: ['waist', 'hip', 'thigh', 'knee', 'inseam'],
  Skirt: ['waist', 'hip', 'thigh', 'knee'],
  'Two-piece': ['bust', 'underbust', 'waist', 'hip', 'shoulder', 'arm', 'thigh', 'inseam'],
};

// SVG path data for the garment-picker icons (80x120 viewBox).
export const GICONS: Record<GarmentName, string> = {
  Gown: 'M28 8 Q40 2 52 8 L58 20 Q52 24 52 30 L60 100 Q40 108 20 100 L28 30 Q28 24 22 20 Z',
  Blouse: 'M26 10 Q40 4 54 10 L62 22 L54 28 L56 60 Q40 66 24 60 L26 28 L18 22 Z',
  Trousers: 'M30 8 H50 L54 60 L48 108 H40 L40 64 H40 L32 108 H24 L26 60 Z',
  Skirt: 'M30 10 H50 L64 100 Q40 108 16 100 Z',
  'Two-piece':
    'M28 8 Q40 3 52 8 L58 20 L52 26 L54 44 Q40 48 26 44 L28 26 L22 20 Z M28 58 H52 L60 100 Q40 106 20 100 Z',
};

// Miniature garment silhouettes shown on the design thumbnails (120x160 viewBox).
export const DPATHS: string[] = [
  'M30 30 Q40 26 50 30 L58 130 Q40 138 22 130 Z',
  'M28 30 Q40 24 52 30 L56 80 L48 82 L50 132 Q40 136 30 132 L32 82 L24 80 Z',
  'M30 30 H50 L60 128 Q40 134 20 128 Z',
];

export const CLIENTS: Client[] = [
  {
    id: 1,
    name: 'Adaeze Okonkwo',
    contact: 'adaeze.okonkwo@gmail.com · +234 803 412 5590',
    lastDesign: '12 May 2026',
    updated: '12 May 2026',
    m: { bust: '34.5', underbust: '28', waist: '26', hip: '37', shoulder: '15', back: '14', nape: '16.5', arm: '23', bicep: '10.5', wrist: '6', thigh: '21', knee: '14', inseam: '31' },
    designs: [],
  },
  {
    id: 2,
    name: 'Chiamaka Eze',
    contact: 'chiamaka@ezeatelier.ng · +234 806 220 1548',
    lastDesign: '28 Apr 2026',
    updated: '28 Apr 2026',
    m: { bust: '36', underbust: '30', waist: '28.5', hip: '39', shoulder: '15.5', back: '14.5', nape: '17', arm: '23.5', bicep: '11', wrist: '6.25', thigh: '22.5', knee: '14.5', inseam: '32' },
    designs: [],
  },
  {
    id: 3,
    name: 'Folasade Adeyemi',
    contact: 'folasade.a@lagosmail.com · +234 701 900 3312',
    lastDesign: '03 Jun 2026',
    updated: '03 Jun 2026',
    m: { bust: '32', underbust: '27', waist: '24.5', hip: '35', shoulder: '14.5', back: '13.5', nape: '16', arm: '22.5', bicep: '10', wrist: '5.75', thigh: '20', knee: '13.5', inseam: '30.5' },
    designs: [],
  },
  {
    id: 4,
    name: 'Ngozi Balogun',
    contact: 'ngozi.balogun@maison.ng · +234 802 455 7702',
    lastDesign: '19 Mar 2026',
    updated: '19 Mar 2026',
    m: { bust: '35', underbust: '29', waist: '27', hip: '38', shoulder: '15', back: '14', nape: '16.75', arm: '23', bicep: '10.75', wrist: '6.1', thigh: '21.5', knee: '14', inseam: '31.5' },
    designs: [],
  },
  {
    id: 5,
    name: 'Zainab Bello',
    contact: 'zainab@belloatelier.ng · +234 809 331 8820',
    lastDesign: '21 Feb 2026',
    updated: '21 Feb 2026',
    m: { bust: '33.5', underbust: '28.5', waist: '25.5', hip: '36.5', shoulder: '14.75', back: '13.75', nape: '16.25', arm: '22.75', bicep: '10.25', wrist: '5.9', thigh: '20.5', knee: '13.75', inseam: '31' },
    designs: [],
  },
  {
    id: 6,
    name: 'Temiloluwa Ajayi',
    contact: 'temi.ajayi@studio.ng · +234 703 555 0148',
    lastDesign: '07 Jun 2026',
    updated: '07 Jun 2026',
    m: { bust: '37', underbust: '31', waist: '29', hip: '40', shoulder: '16', back: '15', nape: '17.25', arm: '24', bicep: '11.5', wrist: '6.4', thigh: '23', knee: '15', inseam: '32.5' },
    designs: [],
  },
];

// Seed each demo client with the dynamic section structure from their legacy `m`.
CLIENTS.forEach((c) => {
  c.sections = buildSections(c.m);
});

// ---------------------------------------------------------------------------
// Invoicing
// ---------------------------------------------------------------------------

export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'NGN', symbol: '₦', label: 'Naira' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'Pound' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GHS', symbol: '₵', label: 'Cedi' },
  { code: 'ZAR', symbol: 'R', label: 'Rand' },
  { code: 'KES', symbol: 'KSh', label: 'Shilling' },
  { code: 'CAD', symbol: 'C$', label: 'Can. Dollar' },
  { code: 'AED', symbol: 'AED', label: 'Dirham' },
  { code: 'INR', symbol: '₹', label: 'Rupee' },
];

export const currencyByCode = (code: string): Currency =>
  CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

export interface InvoiceItem {
  id: string;
  description: string;
  qty: string;
  unitPrice: string;
}

export interface Invoice {
  id: string;
  clientId: number;
  number: string;
  currency: string; // currency code
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: string; // percent, e.g. "7.5"
  discount: string; // flat amount in the invoice currency
  notes: string;
  templateId: string;
  atelierName: string;
  atelierTagline: string;
  atelierContact: string;
  billTo: string;
  billContact: string;
  status: 'draft' | 'sent' | 'paid';
}

export const num = (s: string | number | undefined): number => {
  const n = typeof s === 'number' ? s : parseFloat(String(s ?? '').replace(/,/g, ''));
  return isFinite(n) ? n : 0;
};

export interface InvoiceTotals {
  sub: number;
  discount: number;
  tax: number;
  total: number;
}

export function invoiceTotals(inv: Invoice): InvoiceTotals {
  const sub = inv.items.reduce((s, it) => s + num(it.qty) * num(it.unitPrice), 0);
  const discount = Math.min(num(inv.discount), sub);
  const taxable = Math.max(0, sub - discount);
  const tax = (taxable * num(inv.taxRate)) / 100;
  return { sub, discount, tax, total: taxable + tax };
}

/** Format an amount with a currency symbol, e.g. "₦ 12,500.00". */
export function money(code: string, amount: number): string {
  const { symbol } = currencyByCode(code);
  const s = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol} ${s}`;
}

export const invoiceNumber = (seq: number): string => 'TB-INV-' + String(seq).padStart(4, '0');

export const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export interface ColorSwatch {
  name: string;
  v: string;
}

export const COLORS: ColorSwatch[] = [
  { name: 'Noir', v: '#26262b' },
  { name: 'Ivory', v: '#efe9dd' },
  { name: 'Champagne', v: '#d9c7a3' },
  { name: 'Blush', v: '#e3c3c0' },
  { name: 'Emerald', v: '#1f5d4c' },
  { name: 'Burgundy', v: '#6a2233' },
  { name: 'Navy', v: '#26324f' },
  { name: 'Gold', v: '#c6a05c' },
];

export interface Fabric {
  id: string;
  name: string;
  base: [number, number, number];
  chip: string; // CSS gradient string from prototype — mapped to a RN preview in FabricChip.
}

export const FABRICS: Fabric[] = [
  { id: 'silk', name: 'Silk', base: [217, 199, 163], chip: 'linear-gradient(120deg,#d9c7a3,#f0e6cf 45%,#c9b489)' },
  { id: 'satin', name: 'Satin', base: [42, 42, 50], chip: 'linear-gradient(120deg,#20202a,#4a4a58 48%,#1a1a22)' },
  { id: 'lace', name: 'Lace', base: [233, 227, 214], chip: 'radial-gradient(circle at 30% 30%,#efe9dd 1.5px,transparent 2px) 0 0/7px 7px,radial-gradient(circle at 70% 70%,#cfc7b4 1.5px,transparent 2px) 0 0/7px 7px,#e3dccb' },
  { id: 'denim', name: 'Denim', base: [46, 64, 96], chip: 'repeating-linear-gradient(45deg,#2e4060 0 3px,#26365200 3px 6px),#2e4060' },
  { id: 'velvet', name: 'Velvet', base: [92, 32, 48], chip: 'radial-gradient(circle at 40% 30%,#7a2a40,#4a1526)' },
  { id: 'tulle', name: 'Tulle', base: [227, 195, 192], chip: 'radial-gradient(circle at 50% 40%,#f0d9d6,#d9b3af 70%)' },
];

export const WEIGHT_LABELS: Record<number, string> = { 1: 'Pencil', 2: 'Fine', 4: 'Medium', 7: 'Bold' };

export const INKS: string[] = [
  '#1a1814', // near-black
  '#33322c', // graphite
  '#5b5148', // taupe
  '#7a4a34', // sepia
  '#9a3b2e', // terracotta
  '#6a2233', // burgundy
  '#26324f', // navy
  '#1f5d4c', // emerald
  '#3b4a6b', // slate blue
  '#8a5a7a', // mauve
  '#c6a05c', // gold
  '#a9a29a', // silver
];
export const WEIGHTS: number[] = [1, 2, 4, 7];

export const initials = (name: string): string =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

export const todayLabel = (): string =>
  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
