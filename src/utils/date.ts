const DAY_ABBR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
] as const;

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function dayAbbr(date: Date): string {
  return DAY_ABBR[(date.getDay() + 6) % 7];
}

export function formatShortDate(date: Date): string {
  const day = DAY_ABBR[(date.getDay() + 6) % 7];
  return `${day} ${date.getDate()} ${MONTH_NAMES[date.getMonth()].toLowerCase()}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function weekRangeLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const startMonth = MONTH_NAMES[weekStart.getMonth()].toLowerCase();
  const endMonth = MONTH_NAMES[end.getMonth()].toLowerCase();
  if (weekStart.getMonth() === end.getMonth()) {
    return `${weekStart.getDate()} – ${end.getDate()} ${startMonth}`;
  }
  return `${weekStart.getDate()} ${startMonth} – ${end.getDate()} ${endMonth}`;
}
