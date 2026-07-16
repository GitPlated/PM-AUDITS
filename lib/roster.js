// Static roster for now — swap the LEADERS export for a Supabase query
// (see lib/supabaseClient.js) once the leaders/technicians tables exist.
// Shape is designed to map 1:1 onto: leaders, shifts, technicians tables.

export const LEADERS = [
  {
    name: 'Tyler Christensen',
    color: 'amber',
    badges: ['FHD', 'FHS'],
    shifts: [
      {
        code: 'FHD',
        label: 'Front Half, Days',
        techs: [
          { name: 'Mike Fondren', role: 'Lead Tech' },
          { name: 'Antonio Foster', role: 'KT' },
          { name: 'Sergio Ortiz', role: 'IAT' },
          { name: 'John Danhoff', role: 'RT' },
          { name: 'Brett Stone', role: 'RT' },
          { name: 'Francisco Chavez', role: 'T-3' },
          { name: 'Adrian Escobedo', role: 'T-2' },
          { name: 'Eduardo Guzman', role: 'T-1' },
          { name: 'Jose Vargas', role: 'Lead KT' },
        ],
      },
      {
        code: 'FHS',
        label: 'Front Half, Mids',
        techs: [
          { name: 'Keith Grimes', role: 'Lead Tech' },
          { name: 'Erick Sanchez', role: 'KT' },
          { name: 'Julian Escobedo', role: 'T-1' },
          { name: 'Jessy Rodriguez', role: 'T-2' },
          { name: 'Andrew Brewster', role: 'T-2' },
          { name: 'Gregory Turner', role: 'T-3' },
        ],
      },
    ],
  },
  {
    name: 'Dave Haney',
    color: 'teal',
    badges: ['BHD', 'BHS'],
    shifts: [
      {
        code: 'BHD',
        label: 'Back Half, Days',
        techs: [
          { name: 'Tim Solof', role: 'Lead Tech' },
          { name: 'Wyatt Talaska', role: 'KT' },
          { name: 'Andres Mazuera', role: 'IAT' },
          { name: 'Jacolby Moffett', role: 'RT' },
          { name: 'John Doyle', role: 'T-3' },
          { name: 'Julio Segura Jr', role: 'T-2' },
          { name: 'Oscar Villalobos', role: 'T-2' },
        ],
      },
      {
        code: 'BHS',
        label: 'Back Half, Mids',
        techs: [
          { name: 'Jason Riddle', role: 'KT' },
          { name: null, role: 'T-2', vacant: true },
          { name: 'Tristan Chandler', role: 'T-2' },
          { name: 'Maximo Hernandez', role: 'T-2' },
          { name: 'Adam Mccalahan', role: 'T-2' },
        ],
      },
    ],
  },
  {
    name: 'Ron Vogel',
    color: 'indigo',
    badges: ['FHN'],
    shifts: [
      {
        code: 'FHN',
        label: 'Front Half, Nights',
        techs: [
          { name: 'Jose Aguilar', role: 'T-2' },
          { name: 'Angel Mejia', role: 'T-2' },
          { name: 'Ariel Lopez', role: 'T-3' },
          { name: 'Arnie Chavez', role: 'T-3' },
        ],
      },
    ],
  },
  {
    name: 'Wilberth Carrizal',
    color: 'plum',
    badges: ['BHN'],
    shifts: [
      {
        code: 'BHN',
        label: 'Back Half, Nights',
        techs: [
          { name: null, role: 'T-1', vacant: true },
          { name: 'Miguel Pereira Lara', role: 'T-1' },
          { name: 'Ryan Lopez', role: 'T-1' },
          { name: 'Robert Knudsen', role: 'T-2' },
        ],
      },
    ],
  },
]

export function getSummary(leaders) {
  let techs = 0
  let vacant = 0
  const vacancies = []

  for (const leader of leaders) {
    for (const shift of leader.shifts) {
      for (const tech of shift.techs) {
        if (tech.vacant) {
          vacant++
          vacancies.push({ leader: leader.name, shiftLabel: shift.label, role: tech.role })
        } else {
          techs++
        }
      }
    }
  }

  return { techs, vacant, leaders: leaders.length, vacancies }
}
