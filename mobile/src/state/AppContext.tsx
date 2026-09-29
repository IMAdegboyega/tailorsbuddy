import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import {
  CLIENTS,
  Client,
  GarmentName,
  Invoice,
  InvoiceItem,
  MSection,
  addDays,
  blankSections,
  genId,
  initials,
  invoiceNumber,
  todayLabel,
} from '../data';

export type Screen =
  | 'login'
  | 'clients'
  | 'detail'
  | 'newdesign'
  | 'canvas'
  | 'export'
  | 'pricing'
  | 'settings'
  | 'invoiceEditor'
  | 'invoicePreview';

export type DetailTab = 'meas' | 'inspiration' | 'notes' | 'designs' | 'invoices';
export type Tool = 'pencil' | 'eraser' | 'fill' | 'observe';
export type Figure = 'female' | 'male';

/** A fabric/colour that has been applied on the canvas, for the spec sheet. */
export interface UsedFill {
  name: string;
  dot: string; // solid colour used to render the swatch dot
}

interface AppState {
  screen: Screen;
  clients: Client[];
  activeId: number;
  detailTab: DetailTab;
  search: string;
  showNewClient: boolean;
  ncName: string;
  ncContact: string;
  garment: GarmentName | null;
  // canvas
  tool: Tool;
  ink: string;
  weight: number;
  view: 'front' | 'back';
  figure: Figure;
  fabric: string | null;
  usedList: UsedFill[];
  designImage: string; // captured PNG data-uri
  toast: string;
  // invoicing
  invoices: Invoice[];
  activeInvoiceId: string | null;
}

interface AppActions {
  active: () => Client;
  goClients: () => void;
  goPricing: () => void;
  goSettings: () => void;
  doLogin: () => void;
  openClient: (id: number) => void;
  startNewDesign: () => void;
  backToDetail: () => void;
  pickGarment: (g: GarmentName) => void;
  toCanvas: () => void;
  exportDesign: (image: string) => void;
  backToCanvas: () => void;
  setSearch: (v: string) => void;
  openNewClient: () => void;
  cancelNewClient: () => void;
  setNcName: (v: string) => void;
  setNcContact: (v: string) => void;
  addClient: () => void;
  setDetailTab: (t: DetailTab) => void;
  // measurements (per-client dynamic sections)
  addSection: () => void;
  renameSection: (sectionId: string, label: string) => void;
  deleteSection: (sectionId: string) => void;
  addField: (sectionId: string) => void;
  renameField: (sectionId: string, fieldId: string, label: string) => void;
  setField: (sectionId: string, fieldId: string, value: string) => void;
  deleteField: (sectionId: string, fieldId: string) => void;
  setClientNotes: (text: string) => void;
  addReference: (uri: string) => void;
  removeReference: (uri: string) => void;
  showToast: (t: string) => void;
  // canvas setters
  setTool: (t: Tool) => void;
  setInk: (v: string) => void;
  setWeight: (w: number) => void;
  setView: (v: 'front' | 'back') => void;
  setFigure: (f: Figure) => void;
  setFabric: (id: string | null) => void;
  markFabric: (f: UsedFill) => void;
  resetCanvasFills: () => void;
  // invoicing
  activeInvoice: () => Invoice | undefined;
  clientInvoices: (clientId: number) => Invoice[];
  createInvoice: (clientId: number) => void;
  openInvoice: (id: number, invoiceId: string) => void;
  updateInvoice: (patch: Partial<Invoice>) => void;
  addInvoiceItem: () => void;
  updateInvoiceItem: (itemId: string, patch: Partial<InvoiceItem>) => void;
  removeInvoiceItem: (itemId: string) => void;
  setInvoiceTemplate: (templateId: string) => void;
  deleteInvoice: (invoiceId: string) => void;
  goInvoicePreview: () => void;
  backToInvoiceEditor: () => void;
}

type Ctx = AppState & AppActions;

const AppContext = createContext<Ctx | null>(null);

