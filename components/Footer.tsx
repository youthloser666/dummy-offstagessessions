import ContactEmailForm from './ContactEmailForm';

interface FooterProps {
    footerBigText?: string;
}

export default function Footer({ footerBigText = 'Offstage Sessions' }: FooterProps) {
    return (
        <footer id="contact">
            <div className="footer-top">
                <div className="footer-headline reveal">
                    Get
                    <br />
                    <span>In</span>
                    <br />
                    Touch
                </div>
                <div className="reveal">
                    <p className="footer-desc">
                        Have a question, booking inquiry, or want to collaborate with Offstage Sessions?
                        Send us a message directly.
                    </p>
                    <ContactEmailForm />
                    <div className="footer-contact-block">
                        <span className="footer-contact-label">DIRECT EMAIL</span>
                        <a
                            href="mailto:offstage@offstagesessions.com"
                            className="footer-contact-mail"
                            data-cursor="EMAIL"
                            data-hover
                        >
                            offstage@offstagesessions.com ↗
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-logo-text">
                    OFFSTAGE SESSIONS LLC. EST. 2023
                </div>
                <div className="footer-socials">
                    <a
                        href="mailto:offstage@offstagesessions.com"
                        data-cursor="EMAIL"
                        data-hover
                    >
                        Email
                    </a>
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
