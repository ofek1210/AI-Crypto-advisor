export type Meme = {
  title: string;
  url: string;
  source: string;
};

type MemeSeed = {
  title: string;
  subtitle: string;
  accent: string;
};

const buildMemeUrl = (seed: MemeSeed) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <rect x="40" y="40" width="820" height="520" rx="28" fill="#0b1220" stroke="${seed.accent}" stroke-width="4" />
      <text x="90" y="190" fill="#f8fafc" font-size="48" font-family="Segoe UI, Arial, sans-serif" font-weight="700">
        ${seed.title}
      </text>
      <text x="90" y="260" fill="#cbd5f5" font-size="28" font-family="Segoe UI, Arial, sans-serif">
        ${seed.subtitle}
      </text>
      <text x="90" y="420" fill="${seed.accent}" font-size="22" font-family="Segoe UI, Arial, sans-serif">
        AI Crypto Advisor Meme
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const memeSeeds: MemeSeed[] = [
  {
    title: 'HODL Mode: ON',
    subtitle: 'When the chart drops but you stay calm',
    accent: '#38bdf8'
  },
  {
    title: 'Altcoin Season',
    subtitle: 'Portfolio: 99% hope, 1% logic',
    accent: '#a855f7'
  },
  {
    title: 'Buy The Dip',
    subtitle: 'Refreshing the chart every 5 seconds',
    accent: '#22c55e'
  }
];

export const memes: Meme[] = memeSeeds.map((seed) => ({
  title: seed.title,
  url: buildMemeUrl(seed),
  source: 'inline-svg'
}));
