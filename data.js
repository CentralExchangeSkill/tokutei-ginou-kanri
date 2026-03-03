const workers = [
  { id: 1, name: 'Nguyen Van A', company: 'Tokyo Foods', visaExpiry: '2026-03-15' },
  { id: 2, name: 'Maria Santos', company: 'Sakura Care', visaExpiry: '2026-04-09' },
  { id: 3, name: 'Rizal Ahmad', company: 'Kansai Build', visaExpiry: '2026-05-02' },
  { id: 4, name: 'Somchai Chaiya', company: 'Tohoku Farm', visaExpiry: '2026-06-20' },
  { id: 5, name: 'Le Thi B', company: 'Hikari Logistics', visaExpiry: '2026-02-14' }
];

const cases = [
  {
    id: 'C-1021',
    workerId: 1,
    title: 'Visa renewal package',
    dueDate: '2026-02-01',
    checklist: [
      { item: 'Passport copy', completed: true },
      { item: 'Residence card copy', completed: true },
      { item: 'Employment contract', completed: false }
    ]
  },
  {
    id: 'C-1022',
    workerId: 2,
    title: 'Status extension',
    dueDate: '2026-03-30',
    checklist: [
      { item: 'Tax certificate', completed: true },
      { item: 'Health insurance proof', completed: true }
    ]
  },
  {
    id: 'C-1023',
    workerId: 3,
    title: 'Residence update',
    dueDate: '2026-01-20',
    checklist: [
      { item: 'Address registration', completed: false },
      { item: 'Notification form', completed: false }
    ]
  }
];