let nextId = Math.max(...CLIENTS.map((c) => c.id)) + 1;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(CLIENTS);
  const [screen, setScreen] = useState<Screen>('login');
  const [activeId, setActiveId] = useState<number>(1);
  const [detailTab, setDetailTab] = useState<DetailTab>('meas');
  const [search, setSearch] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [ncName, setNcName] = useState('');
  const [ncContact, setNcContact] = useState('');
  const [garment, setGarment] = useState<GarmentName | null>(null);
  const [tool, setTool] = useState<Tool>('pencil');
  const [ink, setInkState] = useState('#33322c');
  const [weight, setWeightState] = useState(2);
  const [view, setViewState] = useState<'front' | 'back'>('front');
  const [figure, setFigure] = useState<Figure>('female');
  const [fabric, setFabric] = useState<string | null>(null);
  const [usedList, setUsedList] = useState<UsedFill[]>([]);
  const [designImage, setDesignImage] = useState('');
  const [toast, setToast] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invSeq = useRef(1);

  const active = useCallback(
    () => clients.find((c) => c.id === activeId) ?? clients[0],
    [clients, activeId]
  );

  const showToast = useCallback((t: string) => {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  }, []);

  const openClient = useCallback(
    (id: number) => {
      setActiveId(id);
      setDetailTab('meas');
      setScreen('detail');
    },
    []
  );

  const addClient = useCallback(() => {
    const name = (ncName || 'New Client').trim();
    const client: Client = {
      id: nextId++,
      name,
      contact: ncContact || '—',
      lastDesign: '—',
      updated: 'today',
      m: {},
      sections: blankSections(),
      designs: [],
      references: [],
      notes: '',
    };
    setClients((prev) => [client, ...prev]);
    setShowNewClient(false);
  }, [ncName, ncContact]);

  const patchActive = useCallback(
    (patch: (c: Client) => Client) => {
      setClients((prev) => prev.map((c) => (c.id === activeId ? patch(c) : c)));
    },
    [activeId]
  );

  // ---- measurements: dynamic per-client sections ----
  const patchSections = useCallback(
    (fn: (secs: MSection[]) => MSection[]) =>
      patchActive((c) => ({ ...c, sections: fn(c.sections ?? []) })),
    [patchActive]
  );
  const addSection = useCallback(
    () => patchSections((secs) => [...secs, { id: genId('sec'), label: 'New Section', fields: [{ id: genId('f'), label: 'Measurement', value: '' }] }]),
    [patchSections]
  );
  const renameSection = useCallback(
    (sectionId: string, label: string) => patchSections((secs) => secs.map((s) => (s.id === sectionId ? { ...s, label } : s))),
    [patchSections]
  );
  const deleteSection = useCallback(
    (sectionId: string) => patchSections((secs) => secs.filter((s) => s.id !== sectionId)),
    [patchSections]
  );
  const addField = useCallback(
    (sectionId: string) => patchSections((secs) => secs.map((s) => (s.id === sectionId ? { ...s, fields: [...s.fields, { id: genId('f'), label: 'Measurement', value: '' }] } : s))),
    [patchSections]
  );
  const renameField = useCallback(
    (sectionId: string, fieldId: string, label: string) =>
      patchSections((secs) => secs.map((s) => (s.id === sectionId ? { ...s, fields: s.fields.map((f) => (f.id === fieldId ? { ...f, label } : f)) } : s))),
    [patchSections]
  );
  const setField = useCallback(
    (sectionId: string, fieldId: string, value: string) =>
      patchSections((secs) => secs.map((s) => (s.id === sectionId ? { ...s, fields: s.fields.map((f) => (f.id === fieldId ? { ...f, value } : f)) } : s))),
    [patchSections]
  );
  const deleteField = useCallback(
    (sectionId: string, fieldId: string) =>
      patchSections((secs) => secs.map((s) => (s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) } : s))),
    [patchSections]
  );

  const setClientNotes = useCallback(
    (text: string) => patchActive((c) => ({ ...c, notes: text })),
    [patchActive]
  );
  const addReference = useCallback(
    (uri: string) => patchActive((c) => ({ ...c, references: [...(c.references ?? []), uri] })),
    [patchActive]
  );
  const removeReference = useCallback(
    (uri: string) => patchActive((c) => ({ ...c, references: (c.references ?? []).filter((r) => r !== uri) })),
    [patchActive]
  );

  const toCanvas = useCallback(() => {
    setViewState('front');
    setFabric(null);
    setUsedList([]);
    setTool('pencil');
    setScreen('canvas');
  }, []);

  const markFabric = useCallback((f: UsedFill) => {
    setUsedList((prev) => (prev.find((u) => u.name === f.name) ? prev : [...prev, f]));
  }, []);

  // ---- invoicing ----
  const activeInvoice = useCallback(
    () => invoices.find((i) => i.id === activeInvoiceId),
    [invoices, activeInvoiceId]
  );
  const clientInvoices = useCallback(
    (clientId: number) => invoices.filter((i) => i.clientId === clientId),
    [invoices]
  );
  const createInvoice = useCallback(
    (clientId: number) => {
      const c = clients.find((x) => x.id === clientId);
      const inv: Invoice = {
        id: genId('inv'),
        clientId,
        number: invoiceNumber(invSeq.current++),
        currency: 'NGN',
        issueDate: todayLabel(),
        dueDate: addDays(14),
        items: [
          { id: genId('it'), description: 'Bespoke garment — design & tailoring', qty: '1', unitPrice: '' },
        ],
        taxRate: '',
        discount: '',
        notes: 'Thank you for your custom. A 50% deposit confirms your commission; balance is due on delivery.',
        templateId: 'noir',
        atelierName: 'Tailors Buddy',
        atelierTagline: 'Bespoke Atelier',
        atelierContact: 'severine@tailorsbuddy.com · +234 800 000 0000',
        billTo: c?.name ?? '',
        billContact: c?.contact ?? '',
        status: 'draft',
      };
      setInvoices((prev) => [inv, ...prev]);
      setActiveId(clientId);
      setActiveInvoiceId(inv.id);
      setScreen('invoiceEditor');
    },
    [clients]
  );
  const openInvoice = useCallback((id: number, invoiceId: string) => {
    setActiveId(id);
    setActiveInvoiceId(invoiceId);
    setScreen('invoiceEditor');
  }, []);
  const patchInvoice = useCallback(
    (fn: (i: Invoice) => Invoice) =>
      setInvoices((prev) => prev.map((i) => (i.id === activeInvoiceId ? fn(i) : i))),
    [activeInvoiceId]
  );
  const updateInvoice = useCallback(
    (patch: Partial<Invoice>) => patchInvoice((i) => ({ ...i, ...patch })),
    [patchInvoice]
  );
  const addInvoiceItem = useCallback(
    () => patchInvoice((i) => ({ ...i, items: [...i.items, { id: genId('it'), description: '', qty: '1', unitPrice: '' }] })),
    [patchInvoice]
  );
  const updateInvoiceItem = useCallback(
    (itemId: string, patch: Partial<InvoiceItem>) =>
      patchInvoice((i) => ({ ...i, items: i.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) })),
    [patchInvoice]
  );
  const removeInvoiceItem = useCallback(
    (itemId: string) => patchInvoice((i) => ({ ...i, items: i.items.filter((it) => it.id !== itemId) })),
    [patchInvoice]
  );
  const setInvoiceTemplate = useCallback(
    (templateId: string) => patchInvoice((i) => ({ ...i, templateId })),
    [patchInvoice]
  );
  const deleteInvoice = useCallback(
    (invoiceId: string) => setInvoices((prev) => prev.filter((i) => i.id !== invoiceId)),
    []
  );

  const value = useMemo<Ctx>(
    () => ({
      // state
      screen,
      clients,
      activeId,
      detailTab,
      search,
      showNewClient,
      ncName,
      ncContact,
      garment,
      tool,
      ink,
      weight,
      view,
      figure,
      fabric,
      usedList,
      designImage,
      toast,
      invoices,
      activeInvoiceId,
      // actions
      active,
      goClients: () => setScreen('clients'),
      goPricing: () => setScreen('pricing'),
      goSettings: () => setScreen('settings'),
      doLogin: () => setScreen('clients'),
      openClient,
      startNewDesign: () => {
        setGarment(null);
        toCanvas();
      },
      backToDetail: () => setScreen('detail'),
      pickGarment: (g) => setGarment(g),
      toCanvas,
      exportDesign: (image: string) => {
        setDesignImage(image);
        setScreen('export');
      },
      backToCanvas: () => setScreen('canvas'),
      setSearch,
      openNewClient: () => {
        setNcName('');
        setNcContact('');
        setShowNewClient(true);
      },
      cancelNewClient: () => setShowNewClient(false),
      setNcName,
      setNcContact,
      addClient,
      setDetailTab,
      addSection,
      renameSection,
      deleteSection,
      addField,
      renameField,
      setField,
      deleteField,
      setClientNotes,
      addReference,
      removeReference,
      showToast,
      setTool,
      setInk: (v: string) => {
        setInkState(v);
        setTool('pencil');
      },
      setWeight: (w: number) => {
        setWeightState(w);
        setTool('pencil');
      },
      setView: setViewState,
      setFigure,
      setFabric,
      markFabric,
      resetCanvasFills: () => setUsedList([]),
      // invoicing
      activeInvoice,
      clientInvoices,
      createInvoice,
      openInvoice,
      updateInvoice,
      addInvoiceItem,
      updateInvoiceItem,
      removeInvoiceItem,
      setInvoiceTemplate,
      deleteInvoice,
      goInvoicePreview: () => setScreen('invoicePreview'),
      backToInvoiceEditor: () => setScreen('invoiceEditor'),
    }),
    [
      screen, clients, activeId, detailTab, search, showNewClient, ncName, ncContact,
      garment, tool, ink, weight, view, figure, fabric, usedList, designImage, toast,
      invoices, activeInvoiceId,
      active, openClient, toCanvas, addClient, showToast, markFabric,
      addSection, renameSection, deleteSection, addField, renameField, setField, deleteField,
      setClientNotes, addReference, removeReference,
      activeInvoice, clientInvoices, createInvoice, openInvoice, updateInvoice,
      addInvoiceItem, updateInvoiceItem, removeInvoiceItem, setInvoiceTemplate, deleteInvoice,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}

export { initials };
