// Collector's Guide: short, practical reads for watch owners.
// General guidance only; for a valuable watch, a brand service centre or a trusted watchmaker has the final word.

export type Guide = {
  id: string;
  kicker: string;
  title: string;
  minutes: number;
  icon: string;
  tint: string; // card colour, readable with light text in both themes
  intro: string;
  sections: { h: string; p?: string; list?: string[] }[];
};

export const GUIDES: Guide[] = [
  {
    id: 'fake',
    kicker: 'Buying',
    title: 'Real or fake? What to check before you pay',
    minutes: 4,
    icon: 'shield',
    tint: '#6B2E2E',
    intro: 'Good fakes are very good now. No single check proves a watch is real, but together these catch most problems before money changes hands.',
    sections: [
      { h: 'Buy the seller first', p: 'A seller with a long track record, real reviews and a return policy matters more than any detail on the dial. Be careful with pressure to pay fast or off-platform.' },
      { h: 'If the price is too good, it is', p: 'Popular steel models trade close to their market range. A big discount with no clear reason, like heavy wear or no papers, is the most common warning sign.' },
      {
        h: 'Check the details',
        list: [
          'Papers: the serial on the warranty card should match the serial on the watch.',
          'Date magnifier: on a Rolex the date lens enlarges about 2.5×, so the date fills the window.',
          'Printing: dial text should be sharp and even under a loupe, with no fuzzy edges.',
          'Movement: a sweeping seconds hand on a mechanical watch moves in small steps, not one jump per second.',
          'Weight and finish: fakes often feel lighter, with rough edges on the bracelet clasp. A hint, not proof.',
        ],
      },
      { h: 'When in doubt, verify', p: 'For an expensive watch, ask for an independent check by an authorised dealer or a watchmaker before paying. It costs little compared with a mistake.' },
    ],
  },
  {
    id: 'clean',
    kicker: 'Care',
    title: 'How to clean your watch at home',
    minutes: 3,
    icon: 'drop',
    tint: '#1D3550',
    intro: 'A clean bracelet and case keep a watch looking its value. It takes ten minutes, and you only need a soft brush and a cloth.',
    sections: [
      { h: 'Before you start', p: 'Check the water resistance on the case back or dial. If the crown screws down, make sure it is fully screwed in. If the watch is not water resistant, use a damp cloth only.' },
      {
        h: 'Steel bracelet and case',
        list: [
          'Use lukewarm water with a drop of mild soap.',
          'Brush gently with a soft toothbrush, between the links and around the bezel.',
          'Rinse with fresh water and dry with a microfibre cloth.',
          'After swimming in the sea or a pool, always rinse with fresh water.',
        ],
      },
      { h: 'Leather straps', p: 'Keep them away from water. Wipe with a dry cloth and let them air out between wears. Sweat is what wears leather down fastest.' },
      { h: 'What to avoid', p: 'No alcohol, solvents or ultrasonic cleaners on the watch head, and never open the case back yourself. Hot showers and saunas can age the seals.' },
    ],
  },
  {
    id: 'papers',
    kicker: 'Value',
    title: 'Why box and papers change the price',
    minutes: 2,
    icon: 'box',
    tint: '#5A3E22',
    intro: 'Two watches can look identical and sell for different prices. The difference is often a box and a card in a drawer.',
    sections: [
      { h: 'What counts as "papers"', p: 'The warranty card or certificate, ideally dated and stamped by the dealer with the serial number. Manuals, tags and service receipts help too.' },
      { h: 'Why buyers pay more', p: 'Matching papers make the watch easier to verify and easier to resell. In Crown, a full set adds about 6%, and a watch with nothing loses about 7%.' },
      { h: 'Keep everything', list: ['The box and outer box', 'Warranty card and receipt', 'Spare links from the bracelet', 'Service papers from every visit'] },
    ],
  },
  {
    id: 'photo',
    kicker: 'Crown tips',
    title: 'Take a photo that scans first time',
    minutes: 1,
    icon: 'image',
    tint: '#1E4B3A',
    intro: 'Crown reads the dial. A clear photo means a confident match and a tighter value range.',
    sections: [
      { list: ['Fill the frame with the dial, straight on.', 'Use soft daylight, and avoid reflections on the crystal.', 'Wipe the crystal first; fingerprints blur the text.', 'If Crown asks "Is this your watch?", pick the closest match. You can always search by reference.'], h: 'Four quick rules' },
    ],
  },
  {
    id: 'service',
    kicker: 'Care',
    title: 'When does a watch need a service?',
    minutes: 3,
    icon: 'wrench',
    tint: '#3A3F47',
    intro: 'A mechanical watch is a small engine. Oils age, seals dry out, and a service brings it back to spec.',
    sections: [
      { h: 'How often', p: 'Most brands now suggest every 5 to 10 years, depending on the movement and how the watch is worn. Check your brand’s own advice.' },
      { h: 'Signs it is time', list: ['It gains or loses several minutes a day.', 'The power reserve is shorter than it used to be.', 'Condensation under the crystal.', 'The crown or bezel feels gritty.'] },
      { h: 'It protects value', p: 'Keep every service receipt. A documented service history makes a watch easier to sell, just like box and papers.' },
    ],
  },
  {
    id: 'water',
    kicker: 'Know your watch',
    title: 'Water resistance, in plain words',
    minutes: 2,
    icon: 'wave',
    tint: '#2F4A5A',
    intro: 'The depth on the dial is a pressure test, not a promise for that depth. Here is what it means day to day.',
    sections: [
      { h: 'What the numbers mean', list: ['30 m: splashes and rain only.', '50 m: brief swims, not diving.', '100 m: swimming and snorkelling.', '200 m and above: diving, ideally with a screw-down crown.'] },
      { h: 'Keep it that way', p: 'Seals age. Ask for a pressure test once a year if you swim with the watch, and never use the crown or pushers under water.' },
    ],
  },
  {
    id: 'store',
    kicker: 'Care',
    title: 'Storing and winding, without the myths',
    minutes: 2,
    icon: 'moon',
    tint: '#463552',
    intro: 'You do not need a winder or a safe full of gadgets. A few habits keep a watch accurate for years.',
    sections: [
      { h: 'Winding', p: 'For an automatic you have not worn, give it 20 to 40 turns of the crown off the wrist before you put it on. Stopping and starting does no harm.' },
      { h: 'Magnets', p: 'Phone speakers, laptop lids and magnetic bag clasps can magnetise a watch so it suddenly runs fast. A watchmaker can demagnetise it in minutes.' },
      { h: 'Storage', p: 'Somewhere dry, away from direct sun. Keep watches apart so crystals and bezels do not scratch each other.' },
    ],
  },
];

export const guideById = (id?: string) => GUIDES.find(g => g.id === id);
