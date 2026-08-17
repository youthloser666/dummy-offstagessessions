'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Logo3D from '@/components/Logo3D';
import { useReveal } from '@/hooks/useReveal';
import { useSplash } from '@/components/ClientShell';
import { upcomingShows } from '@/lib/data';
import styles from './page.module.css';

const instagramPosts = [
  {
    id: 1,
    image: '/image/tobehonest.png',
    caption: 'TO BE HONEST — Sound Garden',
    url: 'https://instagram.com/offstagesession',
  },
  {
    id: 2,
    image: '/image/nightswim.png',
    caption: 'NIGHT SWIM — 3 Year Anniversary',
    url: 'https://instagram.com/offstagesession',
  },
  {
    id: 3,
    image: '/image/growgarden.png',
    caption: 'GROW GARDEN — Open Air',
    url: 'https://instagram.com/offstagesession',
  },
  {
    id: 4,
    image: '/image/latecheckout.png',
    caption: 'LATE CHECKOUT — Waterfront',
    url: 'https://instagram.com/offstagesession',
  },
  {
    id: 5,
    image: '/image/jackie.png',
    caption: 'JACKIE HOLLANDER — Soundstage',
    url: 'https://instagram.com/offstagesession',
  },
  {
    id: 6,
    image: '/image/shipwreck.png',
    caption: 'SHIP WREK — Power Plant',
    url: 'https://instagram.com/offstagesession',
  },
];

export default function Home() {
  useReveal();
  const { splashState } = useSplash();

  return (
    <main>
      <section className={styles.hero}>
        <video className={styles.heroVideo} autoPlay muted loop playsInline preload="auto">
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          {splashState === 'done' && <Logo3D />}
        </div>
      </section>

      {/* Statement section */}
      <section className={styles.statement}>
        <div className={styles.statementBody}>
          <h2 className={`${styles.statementHeading} reveal`}>
            HOUSE
            <br />
            TECHNO
            <br />
            BASS, AND
            <br />
            <em>EVERYTHING</em>
            <br />
            <em>IN BETWEEN</em>
          </h2>
        </div>
        <div className={styles.statementBottom}>
          <div className={`${styles.statementTag} reveal`}>
            BORN IN
            <br />
            BALTIMORE
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

      {/* Upcoming Shows — Instagram Grid */}
      <section className={styles.showsSection}>
        <div className={styles.showsHeader}>
          <h2 className={styles.upcomingTitle}>
            <span className={styles.titleSolid}>UPCOMING</span>
            <span className={styles.titleOutline}>SHOWS</span>
          </h2>
          <Link href="/shows" className={styles.showsViewAll}>VIEW ALL SHOWS</Link>
        </div>

        <div className={styles.showsGrid}>
          {upcomingShows.map((show) => (
            <Link key={show.id} href={`/shows#show-${show.id}`} className={styles.showsGridCard}>
              <Image
                src={show.poster}
                alt={show.name}
                width={600}
                height={600}
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

        <div className={`${styles.aboutImageBanner} reveal`}>
          {[
            '/image/1.webp',
            '/image/2.webp',
            '/image/3.webp',
            '/image/4.webp',
            '/image/5.webp',
            '/image/6_web.webp',
            '/image/7_web.webp',
            '/image/8_web.webp',
            '/image/9_web.webp',
            '/image/10_web.webp',
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
    </main>
  );
}
