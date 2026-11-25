'use client';

import { useState, useEffect } from 'react';

export interface PublicSocials {
  email: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  spotify?: string;
  soundcloud?: string;
  youtube?: string;
}

const DEFAULT_SOCIALS: PublicSocials = {
  email: 'offstage@offstagesessions.com',
  facebook: 'https://www.facebook.com/offstagesessions',
  instagram: 'https://instagram.com/offstagesession',
  tiktok: 'https://www.tiktok.com/@offstagesessions',
};

let cachedSocials: PublicSocials | null = null;
let pendingFetch: Promise<PublicSocials> | null = null;

async function fetchSocialsData(): Promise<PublicSocials> {
  if (cachedSocials) return cachedSocials;
  if (pendingFetch) return pendingFetch;

  pendingFetch = fetch('/api/socials')
    .then((res) => res.json())
    .then((json) => {
      if (json.success && json.data) {
        cachedSocials = {
          email: json.data.email || DEFAULT_SOCIALS.email,
          facebook: json.data.facebook || DEFAULT_SOCIALS.facebook,
          instagram: json.data.instagram || DEFAULT_SOCIALS.instagram,
          tiktok: json.data.tiktok || DEFAULT_SOCIALS.tiktok,
          spotify: json.data.spotify,
          soundcloud: json.data.soundcloud,
          youtube: json.data.youtube,
        };
        return cachedSocials;
      }
      return DEFAULT_SOCIALS;
    })
    .catch(() => DEFAULT_SOCIALS)
    .finally(() => {
      pendingFetch = null;
    });

  return pendingFetch;
}

export function usePublicSocials() {
  const [socials, setSocials] = useState<PublicSocials>(cachedSocials || DEFAULT_SOCIALS);

  useEffect(() => {
    let isMounted = true;
    fetchSocialsData().then((data) => {
      if (isMounted) setSocials(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return socials;
}
