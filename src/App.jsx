import { useState, useEffect, useMemo, useRef } from "react";
import {
  Home, Calendar, Wallet, Users, MoreHorizontal, Check, X, Share2, Camera,
  MapPin, Phone, MessageCircle, Navigation, ChevronRight, ChevronLeft, Plus,
  Car, FileText, Building2, CreditCard, Banknote, Clock, TrendingUp,
  AlertTriangle, Settings, LogOut, ArrowLeft, Fuel, Search, ShieldCheck,
  Receipt, Route, ClipboardList, BarChart3, Bell, Info, Smartphone,
  QrCode, CheckCircle2, Circle, Building, UserCircle2, FolderOpen,
  ListChecks, Percent, Gauge, RefreshCw, Send, Eye
} from "lucide-react";

/* ======================================================================
   TAXIOS — PROTOTIPO CLICKABLE
   Fuente de verdad: Paquete Maestro v1 + UX/UI pantalla a pantalla v1.
   Decisión de arquitectura para este prototipo: como no hay entorno de
   compilación nativo iOS/Android disponible en este chat, se construye
   un prototipo web funcional de extremo a extremo (estado real, máquina
   de estados, cobros y OCR simulados) presentado dentro de un marco de
   teléfono con dos pieles (iOS / Android) para validar la experiencia
   en ambas plataformas. Portal B2B y Backoffice se muestran como panel
   web ancho, tal como especifica el documento.
   ====================================================================== */

// ---------------------------------------------------------------------
// TOKENS DE DISEÑO
// ---------------------------------------------------------------------
const C = {
  primary: "#14509E",
  primaryDeep: "#0C3766",
  cyan: "#12A6B4",
  success: "#1E8E5A",
  successBg: "#E6F4EC",
  warning: "#B4780F",
  warningBg: "#FBF0DD",
  danger: "#C23B33",
  dangerBg: "#FBEAE8",
  purple: "#6E56CF",
  purpleBg: "#EFEBFB",
  ink: "#101826",
  ink2: "#33405A",
  muted: "#66748F",
  faint: "#93A0B8",
  bg: "#F2F4F8",
  surface: "#FFFFFF",
  border: "#E1E6EF",
  borderSoft: "#EDF0F6",
};

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const money = (n) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    Math.round((n + Number.EPSILON) * 100) / 100
  );
const fmtDate = (iso, opts) =>
  new Intl.DateTimeFormat("es-ES", opts || { day: "2-digit", month: "short" }).format(new Date(iso));
const fmtTime = (iso) =>
  new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const nowISO = () => new Date().toISOString();
let _uid = 1000;
const uid = (p) => `${p}_${_uid++}`;

// ---------------------------------------------------------------------
// DATOS DEMO — Territorio piloto: La Carlota
// ---------------------------------------------------------------------
const NUCLEOS = [
  "La Carlota", "La Paz", "Los Algarbes", "Monte Alto", "El Arrecife",
  "El Garabato", "Chica Carlota", "Las Pinedas", "El Rinconcillo",
  "Fuencubierta", "Aldea Quintana",
];
const DESTINOS = ["Córdoba capital", "Hospital Reina Sofía", "Estación Córdoba AVE", "Écija"];

const DRIVERS = [
  { id: "drv1", name: "Rafael Ordóñez", phone: "+34 611 223 344", licencia: "TX-0451", municipio: "La Carlota", status: "disponible" },
  { id: "drv2", name: "Beatriz Camacho", phone: "+34 622 334 455", licencia: "TX-0512", municipio: "La Carlota", status: "ocupado" },
  { id: "drv3", name: "Emilio Salcedo", phone: "+34 633 445 566", licencia: "TX-0398", municipio: "La Carlota", status: "descanso" },
];
const ME = DRIVERS[0];

const VEHICLES = [
  { id: "veh1", driverId: "drv1", matricula: "0145 KZP", marca: "Toyota", modelo: "Corolla Hybrid", combustible: "Híbrido", km: 78500, plazas: 4, pmr: false, itv: "2027-03-10", seguro: "2027-01-15", consumo: "4.9 l/100km" },
  { id: "veh2", driverId: "drv2", matricula: "8890 LBM", marca: "Skoda", modelo: "Octavia", combustible: "Diésel", km: 132400, plazas: 4, pmr: false, itv: "2026-11-02", seguro: "2027-02-20", consumo: "5.4 l/100km" },
  { id: "veh3", driverId: "drv3", matricula: "3321 MJT", marca: "Mercedes-Benz", modelo: "Vito PMR", combustible: "Diésel", km: 96200, plazas: 5, pmr: true, itv: "2026-09-18", seguro: "2026-12-05", consumo: "7.8 l/100km" },
];
const MY_VEHICLE = VEHICLES[0];

const COMPANIES = [
  { id: "emp1", name: "Hotel Fuente Real", tipo: "Hotel", cif: "B14556677", contacto: "Recepción 24h", condiciones: "Facturación mensual", centros: ["Recepción", "Eventos"] },
  { id: "emp2", name: "Transportes Agroliva S.L.", tipo: "Empresa", cif: "B14223344", contacto: "Dpto. Compras", condiciones: "Pago a 30 días", centros: ["Comercial", "Logística"] },
  { id: "emp3", name: "Mutua La Carlota Salud", tipo: "Mutua", cif: "G14998877", contacto: "Admisión", condiciones: "Convenio mensual", centros: ["Traslado pacientes"] },
  { id: "emp4", name: "Hotel Vista Sierra", tipo: "Hotel", cif: "B14112233", contacto: "Conserjería", condiciones: "Facturación quincenal", centros: ["Conserjería"] },
  { id: "emp5", name: "Constructora San Rafael", tipo: "Empresa", cif: "B14887766", contacto: "RRHH", condiciones: "Pago a 60 días", centros: ["Obra Écija", "Oficina"] },
];

const CUSTOMER_NAMES = [
  "Antonio Ruiz", "María Jiménez", "José Manuel Pérez", "Carmen López", "Francisco Torres",
  "Isabel Romero", "Manuel Sánchez", "Lucía Fernández", "Rafael Gómez", "Ana Belén Ortega",
  "Juan Carlos Muñoz", "Rocío Delgado", "Pedro Navarro", "Cristina Vargas", "Miguel Ángel Cabrera",
  "Laura Serrano", "Álvaro Moreno", "Marta Iglesias", "Sergio Cano", "Elena Prieto",
];
const CUSTOMERS = CUSTOMER_NAMES.map((name, i) => ({
  id: `cli${i + 1}`,
  name,
  phone: `+34 6${(10 + i).toString().padStart(2, "0")} ${(100 + i * 7).toString()} ${(200 + i * 3).toString()}`,
  email: name.toLowerCase().replace(/[^a-záéíóúñ ]/gi, "").split(" ").join(".") + "@correo.es",
  notas: i % 5 === 0 ? "Prefiere pago con tarjeta" : i % 5 === 1 ? "Cliente habitual, buena propina" : "",
  direcciones: [NUCLEOS[i % NUCLEOS.length]],
}));

const EXPENSE_CATS = ["combustible", "mantenimiento", "neumáticos", "seguro", "teléfono/datos", "comisiones", "limpieza", "gestoría", "otros"];
const PROVEEDORES = {
  combustible: ["Repsol La Carlota", "Cepsa N-IV", "BP Écija"],
  mantenimiento: ["Talleres Ordóñez", "AutoServicio Carlota", "Bosch Car Service Córdoba"],
  neumáticos: ["Neumáticos del Sur", "Feu Vert Córdoba"],
  seguro: ["Mutua Motera", "Línea Directa"],
  "teléfono/datos": ["Movistar Empresas", "Vodafone Negocios"],
  comisiones: ["TaxiOS Plataforma"],
  limpieza: ["Lavadero La Carlota", "Túnel de Lavado Écija"],
  gestoría: ["Gestoría Fernández y Asoc."],
  otros: ["Varios"],
};

function randInt(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
function daysFromNow(d, h = 9, m = 0) {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
}

const RIDE_STEPS = ["ACCEPTED", "EN_ROUTE", "ARRIVED", "PASSENGER_ONBOARD", "IN_PROGRESS", "COMPLETED"];

function newAudit(action, actor = ME.name) {
  return { ts: nowISO(), actor, action };
}

function mkRide(o) {
  const base = {
    id: uid("ride"),
    source: "manual",
    passenger: "Pasajero",
    phone: "",
    origin: "La Carlota",
    destination: "Córdoba capital",
    scheduledAt: nowISO(),
    driverId: ME.id,
    vehicleId: MY_VEHICLE.id,
    status: "CREATED",
    payer: "pasajero",
    companyId: null,
    costCenter: null,
    price: 18,
    method: null,
    fee: 0,
    net: 0,
    notes: "",
    km: randInt(6, 34),
    kmVacio: randInt(0, 6),
    createdAt: nowISO(),
    cancelReason: null,
    audit: [],
    auto: false, // si es true, el motor de asignación lo pasa solo de PENDING_ASSIGNMENT a OFFERED
  };
  const r = { ...base, ...o };
  r.audit = [newAudit(`Reserva creada (${r.source})`)];
  return r;
}

// Casos de demo obligatorios (sección 11 UX/UI) + variedad de estados
const SEED_RIDES = [
  mkRide({ source: "cliente", passenger: "Elena Prieto", phone: "+34 620 900 111", origin: "La Carlota", destination: "Córdoba capital", status: "IN_PROGRESS", payer: "pasajero", price: 24, scheduledAt: nowISO(), notes: "Caso demo 1: cliente app, tarjeta simulada" }),
  mkRide({ source: "b2b", passenger: "David Ferrer (huésped)", phone: "+34 655 111 222", origin: "Hotel Fuente Real", destination: "Estación Córdoba AVE", status: "ACCEPTED", payer: "pasajero", companyId: "emp1", costCenter: "Recepción", price: 21, scheduledAt: daysFromNow(0, 13, 30), notes: "Caso demo 2: hotel reserva, paga el pasajero al finalizar" }),
  mkRide({ source: "b2b", passenger: "Equipo comercial Agroliva", phone: "+34 957 300 200", origin: "Transportes Agroliva S.L.", destination: "Écija", status: "OFFERED", payer: "empresa", companyId: "emp2", costCenter: "Comercial", price: 32, scheduledAt: daysFromNow(0, 16, 0), notes: "Caso demo 3: paga la empresa" }),
  mkRide({ source: "manual", passenger: "Aviso por teléfono — Sra. Cabrera", phone: "+34 699 887 766", origin: "Plaza de España, La Carlota", destination: "Hospital Reina Sofía", status: "PAID", payer: "pasajero", method: "efectivo", price: 27, scheduledAt: daysFromNow(0, 8, 10), notes: "Caso demo 4: carrera recibida por teléfono" }),
  mkRide({ source: "manual", passenger: "Operación externa — emisora", phone: "", origin: "La Paz", destination: "Monte Alto", status: "CLOSED", payer: "pasajero", method: "efectivo", price: 9, scheduledAt: daysFromNow(-1, 19, 0) }),
  mkRide({ source: "red", passenger: "Derivado por Beatriz Camacho", phone: "+34 622 334 455", origin: "El Arrecife", destination: "Fuencubierta", status: "OFFERED", payer: "pasajero", price: 8, scheduledAt: daysFromNow(0, 18, 45), notes: "Caso demo 6: servicio derivado a compañero" }),
  mkRide({ source: "cliente", passenger: "Sergio Cano", phone: "+34 610 200 300", origin: "Chica Carlota", destination: "La Carlota", status: "CANCELLED", payer: "pasajero", price: 6, scheduledAt: daysFromNow(-2, 11, 0), cancelReason: "Cliente canceló antes de la asignación" }),
  mkRide({ source: "b2b", passenger: "Paciente — traslado programado", phone: "+34 957 400 500", origin: "Los Algarbes", destination: "Hospital Reina Sofía", status: "INVOICED", payer: "empresa", companyId: "emp3", costCenter: "Traslado pacientes", price: 29, method: "empresa", scheduledAt: daysFromNow(-3, 9, 0) }),
  mkRide({ source: "manual", passenger: "Pago fallido y reintento", phone: "+34 688 111 999", origin: "La Carlota", destination: "Écija", status: "PAYMENT_PENDING", payer: "pasajero", price: 22, scheduledAt: daysFromNow(0, 12, 0), notes: "Caso demo 8: el primer intento de cobro falló" }),
  mkRide({ source: "cliente", passenger: "Laura Serrano", phone: "+34 633 777 444", origin: "Monte Alto", destination: "Estación Córdoba AVE", status: "PENDING_ASSIGNMENT", payer: "pasajero", price: 19, scheduledAt: daysFromNow(0, 20, 15) }),
];

for (let i = 0; i < 12; i++) {
  const status = pick(["CLOSED", "PAID", "INVOICED", "CANCELLED", "ACCEPTED", "COMPLETED"]);
  const org = pick(NUCLEOS);
  let dest = pick([...NUCLEOS.filter((n) => n !== org), ...DESTINOS]);
  const payer = Math.random() < 0.25 ? "empresa" : "pasajero";
  const companyId = payer === "empresa" ? pick(COMPANIES).id : null;
  SEED_RIDES.push(
    mkRide({
      source: pick(["manual", "cliente", "b2b", "red"]),
      passenger: pick(CUSTOMER_NAMES),
      phone: "+34 6" + randInt(10, 99) + " " + randInt(100, 999) + " " + randInt(100, 999),
      origin: org,
      destination: dest,
      status,
      payer,
      companyId,
      costCenter: companyId ? pick(COMPANIES.find((c) => c.id === companyId).centros) : null,
      price: randInt(6, 38),
      method: ["PAID", "CLOSED", "INVOICED"].includes(status) ? pick(["tarjeta", "efectivo", "bizum", "empresa"]) : null,
      scheduledAt: daysFromNow(randInt(-6, 2), randInt(7, 22), pick([0, 15, 30, 45])),
    })
  );
}

const SEED_EXPENSES = Array.from({ length: 14 }).map((_, i) => {
  const cat = pick(EXPENSE_CATS);
  const base = randInt(15, 220);
  const iva = Math.round(base * 0.21 * 100) / 100;
  return {
    id: uid("exp"),
    driverId: ME.id,
    vehicleId: MY_VEHICLE.id,
    proveedor: pick(PROVEEDORES[cat]),
    fecha: daysFromNow(-randInt(0, 40)),
    nifcif: "B" + randInt(10000000, 99999999),
    base,
    iva,
    total: Math.round((base + iva) * 100) / 100,
    categoria: cat,
    notas: "",
  };
});

const SEED_INVOICES = SEED_RIDES.filter((r) => r.status === "INVOICED" || r.status === "CLOSED")
  .slice(0, 8)
  .map((r, i) => ({
    id: uid("inv"),
    rideId: r.id,
    serie: "A",
    numero: 2026000 + i + 1,
    base: Math.round((r.price / 1.1) * 100) / 100,
    impuestos: Math.round((r.price - r.price / 1.1) * 100) / 100,
    total: r.price,
    status: r.status === "INVOICED" ? "Emitida" : "Cerrada",
    companyId: r.companyId,
  }));

const STATUS_META = {
  CREATED: { label: "Creado", color: C.muted, bg: C.borderSoft },
  PENDING_ASSIGNMENT: { label: "Buscando taxi", color: C.warning, bg: C.warningBg },
  OFFERED: { label: "Oferta pendiente", color: C.purple, bg: C.purpleBg },
  ACCEPTED: { label: "Aceptado", color: C.primary, bg: "#E7EFFA" },
  EN_ROUTE: { label: "En camino", color: C.primary, bg: "#E7EFFA" },
  ARRIVED: { label: "En el punto", color: C.cyan, bg: "#E3F6F7" },
  PASSENGER_ONBOARD: { label: "Pasajero a bordo", color: C.cyan, bg: "#E3F6F7" },
  IN_PROGRESS: { label: "En curso", color: C.cyan, bg: "#E3F6F7" },
  COMPLETED: { label: "Finalizado, sin cobrar", color: C.warning, bg: C.warningBg },
  PAYMENT_PENDING: { label: "Cobro pendiente", color: C.warning, bg: C.warningBg },
  PAID: { label: "Cobrado", color: C.success, bg: C.successBg },
  INVOICED: { label: "Facturado", color: C.success, bg: C.successBg },
  CLOSED: { label: "Cerrado", color: C.success, bg: C.successBg },
  CANCELLED: { label: "Cancelado", color: C.danger, bg: C.dangerBg },
};

const NEXT_ACTION = {
  ACCEPTED: { label: "Salir hacia recogida", next: "EN_ROUTE" },
  EN_ROUTE: { label: "He llegado", next: "ARRIVED" },
  ARRIVED: { label: "Pasajero a bordo", next: "PASSENGER_ONBOARD" },
  PASSENGER_ONBOARD: { label: "Iniciar trayecto", next: "IN_PROGRESS" },
  IN_PROGRESS: { label: "Finalizar servicio", next: "COMPLETED" },
};

const FEE_RATE = 0.025;
const FEE_LABEL = `${(FEE_RATE * 100).toLocaleString("es-ES", { maximumFractionDigits: 2 })}%`;

// ---------------------------------------------------------------------
// COMPONENTES BASE
// ---------------------------------------------------------------------
function StatusChip({ status }) {
  const m = STATUS_META[status] || STATUS_META.CREATED;
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, letterSpacing: 0.2, whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

function IconBadge({ Icon, color, bg }) {
  return (
    <div style={{ width: 38, height: 38, borderRadius: 11, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={18} color={color} strokeWidth={2.2} />
    </div>
  );
}

function PrimaryButton({ children, onClick, color = C.primary, disabled, icon: Icon, style }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: "100%", background: disabled ? C.border : color, color: disabled ? C.faint : "#fff",
        border: "none", borderRadius: 14, padding: "14px 16px", fontSize: 15.5, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: disabled ? "default" : "pointer",
        boxShadow: disabled ? "none" : `0 6px 14px -6px ${color}88`, transition: "transform .12s ease", ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.98)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {Icon && <Icon size={17} />}
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, color = C.ink2, icon: Icon }) {
  return (
    <button onClick={onClick} style={{ background: C.surface, color, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px", fontSize: 14.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", width: "100%" }}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, borderRadius: 16, padding: 14, boxShadow: "0 1px 2px rgba(16,24,38,0.04)", cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 2px 8px" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.ink2, letterSpacing: 0.2 }}>{children}</div>
      {right}
    </div>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 4px 12px" }}>
      {onBack ? (
        <button onClick={onBack} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={17} color={C.ink2} />
        </button>
      ) : <div style={{ width: 34 }} />}
      <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, flex: 1 }}>{title}</div>
      {right}
    </div>
  );
}

