'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TiltCard from '@/components/TiltCard';
import { useReveal } from '@/hooks/useReveal';
import { upcomingShows } from '@/lib/data';
import styles from './page.module.css';

const instagramPosts = [
  {
    id: 1,
    image: '/image/tobehonest_web.webp',
    caption: 'TO BE HONEST — Sound Garden',
    url: 'https://instagram.com/offstagesession',
  },
  {
    id: 2,
    image: '/image/nightswim_web.webp',
    caption: 'NIGHT SWIM — 3 Year Anniversary',
    url: 'https://instagram.com/offstagesession',
  },
  {
    id: 3,
    image: '/image/growgarden_web.webp',
    caption: 'GROW GARDEN — Open Air',
    url: 'https://instagram.com/offstagesession',
  },
  {
    id: 4,
    image: '/image/latecheckout_web.webp',
    caption: 'LATE CHECKOUT — Waterfront',
    url: 'https://instagram.com/offstagesession',
  },
  {
    id: 5,
    image: '/image/jackie_web.webp',
    caption: 'JACKIE HOLLANDER — Soundstage',
    url: 'https://instagram.com/offstagesession',
  },
  {
    id: 6,
    image: '/image/shipwreck_web.webp',
    caption: 'SHIP WREK — Power Plant',
    url: 'https://instagram.com/offstagesession',
  },
];

