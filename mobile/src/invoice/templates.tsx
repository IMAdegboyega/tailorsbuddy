/**
 * Ten world-class invoice templates for Tailors Buddy.
 *
 * Each renderer receives the same `Invoice` + computed `InvoiceTotals` and lays
 * it out in its own visual language. They are print-style documents, so their
 * palettes are fixed (independent of the app's dark/light theme). Preview and
 * export both render `<InvoiceDoc inv={...} />`.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '../theme';
import { Invoice, InvoiceTotals, invoiceTotals, money, num } from '../data';

export interface TemplateMeta {
  id: string;
  name: string;
  blurb: string;
  dark?: boolean;
  swatch: [string, string, string];
}

export const INVOICE_TEMPLATES: TemplateMeta[] = [
  { id: 'noir', name: 'Atelier Noir', blurb: 'Charcoal & gold', dark: true, swatch: ['#1b1712', '#c9925a', '#e9e1d2'] },
  { id: 'ivory', name: 'Ivory Minimal', blurb: 'Clean & quiet', swatch: ['#ffffff', '#111111', '#9a9a9a'] },
  { id: 'serif', name: 'Couture Serif', blurb: 'Editorial masthead', swatch: ['#faf7f0', '#1c1712', '#b98a4a'] },
  { id: 'gold', name: 'Gold Letterhead', blurb: 'Formal crest band', swatch: ['#f7efe0', '#c9922f', '#26201a'] },
  { id: 'slate', name: 'Sidebar Slate', blurb: 'Navy side column', swatch: ['#26324f', '#ffffff', '#c6a05c'] },
  { id: 'bordered', name: 'Bordered Classic', blurb: 'Double-rule frame', swatch: ['#ffffff', '#2a2118', '#8a6a3a'] },
  { id: 'ledger', name: 'Monoline Ledger', blurb: 'Tabular & precise', swatch: ['#fbfbf9', '#1a1a1a', '#3a6b52'] },
  { id: 'blush', name: 'Blush Soft', blurb: 'Rounded & warm', swatch: ['#fff6f4', '#b0596a', '#3a2f2a'] },
  { id: 'emerald', name: 'Emerald Crest', blurb: 'Deep green formal', swatch: ['#f4f1e9', '#1f5d4c', '#26201a'] },
  { id: 'receipt', name: 'Receipt Slip', blurb: 'Narrow ticket', swatch: ['#ffffff', '#222222', '#b98a4a'] },
];

const amt = (qty: string, unit: string) => num(qty) * num(unit);

interface P {
  inv: Invoice;
  tot: InvoiceTotals;
}

/** Dispatch to the selected template. */
export function InvoiceDoc({ inv }: { inv: Invoice }) {
  const tot = invoiceTotals(inv);
  const R = RENDERERS[inv.templateId] ?? TplNoir;
  return <R inv={inv} tot={tot} />;
}

