import { translateDepartment } from "./i18n";

// --- Manuel Atama Gerektiren Departmanlar ---
export const MANUAL_DEPARTMENTS = [
  "Dikişhane",
  "Döşemehane",
  "Dikiş",
  "Döşeme",
  "Швейный цех",
  "Обивочный цех",
  "Швейный",
  "Обивочный",
  "Sewing",
  "Upholstery",
];

export const isManualDept = (dept: string): boolean => {
  const d = (dept || "").toLowerCase().trim();
  if (!d) return false;
  return MANUAL_DEPARTMENTS.some((manual) => {
    const m = manual.toLowerCase();
    return d.includes(m) || m.includes(d);
  });
};

// --- Üretim Akış Sırası ---
export const DEPT_FLOW_ORDER = [
  "Satınalma",
  "Karkas Üretimi",
  "Metal Üretimi",
  "Boyahane",
  "Kumaş",
  "Dikişhane",
  "Döşemehane",
];

// --- Departman Emojileri ---
const DEPT_EMOJI: Record<string, string> = {
  "Karkas Üretimi": "🔩",
  Boyahane: "🎨",
  Kumaş: "🧶",
  Dikişhane: "🧵",
  Döşemehane: "🪑",
  Satınalma: "🛒",
  "Metal Üretimi": "⚙️",
};

// --- Departman bazlı ürün dökümü ---
export function buildDistributionSummary(order: any): string {
  const deptMap = new Map<
    string,
    { product: string; qty: number; details: string }[]
  >();
  for (const item of order.items) {
    const d = item.department as string;
    if (!deptMap.has(d)) deptMap.set(d, []);
    deptMap.get(d)!.push({
      product: item.product,
      qty: item.quantity,
      details: item.details || "",
    });
  }
  let s = `━━━━━━━━━━━━━━━━━━━━\n`;
  for (const [dept, items] of deptMap) {
    const emoji = DEPT_EMOJI[dept] || "📦";
    const ruDept = translateDepartment(dept, "ru");
    s += `${emoji} <b>${ruDept}</b> (${items.length} изд.)\n`;
    for (const it of items) {
      s += `   • ${it.product} — <b>${it.qty} шт.</b>`;
      if (it.details) s += `\n     <i>${it.details}</i>`;
      s += `\n`;
    }
  }
  s += `━━━━━━━━━━━━━━━━━━━━`;
  return s;
}

// --- Departman Buton Etiketi ---
export const getDeptButtonLabel = (
  dept: string,
  isAssigned: boolean = false,
): string => {
  const action = isAssigned ? "Изменить" : "Выбрать";
  if (dept.toLowerCase().includes("dikiş")) return `🧵 Швея — ${action}`;
  if (dept.toLowerCase().includes("döşeme")) return `🪑 Обивщик — ${action}`;
  if (dept.toLowerCase().includes("satın")) return `🛒 Закупки — ${action}`;
  return `${dept} — ${action}`;
};