export default function Home() {
  useReveal();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Kinetic Masked Typography (Split-Line Reveal)
      gsap.fromTo(
        `.${styles.statementLine}`,
        { yPercent: 120, rotate: 2, opacity: 0 },
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.09,
          scrollTrigger: {
            trigger: `.${styles.statement}`,
            start: 'top 75%',
          },
        }
      );

      gsap.fromTo(
        `.${styles.statementTagLine}`,
        { yPercent: 120, rotate: -2, opacity: 0 },
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: `.${styles.statement}`,
            start: 'top 65%',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative z-10 w-full" style={{ background: 'transparent', position: 'relative', zIndex: 10 }}>
      {/* Hero Section (Layar Pertama) */}
      <section className={`relative flex h-screen w-full flex-col items-center justify-center z-10 px-4 ${styles.heroBrutalist}`}>
        <h1 className={`text-center text-[10vw] md:text-[7vw] font-black uppercase leading-[0.9] text-white mix-blend-difference ${styles.heroBrutalistTitle}`}>
          THE BEST<br />
          MOMENTS ARE<br />
          MADE OFFSTAGE
        </h1>
      </section>

      {/* Statement section with Kinetic Split-Line Reveal (Layar Kedua / Di Bawah Hero) */}
      <section className={`${styles.statement} relative z-10`} style={{ position: 'relative', zIndex: 10 }}>
        <div className={styles.statementBody}>
          <h2 className={styles.statementHeading}>
            <div className={styles.statementMask}>
              <span className={styles.statementLine}>HOUSE</span>
            </div>
            <div className={styles.statementMask}>
              <span className={styles.statementLine}>TECHNO</span>
            </div>
            <div className={styles.statementMask}>
              <span className={styles.statementLine}>BASS, AND</span>
            </div>
            <div className={styles.statementMask}>
              <span className={`${styles.statementLine} ${styles.acidText}`}>EVERYTHING</span>
            </div>
            <div className={styles.statementMask}>
              <span className={`${styles.statementLine} ${styles.acidText}`}>IN BETWEEN</span>
            </div>
          </h2>
        </div>
        <div className={styles.statementBottom}>
          <div className={styles.statementTag}>
            <div className={styles.statementMask}>
              <span className={styles.statementTagLine}>BORN IN</span>
            </div>
            <div className={styles.statementMask}>
              <span className={styles.statementTagLine}>BALTIMORE</span>
            </div>
          </div>
        </div>
        <div className={styles.checkoutMarquee}>
          <div className={styles.checkoutTrack}>
            {[...Array(6)].map((_, i) => (
              <span key={i} className={styles.checkoutItem}>
                CHECKOUT UPCOMING EVENTS
                <img src="/image/dots.svg" alt="dots" className={styles.checkoutDots} />
              </span>
            ))}
            {[...Array(6)].map((_, i) => (
              <span key={`dup-${i}`} className={styles.checkoutItem}>
                CHECKOUT UPCOMING EVENTS
                <img src="/image/dots.svg" alt="dots" className={styles.checkoutDots} />
              </span>
            ))}
          </div>
          <div className={styles.checkoutTrackReverse}>
            {[...Array(6)].map((_, i) => (
              <span key={i} className={styles.checkoutItem}>
                CHECKOUT UPCOMING EVENTS
                <img src="/image/dots.svg" alt="dots" className={styles.checkoutDots} />
              </span>
            ))}
            {[...Array(6)].map((_, i) => (
              <span key={`dup2-${i}`} className={styles.checkoutItem}>
                CHECKOUT UPCOMING EVENTS
                <img src="/image/dots.svg" alt="dots" className={styles.checkoutDots} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Shows */}
      <section className={styles.upcomingShowsSection}>
        <div className={styles.upcomingShowsHeader}>
          <h2 className={styles.upcomingTitle}>
            <span className={styles.titleSolid}>UPCOMING</span>
            <span className={styles.titleOutline}>SHOWS</span>
          </h2>
          <Link href="/shows" className={styles.showsViewAll} data-cursor="EXPLORE" data-cursor-magnetic="true">
            VIEW ALL SHOWS
          </Link>
        </div>

        <div className={styles.upcomingShowsGrid}>
          {upcomingShows.map((show) => (
            <TiltCard key={show.id} maxTilt={10} scale={1.03}>
              <Link
                href={`/shows#show-${show.id}`}
                className={styles.showsGridCard}
                data-cursor="VIEW"
              >
                <Image
                  src={show.poster}
                  alt={show.name}
                  width={600}
                  height={800}
                  className={styles.showsGridCardImg}
                />
                <div className={styles.showsGridCardOverlay} />
                <div className={styles.showsGridCardInfo}>
                  <div className={styles.showDate}>{show.dateCode}</div>
                  <h3 className={styles.showName}>{show.name}</h3>
                  {show.subtitle && <div className={styles.showSub}>{show.subtitle}</div>}
                  <div className={styles.showVenue}>{show.venue}</div>
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Instagram Feed */}
      <section className={styles.instagramSection}>
        <div className={styles.instagramHeader}>
          <h2 className={styles.instagramTitle}>
            <span>FOLLOW US ON</span>
            <span className={styles.instagramOutline}>INSTAGRAM</span>
          </h2>
        </div>

        <div className={styles.instagramMarquee}>
          {/* Double the posts for seamless loop */}
          {[...instagramPosts, ...instagramPosts].map((post, i) => (
            <a
              key={`${post.id}-${i}`}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramPost}
              data-cursor="VISIT ↗"
            >
              <Image
                src={post.image}
                alt={post.caption}
                width={300}
                height={300}
                className={styles.instagramPostImg}
              />
              <div className={styles.instagramPostOverlay}>
                <span className={styles.instagramPostIcon}>
                  ↗ {post.caption}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.about} id="about">
        <div className={`${styles.aboutHeader} reveal`}>
          <h2 className={styles.aboutTitle}>
            <span>ABOUT</span>
            <span className={styles.aboutTitleOutline}>OFFSTAGE</span>
          </h2>
        </div>

        <div className={`${styles.aboutGrid} reveal`}>
          <div className={styles.aboutCol}>
            <p className={styles.aboutParagraph}>
              Offstage started the way a lot of good things do, with a couple of friends who loved dance music and felt like Baltimore deserved more of it. What began as throwing house music nights at local bars slowly turned into something bigger as those rooms filled up, word spread, and the community kept showing up. There was never a grand plan, just a shared belief that the best nights are built on good music, good people, and a space where everyone feels welcome.
            </p>
            <p className={styles.aboutParagraph}>
              At its core, Offstage is still about friends throwing parties for the city they love. It is about late nights, shared memories, and the kind of connection you only get when the lights are low and the music hits just right. The best moments are made Offstage, and everyone is invited.
            </p>
          </div>

          <div className={styles.aboutCol}>
            <p className={styles.aboutParagraph}>
              As the crowds grew, so did the vision. Offstage began bringing in nationally and globally recognized artists while staying rooted in the local scene that made it possible. Each event is built with intention, from the sound and production to the energy in the room, blending house, techno, bass, and everything in between. The goal has always been to create moments that feel personal, inclusive, and electric, whether it is an intimate dance floor or a packed room moving as one.
            </p>

          </div>
        </div>

        <div className={`${styles.aboutImageBanner} relative reveal`}>
          {/* Soft Fade Overlays */}
          <div
            className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black to-transparent pointer-events-none z-10"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6rem', backgroundImage: 'linear-gradient(to bottom, #000000, transparent)', pointerEvents: 'none', zIndex: 10 }}
          />
          <div
            className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-10"
            style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '6rem', backgroundImage: 'linear-gradient(to top, #000000, transparent)', pointerEvents: 'none', zIndex: 10 }}
          />

          {[
            '/image/1_web.webp',
            '/image/2_web.webp',
            '/image/3_web.webp',
            '/image/4_web.webp',
            '/image/5_web.webp',
            '/image/6_web_web.webp',
            '/image/7_web_web.webp',
            '/image/8_web_web.webp',
            '/image/9_web_web.webp',
            '/image/10_web_web.webp',
          ].map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={`Offstage moment ${i + 1}`}
              width={1200}
              height={500}
              className={`${styles.bannerImg} ${styles[`bannerSlide${i}`]}`}
            />
          ))}
          <div className={styles.aboutBadge}>BORN IN BALTIMORE · EST 2023</div>
        </div>
      </section>

      {/* The Footer serves as the contact section correctly per layout */}
    </div>
  );
}
