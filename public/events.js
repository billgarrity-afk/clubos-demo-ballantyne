// ════════════════════════════════════════════════════════════════
//  ClubOS Promote — DEMO event data for Ballantyne Country Club
//  This is the only file to edit when the event list changes.
//
//  Sample FAC programming for the demo. Staff can add more from
//  admin.html; those are kept in the browser and merged in.
//
//  date:        'YYYY-MM-DD'      start/end: '6:00 PM' style
//  cap:         max attendees (0 = no cap)
//  going:       seeded RSVP count for the demo
//  early:       how many of those signed up in the first 48 hours
//  checkedIn:   seeded check-ins (only for events already held)
//  theme:       'green' | 'navy' | 'clay' (graphic colourway)
//  who:         a few first names + last initials shown as "who's in"
//               (demo names — never real member names)
// ════════════════════════════════════════════════════════════════

window.CLUBOS_VENUE = {
  name: 'Ballantyne Country Club',
  short: 'BCC',
  crest: 'B',
  openHour: 7,
  closeHour: 21,
  channel: 'clubos-demo-ballantyne-promote'
};

window.CLUBOS_EVENTS = [
  {
    id: 'pickle-social',
    title: 'Pickleball Social',
    category: 'Racquet',
    date: '2026-10-30', start: '6:00 PM', end: '8:00 PM',
    location: 'Pickleball Courts 1–3',
    blurb: 'Two hours, three courts, rotating partners. All levels welcome. Grab a friend and come play.',
    signup: 'BCC App or Pro Shop',
    cap: 12, going: 9, early: 6, theme: 'green',
    who: ['Jordan K.', 'Mia R.', 'Chris T.', 'Dana L.', 'Sam W.']
  },
  {
    id: 'pickle-night',
    title: 'Pickleball Under the Lights',
    category: 'Racquet',
    date: '2026-10-22', start: '6:30 PM', end: '8:30 PM',
    location: 'Pickleball Courts',
    blurb: 'Open play with music and a pro on court for drills. Paddles available at the Pro Shop.',
    signup: 'BCC App or Pro Shop',
    cap: 24, going: 18, early: 7, theme: 'navy',
    who: ['Alex P.', 'Taylor B.', 'Riley M.', 'Casey D.']
  },
  {
    id: 'clinic',
    title: "Women's 3.5 Drill Clinic",
    category: 'Clinic',
    date: '2026-10-27', start: '9:00 AM', end: '10:30 AM',
    location: 'Court 5',
    blurb: 'Serve, return, and net-play drills with the tennis pro. Limited to eight players.',
    signup: 'BCC App or Pro Shop',
    cap: 8, going: 6, early: 5, theme: 'clay',
    who: ['Lauren S.', 'Kim H.', 'Jess A.']
  },
  {
    id: 'mixer',
    title: 'Fall Doubles Mixer',
    category: 'Racquet',
    date: '2026-11-07', start: '4:00 PM', end: '7:00 PM',
    location: 'Tennis Courts 1–4',
    blurb: 'Round-robin doubles, rotating partners every 20 minutes. All levels. Drinks on the terrace after.',
    signup: 'BCC App or Pro Shop',
    cap: 32, going: 14, early: 9, theme: 'green',
    who: ['Jordan K.', 'Mia R.', 'Chris T.', 'Dana L.', 'Sam W.']
  }
];
