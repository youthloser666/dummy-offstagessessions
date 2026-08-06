import NewsletterForm from './NewsletterForm';

interface FooterProps {
    footerBigText?: string;
}

export default function Footer({ footerBigText = 'Offstage Sessions' }: FooterProps) {
    return (
        <footer id="contact">
            <div className="footer-top">
                <div className="footer-headline reveal">
                    Stay
                    <br />
                    <span>Up To</span>
                    <br />
                    Date
                </div>
                <div className="reveal">
                    <p className="footer-desc">
                        Be the first to know about upcoming events, exclusive drops, and
                        everything happening in the Baltimore and DMV dance music scene.
                    </p>
                    <NewsletterForm />
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-logo-text">
                    OFFSTAGE SESSIONS LLC. EST. 2023
                </div>
                <div className="footer-socials">
                    <a
                        href="https://www.facebook.com/offstagesessions"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Facebook
                    </a>
                    <a
                        href="https://instagram.com/offstagesession"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Instagram
                    </a>
                    <a
                        href="https://www.tiktok.com/@offstagesessions"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        TikTok
                    </a>
                </div>
                <div className="footer-copy">© 2026 Offstage Sessions</div>
            </div>

            <div className="footer-big-text">{footerBigText}</div>
        </footer>
    );
}
