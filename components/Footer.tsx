import NewsletterForm from './NewsletterForm';

interface FooterProps {
    footerBigText?: string;
}

export default function Footer({ footerBigText = 'Offstage Sessions' }: FooterProps) {
    return (
        <footer id="contact">
            <div className="footer-top">
                <div className="footer-headline anton reveal">
                    Stay
                    <br />
                    <span>Up To</span>
                    <br />
                    Date
                </div>
                <div className="reveal">
                    <div className="footer-right-label">Newsletter</div>
                    <p className="footer-desc">
                        Get the latest Baltimore and DMV electronic dance music events
                        delivered straight to your inbox. No spam — just shows.
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
                <div className="footer-copy">© 2025 Offstage Sessions</div>
            </div>

            <div className="footer-big-text">{footerBigText}</div>
        </footer>
    );
}
