export const cities = [
  { id: 1, name: 'சென்னை', englishName: 'Chennai', lat: 13.0827, lng: 80.2707 },
  {
    id: 2,
    name: 'ಬೆಂಗಳೂರು',
    englishName: 'Bengaluru',
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: 3,
    name: 'തിരുവനന്തപുരം',
    englishName: 'Trivandrum',
    lat: 8.5241,
    lng: 76.9366,
  },

  {
    id: 4,
    name: 'అమరావతి',
    englishName: 'Amaravati',
    lat: 16.5062,
    lng: 80.648,
  },
  {
    id: 5,
    name: 'హైదరాబాద్',
    englishName: 'Hyderabad',
    lat: 17.385,
    lng: 78.4867,
  },
  { id: 7, name: 'मुंबई', englishName: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { id: 8, name: 'पुणे', englishName: 'Pune', lat: 18.5204, lng: 73.8567 },
  { id: 9, name: 'কলকাতা', englishName: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  {
    id: 6,
    name: 'नयी दिल्ली',
    englishName: 'New Delhi',
    lat: 28.6139,
    lng: 77.209,
  },
]

export const noShowsMessages = [
  'This event is taking a quick breather. Check back soon for the next schedule!',
  "Nothing happening here right now — maybe it's on a coffee break like the rest of us.",
  'The stage is quiet for now. Something exciting is coming soon!',
  'Looks like this event hit snooze. Stay tuned for the next session!',
  'Today’s lineup took a detour. More updates coming your way!',
  "No action here at the moment. Maybe everyone's stuck in the cafeteria line?",
  "This session's off for now — possibly rescheduling, possibly napping.",
  "Intermission alert! We'll be back with more events shortly.",
  'The auditorium is catching its breath. More fun incoming!',
  'No current show — a perfect time to grab chai and check back later!',
]

type SeatCommentKeys =
  | 'lastRow'
  | 'firstRow'
  | 'middle'
  | 'couplesCorner'
  | 'soloCorner'
  | 'default'
  | 'crowd'
  | 'three'
  | 'two'
  | 'zero'

export const seatComments: { [key in SeatCommentKeys]: string[] } = {
  lastRow: [
    'Back row vibes — chill, distant, and perfect for people-watching.',
    "Classic backbencher energy. Hope you're not planning to sneak out early!",
    'Back row: where you can enjoy the event and low-key text.',
    'From way back there, the stage feels like a suggestion.',
    'Last row — prime spot for latecomers and low-key attendees.',
    'Back row legends, quietly judging everything and everyone.',
  ],
  firstRow: [
    'Front row! Bold move — no sneaky yawning here.',
    'First row: for the ultra-engaged or the ultra-late to register.',
    'Front row: where eye contact with the speaker is dangerously frequent.',
    'You’re basically part of the event now. No pressure!',
    'First row folks, ready for the full immersive experience?',
    'Closest seat to the mic — hope you’re not camera shy.',
  ],
  middle: [
    'Middle seats: the diplomatic choice of legends.',
    'Comfortably centered — socially balanced and acoustically blessed.',
    'Not too far, not too close — you’re in the auditorium’s Goldilocks zone.',
    'Middle row crew: here for the content, not the chaos.',
    'Middle seats: great view, great vibes, minimal neck strain.',
    "Sitting here says, 'I'm here for the experience, not the spotlight.'",
  ],
  couplesCorner: [
    'Corner duo spotted — hope you’re paying attention and not whispering secrets!',
    'Perfect little corner — great for bonding *and* ignoring distractions.',
    'Side seats, side stories. Just keep it low-key!',
    'The couple corner: not just for romance, also for strategic exits.',
    'Corner partners: here for the event, and each other, apparently.',
    'Corner seats: where closeness meets comfort… and plausible deniability.',
  ],
  soloCorner: [
    'Solo corner seat — the quiet rebel of the auditorium.',
    'Enjoying the event in peace? You’ve found the perfect hideaway.',
    'One seat, one legend, one private viewing zone.',
    'Corner seat for one: the most underrated spot in the house.',
    'No distractions, no small talk — just pure focus from the edge.',
    'Your own little corner of calm in the campus chaos.',
  ],
  default: [
    "Welcome! Whether you're here for fun, facts, or free snacks — enjoy!",
    'Settle in and enjoy — at least it’s not another 8 a.m. lecture.',
    'Get comfy! Something exciting is about to happen (hopefully).',
    'Sit tight, switch off your phone (or at least the notifications).',
    'Here’s to learning, cheering, or maybe just chilling in AC.',
    'Auditorium magic: where anything from a fest to a fiasco can happen.',
    'Welcome to the show — or seminar, or skit, or something in between.',
    'Time to unplug from coursework and plug into the event.',
    "Lights on, phones off (unless you're live-tweeting, we guess).",
    'Hope the event’s good. If not, hey, at least the seat’s comfy!',
  ],
  crowd: [
    'Full squad incoming! Hope you all remembered where you’re sitting.',
    'You brought the whole class? Hope it’s worth the attendance marks.',
    'Squad goals: synchronized clapping and side comments only.',
    'Rolling deep — is this an event or a group project?',
    'The group’s all here — time for some organized chaos!',
    'Mass booking detected. Is this a fest or a flash mob?',
    'Looks like you reserved an entire section. Respect.',
    'Big group, big energy! Just don’t start a wave.',
    'It’s a full house! Hope someone remembered to bring the snacks.',
    'Squad assembled. Let the clapping, cheering, and side-eyeing commence.',
  ],
  three: [
    'Trio time! Just enough people for jokes, commentary, and backup plans.',
    'Three’s a good number — balanced, like a well-structured timetable.',
    'Three seats: one leader, one enthusiast, one confused member.',
    'Classic group dynamic: one talks, one listens, one scrolls.',
    'The power of three — may your event banter be as strong as your Wi-Fi.',
    'Three of you? That’s basically a club meeting.',
  ],
  two: [
    'Just the two of you? A compact, efficient event team.',
    'Dynamic duo — hope one of you’s good at remembering the details!',
    'The perfect pair: one pays attention, the other takes notes.',
    'Two seats filled, plenty of room for shared commentary.',
    'Looks like a focused pair — or just two people avoiding the crowd.',
    'Two-person squad, low drama, high comfort. Smart choice.',
  ],
  zero: [
    'Zero seats picked? Just browsing or fighting commitment issues?',
    'No seats yet? Must be weighing all the vibes.',
    'Still deciding? That’s okay — auditorium time is flexible.',
    'Take your time, just don’t let the good ones vanish.',
    'No selection yet? We know — the paradox of choice is real.',
    'Still seatless? Maybe you’re just here for moral support.',
  ],
}
