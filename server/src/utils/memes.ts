export type Meme = {
  title: string;
  url: string;
  source: string;
};

const toDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const makeMemeSvg = (title: string, subtitle: string, accent: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="40" y="40" width="820" height="520" rx="28" fill="#0b1220" stroke="${accent}" stroke-width="4"/>
  <text x="90" y="190" fill="#f8fafc" font-size="48" font-family="Segoe UI, Arial, sans-serif" font-weight="700">
    ${title}
  </text>
  <text x="90" y="260" fill="#cbd5f5" font-size="28" font-family="Segoe UI, Arial, sans-serif">
    ${subtitle}
  </text>
  <text x="90" y="420" fill="${accent}" font-size="22" font-family="Segoe UI, Arial, sans-serif">
    AI Crypto Advisor Meme
  </text>
</svg>
`;

export const memes: Meme[] = [
  {
    title: 'HODL Mode',
    url: toDataUrl(makeMemeSvg('HODL Mode: ON', 'When the chart drops but you stay calm', '#38bdf8')),
    source: 'inline-svg'
  },
  {
    title: 'Buy The Dip',
    url: toDataUrl(makeMemeSvg('Buy The Dip', 'Refreshing the chart every 5 seconds', '#22c55e')),
    source: 'inline-svg'
  },
  {
    title: 'Altcoin Season',
    url: toDataUrl(makeMemeSvg('Altcoin Season', 'Every bag is a moon mission', '#f97316')),
    source: 'inline-svg'
  },
  {
    title: 'Diamond Hands',
    url: toDataUrl(makeMemeSvg('Diamond Hands', 'Sell button removed from keyboard', '#a855f7')),
    source: 'inline-svg'
  },
  {
    title: 'To The Moon',
    url: toDataUrl(makeMemeSvg('To The Moon', 'Launching in 3...2...1', '#facc15')),
    source: 'inline-svg'
  }
];
