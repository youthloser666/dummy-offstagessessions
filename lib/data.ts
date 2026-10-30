export type Show = {
    id: number | string;
    poster: string;
    dateCode: string;
    date: string;
    name: string;
    subtitle?: string;
    venue: string;
    time: string;
    tags: string[];
    featured?: boolean;
    month: string;
    ticketUrl?: string;
    poshUrl?: string;
};

export type UpcomingShow = Show;

export const shows: Show[] = [
    {
        id: 1,
        poster: '/image/tobehonest_web.webp',
        dateCode: '07.25',
        date: 'Fri<br>Jul 25',
        name: 'TO BE HONEST',
        venue: 'Sound Garden / Arepi, Baltimore',
        time: '4:00 PM — 9:00 PM',
        tags: ['House', 'Techno'],
        featured: true,
        month: 'July 2026',
        ticketUrl: 'https://posh.vip/e/to-be-honest-baltimore',
        poshUrl: 'https://posh.vip/e/to-be-honest-baltimore',
    },
    {
        id: 2,
        poster: '/image/nightswim_web.webp',
        dateCode: '08.14',
        date: 'Fri<br>Aug 14',
        name: 'NIGHT SWIM',
        subtitle: 'OFFSTAGE 3 YEARS ANNIVERSARY',
        venue: 'Raw & Refined, Baltimore',
        time: '6:00 PM — 12:00 AM',
        tags: ['House', 'Techno'],
        month: 'August 2026',
        ticketUrl: 'https://posh.vip/e/night-swim-3-years',
        poshUrl: 'https://posh.vip/e/night-swim-3-years',
    },
    {
        id: 3,
        poster: '/image/growgarden_web.webp',
        dateCode: '08.15',
        date: 'Sat<br>Aug 15',
        name: 'GROW GARDEN',
        subtitle: 'OFFSTAGE 3 YEARS ANNIVERSARY',
        venue: 'Sound Garden / Arepi, Baltimore',
        time: '4:00 PM — 9:00 PM',
        tags: ['House'],
        month: 'August 2026',
        ticketUrl: 'https://posh.vip/e/grow-garden-open-air',
        poshUrl: 'https://posh.vip/e/grow-garden-open-air',
    },
    {
        id: 4,
        poster: '/image/latecheckout_web.webp',
        dateCode: '08.21',
        date: 'Thu<br>Aug 21',
        name: 'LATE CHECKOUT',
        venue: 'Waterfront Hotel, Baltimore',
        time: '7:00 PM — 2:00 AM',
        tags: ['House', 'Bass'],
        month: 'August 2026',
        ticketUrl: 'https://posh.vip/e/late-checkout-baltimore',
        poshUrl: 'https://posh.vip/e/late-checkout-baltimore',
    },
    {
        id: 5,
        poster: '/image/jackie_web.webp',
        dateCode: '09.12',
        date: 'Sat<br>Sep 12',
        name: 'JACKIE HOLLANDER',
        venue: 'Baltimore Soundstage, Baltimore',
        time: '9:00 PM — 2:00 AM',
        tags: ['House', 'Techno'],
        month: 'September 2026',
        ticketUrl: 'https://posh.vip/e/jackie-hollander',
        poshUrl: 'https://posh.vip/e/jackie-hollander',
    },
    {
        id: 6,
        poster: '/image/shipwreck_web.webp',
        dateCode: '10.03',
        date: 'Sat<br>Oct 03',
        name: 'SHIP WREK',
        venue: 'Power Plant Live, Baltimore',
        time: '8:00 PM — 2:00 AM',
        tags: ['Bass', 'House'],
        month: 'October 2026',
        ticketUrl: 'https://posh.vip/e/ship-wrek-live',
        poshUrl: 'https://posh.vip/e/ship-wrek-live',
    },
];
