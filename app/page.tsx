'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import InteractiveLogo from '@/components/InteractiveLogo';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReveal } from '@/hooks/useReveal';
import { shows, upcomingShows } from '@/lib/data';
import styles from './page.module.css';

export default function Home() {
  useReveal();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Upcoming Shows horizontal scroll trigger
      const showsWrapper = document.getElementById('shows-hscroll');
      if (showsWrapper) {
        const getScrollAmount = () => Math.max(0, showsWrapper.scrollWidth - window.innerWidth);
        gsap.to(showsWrapper, {
          x: () => -getScrollAmount(),
          ease: 'none',
          scrollTrigger: {
            trigger: '#shows-container',
            start: 'top top',
            end: () => '+=' + getScrollAmount(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }

      // Explore Venues horizontal scroll trigger
      const venuesWrapper = document.getElementById('hscroll');
      if (venuesWrapper) {
        const getScrollAmount = () => Math.max(0, venuesWrapper.scrollWidth - window.innerWidth);
        gsap.to(venuesWrapper, {
          x: () => -getScrollAmount(),
          ease: 'none',
          scrollTrigger: {
            trigger: '#venues-container',
            start: 'top top',
            end: () => '+=' + getScrollAmount(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }
    });

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  const previewShows = shows.slice(0, 3); // Map first 3 items

  return (
    <main>
      <section className={styles.hero}>
        <video className={styles.heroVideo} autoPlay muted loop playsInline>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <InteractiveLogo />
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

      {/* Upcoming Shows Scroll Container */}
      <div className={`${styles.hScrollContainer} ${styles.hScrollContainerShows}`} id="shows-container">
        <div className={styles.hScrollWrapper} id="shows-hscroll">
          <span className={styles.hSectionLabel}></span>

          <div className={styles.showsTitleCard}>
            <h2 className={styles.upcomingTitle}>
              <span className={styles.titleSolid}>UPCOMING</span>
              <span className={styles.titleOutline}>SHOWS</span>
            </h2>
          </div>

          {upcomingShows.map((show) => (
            <Link key={show.id} href={`/shows#show-${show.id}`} className={styles.showCard}>
              <Image
                src={show.poster}
                alt={show.name}
                width={600}
                height={800}
                className={styles.showPosterImg}
                style={{ objectFit: 'cover' }}
              />
              <div className={styles.showCardInner}>
                <span className={styles.moreInfoBtn}>MORE INFORMATIONS</span>
                <div className={styles.showDate}>{show.dateCode}</div>
                <h3 className={styles.showName}>{show.name}</h3>
                {show.subtitle && <div className={styles.showSub}>{show.subtitle}</div>}
                <div className={styles.showVenue}>{show.venue}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Explore Venues Scroll Container */}
      <div className={`${styles.hScrollContainer} ${styles.hScrollContainerVenues}`} id="venues-container">
        <div className={styles.hScrollWrapper} id="hscroll">
          <span className={styles.hSectionLabel}>Explore Venues</span>
          <div className={styles.card}>
            <Image
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600"
              alt="Warehouse"
              width={600}
              height={800}
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.cardInner}>
              <h3>Warehouses</h3>
              <div className={styles.cardSub}>Industrial underground</div>
            </div>
          </div>
          <div className={styles.card}>
            <Image
              src="https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600"
              alt="Bar"
              width={600}
              height={800}
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.cardInner}>
              <h3>Bars & Clubs</h3>
              <div className={styles.cardSub}>Intimate floor</div>
            </div>
          </div>
          <div className={styles.card}>
            <Image
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600"
              alt="Outdoor"
              width={600}
              height={800}
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.cardInner}>
              <h3>Outdoor</h3>
              <div className={styles.cardSub}>Open air sessions</div>
            </div>
          </div>
          <div className={styles.card}>
            <Image
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"
              alt="Festival"
              width={600}
              height={800}
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.cardInner}>
              <h3>Festivals</h3>
              <div className={styles.cardSub}>Large scale energy</div>
            </div>
          </div>
          <div className={styles.card}>
            <Image
              src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600"
              alt="Pop-up"
              width={600}
              height={800}
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.cardInner}>
              <h3>Pop-Ups</h3>
              <div className={styles.cardSub}>Unexpected spaces</div>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.about} id="about">
        <div className={`${styles.aboutHeader} reveal`}>
          <h2 className={styles.aboutTitle}>
            <span>ABOUT</span>
            <span>OFFSTAGE</span>
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

            <div className={styles.aboutStats}>
              <div>
                <div className={styles.statNum}>50+</div>
                <div className={styles.statLabel}>Events curated</div>
              </div>
              <div>
                <div className={styles.statNum}>2</div>
                <div className={styles.statLabel}>Cities, one scene</div>
              </div>
              <div>
                <div className={styles.statNum}>EST 2023</div>
                <div className={styles.statLabel}>Founded</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.aboutImageBanner} reveal`}>
          <Image
            src="/crowd.jpeg"
            alt="Crowd"
            width={1200}
            height={500}
            className={styles.bannerImg}
          />
          <div className={styles.aboutBadge}>BORN IN BALTIMORE · EST 2023</div>
        </div>
      </section>

      {/* The Footer serves as the contact section correctly per layout */}
    </main>
  );
}
