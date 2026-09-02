export type Show = {
    id: number;
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
        ticketUrl: 'https://shotgun.live/events/to-be-honest-baltimore',
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
        ticketUrl: 'https://shotgun.live/events/night-swim-3-years',
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
        ticketUrl: 'https://shotgun.live/events/grow-garden-open-air',
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
        ticketUrl: 'https://shotgun.live/events/late-checkout-baltimore',
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
        ticketUrl: 'https://shotgun.live/events/jackie-hollander',
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
        ticketUrl: 'https://shotgun.live/events/ship-wrek-live',
    },
];

export const upcomingShows: Show[] = shows.slice(0, 4);

export type MediaItem = {
    id: number;
    title: string;
    type: string;
    src: string;
    thumbnail: string;
};

export type Product = {
    id: number;
    name: string;
    price: number;
    image: string;
    hoverImage?: string;
    category: string;
    sizes?: string[];
    badge?: 'New' | 'Sold Out' | 'Limited';
};

export type ShopCategory = {
    id: string;
    name: string;
    image: string;
};

export const mediaItems: MediaItem[] = [
    {
        id: 1,
        title: 'Offstage Open Air Aftermovie',
        type: 'Video',
        src: 'https://www.youtube.com/embed/placeholder1',
        thumbnail: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800',
    },
    {
        id: 2,
        title: 'San Pacho — Live at Soundstage',
        type: 'Mix',
        src: 'https://w.soundcloud.com/player/?url=placeholder',
        thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    },
    {
        id: 3,
        title: 'Warehouse Sessions 001',
        type: 'Gallery',
        src: '/gallery/warehouse',
        thumbnail: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800',
    },
];

export const shopCategories: ShopCategory[] = [
    {
        id: 'Tees',
        name: 'T-Shirts',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    },
    {
        id: 'Headwear',
        name: 'Headwear',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600',
    },
    {
        id: 'Sweatshirts',
        name: 'Sweatshirts',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
    },
    {
        id: 'Accessories',
        name: 'Accessories',
        image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=600',
    },
];

export const products: Product[] = [
    {
        id: 1,
        name: 'Offstage Logo Tee',
        price: 35,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        hoverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
        category: 'Tees',
        sizes: ['S', 'M', 'L', 'XL'],
        badge: 'New',
    },
    {
        id: 2,
        name: 'Warehouse Sessions Tee',
        price: 38,
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
        hoverImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        category: 'Tees',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
        id: 3,
        name: 'Acid Smiley Tee',
        price: 35,
        image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800',
        category: 'Tees',
        sizes: ['S', 'M', 'L', 'XL'],
    },
    {
        id: 4,
        name: 'Baltimore Graphic Tee',
        price: 40,
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        category: 'Tees',
        sizes: ['M', 'L', 'XL'],
        badge: 'Limited',
    },
    {
        id: 5,
        name: 'OS Dad Hat',
        price: 28,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        hoverImage: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800',
        category: 'Headwear',
        sizes: ['O/S'],
    },
    {
        id: 6,
        name: 'Offstage 5-Panel Cap',
        price: 32,
        image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800',
        category: 'Headwear',
        sizes: ['O/S'],
        badge: 'New',
    },
    {
        id: 7,
        name: 'Drop 001 Hoodie',
        price: 65,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        hoverImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        category: 'Sweatshirts',
        sizes: ['S', 'M', 'L', 'XL'],
    },
    {
        id: 8,
        name: 'Heavyweight Crewneck',
        price: 55,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        category: 'Sweatshirts',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
        id: 9,
        name: 'Acid Zip-Up Hoodie',
        price: 72,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        category: 'Sweatshirts',
        sizes: ['S', 'M', 'L'],
        badge: 'Sold Out',
    },
    {
        id: 10,
        name: 'Acid Smiley Slipmat',
        price: 20,
        image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800',
        category: 'Accessories',
        sizes: ['O/S'],
    },
    {
        id: 11,
        name: 'Offstage Tote Bag',
        price: 25,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        category: 'Accessories',
        sizes: ['O/S'],
        badge: 'New',
    },
    {
        id: 12,
        name: 'Enamel Pin Set',
        price: 15,
        image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800',
        category: 'Accessories',
        sizes: ['O/S'],
    },
];
