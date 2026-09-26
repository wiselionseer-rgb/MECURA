export const ALL_24H_TIME_SLOTS = [
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30',
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

export type TimePeriodId = 'all' | 'madrugada' | 'manha' | 'tarde' | 'noite';

export const TIME_PERIODS: { id: TimePeriodId; label: string; badge: string; slots: string[] }[] = [
  {
    id: 'all',
    label: 'Todos (24h)',
    badge: '00h às 23h30',
    slots: ALL_24H_TIME_SLOTS
  },
  {
    id: 'madrugada',
    label: 'Madrugada',
    badge: '00h às 05h30',
    slots: ALL_24H_TIME_SLOTS.slice(0, 12)
  },
  {
    id: 'manha',
    label: 'Manhã',
    badge: '06h às 11h30',
    slots: ALL_24H_TIME_SLOTS.slice(12, 24)
  },
  {
    id: 'tarde',
    label: 'Tarde',
    badge: '12h às 17h30',
    slots: ALL_24H_TIME_SLOTS.slice(24, 36)
  },
  {
    id: 'noite',
    label: 'Noite',
    badge: '18h às 23h30',
    slots: ALL_24H_TIME_SLOTS.slice(36, 48)
  }
];