function EmptyState({ Icon = Info, title, hint }) {
  return (
    <div style={{ textAlign: "center", padding: "34px 18px", color: C.muted }}>
      <Icon size={26} style={{ marginBottom: 8, opacity: 0.6 }} />
      <div style={{ fontWeight: 700, color: C.ink2, fontSize: 14 }}>{title}</div>
      {hint && <div style={{ fontSize: 12.5, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function MoneySummary({ bruto, fee, net }) {
  return (
    <div style={{ background: C.ink, borderRadius: 16, padding: 16, color: "#fff" }}>
      <Row label="Bruto" value={money(bruto)} light />
      <Row label={`Comisión TaxiOS (${FEE_LABEL})`} value={"− " + money(fee)} light muted />
      <div style={{ height: 1, background: "rgba(255,255,255,0.14)", margin: "8px 0" }} />
      <Row label="Neto para ti" value={money(net)} light big />
    </div>
  );
}
function Row({ label, value, light, big, muted }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "3px 0" }}>
      <span style={{ fontSize: big ? 14 : 12.5, color: light ? (muted ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.85)") : C.muted, fontWeight: big ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: big ? 22 : 14, fontWeight: big ? 800 : 700, color: light ? "#fff" : C.ink, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function RideCard({ ride, onClick, showCompany }) {
  const company = COMPANIES.find((c) => c.id === ride.companyId);
  return (
    <Card onClick={onClick} style={{ marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ride.passenger}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={11} /> {ride.origin} <ChevronRight size={11} /> {ride.destination}
          </div>
        </div>
        <StatusChip status={ride.status} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 9 }}>
        <div style={{ fontSize: 11.5, color: C.faint, display: "flex", gap: 10 }}>
          <span><Clock size={11} style={{ verticalAlign: -1 }} /> {fmtTime(ride.scheduledAt)} · {fmtDate(ride.scheduledAt)}</span>
          {showCompany && company && <span><Building2 size={11} style={{ verticalAlign: -1 }} /> {company.name}</span>}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.ink2 }}>{money(ride.price)}</div>
      </div>
    </Card>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", background: C.borderSoft, borderRadius: 12, padding: 3, gap: 3 }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          style={{ flex: 1, padding: "8px 4px", borderRadius: 9, border: "none", cursor: "pointer",
            background: value === o.value ? C.surface : "transparent",
            color: value === o.value ? C.ink : C.muted, fontWeight: 700, fontSize: 12.5,
            boxShadow: value === o.value ? "0 1px 3px rgba(16,24,38,0.12)" : "none" }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}
const inputStyle = {
  width: "100%", border: `1px solid ${C.border}`, borderRadius: 11, padding: "11px 12px",
  fontSize: 14, color: C.ink, background: C.surface, boxSizing: "border-box", fontFamily: FONT_STACK,
};

function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(10,14,24,0.42)", zIndex: 50, display: "flex", alignItems: "flex-end", borderRadius: "inherit" }}>
      <div style={{ background: C.bg, width: "100%", maxHeight: "88%", borderTopLeftRadius: 22, borderTopRightRadius: 22, display: "flex", flexDirection: "column", boxShadow: "0 -8px 30px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "9px 0 2px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px" }}>
          <div style={{ fontWeight: 800, fontSize: 15.5, color: C.ink }}>{title}</div>
          <button onClick={onClose} style={{ background: C.borderSoft, border: "none", borderRadius: 9, width: 30, height: 30, cursor: "pointer" }}>
            <X size={15} color={C.ink2} />
          </button>
        </div>
        <div style={{ padding: "6px 16px 20px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ text, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "absolute", left: 16, right: 16, bottom: 92, zIndex: 60, background: C.ink, color: "#fff", padding: "11px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 20px rgba(0,0,0,0.25)" }}>
      <CheckCircle2 size={16} color="#8FE3B3" /> {text}
    </div>
  );
}

// Alerta de nueva solicitud entrante: aparece encima de cualquier pantalla del
// taxista (venga de Cliente, B2B o de una oferta simulada) y permite aceptar o
// rechazar sin tener que navegar a la pestaña Red.
function IncomingAlert({ ride, onAccept, onReject, onDismiss, onDetail }) {
  const company = COMPANIES.find((c) => c.id === ride.companyId);
  const originLabel =
    ride.source === "cliente" ? "Cliente buscando taxi" : ride.source === "b2b" ? `Reserva · ${company?.name || "empresa"}` : "Nueva oferta";
  return (
    <div style={{ position: "absolute", top: 10, left: 10, right: 10, zIndex: 80, animation: "taxiosSlideDown .35s ease" }}>
      <style>{`
        @keyframes taxiosSlideDown { from { transform: translateY(-24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes taxiosPing { 0% { transform: scale(0.9); opacity: 0.7; } 100% { transform: scale(1.5); opacity: 0; } }
      `}</style>
      <div style={{ background: "#101826", color: "#fff", borderRadius: 18, padding: 14, boxShadow: "0 16px 34px rgba(6,10,20,0.4)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
            <span style={{ position: "absolute", inset: -5, borderRadius: 16, border: "2px solid rgba(255,255,255,0.4)", animation: "taxiosPing 1.6s ease-out infinite" }} />
            <Bell size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={onDetail}>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.3, color: "#9FE3B8" }}>{originLabel.toUpperCase()}</div>
            <div style={{ fontWeight: 800, fontSize: 13.5, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ride.passenger}</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>{ride.origin} → {ride.destination}</div>
          </div>
          <button onClick={onDismiss} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", cursor: "pointer", padding: 2 }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "9px 2px 0" }}>
          <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)" }}><Clock size={11} style={{ verticalAlign: -1 }} /> {fmtTime(ride.scheduledAt)}</span>
          <span style={{ fontSize: 14, fontWeight: 800 }}>{money(ride.price)}</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
          <button onClick={onReject} style={{ flex: 1, background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 11, padding: "10px 0", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Rechazar</button>
          <button onClick={onAccept} style={{ flex: 1, background: C.success, border: "none", borderRadius: 11, padding: "10px 0", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// APP
// ---------------------------------------------------------------------
export default function App() {
  const [platform, setPlatform] = useState("ios");
  const [role, setRole] = useState("taxista");
  const [stacks, setStacks] = useState({ taxista: ["inicio"], cliente: ["inicio"], b2b: ["dashboard"], admin: ["dashboard"] });
  const [rides, setRides] = useState(SEED_RIDES);
  const [expenses, setExpenses] = useState(SEED_EXPENSES);
  const [invoices] = useState(SEED_INVOICES);
  const [driverStatus, setDriverStatus] = useState("disponible");
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [clienteRideId, setClienteRideId] = useState(null);
  const [loggedIn, setLoggedIn] = useState({ taxista: true, cliente: true, b2b: true, admin: true });
  const [incomingAlert, setIncomingAlert] = useState(null); // id del servicio con alerta activa
  const [alertQueue, setAlertQueue] = useState([]); // ids en espera si llegan varias a la vez
  const seenOfferIds = useRef(new Set(SEED_RIDES.map((r) => r.id)));
  const matchTimers = useRef(new Set());

  const push = (r, s) => setStacks((st) => ({ ...st, [r]: [...st[r], s] }));
  const pop = (r) => setStacks((st) => ({ ...st, [r]: st[r].length > 1 ? st[r].slice(0, -1) : st[r] }));
  const resetTo = (r, s) => setStacks((st) => ({ ...st, [r]: [s] }));
  const screen = (r) => stacks[r][stacks[r].length - 1];

  const selectedRide = rides.find((r) => r.id === selectedRideId) || null;

  function updateRide(id, patch, action) {
    setRides((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch, audit: action ? [...r.audit, newAudit(action)] : r.audit } : r)));
  }
  function addRide(r) { setRides((rs) => [r, ...rs]); return r; }

  function acceptOffer(id) { updateRide(id, { status: "ACCEPTED" }, "Servicio aceptado"); setToast("Servicio aceptado y añadido a tu agenda"); }
  function rejectOffer(id) { updateRide(id, { status: "CANCELLED", cancelReason: "Rechazado por el taxista" }, "Servicio rechazado"); setToast("Servicio rechazado"); }
  function deriveOffer(id) { updateRide(id, { status: "OFFERED", source: "red" }, "Ofrecido a la red de compañeros"); setToast("Ofrecido a tu red de compañeros"); }
  function advance(id) {
    const r = rides.find((x) => x.id === id);
    const step = NEXT_ACTION[r.status];
    if (!step) return;
    updateRide(id, { status: step.next }, step.label);
  }
  function confirmPayment(id, method) {
    const r = rides.find((x) => x.id === id);
    const fee = Math.round(r.price * FEE_RATE * 100) / 100;
    const net = Math.round((r.price - fee) * 100) / 100;
    updateRide(id, { status: "PAID", method, fee, net }, `Cobro confirmado (${method})`);
    setTimeout(() => updateRide(id, { status: "INVOICED" }, "Recibo/factura emitidos"), 250);
  }
  function markCompanyBilled(id) {
    updateRide(id, { status: "PAID", method: "empresa", fee: 0, net: rides.find(x=>x.id===id).price }, "Marcado para facturar a empresa");
    setTimeout(() => updateRide(id, { status: "INVOICED" }, "Factura generada para la empresa"), 250);
  }
  function addExpense(exp) { setExpenses((es) => [{ ...exp, id: uid("exp") }, ...es]); }

  // Motor de asignación simulado: los servicios marcados como "auto" (pedidos desde
  // Cliente o reservas B2B) pasan solos de PENDING_ASSIGNMENT a OFFERED tras una breve
  // búsqueda, igual que ocurriría al encontrar un taxista disponible cerca.
  useEffect(() => {
    rides.forEach((r) => {
      if (r.status === "PENDING_ASSIGNMENT" && r.auto && !matchTimers.current.has(r.id)) {
        matchTimers.current.add(r.id);
        setTimeout(() => {
          updateRide(r.id, { status: "OFFERED" }, "Taxista cercano encontrado, oferta enviada");
        }, 1500);
      }
    });
  }, [rides]);

  // Alertas de nueva solicitud: cualquier servicio que pase a OFFERED por primera vez
  // (alguien buscando taxi desde la app, una reserva B2B recién asignada o una oferta
  // simulada) entra en la cola de alertas para el taxista, con opción de aceptar o
  // rechazar directamente desde la alerta.
  useEffect(() => {
    const nuevas = [];
    rides.forEach((r) => {
      if (r.status === "OFFERED" && !seenOfferIds.current.has(r.id)) {
        seenOfferIds.current.add(r.id);
        nuevas.push(r.id);
      }
    });
    if (nuevas.length) setAlertQueue((q) => [...q, ...nuevas]);
  }, [rides]);

  useEffect(() => {
    if (!incomingAlert && alertQueue.length > 0) {
      setIncomingAlert(alertQueue[0]);
      setAlertQueue((q) => q.slice(1));
    }
  }, [alertQueue, incomingAlert]);

  const alertRide = rides.find((r) => r.id === incomingAlert) || null;
  const pendingOffersCount = rides.filter((r) => r.status === "OFFERED").length;

  const todayStr = new Date().toDateString();
  const todaysPaid = rides.filter((r) => ["PAID", "INVOICED", "CLOSED"].includes(r.status) && new Date(r.scheduledAt).toDateString() === todayStr);
  const todaysEarnings = todaysPaid.reduce((s, r) => s + r.price, 0);
  const weekPaid = rides.filter((r) => ["PAID", "INVOICED", "CLOSED"].includes(r.status));
  const weekEarnings = weekPaid.reduce((s, r) => s + r.price, 0);

  const ctx = {
    platform, role, rides, expenses, invoices, driverStatus, setDriverStatus,
    selectedRide, selectedRideId, setSelectedRideId, selectedCustomerId, setSelectedCustomerId,
    selectedCompanyId, setSelectedCompanyId, push, pop, resetTo, screen,
    acceptOffer, rejectOffer, deriveOffer, advance, confirmPayment, markCompanyBilled,
    addExpense, addRide, updateRide, setToast, todaysEarnings, todaysPaid, weekEarnings,
    clienteRideId, setClienteRideId, loggedIn, setLoggedIn, setRole, pendingOffersCount,
  };

  const isPortal = role === "b2b" || role === "admin";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#EEF1F7,#E4E9F2)", fontFamily: FONT_STACK, display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 12px 40px" }}>
      <Header platform={platform} setPlatform={setPlatform} role={role} setRole={setRole} pendingOffersCount={pendingOffersCount} />
      {!isPortal ? (
        <PhoneFrame platform={platform}>
          <StatusBar platform={platform} />
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px 0", position: "relative" }} id="scrollArea">
            {role === "taxista" ? <TaxistaRoot ctx={ctx} /> : <ClienteRoot ctx={ctx} />}
            {toast && <Toast text={toast} onDone={() => setToast(null)} />}
          </div>
          {role === "taxista" && <TaxistaTabBar screen={screen("taxista")} onTab={(s) => resetTo("taxista", s)} platform={platform} />}
          {role === "taxista" && alertRide && (
            <IncomingAlert
              ride={alertRide}
              onAccept={() => { acceptOffer(alertRide.id); setIncomingAlert(null); resetTo("taxista", "agenda"); }}
              onReject={() => { rejectOffer(alertRide.id); setIncomingAlert(null); }}
              onDismiss={() => setIncomingAlert(null)}
              onDetail={() => { setSelectedRideId(alertRide.id); setIncomingAlert(null); push("taxista", "oferta"); }}
            />
          )}
        </PhoneFrame>
      ) : (
        <PortalFrame>
          {role === "b2b" ? <B2BRoot ctx={ctx} /> : <AdminRoot ctx={ctx} />}
        </PortalFrame>
      )}
      <div style={{ marginTop: 14, fontSize: 11.5, color: "#8592AC", textAlign: "center", maxWidth: 420, lineHeight: 1.5 }}>
        Prototipo con datos simulados · Municipio piloto La Carlota · Pagos y OCR en modo sandbox/mock, sin PSP real conectado.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// CABECERA DE CONTROL DEL PROTOTIPO (no forma parte de la app real)
// ---------------------------------------------------------------------
function Header({ platform, setPlatform, role, setRole, pendingOffersCount }) {
  return (
    <div style={{ width: "100%", maxWidth: 920, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 900, color: C.ink, letterSpacing: -0.3, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary}, ${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Car size={16} color="#fff" />
          </div>
          TaxiOS <span style={{ fontWeight: 600, color: C.faint, fontSize: 13 }}>· prototipo</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", background: "#fff", borderRadius: 11, border: `1px solid ${C.border}`, padding: 3, gap: 2 }}>
          {[["taxista", "Taxista"], ["cliente", "Cliente"], ["b2b", "B2B"], ["admin", "Admin"]].map(([v, l]) => (
            <button key={v} onClick={() => setRole(v)} style={{ position: "relative", padding: "7px 11px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: role === v ? C.ink : "transparent", color: role === v ? "#fff" : C.muted }}>
              {l}
              {v === "taxista" && pendingOffersCount > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, minWidth: 15, height: 15, padding: "0 3px", borderRadius: 999, background: C.danger, color: "#fff", fontSize: 9.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #fff" }}>
                  {pendingOffersCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {(role === "taxista" || role === "cliente") && (
          <div style={{ display: "flex", background: "#fff", borderRadius: 11, border: `1px solid ${C.border}`, padding: 3, gap: 2 }}>
            {[["ios", "iOS"], ["android", "Android"]].map(([v, l]) => (
              <button key={v} onClick={() => setPlatform(v)} style={{ padding: "7px 11px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: platform === v ? C.primary : "transparent", color: platform === v ? "#fff" : C.muted }}>{l}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PhoneFrame({ platform, children }) {
  const radius = platform === "ios" ? 44 : 28;
  return (
    <div style={{ width: 380, height: 790, background: "#0B0F17", borderRadius: radius + 8, padding: 9, boxShadow: "0 30px 60px -20px rgba(10,14,24,0.45), 0 0 0 1px rgba(10,14,24,0.06)" }}>
      <div style={{ width: "100%", height: "100%", background: C.bg, borderRadius: radius, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

function StatusBar({ platform }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: platform === "ios" ? "16px 24px 4px" : "10px 16px 2px", fontSize: 12.5, fontWeight: 700, color: C.ink }}>
      <span>{new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date())}</span>
      {platform === "ios" ? (
        <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 110, height: 24, background: "#000", borderRadius: 16 }} />
      ) : null}
      <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <Smartphone size={13} /> 5G <span style={{ display: "inline-block", width: 18, height: 10, border: "1.5px solid #101826", borderRadius: 3 }} />
      </span>
    </div>
  );
}

function PortalFrame({ children }) {
  return (
    <div style={{ width: "100%", maxWidth: 1080, background: "#fff", borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: "0 20px 45px -25px rgba(10,14,24,0.35)", overflow: "hidden", minHeight: 680, display: "flex" }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — TAB BAR
// ---------------------------------------------------------------------
function TaxistaTabBar({ screen, onTab, platform }) {
  const tabs = [
    { k: "inicio", label: "Inicio", Icon: Home },
    { k: "agenda", label: "Agenda", Icon: Calendar },
    { k: "negocio", label: "Negocio", Icon: Wallet },
    { k: "red", label: "Red", Icon: Route },
    { k: "mas", label: "Más", Icon: MoreHorizontal },
  ];
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, background: "rgba(255,255,255,0.96)", padding: platform === "ios" ? "8px 6px 16px" : "8px 6px 10px" }}>
      {tabs.map(({ k, label, Icon }) => {
        const active = screen === k;
        return (
          <button key={k} onClick={() => onTab(k)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 0" }}>
            <Icon size={20} color={active ? C.primary : C.faint} strokeWidth={active ? 2.4 : 2} />
            <span style={{ fontSize: 10.5, fontWeight: active ? 800 : 600, color: active ? C.primary : C.faint }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — ROOT ROUTER
// ---------------------------------------------------------------------
function TaxistaRoot({ ctx }) {
  const s = ctx.screen("taxista");
  if (!ctx.loggedIn.taxista) return <LoginScreen role="taxista" ctx={ctx} />;
  switch (s) {
    case "inicio": return <TaxHome ctx={ctx} />;
    case "agenda": return <TaxAgenda ctx={ctx} />;
    case "negocio": return <TaxNegocio ctx={ctx} />;
    case "red": return <TaxRed ctx={ctx} />;
    case "mas": return <TaxMas ctx={ctx} />;
    case "rideDetail": return <TaxRideDetail ctx={ctx} />;
    case "oferta": return <TaxOferta ctx={ctx} />;
    case "servicioActivo": return <TaxServicioActivo ctx={ctx} />;
    case "cobrar": return <TaxCobrar ctx={ctx} />;
    case "confirmCobro": return <TaxConfirmCobro ctx={ctx} />;
    case "altaServicio": return <TaxAltaServicio ctx={ctx} />;
    case "operacionExterna": return <TaxOperacionExterna ctx={ctx} />;
    case "gastos": return <TaxGastos ctx={ctx} />;
    case "ocr": return <TaxOCR ctx={ctx} />;
    case "clientes": return <TaxClientes ctx={ctx} />;
    case "clienteDetalle": return <TaxClienteDetalle ctx={ctx} />;
    case "empresas": return <TaxEmpresas ctx={ctx} />;
    case "empresaDetalle": return <TaxEmpresaDetalle ctx={ctx} />;
    case "vehiculo": return <TaxVehiculo ctx={ctx} />;
    case "documentos": return <TaxDocumentos ctx={ctx} />;
    case "liquidaciones": return <TaxLiquidaciones ctx={ctx} />;
    default: return <TaxHome ctx={ctx} />;
  }
}

function LoginScreen({ role, ctx }) {
  const [step, setStep] = useState("login");
  const label = role === "taxista" ? "taxista" : "cliente";
  return (
    <div style={{ padding: "40px 6px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ width: 54, height: 54, borderRadius: 15, background: `linear-gradient(135deg, ${C.primary}, ${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
        <Car size={26} color="#fff" />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: C.ink }}>Acceso {label}</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 20 }}>Entra con tu cuenta TaxiOS</div>
      {step === "login" && (
        <>
          <Field label="Teléfono o email"><input style={inputStyle} defaultValue={role === "taxista" ? "rafael.ordonez@taxios.demo" : "cliente.demo@taxios.demo"} /></Field>
          <Field label="Contraseña"><input style={inputStyle} type="password" defaultValue="••••••••" /></Field>
          <div style={{ background: C.borderSoft, borderRadius: 12, padding: 10, fontSize: 12, color: C.muted, marginBottom: 16 }}>
            Entorno demo — credenciales ya rellenadas para la prueba.
          </div>
          <PrimaryButton onClick={() => ctx.setLoggedIn((l) => ({ ...l, [role]: true }))}>Entrar</PrimaryButton>
          {role === "taxista" && <div style={{ marginTop: 10 }}><GhostButton onClick={() => setStep("onboarding1")}>Crear cuenta de taxista</GhostButton></div>}
          <div style={{ textAlign: "center", fontSize: 12.5, color: C.primary, marginTop: 14, fontWeight: 700, cursor: "pointer" }}>Recuperar contraseña</div>
        </>
      )}
      {step === "onboarding1" && <OnboardingMini ctx={ctx} onDone={() => ctx.setLoggedIn((l) => ({ ...l, taxista: true }))} />}
    </div>
  );
}

function OnboardingMini({ ctx, onDone }) {
  const [n, setN] = useState(1);
  const steps = [
    { t: "Datos personales y licencia", body: <>
      <Field label="Nombre completo"><input style={inputStyle} placeholder="Ej. Rafael Ordóñez" /></Field>
      <Field label="Nº de licencia"><input style={inputStyle} placeholder="TX-0000" /></Field>
    </> },
    { t: "Municipio y ámbito", body: <>
      <Field label="Municipio principal"><select style={inputStyle} defaultValue="La Carlota">{NUCLEOS.map(n=><option key={n}>{n}</option>)}</select></Field>
    </> },
    { t: "Vehículo", body: <>
      <Field label="Matrícula"><input style={inputStyle} placeholder="0000 ABC" /></Field>
      <Field label="Marca y modelo"><input style={inputStyle} placeholder="Toyota Corolla" /></Field>
    </> },
    { t: "Cobros preferidos", body: <>
      <Field label="Métodos que aceptas"><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["Efectivo","Tarjeta","Bizum"].map(m=>(<span key={m} style={{background:C.successBg,color:C.success,fontSize:12,fontWeight:700,padding:"6px 10px",borderRadius:999}}>{m} ✓</span>))}</div></Field>
    </> },
  ];
  const cur = steps[n-1];
  return (
    <div>
      <div style={{ display:"flex", gap:5, marginBottom:16 }}>
        {steps.map((_,i)=>(<div key={i} style={{flex:1,height:5,borderRadius:3,background: i<n?C.primary:C.border}} />))}
      </div>
      <div style={{ fontSize:15, fontWeight:800, marginBottom:12 }}>{n}. {cur.t}</div>
      {cur.body}
      <div style={{ display:"flex", gap:8, marginTop:8 }}>
        {n>1 && <div style={{flex:1}}><GhostButton onClick={()=>setN(n-1)}>Atrás</GhostButton></div>}
        <div style={{flex:2}}>
          <PrimaryButton onClick={()=> n<steps.length ? setN(n+1) : onDone()}>{n<steps.length? "Continuar" : "Ir al dashboard"}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — INICIO (T03)
// ---------------------------------------------------------------------
function TaxHome({ ctx }) {
  const proximo = ctx.rides.find((r) => ["ACCEPTED", "EN_ROUTE", "ARRIVED", "PASSENGER_ONBOARD", "IN_PROGRESS"].includes(r.status));
  const offersCount = ctx.rides.filter((r) => r.status === "OFFERED").length;
  const km = 187, kmVacio = 34;
  return (
    <div style={{ paddingBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 2px 2px" }}>
        <div>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Tu negocio hoy</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: C.ink }}>Hola, {ME.name.split(" ")[0]}</div>
        </div>
        <div style={{ position: "relative" }}>
          <Bell size={20} color={C.ink2} />
          {offersCount > 0 && <div style={{ position: "absolute", top: -3, right: -3, width: 9, height: 9, borderRadius: 9, background: C.danger, border: "1.5px solid #fff" }} />}
        </div>
      </div>

      <Card style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 8 }}>ESTADO OPERATIVO</div>
        <Segmented
          value={ctx.driverStatus}
          onChange={ctx.setDriverStatus}
          options={[
            { value: "disponible", label: "Disponible" },
            { value: "ocupado", label: "En servicio" },
            { value: "descanso", label: "Descanso" },
            { value: "fuera", label: "Fuera" },
          ]}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 12.5, color: ctx.driverStatus === "disponible" ? C.success : C.muted, fontWeight: 700 }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: ctx.driverStatus === "disponible" ? C.success : C.faint, boxShadow: ctx.driverStatus === "disponible" ? `0 0 0 4px ${C.successBg}` : "none" }} />
          {ctx.driverStatus === "disponible" ? "Listo para recibir servicios" : ctx.driverStatus === "ocupado" ? "En servicio, no visible a nuevas ofertas" : ctx.driverStatus === "descanso" ? "En descanso" : "Fuera de servicio"}
        </div>
      </Card>

      {proximo && (
        <Card style={{ marginTop: 10 }} onClick={() => { ctx.setSelectedRideId(proximo.id); ctx.push("taxista", "servicioActivo"); }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.primary, marginBottom: 6 }}>PRÓXIMO SERVICIO</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{proximo.passenger}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{proximo.origin} → {proximo.destination}</div>
            </div>
            <StatusChip status={proximo.status} />
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <MetricCard label="Ingresos hoy" value={money(ctx.todaysEarnings)} Icon={Wallet} color={C.success} />
        <MetricCard label="Servicios hoy" value={String(ctx.todaysPaid.length + (proximo ? 1 : 0))} Icon={ListChecks} color={C.primary} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <MetricCard label="Km hoy / vacío" value={`${km} / ${kmVacio}`} Icon={Gauge} color={C.cyan} />
        <MetricCard label="Rentabilidad/km" value={money((ctx.todaysEarnings || 42) / km)} Icon={TrendingUp} color={C.purple} />
      </div>

      <Card style={{ marginTop: 12, background: C.successBg, border: "none" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <IconBadge Icon={TrendingUp} color={C.success} bg="#fff" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.ink }}>Recomendación</div>
            <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 2 }}>Las tardes hacia Écija tienen tu mejor rentabilidad/km esta semana. Considera priorizar esa zona hoy.</div>
          </div>
        </div>
      </Card>

      <SectionTitle>Accesos rápidos</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <QuickAction label="Nuevo servicio" Icon={Plus} onClick={() => ctx.push("taxista", "altaServicio")} />
        <QuickAction label="Operación externa" Icon={Phone} onClick={() => ctx.push("taxista", "operacionExterna")} />
        <QuickAction label="Escanear gasto" Icon={Camera} onClick={() => ctx.push("taxista", "ocr")} />
        <QuickAction label="Agenda" Icon={Calendar} onClick={() => ctx.resetTo("taxista", "agenda")} />
      </div>

      <SectionTitle>Alertas</SectionTitle>
      <Card>
        <AlertRow Icon={AlertTriangle} color={C.warning} text="ITV del vehículo caduca en 34 días" />
        <div style={{ height: 1, background: C.borderSoft, margin: "8px 0" }} />
        <AlertRow Icon={Receipt} color={C.danger} text="1 cobro con pago fallido pendiente de reintento" onClick={() => ctx.resetTo("taxista", "negocio")} />
        <div style={{ height: 1, background: C.borderSoft, margin: "8px 0" }} />
        <AlertRow Icon={FileText} color={C.muted} text="Seguro del vehículo se renueva el 15/01" />
      </Card>
    </div>
  );
}
function AlertRow({ Icon, color, text, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 9, cursor: onClick ? "pointer" : "default" }}>
      <Icon size={15} color={color} />
      <div style={{ fontSize: 12.5, color: C.ink2, flex: 1 }}>{text}</div>
      <ChevronRight size={14} color={C.faint} />
    </div>
  );
}
function MetricCard({ label, value, Icon, color }) {
  return (
    <Card style={{ flex: 1 }}>
      <Icon size={16} color={color} />
      <div style={{ fontSize: 17, fontWeight: 900, color: C.ink, marginTop: 6 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{label}</div>
    </Card>
  );
}
function QuickAction({ label, Icon, onClick }) {
  return (
    <button onClick={onClick} style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, borderRadius: 15, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
      <IconBadge Icon={Icon} color={C.primary} bg="#E7EFFA" />
      <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — AGENDA (T05)
// ---------------------------------------------------------------------
function TaxAgenda({ ctx }) {
  const [view, setView] = useState("dia");
  const [filter, setFilter] = useState("todos");
  const todayStr = new Date().toDateString();
  let list = ctx.rides.filter((r) => (view === "dia" ? new Date(r.scheduledAt).toDateString() === todayStr : true));
  if (filter !== "todos") list = list.filter((r) => r.source === filter);
  list = [...list].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  return (
    <div>
      <TopBar title="Agenda" right={<button onClick={() => ctx.push("taxista", "altaServicio")} style={{ background: C.primary, border: "none", borderRadius: 10, width: 32, height: 32, cursor: "pointer" }}><Plus size={16} color="#fff" /></button>} />
      <Segmented value={view} onChange={setView} options={[{ value: "dia", label: "Día" }, { value: "semana", label: "Semana" }]} />
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginTop: 10, paddingBottom: 4 }}>
        {[["todos", "Todos"], ["manual", "Manual"], ["b2b", "Empresa"], ["cliente", "App"], ["red", "Red"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ flexShrink: 0, padding: "6px 11px", borderRadius: 999, border: `1px solid ${filter === v ? C.primary : C.border}`, background: filter === v ? C.primary : "#fff", color: filter === v ? "#fff" : C.ink2, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        {list.length === 0 && <EmptyState Icon={Calendar} title="Sin servicios" hint="Crea uno manual o espera nuevas ofertas." />}
        {list.map((r) => (
          <RideCard key={r.id} ride={r} showCompany onClick={() => { ctx.setSelectedRideId(r.id); ctx.push("taxista", r.status === "OFFERED" ? "oferta" : "rideDetail"); }} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — DETALLE DE SERVICIO (lectura, con rentabilidad T13 + auditoría)
// ---------------------------------------------------------------------
function TaxRideDetail({ ctx }) {
  const r = ctx.selectedRide;
  if (!r) return null;
  const company = COMPANIES.find((c) => c.id === r.companyId);
  const margen = r.price - r.km * 0.18 - r.kmVacio * 0.18;
  const nivel = margen > 15 ? "Alta" : margen > 7 ? "Media" : "Baja";
  const nivelColor = nivel === "Alta" ? C.success : nivel === "Media" ? C.warning : C.danger;
  const canResume = ["ACCEPTED", "EN_ROUTE", "ARRIVED", "PASSENGER_ONBOARD", "IN_PROGRESS"].includes(r.status);
  return (
    <div>
      <TopBar title="Detalle del servicio" onBack={() => ctx.pop("taxista")} />
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{r.passenger}</div>
          <StatusChip status={r.status} />
        </div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
          <span><MapPin size={12} style={{ verticalAlign: -1 }} /> {r.origin} → {r.destination}</span>
          <span><Clock size={12} style={{ verticalAlign: -1 }} /> {fmtDate(r.scheduledAt, { day: "2-digit", month: "long" })}, {fmtTime(r.scheduledAt)}</span>
          {company && <span><Building2 size={12} style={{ verticalAlign: -1 }} /> {company.name} · {r.costCenter}</span>}
          {r.phone && <span><Phone size={12} style={{ verticalAlign: -1 }} /> {r.phone}</span>}
          {r.notes && <span style={{ marginTop: 4, fontStyle: "italic" }}>"{r.notes}"</span>}
        </div>
      </Card>

      <SectionTitle>Rentabilidad</SectionTitle>
      <Card>
        <Row label="Ingreso" value={money(r.price)} />
        <Row label="Km con cliente / en vacío" value={`${r.km} km / ${r.kmVacio} km`} />
        <Row label="Combustible estimado" value={money((r.km + r.kmVacio) * 0.07)} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>Señal de rentabilidad</span>
          <span style={{ background: nivelColor + "22", color: nivelColor, fontWeight: 800, fontSize: 12, padding: "4px 10px", borderRadius: 999 }}>{nivel}</span>
        </div>
      </Card>

      {canResume && (
        <div style={{ marginTop: 14 }}>
          <PrimaryButton onClick={() => ctx.push("taxista", "servicioActivo")}>Retomar servicio</PrimaryButton>
        </div>
      )}

      <SectionTitle>Auditoría</SectionTitle>
      <Card>
        {r.audit.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 9, padding: "6px 0", borderTop: i > 0 ? `1px solid ${C.borderSoft}` : "none" }}>
            <div style={{ width: 6, height: 6, borderRadius: 6, background: C.primary, marginTop: 5, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{a.action}</div>
              <div style={{ fontSize: 11, color: C.faint }}>{a.actor} · {fmtDate(a.ts, { day: "2-digit", month: "short" })} {fmtTime(a.ts)}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — OFERTA ENTRANTE (T04)
// ---------------------------------------------------------------------
function TaxOferta({ ctx }) {
  const r = ctx.selectedRide;
  if (!r) return null;
  const company = COMPANIES.find((c) => c.id === r.companyId);
  const margen = r.price - r.km * 0.18 - r.kmVacio * 0.18;
  const nivel = margen > 15 ? "Alta" : margen > 7 ? "Media" : "Baja";
  return (
    <div>
      <TopBar title="Oferta de servicio" onBack={() => ctx.pop("taxista")} />
      <div style={{ textAlign: "center", fontWeight: 800, fontSize: 15, color: C.ink, marginBottom: 10 }}>¿Quieres aceptar este servicio?</div>
      <Card>
        <Row label="Pasajero" value={r.passenger} />
        <Row label="Origen" value={r.origin} />
        <Row label="Destino" value={r.destination} />
        <Row label="Hora" value={fmtTime(r.scheduledAt)} />
        <Row label="Distancia hasta recogida" value={`${randInt(1, 8)} km`} />
        <Row label="Pagador" value={r.payer === "empresa" ? (company?.name || "Empresa") : "Pasajero"} />
        <Row label="Importe estimado" value={money(r.price)} />
        {r.notes && <div style={{ fontSize: 12, color: C.muted, marginTop: 8, fontStyle: "italic" }}>{r.notes}</div>}
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>Rentabilidad estimada</span>
          <span style={{ color: nivel === "Alta" ? C.success : nivel === "Media" ? C.warning : C.danger, fontWeight: 800, fontSize: 12.5 }}>{nivel}</span>
        </div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 16 }}>
        <PrimaryButton icon={Check} color={C.success} onClick={() => { ctx.acceptOffer(r.id); ctx.resetTo("taxista", "agenda"); }}>Aceptar</PrimaryButton>
        <GhostButton icon={Route} onClick={() => { ctx.deriveOffer(r.id); ctx.pop("taxista"); }}>Ofrecer a mi red</GhostButton>
        <GhostButton icon={X} color={C.danger} onClick={() => { ctx.rejectOffer(r.id); ctx.pop("taxista"); }}>Rechazar</GhostButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — SERVICIO ACEPTADO / EN CURSO (T07 + T08)
// ---------------------------------------------------------------------
function TaxServicioActivo({ ctx }) {
  const r = ctx.selectedRide;
  if (!r) return null;
  const step = NEXT_ACTION[r.status];
  const stageIdx = RIDE_STEPS.indexOf(r.status);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Servicio activo" onBack={() => ctx.pop("taxista")} />
      <Card style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: C.muted }}>{fmtTime(r.scheduledAt)} · {r.passenger}</div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{r.origin} → {r.destination}</div>
          </div>
          <StatusChip status={r.status} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <MiniAction Icon={Phone} label="Llamar" />
          <MiniAction Icon={MessageCircle} label="Mensaje" />
          <MiniAction Icon={Navigation} label="Navegar" />
        </div>
      </Card>

      <div style={{ flex: 1, background: "#DCE6F5", borderRadius: 18, position: "relative", overflow: "hidden", minHeight: 190 }}>
        <svg width="100%" height="100%" viewBox="0 0 300 200" style={{ position: "absolute", inset: 0 }}>
          <path d="M20 170 C 80 60, 180 160, 280 40" stroke={C.primary} strokeWidth="4" fill="none" strokeDasharray="2 10" strokeLinecap="round" opacity="0.55" />
          <circle cx="20" cy="170" r="7" fill={C.success} />
          <circle cx="280" cy="40" r="7" fill={C.danger} />
        </svg>
        <div style={{ position: "absolute", bottom: 10, left: 10, background: "#fff", borderRadius: 10, padding: "6px 10px", fontSize: 11.5, fontWeight: 700, color: C.ink2, display:"flex",alignItems:"center",gap:6 }}>
          <MapPin size={12} color={C.primary}/> Mapa simulado del trayecto
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <StageTracker stageIdx={stageIdx} />
      </div>

      <div style={{ marginTop: 14 }}>
        {step ? (
          <PrimaryButton onClick={() => {
            ctx.advance(r.id);
            if (step.next === "COMPLETED") ctx.push("taxista", "cobrar");
          }}>{step.label}</PrimaryButton>
        ) : (
          <GhostButton onClick={() => ctx.resetTo("taxista", "agenda")}>Volver a agenda</GhostButton>
        )}
      </div>
    </div>
  );
}
function MiniAction({ Icon, label }) {
  return (
    <div style={{ flex: 1, background: C.borderSoft, borderRadius: 11, padding: "8px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
      <Icon size={15} color={C.ink2} />
      <span style={{ fontSize: 10.5, fontWeight: 700, color: C.ink2 }}>{label}</span>
    </div>
  );
}
function StageTracker({ stageIdx }) {
  const labels = ["Aceptado", "En camino", "Llegada", "A bordo", "En curso", "Finalizado"];
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {labels.map((l, i) => (
        <div key={l} style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            {i <= stageIdx ? <CheckCircle2 size={16} color={C.primary} /> : <Circle size={16} color={C.border} />}
            <span style={{ fontSize: 8.5, fontWeight: 700, color: i <= stageIdx ? C.primary : C.faint, textAlign: "center" }}>{l}</span>
          </div>
          {i < labels.length - 1 && <div style={{ flex: 1, height: 2, background: i < stageIdx ? C.primary : C.border, marginBottom: 14 }} />}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — FINALIZAR / COBRAR (T09) + CONFIRMACIÓN (T10)
// ---------------------------------------------------------------------
function TaxCobrar({ ctx }) {
  const r = ctx.selectedRide;
  if (!r) return null;
  const [amount, setAmount] = useState(r.price);
  const [method, setMethod] = useState(r.payer === "empresa" ? "empresa" : "tarjeta");
  const fee = Math.round(amount * FEE_RATE * 100) / 100;
  const net = Math.round((amount - fee) * 100) / 100;
  const [processing, setProcessing] = useState(false);
  const company = COMPANIES.find((c) => c.id === r.companyId);

  function confirm() {
    if (r.payer === "empresa") {
      ctx.markCompanyBilled(r.id);
      ctx.push("taxista", "confirmCobro");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      ctx.confirmPayment(r.id, method);
      ctx.push("taxista", "confirmCobro");
    }, 900);
  }

  return (
    <div>
      <TopBar title="Finalizar y cobrar" onBack={() => ctx.pop("taxista")} />
      <Card>
        <div style={{ fontSize: 12, color: C.muted }}>{r.passenger} · {r.origin} → {r.destination}</div>
        <Field label="Importe final">
          <input style={{ ...inputStyle, fontSize: 20, fontWeight: 800 }} type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
        </Field>
      </Card>

      {r.payer === "empresa" ? (
        <Card style={{ marginTop: 10, background: C.purpleBg, border: "none" }}>
          <div style={{ display: "flex", gap: 9 }}>
            <IconBadge Icon={Building2} color={C.purple} bg="#fff" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>Paga {company?.name || "la empresa"}</div>
              <div style={{ fontSize: 12, color: C.ink2 }}>No es necesario cobrar al pasajero. Se generará factura a la empresa.</div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <SectionTitle>Método de cobro</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { v: "tarjeta", l: "Tarjeta / SoftPOS", Icon: CreditCard },
              { v: "bizum", l: "Bizum / enlace", Icon: Smartphone },
              { v: "efectivo", l: "Efectivo", Icon: Banknote },
              { v: "wallet", l: "Wallet (próx.)", Icon: QrCode },
            ].map((m) => (
              <button key={m.v} onClick={() => setMethod(m.v)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 10px", borderRadius: 13, cursor: "pointer", border: `1.5px solid ${method === m.v ? C.primary : C.border}`, background: method === m.v ? "#E7EFFA" : "#fff" }}>
                <m.Icon size={16} color={method === m.v ? C.primary : C.ink2} />
                <span style={{ fontSize: 12, fontWeight: 700, color: method === m.v ? C.primary : C.ink2 }}>{m.l}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 14 }}>
        <MoneySummary bruto={amount} fee={r.payer === "empresa" ? 0 : fee} net={r.payer === "empresa" ? amount : net} />
      </div>

      <div style={{ marginTop: 14 }}>
        <PrimaryButton disabled={processing} onClick={confirm}>{processing ? "Procesando cobro…" : "Finalizar y cobrar"}</PrimaryButton>
      </div>
    </div>
  );
}

function TaxConfirmCobro({ ctx }) {
  const r = ctx.selectedRide;
  if (!r) return null;
  return (
    <div>
      <TopBar title="Cobro confirmado" onBack={() => ctx.resetTo("taxista", "agenda")} />
      <div style={{ textAlign: "center", padding: "10px 0 16px" }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: C.successBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
          <CheckCircle2 size={28} color={C.success} />
        </div>
        <div style={{ fontWeight: 900, fontSize: 16 }}>{r.payer === "empresa" ? "Servicio facturado a empresa" : "Cobro registrado"}</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{r.method === "efectivo" ? "Efectivo · registrado como cobrado" : r.payer === "empresa" ? "Se generó factura automáticamente" : "Estado de liquidación: incluido en próximo pago"}</div>
      </div>
      <MoneySummary bruto={r.price} fee={r.payer === "empresa" ? 0 : Math.round(r.price * FEE_RATE * 100) / 100} net={r.payer === "empresa" ? r.price : Math.round(r.price * (1 - FEE_RATE) * 100) / 100} />
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <GhostButton icon={Share2} onClick={() => ctx.setToast("Recibo compartido por WhatsApp (simulado)")}>WhatsApp</GhostButton>
        <GhostButton icon={FileText} onClick={() => ctx.setToast("PDF del recibo generado (simulado)")}>PDF</GhostButton>
      </div>
      <div style={{ marginTop: 16 }}>
        <PrimaryButton onClick={() => ctx.resetTo("taxista", "agenda")}>Cerrar</PrimaryButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — ALTA MANUAL (T06) Y OPERACIÓN EXTERNA (T11)
// ---------------------------------------------------------------------
function TaxAltaServicio({ ctx }) {
  const [origin, setOrigin] = useState("La Carlota");
  const [destination, setDestination] = useState("Córdoba capital");
  const [passenger, setPassenger] = useState("");
  const [phone, setPhone] = useState("");
  const [payer, setPayer] = useState("pasajero");
  const [companyId, setCompanyId] = useState("");
  const [price, setPrice] = useState(18);
  const [notes, setNotes] = useState("");

  function save(startNow) {
    const r = mkRide({
      source: "manual", passenger: passenger || "Pasajero sin nombre", phone, origin, destination,
      payer, companyId: companyId || null, price, notes,
      status: startNow ? "ACCEPTED" : "CREATED",
      scheduledAt: nowISO(),
    });
    ctx.addRide(r);
    ctx.setSelectedRideId(r.id);
    ctx.setToast(startNow ? "Servicio iniciado" : "Reserva guardada en agenda");
    if (startNow) ctx.push("taxista", "servicioActivo"); else ctx.resetTo("taxista", "agenda");
  }

  return (
    <div>
      <TopBar title="Nuevo servicio" onBack={() => ctx.pop("taxista")} />
      <Field label="Origen"><input style={inputStyle} value={origin} onChange={(e) => setOrigin(e.target.value)} /></Field>
      <Field label="Destino"><input style={inputStyle} value={destination} onChange={(e) => setDestination(e.target.value)} /></Field>
      <Field label="Cliente / pasajero"><input style={inputStyle} placeholder="Nombre" value={passenger} onChange={(e) => setPassenger(e.target.value)} /></Field>
      <Field label="Teléfono (opcional)"><input style={inputStyle} placeholder="+34 6XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
      <Field label="Pagador">
        <Segmented value={payer} onChange={setPayer} options={[{ value: "pasajero", label: "Pasajero" }, { value: "empresa", label: "Empresa" }]} />
      </Field>
      {payer === "empresa" && (
        <Field label="Empresa">
          <select style={inputStyle} value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            <option value="">Selecciona…</option>
            {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      )}
      <Field label="Precio pactado (€)"><input style={inputStyle} type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} /></Field>
      <Field label="Observaciones"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <div style={{ flex: 1 }}><GhostButton onClick={() => save(false)}>Guardar reserva</GhostButton></div>
        <div style={{ flex: 1 }}><PrimaryButton onClick={() => save(true)}>Iniciar ahora</PrimaryButton></div>
      </div>
    </div>
  );
}

function TaxOperacionExterna({ ctx }) {
  const [origin, setOrigin] = useState("La Carlota");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState(12);
  const [method, setMethod] = useState("efectivo");
  const [via, setVia] = useState("Teléfono");
  function save() {
    const fee = Math.round(amount * FEE_RATE * 100) / 100;
    const r = mkRide({
      source: "manual", passenger: `Carrera recibida por ${via.toLowerCase()}`, origin, destination: destination || "Destino no especificado",
      status: "INVOICED", payer: "pasajero", method, price: amount, fee, net: amount - fee, scheduledAt: nowISO(),
      notes: `Operación externa registrada manualmente (${via})`,
    });
    ctx.addRide(r);
    ctx.setToast("Operación externa registrada en tu negocio");
    ctx.resetTo("taxista", "negocio");
  }
  return (
    <div>
      <TopBar title="Operación externa" onBack={() => ctx.pop("taxista")} />
      <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10 }}>Registra una carrera recibida por llamada, WhatsApp, parada o emisora para que quede en tu negocio.</div>
      <Field label="Recibida por">
        <Segmented value={via} onChange={setVia} options={[{ value: "Teléfono", label: "Teléfono" }, { value: "WhatsApp", label: "WhatsApp" }, { value: "Parada", label: "Parada" }, { value: "Emisora", label: "Emisora" }]} />
      </Field>
      <Field label="Origen"><input style={inputStyle} value={origin} onChange={(e) => setOrigin(e.target.value)} /></Field>
      <Field label="Destino"><input style={inputStyle} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Opcional" /></Field>
      <Field label="Importe (€)"><input style={inputStyle} type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} /></Field>
      <Field label="Método de cobro">
        <Segmented value={method} onChange={setMethod} options={[{ value: "efectivo", label: "Efectivo" }, { value: "tarjeta", label: "Tarjeta" }, { value: "bizum", label: "Bizum" }]} />
      </Field>
      <PrimaryButton onClick={save}>Registrar operación</PrimaryButton>
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — NEGOCIO / DASHBOARD (T12) + LIQUIDACIONES (T17)
// ---------------------------------------------------------------------
function TaxNegocio({ ctx }) {
  const paidRides = ctx.rides.filter((r) => ["PAID", "INVOICED", "CLOSED"].includes(r.status));
  const month = paidRides.reduce((s, r) => s + r.price, 0);
  const comm = Math.round(month * FEE_RATE * 100) / 100;
  const profit = month - comm - ctx.expenses.reduce((s, e) => s + e.total, 0) * 0.3;
  const objetivo = 2400, pct = Math.min(100, Math.round((month / objetivo) * 100));
  const topClientes = {};
  paidRides.forEach((r) => { topClientes[r.passenger] = (topClientes[r.passenger] || 0) + r.price; });
  const top3 = Object.entries(topClientes).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const horas = [["8-10h", 62], ["12-14h", 48], ["18-20h", 91], ["22-00h", 74]];

  return (
    <div>
      <TopBar title="Negocio" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <MetricCard label="Hoy" value={money(ctx.todaysEarnings)} Icon={Wallet} color={C.primary} />
        <MetricCard label="Últimos servicios" value={money(month)} Icon={TrendingUp} color={C.success} />
      </div>
      <Card style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink2 }}>Objetivo mensual</span>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: C.primary }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: C.borderSoft, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.primary}, ${C.cyan})` }} />
        </div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 5 }}>{money(month)} de {money(objetivo)}</div>
      </Card>

      <SectionTitle>Rentabilidad</SectionTitle>
      <Card>
        <Row label="Beneficio estimado" value={money(profit)} />
        <Row label="Comisiones TaxiOS" value={"− " + money(comm)} />
        <Row label="Rentabilidad/km" value={money(month / 800)} />
        <Row label="Km en vacío (semana)" value="112 km" />
      </Card>

      <SectionTitle>Horas más rentables</SectionTitle>
      <Card>
        {horas.map(([h, v]) => (
          <div key={h} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <span style={{ fontSize: 11.5, width: 48, color: C.muted, fontWeight: 700 }}>{h}</span>
            <div style={{ flex: 1, height: 8, background: C.borderSoft, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ width: `${v}%`, height: "100%", background: C.cyan, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </Card>

      <SectionTitle>Clientes / empresas top</SectionTitle>
      <Card>
        {top3.map(([n, v], i) => (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
            <span style={{ fontSize: 12.5, color: C.ink2 }}>{i + 1}. {n}</span>
            <span style={{ fontSize: 12.5, fontWeight: 800 }}>{money(v)}</span>
          </div>
        ))}
      </Card>

      <SectionTitle>Accesos</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <QuickAction label="Gastos" Icon={Receipt} onClick={() => ctx.push("taxista", "gastos")} />
        <QuickAction label="Liquidaciones" Icon={ClipboardList} onClick={() => ctx.push("taxista", "liquidaciones")} />
      </div>

      <Card style={{ marginTop: 14, background: C.borderSoft, border: "none" }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: C.ink2, marginBottom: 4 }}>RESUMEN FISCAL ORIENTATIVO</div>
        <Row label="Ingresos del periodo" value={money(month)} />
        <Row label="Gastos deducibles" value={money(ctx.expenses.reduce((s, e) => s + e.total, 0))} />
        <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>Resumen orientativo para tu gestoría — no sustituye la presentación oficial de impuestos.</div>
      </Card>
    </div>
  );
}

function TaxLiquidaciones({ ctx }) {
  const settled = ctx.rides.filter((r) => ["PAID", "INVOICED", "CLOSED"].includes(r.status));
  const bruto = settled.reduce((s, r) => s + r.price, 0);
  const comm = Math.round(bruto * FEE_RATE * 100) / 100;
  return (
    <div>
      <TopBar title="Liquidaciones" onBack={() => ctx.pop("taxista")} />
      <MoneySummary bruto={bruto} fee={comm} net={bruto - comm} />
      <SectionTitle>Próximo pago</SectionTitle>
      <Card>
        <Row label="Fecha estimada" value={fmtDate(daysFromNow(3), { day: "2-digit", month: "long" })} />
        <Row label="Destino de fondos" value="IBAN ES91 •••• 4521" />
        <Row label="Devoluciones" value={money(0)} />
      </Card>
      <SectionTitle>Detalle por servicio</SectionTitle>
      {settled.slice(0, 8).map((r) => (
        <RideCard key={r.id} ride={r} onClick={() => { ctx.setSelectedRideId(r.id); ctx.push("taxista", "rideDetail"); }} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — GASTOS (T14) + OCR (T15)
// ---------------------------------------------------------------------
function TaxGastos({ ctx }) {
  const [cat, setCat] = useState("todos");
  const list = ctx.expenses.filter((e) => cat === "todos" || e.categoria === cat);
  const total = list.reduce((s, e) => s + e.total, 0);
  return (
    <div>
      <TopBar title="Gastos" onBack={() => ctx.pop("taxista")} right={<button onClick={() => ctx.push("taxista", "ocr")} style={{ background: C.primary, border: "none", borderRadius: 10, width: 32, height: 32, cursor: "pointer" }}><Camera size={15} color="#fff" /></button>} />
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 }}>
        {["todos", ...EXPENSE_CATS].map((c) => (
          <button key={c} onClick={() => setCat(c)} style={{ flexShrink: 0, padding: "6px 11px", borderRadius: 999, border: `1px solid ${cat === c ? C.primary : C.border}`, background: cat === c ? C.primary : "#fff", color: cat === c ? "#fff" : C.ink2, fontSize: 11.5, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>{c}</button>
        ))}
      </div>
      <Card style={{ marginTop: 10, background: C.ink }}>
        <Row label="Total del periodo" value={money(total)} light big />
      </Card>
      <SectionTitle>Movimientos</SectionTitle>
      {list.map((e) => (
        <Card key={e.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{e.proveedor}</div>
              <div style={{ fontSize: 11.5, color: C.muted, textTransform: "capitalize" }}>{e.categoria} · {fmtDate(e.fecha)}</div>
            </div>
            <div style={{ fontWeight: 800 }}>{money(e.total)}</div>
          </div>
        </Card>
      ))}
      <div style={{ marginTop: 6 }}><GhostButton icon={Plus} onClick={() => ctx.push("taxista", "ocr")}>Escanear ticket / factura</GhostButton></div>
    </div>
  );
}

function TaxOCR({ ctx }) {
  const [stage, setStage] = useState("cam"); // cam -> processing -> form
  const [form, setForm] = useState(null);

  function scan() {
    setStage("processing");
    setTimeout(() => {
      const cat = pick(EXPENSE_CATS.slice(0, 5));
      const base = randInt(20, 140);
      const iva = Math.round(base * 0.21 * 100) / 100;
      setForm({
        proveedor: pick(PROVEEDORES[cat]), fecha: nowISO().slice(0, 10), nifcif: "B" + randInt(10000000, 99999999),
        base, iva, total: Math.round((base + iva) * 100) / 100, categoria: cat, vehiculo: MY_VEHICLE.matricula, notas: "",
      });
      setStage("form");
    }, 1400);
  }

  if (stage === "cam") {
    return (
      <div>
        <TopBar title="Escanear ticket" onBack={() => ctx.pop("taxista")} />
        <div style={{ height: 320, borderRadius: 18, background: "linear-gradient(160deg,#1B2436,#0B0F17)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", gap: 10 }}>
          <Camera size={30} />
          <div style={{ fontSize: 12.5, opacity: 0.75 }}>Encuadra el ticket o factura</div>
        </div>
        <div style={{ marginTop: 16 }}><PrimaryButton icon={Camera} onClick={scan}>Capturar</PrimaryButton></div>
        <div style={{ marginTop: 8 }}><GhostButton onClick={scan}>Subir desde galería</GhostButton></div>
      </div>
    );
  }
  if (stage === "processing") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70%", gap: 12 }}>
        <RefreshCw size={26} color={C.primary} className="spin" />
        <div style={{ fontWeight: 700, color: C.ink2, fontSize: 13.5 }}>Leyendo el documento…</div>
        <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  return (
    <div>
      <TopBar title="Confirmar gasto" onBack={() => setStage("cam")} />
      <div style={{ background: C.warningBg, color: C.warning, fontSize: 12, fontWeight: 700, padding: "8px 11px", borderRadius: 10, marginBottom: 10 }}>Revisa los datos antes de guardar</div>
      <Field label="Proveedor"><input style={inputStyle} value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })} /></Field>
      <Field label="NIF/CIF"><input style={inputStyle} value={form.nifcif} onChange={(e) => setForm({ ...form, nifcif: e.target.value })} /></Field>
      <Field label="Fecha"><input style={inputStyle} type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Field>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}><Field label="Base"><input style={inputStyle} type="number" value={form.base} onChange={(e) => setForm({ ...form, base: parseFloat(e.target.value) || 0 })} /></Field></div>
        <div style={{ flex: 1 }}><Field label="IVA"><input style={inputStyle} type="number" value={form.iva} onChange={(e) => setForm({ ...form, iva: parseFloat(e.target.value) || 0 })} /></Field></div>
      </div>
      <Field label="Total"><input style={{ ...inputStyle, fontWeight: 800 }} type="number" value={form.total} onChange={(e) => setForm({ ...form, total: parseFloat(e.target.value) || 0 })} /></Field>
      <Field label="Categoría">
        <select style={inputStyle} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
          {EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Vehículo"><input style={inputStyle} value={form.vehiculo} disabled /></Field>
      <PrimaryButton icon={Check} onClick={() => { ctx.addExpense(form); ctx.setToast("Gasto guardado"); ctx.resetTo("taxista", "gastos"); }}>Confirmar y guardar</PrimaryButton>
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — RED DE COMPAÑEROS (T20)
// ---------------------------------------------------------------------
function TaxRed({ ctx }) {
  const offers = ctx.rides.filter((r) => r.status === "OFFERED");
  function simulate() {
    const org = pick(NUCLEOS);
    const r = mkRide({
      source: "cliente", passenger: pick(CUSTOMER_NAMES), phone: "+34 6" + randInt(10, 99) + " " + randInt(100, 999) + " " + randInt(100, 999),
      origin: org, destination: pick([...NUCLEOS.filter((n) => n !== org), ...DESTINOS]),
      status: "OFFERED", payer: "pasajero", price: randInt(7, 30), scheduledAt: daysFromNow(0, new Date().getHours(), pick([0, 15, 30, 45])),
    });
    ctx.addRide(r);
    ctx.setToast("Nueva oferta recibida — revisa la alerta");
  }
  return (
    <div>
      <TopBar title="Red" />
      <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10 }}>Servicios disponibles para aceptar o derivar entre compañeros y empresas conectadas. Red cerrada en este MVP.</div>
      <GhostButton icon={RefreshCw} onClick={simulate}>Simular nueva oferta entrante</GhostButton>
      <SectionTitle>Ofertas disponibles ({offers.length})</SectionTitle>
      {offers.length === 0 && <EmptyState Icon={Route} title="Sin ofertas ahora mismo" hint="Simula una oferta para ver el flujo." />}
      {offers.map((r) => (
        <RideCard key={r.id} ride={r} onClick={() => { ctx.setSelectedRideId(r.id); ctx.push("taxista", "oferta"); }} />
      ))}
      <SectionTitle>Compañeros conectados</SectionTitle>
      {DRIVERS.filter((d) => d.id !== ME.id).map((d) => (
        <Card key={d.id} style={{ marginBottom: 8, display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
          <IconBadge Icon={UserCircle2} color={C.primary} bg="#E7EFFA" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{d.name}</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>{d.municipio}</div>
          </div>
          <StatusChip status={d.status === "disponible" ? "PAID" : d.status === "ocupado" ? "IN_PROGRESS" : "CREATED"} />
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// TAXISTA — MÁS: CLIENTES, EMPRESAS, VEHÍCULO, DOCUMENTOS
// ---------------------------------------------------------------------
function TaxMas({ ctx }) {
  const items = [
    { label: "Clientes", Icon: Users, screen: "clientes" },
    { label: "Empresas / hoteles / mutuas", Icon: Building2, screen: "empresas" },
    { label: "Vehículo", Icon: Car, screen: "vehiculo" },
    { label: "Documentos", Icon: FolderOpen, screen: "documentos" },
  ];
  return (
    <div>
      <TopBar title="Más" />
      <Card style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <IconBadge Icon={UserCircle2} color={C.primary} bg="#E7EFFA" />
        <div>
          <div style={{ fontWeight: 800, fontSize: 14.5 }}>{ME.name}</div>
          <div style={{ fontSize: 12, color: C.muted }}>Licencia {ME.licencia} · {ME.municipio}</div>
        </div>
      </Card>
      {items.map((it) => (
        <Card key={it.screen} onClick={() => ctx.push("taxista", it.screen)} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <it.Icon size={17} color={C.ink2} />
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: C.ink }}>{it.label}</span>
          <ChevronRight size={15} color={C.faint} />
        </Card>
      ))}
      <Card style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <Settings size={17} color={C.ink2} /><span style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>Configuración</span><ChevronRight size={15} color={C.faint} />
      </Card>
      <Card onClick={() => ctx.setLoggedIn((l) => ({ ...l, taxista: false }))} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LogOut size={17} color={C.danger} /><span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: C.danger }}>Cerrar sesión</span>
      </Card>
    </div>
  );
}

function TaxClientes({ ctx }) {
  const [q, setQ] = useState("");
  const list = CUSTOMERS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <TopBar title="Clientes" onBack={() => ctx.pop("taxista")} />
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={15} color={C.faint} style={{ position: "absolute", left: 12, top: 12 }} />
        <input style={{ ...inputStyle, paddingLeft: 34 }} placeholder="Buscar cliente…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.map((c) => (
        <Card key={c.id} onClick={() => { ctx.setSelectedCustomerId(c.id); ctx.push("taxista", "clienteDetalle"); }} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <IconBadge Icon={UserCircle2} color={C.primary} bg="#E7EFFA" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>{c.phone}</div>
          </div>
          <ChevronRight size={15} color={C.faint} />
        </Card>
      ))}
    </div>
  );
}
function TaxClienteDetalle({ ctx }) {
  const c = CUSTOMERS.find((x) => x.id === ctx.selectedCustomerId);
  if (!c) return null;
  const rides = ctx.rides.filter((r) => r.passenger === c.name);
  const total = rides.reduce((s, r) => s + r.price, 0);
  return (
    <div>
      <TopBar title="Ficha de cliente" onBack={() => ctx.pop("taxista")} />
      <Card>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{c.name}</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>{c.phone} · {c.email}</div>
        {c.notas && <div style={{ fontSize: 12, marginTop: 6, color: C.ink2, fontStyle: "italic" }}>{c.notas}</div>}
      </Card>
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <MetricCard label="Servicios" value={String(rides.length)} Icon={ListChecks} color={C.primary} />
        <MetricCard label="Facturación" value={money(total)} Icon={Wallet} color={C.success} />
      </div>
      <SectionTitle>Direcciones habituales</SectionTitle>
      <Card>{c.direcciones.map((d) => <div key={d} style={{ fontSize: 12.5, padding: "3px 0" }}><MapPin size={11} style={{ verticalAlign: -1 }} /> {d}</div>)}</Card>
      <SectionTitle>Histórico</SectionTitle>
      {rides.map((r) => <RideCard key={r.id} ride={r} onClick={() => { ctx.setSelectedRideId(r.id); ctx.push("taxista", "rideDetail"); }} />)}
    </div>
  );
}

function TaxEmpresas({ ctx }) {
  return (
    <div>
      <TopBar title="Empresas" onBack={() => ctx.pop("taxista")} />
      {COMPANIES.map((c) => (
        <Card key={c.id} onClick={() => { ctx.setSelectedCompanyId(c.id); ctx.push("taxista", "empresaDetalle"); }} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <IconBadge Icon={Building2} color={C.purple} bg={C.purpleBg} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>{c.tipo} · {c.condiciones}</div>
          </div>
          <ChevronRight size={15} color={C.faint} />
        </Card>
      ))}
    </div>
  );
}
function TaxEmpresaDetalle({ ctx }) {
  const c = COMPANIES.find((x) => x.id === ctx.selectedCompanyId);
  if (!c) return null;
  const rides = ctx.rides.filter((r) => r.companyId === c.id);
  return (
    <div>
      <TopBar title="Ficha de empresa" onBack={() => ctx.pop("taxista")} />
      <Card>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{c.name}</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>{c.tipo} · CIF {c.cif}</div>
        <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 4 }}>{c.contacto}</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Condiciones: {c.condiciones}</div>
      </Card>
      <SectionTitle>Centros de coste</SectionTitle>
      <Card>{c.centros.map((cc) => <div key={cc} style={{ fontSize: 12.5, padding: "3px 0" }}>• {cc}</div>)}</Card>
      <SectionTitle>Servicios</SectionTitle>
      {rides.map((r) => <RideCard key={r.id} ride={r} onClick={() => { ctx.setSelectedRideId(r.id); ctx.push("taxista", "rideDetail"); }} />)}
    </div>
  );
}

function TaxVehiculo({ ctx }) {
  const v = MY_VEHICLE;
  return (
    <div>
      <TopBar title="Vehículo" onBack={() => ctx.pop("taxista")} />
      <Card>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{v.marca} {v.modelo}</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>Matrícula {v.matricula}</div>
      </Card>
      <SectionTitle>Datos</SectionTitle>
      <Card>
        <Row label="Kilometraje" value={`${v.km.toLocaleString("es-ES")} km`} />
        <Row label="Combustible" value={v.combustible} />
        <Row label="Consumo configurado" value={v.consumo} />
        <Row label="Plazas" value={String(v.plazas)} />
        <Row label="PMR" value={v.pmr ? "Sí" : "No"} />
      </Card>
      <SectionTitle>Vencimientos</SectionTitle>
      <Card>
        <Row label="ITV" value={fmtDate(v.itv, { day: "2-digit", month: "long", year: "numeric" })} />
        <Row label="Seguro" value={fmtDate(v.seguro, { day: "2-digit", month: "long", year: "numeric" })} />
      </Card>
      <div style={{ background: C.borderSoft, borderRadius: 12, padding: 10, fontSize: 11.5, color: C.muted, marginTop: 10 }}>Preparado para futura integración con taxímetro (TaximeterAdapter / MockTaximeter en este prototipo).</div>
    </div>
  );
}

function TaxDocumentos({ ctx }) {
  const folders = [
    { name: "Vehículo", Icon: Car, count: 4 },
    { name: "Fiscal", Icon: FileText, count: 6 },
    { name: "Seguros", Icon: ShieldCheck, count: 2 },
    { name: "Mantenimiento", Icon: Settings, count: 3 },
    { name: "Gastos", Icon: Receipt, count: ctx.expenses.length },
    { name: "Facturas emitidas", Icon: ClipboardList, count: ctx.invoices.length },
  ];
  return (
    <div>
      <TopBar title="Documentos" onBack={() => ctx.pop("taxista")} />
      <Card style={{ marginBottom: 10, background: C.warningBg, border: "none" }}>
        <AlertRow Icon={AlertTriangle} color={C.warning} text="ITV caduca en 34 días — sube el nuevo certificado" />
      </Card>
      {folders.map((f) => (
        <Card key={f.name} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <IconBadge Icon={f.Icon} color={C.ink2} bg={C.borderSoft} />
          <div style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{f.name}</div>
          <div style={{ fontSize: 12, color: C.faint }}>{f.count} archivos</div>
          <ChevronRight size={15} color={C.faint} />
        </Card>
      ))}
    </div>
  );
}

// =======================================================================
// CLIENTE — ROOT (C01–C07)
// =======================================================================
function ClienteRoot({ ctx }) {
  const s = ctx.screen("cliente");
  if (!ctx.loggedIn.cliente) return <LoginScreen role="cliente" ctx={ctx} />;
  switch (s) {
    case "inicio": return <CliInicio ctx={ctx} />;
    case "confirmar": return <CliConfirmar ctx={ctx} />;
    case "buscando": return <CliBuscando ctx={ctx} />;
    case "seguimiento": return <CliSeguimiento ctx={ctx} />;
    case "pago": return <CliPago ctx={ctx} />;
    case "recibo": return <CliRecibo ctx={ctx} />;
    case "historial": return <CliHistorial ctx={ctx} />;
    default: return <CliInicio ctx={ctx} />;
  }
}

const CLI_NAME = "Elena Prieto";

function CliInicio({ ctx }) {
  const [origin, setOrigin] = useState("La Carlota (ubicación actual)");
  const [destination, setDestination] = useState("");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 2px" }}>
        <div style={{ fontSize: 19, fontWeight: 900, color: C.ink }}>Hola, {CLI_NAME.split(" ")[0]}</div>
        <button onClick={() => ctx.push("cliente", "historial")} style={{ background: C.borderSoft, border: "none", borderRadius: 10, width: 32, height: 32, cursor: "pointer" }}><Clock size={15} color={C.ink2} /></button>
      </div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>¿A dónde necesitas ir?</div>
      <Card>
        <Field label="Origen"><input style={inputStyle} value={origin} onChange={(e) => setOrigin(e.target.value)} /></Field>
        <Field label="Destino">
          <input style={inputStyle} placeholder="Ej. Estación Córdoba AVE" value={destination} onChange={(e) => setDestination(e.target.value)} list="dests" />
          <datalist id="dests">{[...NUCLEOS, ...DESTINOS].map((d) => <option key={d} value={d} />)}</datalist>
        </Field>
      </Card>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <div style={{ flex: 1 }}><GhostButton icon={Calendar}>Reservar</GhostButton></div>
        <div style={{ flex: 1 }}>
          <PrimaryButton disabled={!destination} onClick={() => { ctx.setToast(null); ctx.push("cliente", "confirmar"); ctx._cliOrigin = origin; ctx._cliDest = destination; }}>Ahora</PrimaryButton>
        </div>
      </div>
      <SectionTitle>Destinos frecuentes</SectionTitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {DESTINOS.map((d) => (
          <button key={d} onClick={() => setDestination(d)} style={{ padding: "8px 12px", borderRadius: 999, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, color: C.ink2, cursor: "pointer" }}>{d}</button>
        ))}
      </div>
    </div>
  );
}

function CliConfirmar({ ctx }) {
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState("tarjeta");
  const origin = ctx._cliOrigin || "La Carlota";
  const destination = ctx._cliDest || "Córdoba capital";
  function confirm() {
    const r = mkRide({ source: "cliente", passenger: CLI_NAME, phone: "+34 620 900 111", origin, destination, status: "PENDING_ASSIGNMENT", payer: "pasajero", price: randInt(9, 30), notes, scheduledAt: nowISO(), auto: true });
    ctx.addRide(r);
    ctx.setClienteRideId(r.id);
    ctx.push("cliente", "buscando");
  }
  return (
    <div>
      <TopBar title="Confirmar solicitud" onBack={() => ctx.pop("cliente")} />
      <Card>
        <Row label="Origen" value={origin} />
        <Row label="Destino" value={destination} />
        <Row label="Hora" value="Ahora" />
      </Card>
      <Field label="Necesidades especiales"><input style={inputStyle} placeholder="Ej. maletero grande, PMR…" /></Field>
      <Field label="Observaciones"><textarea style={{ ...inputStyle, minHeight: 50 }} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <Field label="Método de pago preferido">
        <Segmented value={method} onChange={setMethod} options={[{ value: "tarjeta", label: "Tarjeta" }, { value: "bizum", label: "Bizum" }, { value: "efectivo", label: "Efectivo" }]} />
      </Field>
      <div style={{ background: C.borderSoft, borderRadius: 12, padding: 10, fontSize: 11.5, color: C.muted, marginBottom: 12 }}>Sin tarifa cerrada todavía: el importe final lo confirma el taxista al finalizar.</div>
      <PrimaryButton onClick={confirm}>Confirmar solicitud</PrimaryButton>
    </div>
  );
}

function CliBuscando({ ctx }) {
  // El paso de PENDING_ASSIGNMENT a OFFERED lo gestiona el motor de asignación
  // global en App (ver useEffect "auto"), que también dispara la alerta al taxista.
  const r = ctx.rides.find((x) => x.id === ctx.clienteRideId);
  useEffect(() => {
    if (r && ["ACCEPTED", "EN_ROUTE", "ARRIVED", "PASSENGER_ONBOARD", "IN_PROGRESS", "COMPLETED", "PAID", "INVOICED"].includes(r.status)) {
      ctx.resetTo("cliente", "seguimiento");
    }
  }, [r?.status]);
  if (!r) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "90%", textAlign: "center", gap: 14 }}>
      <RefreshCw size={30} color={C.primary} style={{ animation: "spin 1.4s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontWeight: 800, fontSize: 15 }}>{r.status === "PENDING_ASSIGNMENT" ? "Buscando taxista disponible…" : "Esperando confirmación del taxista…"}</div>
      <div style={{ fontSize: 12.5, color: C.muted, maxWidth: 240 }}>Cambia a la vista <b>Taxista</b> arriba y acepta esta oferta desde la pestaña Red para continuar la demo.</div>
      <GhostButton onClick={() => ctx.setRole("taxista")} icon={Route}>Ir a la vista Taxista</GhostButton>
    </div>
  );
}

function CliSeguimiento({ ctx }) {
  const r = ctx.rides.find((x) => x.id === ctx.clienteRideId);
  if (!r) return null;
  const stageIdx = Math.max(0, RIDE_STEPS.indexOf(r.status));
  const done = ["COMPLETED", "PAID", "INVOICED", "CLOSED"].includes(r.status);
  useEffect(() => { if (r.status === "PAID" || r.status === "INVOICED") ctx.resetTo("cliente", "recibo"); }, [r.status]);
  return (
    <div>
      <TopBar title="Seguimiento" />
      <div style={{ height: 190, background: "#DCE6F5", borderRadius: 18, position: "relative", overflow: "hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 300 200" style={{ position: "absolute", inset: 0 }}>
          <path d="M20 170 C 80 60, 180 160, 280 40" stroke={C.primary} strokeWidth="4" fill="none" strokeDasharray="2 10" strokeLinecap="round" opacity="0.55" />
          <circle cx="20" cy="170" r="7" fill={C.success} /><circle cx="280" cy="40" r="7" fill={C.danger} />
        </svg>
      </div>
      <Card style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{ME.name}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{MY_VEHICLE.marca} {MY_VEHICLE.modelo} · {MY_VEHICLE.matricula}</div>
          </div>
          <StatusChip status={r.status} />
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>ETA estimada: {done ? "Llegado" : "4 min"}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <MiniAction Icon={Phone} label="Llamar" /><MiniAction Icon={MessageCircle} label="Mensaje" />
        </div>
      </Card>
      {!done && (
        <div style={{ marginTop: 12 }}>
          <GhostButton icon={RefreshCw} onClick={() => ctx.advance(r.id)}>Avanzar servicio (demo)</GhostButton>
        </div>
      )}
      {r.status === "COMPLETED" && (
        <div style={{ marginTop: 10 }}><PrimaryButton onClick={() => ctx.push("cliente", "pago")}>Ir a pagar</PrimaryButton></div>
      )}
    </div>
  );
}

function CliPago({ ctx }) {
  const r = ctx.rides.find((x) => x.id === ctx.clienteRideId);
  const [method, setMethod] = useState("tarjeta");
  if (!r) return null;
  return (
    <div>
      <TopBar title="Pago" />
      <MoneySummary bruto={r.price} fee={0} net={r.price} />
      <SectionTitle>Método</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[{ v: "tarjeta", l: "Tarjeta", Icon: CreditCard }, { v: "bizum", l: "Bizum", Icon: Smartphone }, { v: "efectivo", l: "Efectivo", Icon: Banknote }, { v: "wallet", l: "Wallet", Icon: QrCode }].map((m) => (
          <button key={m.v} onClick={() => setMethod(m.v)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 10px", borderRadius: 13, cursor: "pointer", border: `1.5px solid ${method === m.v ? C.primary : C.border}`, background: method === m.v ? "#E7EFFA" : "#fff" }}>
            <m.Icon size={16} color={method === m.v ? C.primary : C.ink2} /><span style={{ fontSize: 12, fontWeight: 700 }}>{m.l}</span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <PrimaryButton onClick={() => { ctx.confirmPayment(r.id, method); ctx.push("cliente", "recibo"); }}>Pagar {money(r.price)}</PrimaryButton>
      </div>
    </div>
  );
}

function CliRecibo({ ctx }) {
  const r = ctx.rides.find((x) => x.id === ctx.clienteRideId);
  if (!r) return null;
  return (
    <div>
      <TopBar title="Recibo" />
      <div style={{ textAlign: "center", padding: "6px 0 14px" }}>
        <CheckCircle2 size={40} color={C.success} />
        <div style={{ fontWeight: 900, fontSize: 16, marginTop: 8 }}>Viaje completado</div>
      </div>
      <Card>
        <Row label="Trayecto" value={`${r.origin} → ${r.destination}`} />
        <Row label="Taxista" value={ME.name} />
        <Row label="Método" value={r.method || "Tarjeta"} />
        <Row label="Total" value={money(r.price)} />
      </Card>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <GhostButton icon={FileText} onClick={() => ctx.setToast("Factura descargada (simulado)")}>Descargar PDF</GhostButton>
        <GhostButton icon={Share2} onClick={() => ctx.setToast("Enviado por WhatsApp (simulado)")}>WhatsApp</GhostButton>
      </div>
      <div style={{ marginTop: 14 }}><PrimaryButton onClick={() => ctx.resetTo("cliente", "inicio")}>Volver al inicio</PrimaryButton></div>
    </div>
  );
}

function CliHistorial({ ctx }) {
  const mine = ctx.rides.filter((r) => r.passenger === CLI_NAME);
  return (
    <div>
      <TopBar title="Historial" onBack={() => ctx.pop("cliente")} />
      {mine.length === 0 && <EmptyState Icon={Calendar} title="Aún sin viajes" hint="Pide tu primer viaje desde el inicio." />}
      {mine.map((r) => (
        <Card key={r.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>{r.origin} → {r.destination}</div>
            <StatusChip status={r.status} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11.5, color: C.faint }}>{fmtDate(r.scheduledAt)}</span>
            <span style={{ fontSize: 12, fontWeight: 800 }}>{money(r.price)}</span>
          </div>
          {["PAID", "INVOICED", "CLOSED"].includes(r.status) && <div style={{ marginTop: 8 }}><GhostButton onClick={() => ctx.setToast("Repitiendo trayecto…")}>Repetir trayecto</GhostButton></div>}
        </Card>
      ))}
    </div>
  );
}

// =======================================================================
// PORTAL B2B (B01–B05)
// =======================================================================
function PortalSidebar({ items, active, onSelect, title, subtitle }) {
  return (
    <div style={{ width: 220, background: C.ink, color: "#fff", padding: "22px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "0 6px" }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, ${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center" }}><Car size={14} color="#fff" /></div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5 }}>{title}</div>
          <div style={{ fontSize: 10.5, opacity: 0.6 }}>{subtitle}</div>
        </div>
      </div>
      {items.map((it) => (
        <button key={it.k} onClick={() => onSelect(it.k)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, border: "none", cursor: "pointer", background: active === it.k ? "rgba(255,255,255,0.1)" : "transparent", color: active === it.k ? "#fff" : "rgba(255,255,255,0.65)", textAlign: "left", fontSize: 13, fontWeight: 700 }}>
          <it.Icon size={16} /> {it.label}
        </button>
      ))}
    </div>
  );
}

function B2BRoot({ ctx }) {
  const items = [
    { k: "dashboard", label: "Dashboard", Icon: BarChart3 },
    { k: "nueva", label: "Nueva reserva", Icon: Plus },
    { k: "activas", label: "Reservas activas", Icon: Route },
    { k: "historico", label: "Histórico", Icon: Clock },
    { k: "pasajeros", label: "Pasajeros", Icon: Users },
    { k: "costes", label: "Centros de coste", Icon: ListChecks },
    { k: "facturas", label: "Facturas", Icon: Receipt },
  ];
  const active = ctx.screen("b2b");
  const company = COMPANIES[0];
  const companyRides = ctx.rides.filter((r) => r.companyId === company.id);
  return (
    <>
      <PortalSidebar items={items} active={active} onSelect={(k) => ctx.resetTo("b2b", k)} title={company.name} subtitle="Portal B2B" />
      <div style={{ flex: 1, padding: "26px 30px", overflowY: "auto", maxHeight: 680 }}>
        {active === "dashboard" && <B2BDashboard ctx={ctx} company={company} rides={companyRides} />}
        {active === "nueva" && <B2BNueva ctx={ctx} company={company} />}
        {active === "activas" && <B2BLista ctx={ctx} title="Reservas activas" rides={companyRides.filter((r) => !["PAID", "INVOICED", "CLOSED", "CANCELLED"].includes(r.status))} />}
        {active === "historico" && <B2BLista ctx={ctx} title="Histórico" rides={companyRides} showFilters />}
        {active === "pasajeros" && <B2BPasajeros rides={companyRides} />}
        {active === "costes" && <B2BCostes company={company} rides={companyRides} />}
        {active === "facturas" && <B2BFacturas ctx={ctx} company={company} />}
      </div>
    </>
  );
}
function PortalHeader({ title, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div style={{ fontSize: 21, fontWeight: 900, color: C.ink }}>{title}</div>
      {action}
    </div>
  );
}
function StatBlock({ label, value, color }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: 16, flex: 1 }}>
      <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: color || C.ink, marginTop: 4 }}>{value}</div>
    </div>
  );
}
function TableRow({ cells, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", padding: "11px 4px", borderBottom: `1px solid ${C.borderSoft}`, cursor: onClick ? "pointer" : "default", alignItems: "center" }}>
      {cells.map((c, i) => <div key={i} style={{ flex: c.flex || 1, fontSize: 12.5, color: c.strong ? C.ink : C.ink2, fontWeight: c.strong ? 700 : 500 }}>{c.content}</div>)}
    </div>
  );
}

function B2BDashboard({ ctx, company, rides }) {
  const today = rides.filter((r) => new Date(r.scheduledAt).toDateString() === new Date().toDateString());
  const enCurso = rides.filter((r) => ["ACCEPTED", "EN_ROUTE", "ARRIVED", "PASSENGER_ONBOARD", "IN_PROGRESS"].includes(r.status));
  const pendientes = rides.filter((r) => ["CREATED", "PENDING_ASSIGNMENT", "OFFERED"].includes(r.status));
  const gasto = rides.reduce((s, r) => s + r.price, 0);
  return (
    <div>
      <PortalHeader title="Dashboard" action={<PortalCTA onClick={() => ctx.resetTo("b2b", "nueva")}>Nueva reserva</PortalCTA>} />
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <StatBlock label="Reservas de hoy" value={today.length} />
        <StatBlock label="En curso" value={enCurso.length} color={C.primary} />
        <StatBlock label="Pendientes" value={pendientes.length} color={C.warning} />
        <StatBlock label="Gasto del periodo" value={money(gasto)} color={C.success} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Reservas recientes</div>
      {rides.slice(0, 6).map((r) => (
        <TableRow key={r.id} onClick={() => ctx.resetTo("b2b", "activas")} cells={[
          { content: r.passenger, strong: true }, { content: `${r.origin} → ${r.destination}`, flex: 1.4 }, { content: fmtDate(r.scheduledAt) + " " + fmtTime(r.scheduledAt) }, { content: <StatusChip status={r.status} /> }, { content: money(r.price) },
        ]} />
      ))}
    </div>
  );
}
function PortalCTA({ children, onClick }) {
  return <button onClick={onClick} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} />{children}</button>;
}

function B2BNueva({ ctx, company }) {
  const [passenger, setPassenger] = useState("");
  const [phone, setPhone] = useState("");
  const [origin, setOrigin] = useState(company.name);
  const [destination, setDestination] = useState("");
  const [costCenter, setCostCenter] = useState(company.centros[0]);
  const [ref, setRef] = useState("");
  const [payer, setPayer] = useState("empresa");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  function save() {
    const r = mkRide({ source: "b2b", passenger: passenger || "Pasajero sin nombre", phone, origin, destination: destination || "Por confirmar", companyId: company.id, costCenter, payer, notes: notes + (ref ? ` · Ref: ${ref}` : ""), price: randInt(9, 34), status: "PENDING_ASSIGNMENT", scheduledAt: nowISO(), auto: true });
    ctx.addRide(r);
    setSaved(true);
    setTimeout(() => { setSaved(false); ctx.resetTo("b2b", "activas"); }, 900);
  }
  return (
    <div style={{ maxWidth: 460 }}>
      <PortalHeader title="Nueva reserva" />
      <Field label="Pasajero"><input style={inputStyle} value={passenger} onChange={(e) => setPassenger(e.target.value)} placeholder="Nombre del pasajero" /></Field>
      <Field label="Teléfono"><input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
      <Field label="Origen"><input style={inputStyle} value={origin} onChange={(e) => setOrigin(e.target.value)} /></Field>
      <Field label="Destino"><input style={inputStyle} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ej. Estación Córdoba AVE" /></Field>
      <Field label="Centro de coste">
        <select style={inputStyle} value={costCenter} onChange={(e) => setCostCenter(e.target.value)}>{company.centros.map((c) => <option key={c}>{c}</option>)}</select>
      </Field>
      <Field label="Referencia externa"><input style={inputStyle} value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Opcional" /></Field>
      <Field label="Pagador"><Segmented value={payer} onChange={setPayer} options={[{ value: "empresa", label: "Empresa" }, { value: "pasajero", label: "Pasajero" }]} /></Field>
      <Field label="Observaciones"><textarea style={{ ...inputStyle, minHeight: 60 }} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <PrimaryButton icon={saved ? Check : Send} onClick={save} style={{ width: 200 }}>{saved ? "Reserva creada" : "Crear reserva"}</PrimaryButton>
    </div>
  );
}

function B2BLista({ ctx, title, rides, showFilters }) {
  return (
    <div>
      <PortalHeader title={title} />
      {rides.length === 0 && <EmptyState title="Sin resultados" />}
      {rides.map((r) => (
        <TableRow key={r.id} cells={[
          { content: r.passenger, strong: true }, { content: `${r.origin} → ${r.destination}`, flex: 1.4 }, { content: r.costCenter || "—" }, { content: fmtDate(r.scheduledAt) }, { content: <StatusChip status={r.status} /> }, { content: money(r.price) },
        ]} />
      ))}
    </div>
  );
}
function B2BPasajeros({ rides }) {
  const map = {};
  rides.forEach((r) => { map[r.passenger] = (map[r.passenger] || 0) + 1; });
  return (
    <div>
      <PortalHeader title="Pasajeros" />
      {Object.entries(map).map(([n, c]) => (
        <TableRow key={n} cells={[{ content: n, strong: true }, { content: `${c} servicio(s)` }]} />
      ))}
    </div>
  );
}
function B2BCostes({ company, rides }) {
  const map = {};
  company.centros.forEach((c) => (map[c] = 0));
  rides.forEach((r) => { if (r.costCenter) map[r.costCenter] = (map[r.costCenter] || 0) + r.price; });
  return (
    <div>
      <PortalHeader title="Centros de coste" />
      {Object.entries(map).map(([c, v]) => (
        <TableRow key={c} cells={[{ content: c, strong: true }, { content: money(v) }]} />
      ))}
    </div>
  );
}
function B2BFacturas({ ctx, company }) {
  const list = ctx.invoices.filter((i) => i.companyId === company.id);
  return (
    <div>
      <PortalHeader title="Facturación" />
      {list.length === 0 && <EmptyState title="Sin facturas todavía" hint="Se generan automáticamente al facturar un servicio a la empresa." />}
      {list.map((i) => (
        <TableRow key={i.id} cells={[
          { content: `${i.serie}-${i.numero}`, strong: true }, { content: money(i.total) }, { content: i.status },
        ]} />
      ))}
    </div>
  );
}

// =======================================================================
// BACKOFFICE ADMIN (A01–A06)
// =======================================================================
function AdminRoot({ ctx }) {
  const items = [
    { k: "dashboard", label: "Dashboard", Icon: BarChart3 },
    { k: "taxistas", label: "Taxistas", Icon: UserCircle2 },
    { k: "empresas", label: "Empresas", Icon: Building2 },
    { k: "servicios", label: "Servicios y auditoría", Icon: Eye },
    { k: "incidencias", label: "Incidencias", Icon: AlertTriangle },
    { k: "config", label: "Configuración", Icon: Settings },
  ];
  const active = ctx.screen("admin");
  return (
    <>
      <PortalSidebar items={items} active={active} onSelect={(k) => ctx.resetTo("admin", k)} title="Backoffice" subtitle="TaxiOS Admin" />
      <div style={{ flex: 1, padding: "26px 30px", overflowY: "auto", maxHeight: 680 }}>
        {active === "dashboard" && <AdminDashboard ctx={ctx} />}
        {active === "taxistas" && <AdminTaxistas ctx={ctx} />}
        {active === "empresas" && <AdminEmpresas ctx={ctx} />}
        {active === "servicios" && <AdminServicios ctx={ctx} />}
        {active === "incidencias" && <AdminIncidencias ctx={ctx} />}
        {active === "config" && <AdminConfig />}
      </div>
    </>
  );
}
function AdminDashboard({ ctx }) {
  const total = ctx.rides.length;
  const activos = ctx.rides.filter((r) => ["ACCEPTED", "EN_ROUTE", "ARRIVED", "PASSENGER_ONBOARD", "IN_PROGRESS"].includes(r.status)).length;
  const pagos = ctx.rides.filter((r) => ["PAID", "INVOICED", "CLOSED"].includes(r.status)).reduce((s, r) => s + r.price, 0);
  const incidencias = ctx.rides.filter((r) => r.status === "CANCELLED").length;
  return (
    <div>
      <PortalHeader title="Dashboard" />
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <StatBlock label="Servicios totales" value={total} />
        <StatBlock label="Taxistas activos" value={DRIVERS.filter((d) => d.status !== "fuera").length} color={C.primary} />
        <StatBlock label="Volumen de pagos" value={money(pagos)} color={C.success} />
        <StatBlock label="Incidencias" value={incidencias} color={C.danger} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Actividad reciente</div>
      {ctx.rides.slice(0, 8).map((r) => (
        <TableRow key={r.id} cells={[{ content: r.passenger, strong: true }, { content: `${r.origin} → ${r.destination}`, flex: 1.4 }, { content: fmtDate(r.scheduledAt) }, { content: <StatusChip status={r.status} /> }]} />
      ))}
    </div>
  );
}
function AdminTaxistas() {
  return (
    <div>
      <PortalHeader title="Taxistas" />
      {DRIVERS.map((d) => {
        const v = VEHICLES.find((x) => x.driverId === d.id);
        return <TableRow key={d.id} cells={[{ content: d.name, strong: true }, { content: d.licencia }, { content: v ? `${v.marca} ${v.modelo}` : "—" }, { content: <StatusChip status={d.status === "disponible" ? "PAID" : d.status === "ocupado" ? "IN_PROGRESS" : "CREATED"} /> }]} />;
      })}
    </div>
  );
}
function AdminEmpresas({ ctx }) {
  return (
    <div>
      <PortalHeader title="Empresas" />
      {COMPANIES.map((c) => {
        const n = ctx.rides.filter((r) => r.companyId === c.id).length;
        return <TableRow key={c.id} cells={[{ content: c.name, strong: true }, { content: c.tipo }, { content: c.cif }, { content: `${n} servicios` }]} />;
      })}
    </div>
  );
}
function AdminServicios({ ctx }) {
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);
  const list = ctx.rides.filter((r) => r.passenger.toLowerCase().includes(q.toLowerCase()) || r.id.includes(q));
  return (
    <div>
      <PortalHeader title="Servicios y auditoría" />
      <input style={{ ...inputStyle, maxWidth: 320, marginBottom: 14 }} placeholder="Buscar por pasajero o ID…" value={q} onChange={(e) => setQ(e.target.value)} />
      {list.slice(0, 20).map((r) => (
        <div key={r.id}>
          <TableRow onClick={() => setOpenId(openId === r.id ? null : r.id)} cells={[{ content: r.passenger, strong: true }, { content: `${r.origin} → ${r.destination}`, flex: 1.4 }, { content: fmtDate(r.scheduledAt) }, { content: <StatusChip status={r.status} /> }, { content: money(r.price) }]} />
          {openId === r.id && (
            <div style={{ background: C.borderSoft, borderRadius: 10, padding: 12, marginBottom: 8 }}>
              {r.audit.map((a, i) => (
                <div key={i} style={{ fontSize: 12, color: C.ink2, padding: "3px 0" }}>• {a.action} — {a.actor}, {fmtDate(a.ts)} {fmtTime(a.ts)}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
function AdminIncidencias({ ctx }) {
  const list = ctx.rides.filter((r) => r.status === "CANCELLED");
  return (
    <div>
      <PortalHeader title="Incidencias" />
      {list.length === 0 && <EmptyState title="Sin incidencias abiertas" />}
      {list.map((r) => (
        <TableRow key={r.id} cells={[{ content: r.passenger, strong: true }, { content: r.cancelReason || "Sin motivo registrado", flex: 1.6 }, { content: fmtDate(r.scheduledAt) }]} />
      ))}
    </div>
  );
}
function AdminConfig() {
  return (
    <div>
      <PortalHeader title="Configuración" />
      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Municipio piloto</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {NUCLEOS.map((n) => <span key={n} style={{ background: C.borderSoft, padding: "6px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{n}</span>)}
      </div>
      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Categorías de gasto</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {EXPENSE_CATS.map((n) => <span key={n} style={{ background: C.borderSoft, padding: "6px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{n}</span>)}
      </div>
    </div>
  );
}