// ---------------------------------------------------------------------------
// 1 · Atelier Noir — dark charcoal, gold accents
// ---------------------------------------------------------------------------
function TplNoir({ inv, tot }: P) {
  const g = '#c9925a';
  return (
    <View style={[s.doc, { backgroundColor: '#1b1712' }]}>
      <View style={s.rowBetween}>
        <View>
          <Text style={[s.serif, { fontSize: 28, color: '#f0e9db' }]}>{inv.atelierName}</Text>
          <Text style={[s.italic, { color: g, marginTop: 2 }]}>{inv.atelierTagline}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 13, letterSpacing: 6, color: g, fontFamily: fonts.sansSemiBold }}>INVOICE</Text>
          <Text style={[s.serif, { fontSize: 18, color: '#e9e1d2', marginTop: 4 }]}>{inv.number}</Text>
        </View>
      </View>
      <View style={[s.hr, { backgroundColor: 'rgba(201,146,90,0.35)', marginVertical: 22 }]} />
      <View style={s.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={[s.kick, { color: g }]}>BILL TO</Text>
          <Text style={[s.serif, { fontSize: 20, color: '#f0e9db' }]}>{inv.billTo}</Text>
          <Text style={[s.small, { color: 'rgba(233,225,210,0.6)' }]}>{inv.billContact}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Meta label="ISSUED" value={inv.issueDate} c={g} v="#e9e1d2" />
          <Meta label="DUE" value={inv.dueDate} c={g} v="#e9e1d2" />
        </View>
      </View>
      <ItemsTable inv={inv} headColor={g} lineColor="rgba(233,225,210,0.12)" textColor="#e9e1d2" subColor="rgba(233,225,210,0.55)" mt={24} />
      <Totals inv={inv} tot={tot} align="right" labelColor="rgba(233,225,210,0.6)" valueColor="#f0e9db" accent={g} />
      <Notes inv={inv} labelColor={g} textColor="rgba(233,225,210,0.65)" borderColor="rgba(201,146,90,0.25)" />
      <Signature name={inv.atelierName} lineColor="rgba(201,146,90,0.4)" labelColor={g} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 2 · Ivory Minimal — white, hairlines, sans
// ---------------------------------------------------------------------------
function TplIvory({ inv, tot }: P) {
  return (
    <View style={[s.doc, { backgroundColor: '#ffffff' }]}>
      <View style={s.rowBetween}>
        <Text style={{ fontSize: 40, letterSpacing: 2, color: '#111', fontFamily: fonts.sansLight }}>Invoice</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 12, color: '#111', fontFamily: fonts.sansSemiBold, letterSpacing: 1 }}>{inv.atelierName}</Text>
          <Text style={[s.small, { color: '#999' }]}>{inv.atelierContact}</Text>
        </View>
      </View>
      <View style={[s.hr, { backgroundColor: '#e9e9e9', marginTop: 20, marginBottom: 24 }]} />
      <View style={s.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={[s.kick, { color: '#aaa' }]}>BILLED TO</Text>
          <Text style={{ fontSize: 17, color: '#111', fontFamily: fonts.sansMedium }}>{inv.billTo}</Text>
          <Text style={[s.small, { color: '#888' }]}>{inv.billContact}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Meta label="NO." value={inv.number} c="#aaa" v="#111" />
          <Meta label="ISSUED" value={inv.issueDate} c="#aaa" v="#111" />
          <Meta label="DUE" value={inv.dueDate} c="#aaa" v="#111" />
        </View>
      </View>
      <ItemsTable inv={inv} headColor="#aaa" lineColor="#eee" textColor="#111" subColor="#999" mt={26} />
      <Totals inv={inv} tot={tot} align="right" labelColor="#999" valueColor="#111" accent="#111" />
      <Notes inv={inv} labelColor="#aaa" textColor="#666" borderColor="#eee" />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 3 · Couture Serif — cream, centered masthead
// ---------------------------------------------------------------------------
function TplSerif({ inv, tot }: P) {
  const g = '#b98a4a';
  return (
    <View style={[s.doc, { backgroundColor: '#faf7f0' }]}>
      <View style={{ alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 11, letterSpacing: 7, color: g, fontFamily: fonts.sans }}>INVOICE</Text>
        <Text style={[s.serif, { fontSize: 34, color: '#1c1712', marginTop: 6, textAlign: 'center' }]}>{inv.atelierName}</Text>
        <Text style={[s.italic, { color: '#8a7a55' }]}>{inv.atelierTagline} · {inv.atelierContact}</Text>
      </View>
      <View style={[s.hr, { backgroundColor: g, opacity: 0.5, marginVertical: 22 }]} />
      <View style={s.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={[s.kick, { color: g }]}>PREPARED FOR</Text>
          <Text style={[s.serif, { fontSize: 22, color: '#1c1712' }]}>{inv.billTo}</Text>
          <Text style={[s.small, { color: '#8a7a66' }]}>{inv.billContact}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Meta label="NO." value={inv.number} c={g} v="#1c1712" />
          <Meta label="ISSUED" value={inv.issueDate} c={g} v="#1c1712" />
          <Meta label="DUE" value={inv.dueDate} c={g} v="#1c1712" />
        </View>
      </View>
      <ItemsTable inv={inv} headColor={g} lineColor="rgba(28,23,18,0.1)" textColor="#1c1712" subColor="#8a7a66" mt={24} serifAmounts />
      <Totals inv={inv} tot={tot} align="right" labelColor="#8a7a66" valueColor="#1c1712" accent={g} serif />
      <Notes inv={inv} labelColor={g} textColor="#6a5f52" borderColor="rgba(28,23,18,0.1)" italic />
      <Signature name={inv.atelierName} lineColor={g} labelColor="#8a7a66" />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 4 · Gold Letterhead — cream with a gold header band + crest
// ---------------------------------------------------------------------------
function TplGold({ inv, tot }: P) {
  return (
    <View style={[s.doc, { backgroundColor: '#f7efe0', padding: 0, overflow: 'hidden' }]}>
      <View style={{ backgroundColor: '#c9922f', paddingVertical: 26, paddingHorizontal: 34, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={[s.serif, { fontSize: 26, color: '#2a1f0e' }]}>{inv.atelierName}</Text>
          <Text style={[s.italic, { color: 'rgba(42,31,14,0.8)' }]}>{inv.atelierTagline}</Text>
        </View>
        <View style={{ width: 52, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#2a1f0e', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[s.italic, { fontSize: 20, color: '#2a1f0e' }]}>TB</Text>
        </View>
      </View>
      <View style={{ padding: 34 }}>
        <View style={s.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[s.kick, { color: '#b0842a' }]}>BILL TO</Text>
            <Text style={[s.serif, { fontSize: 21, color: '#26201a' }]}>{inv.billTo}</Text>
            <Text style={[s.small, { color: '#7a6a4a' }]}>{inv.billContact}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <Meta label="INVOICE" value={inv.number} c="#b0842a" v="#26201a" />
            <Meta label="ISSUED" value={inv.issueDate} c="#b0842a" v="#26201a" />
            <Meta label="DUE" value={inv.dueDate} c="#b0842a" v="#26201a" />
          </View>
        </View>
        <ItemsTable inv={inv} headColor="#b0842a" lineColor="rgba(38,32,26,0.1)" textColor="#26201a" subColor="#7a6a4a" mt={24} />
        <Totals inv={inv} tot={tot} align="right" labelColor="#7a6a4a" valueColor="#26201a" accent="#c9922f" />
        <Notes inv={inv} labelColor="#b0842a" textColor="#6a5f4a" borderColor="rgba(38,32,26,0.1)" />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 5 · Sidebar Slate — navy left column carries totals
// ---------------------------------------------------------------------------
function TplSlate({ inv, tot }: P) {
  const g = '#c6a05c';
  return (
    <View style={[s.doc, { backgroundColor: '#ffffff', padding: 0, overflow: 'hidden', flexDirection: 'row' }]}>
      <View style={{ width: '38%', backgroundColor: '#26324f', padding: 26, justifyContent: 'space-between' }}>
        <View>
          <Text style={[s.serif, { fontSize: 22, color: '#fff' }]}>{inv.atelierName}</Text>
          <Text style={[s.italic, { color: 'rgba(255,255,255,0.7)', marginBottom: 22 }]}>{inv.atelierTagline}</Text>
          <Text style={[s.kick, { color: g }]}>INVOICE</Text>
          <Text style={{ color: '#fff', fontFamily: fonts.sansMedium, fontSize: 15, marginBottom: 16 }}>{inv.number}</Text>
          <Text style={[s.kick, { color: g }]}>BILL TO</Text>
          <Text style={{ color: '#fff', fontFamily: fonts.serif, fontSize: 18 }}>{inv.billTo}</Text>
          <Text style={[s.small, { color: 'rgba(255,255,255,0.6)' }]}>{inv.billContact}</Text>
        </View>
        <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 16 }}>
          <Text style={[s.kick, { color: g }]}>TOTAL DUE</Text>
          <Text style={[s.serif, { fontSize: 28, color: '#fff' }]}>{money(inv.currency, tot.total)}</Text>
          <Text style={[s.small, { color: 'rgba(255,255,255,0.6)', marginTop: 6 }]}>Due {inv.dueDate}</Text>
        </View>
      </View>
      <View style={{ flex: 1, padding: 26 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Meta label="ISSUED" value={inv.issueDate} c="#98a" v="#26324f" />
          <Meta label="DUE" value={inv.dueDate} c="#98a" v="#26324f" />
        </View>
        <ItemsTable inv={inv} headColor="#8a93a8" lineColor="#e8ebf0" textColor="#26324f" subColor="#8a93a8" mt={16} />
        <Totals inv={inv} tot={tot} align="right" labelColor="#8a93a8" valueColor="#26324f" accent="#26324f" hideTotal />
        <Notes inv={inv} labelColor="#8a93a8" textColor="#5a6478" borderColor="#e8ebf0" />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 6 · Bordered Classic — double-rule frame
// ---------------------------------------------------------------------------
function TplBordered({ inv, tot }: P) {
  const g = '#8a6a3a';
  return (
    <View style={[s.doc, { backgroundColor: '#ffffff', padding: 8 }]}>
      <View style={{ borderWidth: 2, borderColor: '#2a2118', padding: 3, flex: 1 }}>
        <View style={{ borderWidth: 1, borderColor: '#c9b489', padding: 26 }}>
          <View style={{ alignItems: 'center', marginBottom: 6 }}>
            <Text style={[s.serif, { fontSize: 28, color: '#2a2118' }]}>{inv.atelierName}</Text>
            <Text style={[s.italic, { color: g }]}>{inv.atelierTagline} · {inv.atelierContact}</Text>
            <Text style={{ fontSize: 11, letterSpacing: 6, color: '#2a2118', marginTop: 12, fontFamily: fonts.sansSemiBold }}>I N V O I C E</Text>
          </View>
          <View style={[s.hr, { backgroundColor: '#2a2118', opacity: 0.15, marginVertical: 18 }]} />
          <View style={s.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={[s.kick, { color: g }]}>BILL TO</Text>
              <Text style={[s.serif, { fontSize: 20, color: '#2a2118' }]}>{inv.billTo}</Text>
              <Text style={[s.small, { color: '#7a6a52' }]}>{inv.billContact}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <Meta label="NO." value={inv.number} c={g} v="#2a2118" />
              <Meta label="ISSUED" value={inv.issueDate} c={g} v="#2a2118" />
              <Meta label="DUE" value={inv.dueDate} c={g} v="#2a2118" />
            </View>
          </View>
          <ItemsTable inv={inv} headColor={g} lineColor="rgba(42,33,24,0.12)" textColor="#2a2118" subColor="#7a6a52" mt={22} serifAmounts />
          <Totals inv={inv} tot={tot} align="right" labelColor="#7a6a52" valueColor="#2a2118" accent={g} serif />
          <Notes inv={inv} labelColor={g} textColor="#6a5f4a" borderColor="rgba(42,33,24,0.12)" />
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 7 · Monoline Ledger — tabular, precise, grid
// ---------------------------------------------------------------------------
function TplLedger({ inv, tot }: P) {
  const acc = '#3a6b52';
  return (
    <View style={[s.doc, { backgroundColor: '#fbfbf9' }]}>
      <View style={s.rowBetween}>
        <View>
          <Text style={{ fontSize: 16, color: '#1a1a1a', fontFamily: fonts.sansSemiBold, letterSpacing: 1 }}>{inv.atelierName.toUpperCase()}</Text>
          <Text style={[s.small, { color: '#888', letterSpacing: 0.5 }]}>{inv.atelierContact}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 11, letterSpacing: 3, color: acc, fontFamily: fonts.sansSemiBold }}>INVOICE {inv.number}</Text>
          <Text style={[s.small, { color: '#888' }]}>ISSUED {inv.issueDate} · DUE {inv.dueDate}</Text>
        </View>
      </View>
      <View style={{ height: 2, backgroundColor: '#1a1a1a', marginVertical: 16 }} />
      <Text style={[s.kick, { color: '#aaa' }]}>BILL TO</Text>
      <Text style={{ fontSize: 15, color: '#1a1a1a', fontFamily: fonts.sansMedium, marginBottom: 16 }}>{inv.billTo} · {inv.billContact}</Text>
      {/* gridded table */}
      <View style={{ borderWidth: 1, borderColor: '#e2e2de' }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#f1f1ec' }}>
          <Cell flex={5} bold>DESCRIPTION</Cell>
          <Cell flex={1} bold right>QTY</Cell>
          <Cell flex={2} bold right>UNIT</Cell>
          <Cell flex={2} bold right>AMOUNT</Cell>
        </View>
        {inv.items.map((it) => (
          <View key={it.id} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e2e2de' }}>
            <Cell flex={5}>{it.description || '—'}</Cell>
            <Cell flex={1} right>{it.qty || '0'}</Cell>
            <Cell flex={2} right>{money(inv.currency, num(it.unitPrice))}</Cell>
            <Cell flex={2} right>{money(inv.currency, amt(it.qty, it.unitPrice))}</Cell>
          </View>
        ))}
      </View>
      <Totals inv={inv} tot={tot} align="right" labelColor="#888" valueColor="#1a1a1a" accent={acc} />
      <Notes inv={inv} labelColor="#aaa" textColor="#666" borderColor="#e2e2de" />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 8 · Blush Soft — rounded cards, warm blush
// ---------------------------------------------------------------------------
function TplBlush({ inv, tot }: P) {
  const acc = '#b0596a';
  return (
    <View style={[s.doc, { backgroundColor: '#fff6f4' }]}>
      <View style={s.rowBetween}>
        <View>
          <Text style={[s.serif, { fontSize: 26, color: '#3a2f2a' }]}>{inv.atelierName}</Text>
          <Text style={[s.italic, { color: acc }]}>{inv.atelierTagline}</Text>
        </View>
        <View style={{ backgroundColor: acc, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 18, alignSelf: 'flex-start' }}>
          <Text style={{ color: '#fff', fontFamily: fonts.sansSemiBold, letterSpacing: 2, fontSize: 11 }}>INVOICE</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
        <View style={s.softInner}>
          <Text style={[s.kick, { color: acc }]}>BILL TO</Text>
          <Text style={[s.serif, { fontSize: 19, color: '#3a2f2a' }]}>{inv.billTo}</Text>
          <Text style={[s.small, { color: '#8a6a70' }]}>{inv.billContact}</Text>
        </View>
        <View style={[s.softInner, { alignItems: 'flex-end' }]}>
          <Meta label="NO." value={inv.number} c={acc} v="#3a2f2a" />
          <Meta label="ISSUED" value={inv.issueDate} c={acc} v="#3a2f2a" />
          <Meta label="DUE" value={inv.dueDate} c={acc} v="#3a2f2a" />
        </View>
      </View>
      <View style={[s.softInner, { marginTop: 12 }]}>
        <ItemsTable inv={inv} headColor={acc} lineColor="rgba(58,47,42,0.1)" textColor="#3a2f2a" subColor="#8a6a70" mt={0} />
      </View>
      <Totals inv={inv} tot={tot} align="right" labelColor="#8a6a70" valueColor="#3a2f2a" accent={acc} />
      <Notes inv={inv} labelColor={acc} textColor="#6a5a55" borderColor="rgba(58,47,42,0.1)" />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 9 · Emerald Crest — deep green formal
// ---------------------------------------------------------------------------
function TplEmerald({ inv, tot }: P) {
  const acc = '#1f5d4c';
  return (
    <View style={[s.doc, { backgroundColor: '#f4f1e9' }]}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: acc, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          <Text style={[s.italic, { fontSize: 20, color: acc }]}>TB</Text>
        </View>
        <Text style={[s.serif, { fontSize: 26, color: '#26201a' }]}>{inv.atelierName}</Text>
        <Text style={[s.italic, { color: acc }]}>{inv.atelierTagline}</Text>
      </View>
      <View style={{ height: 3, backgroundColor: acc, marginVertical: 20, borderRadius: 2 }} />
      <View style={s.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={[s.kick, { color: acc }]}>BILL TO</Text>
          <Text style={[s.serif, { fontSize: 20, color: '#26201a' }]}>{inv.billTo}</Text>
          <Text style={[s.small, { color: '#6a6258' }]}>{inv.billContact}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Meta label="INVOICE" value={inv.number} c={acc} v="#26201a" />
          <Meta label="ISSUED" value={inv.issueDate} c={acc} v="#26201a" />
          <Meta label="DUE" value={inv.dueDate} c={acc} v="#26201a" />
        </View>
      </View>
      <ItemsTable inv={inv} headColor={acc} lineColor="rgba(38,32,26,0.1)" textColor="#26201a" subColor="#6a6258" mt={22} />
      <Totals inv={inv} tot={tot} align="right" labelColor="#6a6258" valueColor="#26201a" accent={acc} />
      <Notes inv={inv} labelColor={acc} textColor="#5a5248" borderColor="rgba(38,32,26,0.1)" />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 10 · Receipt Slip — narrow ticket, dashed dividers
// ---------------------------------------------------------------------------
function TplReceipt({ inv, tot }: P) {
  const acc = '#b98a4a';
  const dash = { borderBottomWidth: 1, borderStyle: 'dashed' as const, borderBottomColor: '#cfcfcf', marginVertical: 12 };
  return (
    <View style={[s.doc, { backgroundColor: '#ffffff', alignItems: 'center' }]}>
      <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={[s.serif, { fontSize: 24, color: '#222' }]}>{inv.atelierName}</Text>
          <Text style={[s.small, { color: '#888', textAlign: 'center' }]}>{inv.atelierTagline}</Text>
          <Text style={[s.small, { color: '#888', textAlign: 'center' }]}>{inv.atelierContact}</Text>
        </View>
        <View style={dash} />
        <View style={s.rowBetween}><Text style={s.recK}>INVOICE</Text><Text style={s.recV}>{inv.number}</Text></View>
        <View style={s.rowBetween}><Text style={s.recK}>ISSUED</Text><Text style={s.recV}>{inv.issueDate}</Text></View>
        <View style={s.rowBetween}><Text style={s.recK}>DUE</Text><Text style={s.recV}>{inv.dueDate}</Text></View>
        <View style={s.rowBetween}><Text style={s.recK}>CLIENT</Text><Text style={s.recV}>{inv.billTo}</Text></View>
        <View style={dash} />
        {inv.items.map((it) => (
          <View key={it.id} style={{ marginBottom: 8 }}>
            <Text style={{ color: '#222', fontFamily: fonts.sansMedium, fontSize: 13 }}>{it.description || '—'}</Text>
            <View style={s.rowBetween}>
              <Text style={[s.small, { color: '#888' }]}>{it.qty || '0'} × {money(inv.currency, num(it.unitPrice))}</Text>
              <Text style={{ color: '#222', fontFamily: fonts.sansMedium }}>{money(inv.currency, amt(it.qty, it.unitPrice))}</Text>
            </View>
          </View>
        ))}
        <View style={dash} />
        <TotRow k="Subtotal" v={money(inv.currency, tot.sub)} />
        {tot.discount > 0 && <TotRow k="Discount" v={'− ' + money(inv.currency, tot.discount)} />}
        {tot.tax > 0 && <TotRow k={`Tax (${num(inv.taxRate)}%)`} v={money(inv.currency, tot.tax)} />}
        <View style={dash} />
        <View style={s.rowBetween}>
          <Text style={{ fontSize: 15, color: '#222', fontFamily: fonts.sansSemiBold, letterSpacing: 1 }}>TOTAL</Text>
          <Text style={{ fontSize: 18, color: acc, fontFamily: fonts.sansSemiBold }}>{money(inv.currency, tot.total)}</Text>
        </View>
        <View style={dash} />
        <Text style={{ textAlign: 'center', letterSpacing: 4, color: '#888', fontSize: 11, fontFamily: fonts.sans, marginTop: 4 }}>THANK YOU</Text>
        {!!inv.notes && <Text style={{ textAlign: 'center', color: '#999', fontSize: 11, marginTop: 8, fontFamily: fonts.sans }}>{inv.notes}</Text>}
      </View>
    </View>
  );
}

const RENDERERS: Record<string, React.FC<P>> = {
  noir: TplNoir,
  ivory: TplIvory,
  serif: TplSerif,
  gold: TplGold,
  slate: TplSlate,
  bordered: TplBordered,
  ledger: TplLedger,
  blush: TplBlush,
  emerald: TplEmerald,
  receipt: TplReceipt,
};

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------
function Meta({ label, value, c, v }: { label: string; value: string; c: string; v: string }) {
  return (
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ fontSize: 9, letterSpacing: 2, color: c, fontFamily: fonts.sans }}>{label}</Text>
      <Text style={{ fontSize: 13, color: v, fontFamily: fonts.sansMedium, marginTop: 1 }}>{value}</Text>
    </View>
  );
}

function ItemsTable({
  inv,
  headColor,
  lineColor,
  textColor,
  subColor,
  mt,
  serifAmounts,
}: {
  inv: Invoice;
  headColor: string;
  lineColor: string;
  textColor: string;
  subColor: string;
  mt: number;
  serifAmounts?: boolean;
}) {
  return (
    <View style={{ marginTop: mt }}>
      <View style={{ flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: headColor }}>
        <Text style={[s.th, { flex: 5, color: headColor }]}>DESCRIPTION</Text>
        <Text style={[s.th, { flex: 1, color: headColor, textAlign: 'right' }]}>QTY</Text>
        <Text style={[s.th, { flex: 2, color: headColor, textAlign: 'right' }]}>UNIT</Text>
        <Text style={[s.th, { flex: 2, color: headColor, textAlign: 'right' }]}>AMOUNT</Text>
      </View>
      {inv.items.map((it) => (
        <View key={it.id} style={{ flexDirection: 'row', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: lineColor, alignItems: 'center' }}>
          <Text style={{ flex: 5, color: textColor, fontFamily: fonts.sansMedium, fontSize: 13, paddingRight: 8 }}>{it.description || '—'}</Text>
          <Text style={{ flex: 1, color: subColor, textAlign: 'right', fontFamily: fonts.sans, fontSize: 12 }}>{it.qty || '0'}</Text>
          <Text style={{ flex: 2, color: subColor, textAlign: 'right', fontFamily: fonts.sans, fontSize: 12 }}>{money(inv.currency, num(it.unitPrice))}</Text>
          <Text style={{ flex: 2, color: textColor, textAlign: 'right', fontFamily: serifAmounts ? fonts.serif : fonts.sansMedium, fontSize: serifAmounts ? 16 : 13 }}>{money(inv.currency, amt(it.qty, it.unitPrice))}</Text>
        </View>
      ))}
    </View>
  );
}

function Totals({
  inv,
  tot,
  labelColor,
  valueColor,
  accent,
  serif,
  hideTotal,
}: {
  inv: Invoice;
  tot: InvoiceTotals;
  align?: 'right';
  labelColor: string;
  valueColor: string;
  accent: string;
  serif?: boolean;
  hideTotal?: boolean;
}) {
  const Line = ({ k, v, strong }: { k: string; v: string; strong?: boolean }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 240, paddingVertical: 4 }}>
      <Text style={{ color: strong ? valueColor : labelColor, fontFamily: strong ? fonts.sansSemiBold : fonts.sans, fontSize: strong ? 13 : 12, letterSpacing: strong ? 1 : 0 }}>{k}</Text>
      <Text style={{ color: strong ? accent : valueColor, fontFamily: strong ? (serif ? fonts.serif : fonts.sansSemiBold) : fonts.sansMedium, fontSize: strong ? (serif ? 22 : 16) : 13 }}>{v}</Text>
    </View>
  );
  return (
    <View style={{ alignItems: 'flex-end', marginTop: 16 }}>
      <Line k="Subtotal" v={money(inv.currency, tot.sub)} />
      {tot.discount > 0 && <Line k="Discount" v={'− ' + money(inv.currency, tot.discount)} />}
      {tot.tax > 0 && <Line k={`Tax (${num(inv.taxRate)}%)`} v={money(inv.currency, tot.tax)} />}
      {!hideTotal && (
        <>
          <View style={{ height: 1, backgroundColor: accent, opacity: 0.4, width: 240, marginVertical: 6 }} />
          <Line k="TOTAL DUE" v={money(inv.currency, tot.total)} strong />
        </>
      )}
    </View>
  );
}

function Notes({
  inv,
  labelColor,
  textColor,
  borderColor,
  italic,
}: {
  inv: Invoice;
  labelColor: string;
  textColor: string;
  borderColor: string;
  italic?: boolean;
}) {
  if (!inv.notes) return null;
  return (
    <View style={{ marginTop: 22, borderTopWidth: 1, borderTopColor: borderColor, paddingTop: 14 }}>
      <Text style={[s.kick, { color: labelColor, marginBottom: 6 }]}>NOTES</Text>
      <Text style={{ color: textColor, fontFamily: italic ? fonts.serifItalic : fonts.sans, fontSize: italic ? 15 : 12, lineHeight: italic ? 21 : 18 }}>{inv.notes}</Text>
    </View>
  );
}

function Signature({ name, lineColor, labelColor }: { name: string; lineColor: string; labelColor: string }) {
  return (
    <View style={{ marginTop: 26, alignItems: 'flex-end' }}>
      <View style={{ width: 150, borderBottomWidth: 1, borderBottomColor: lineColor, marginBottom: 5 }} />
      <Text style={{ fontSize: 10, letterSpacing: 1.5, color: labelColor, fontFamily: fonts.sans }}>{name.toUpperCase()}</Text>
    </View>
  );
}

// receipt helpers
function TotRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={[s.rowBetween, { paddingVertical: 3 }]}>
      <Text style={[s.small, { color: '#888' }]}>{k}</Text>
      <Text style={{ color: '#222', fontFamily: fonts.sansMedium, fontSize: 12 }}>{v}</Text>
    </View>
  );
}
function Cell({ children, flex, bold, right }: { children: React.ReactNode; flex: number; bold?: boolean; right?: boolean }) {
  return (
    <Text
      style={{
        flex,
        padding: 9,
        fontSize: bold ? 10 : 12,
        letterSpacing: bold ? 1 : 0,
        color: bold ? '#555' : '#1a1a1a',
        fontFamily: bold ? fonts.sansSemiBold : fonts.sans,
        textAlign: right ? 'right' : 'left',
      }}
    >
      {children}
    </Text>
  );
}

const s = StyleSheet.create({
  doc: { width: '100%', padding: 34, borderRadius: 4 },
  serif: { fontFamily: fonts.serif },
  italic: { fontFamily: fonts.serifItalic, fontSize: 14 },
  small: { fontSize: 11, fontFamily: fonts.sans, marginTop: 2 },
  kick: { fontSize: 9, letterSpacing: 2, fontFamily: fonts.sans, marginBottom: 3 },
  th: { fontSize: 9, letterSpacing: 1.5, fontFamily: fonts.sansSemiBold },
  hr: { height: 1, width: '100%' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  softInner: { flex: 1, backgroundColor: 'rgba(176,89,106,0.06)', borderRadius: 16, padding: 16 },
  recK: { fontSize: 11, letterSpacing: 1, color: '#888', fontFamily: fonts.sans },
  recV: { fontSize: 12, color: '#222', fontFamily: fonts.sansMedium },
});
