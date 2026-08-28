const socials = [
  {
    name: "Facebook",
    handle: "AR store",
    href: "https://www.facebook.com/ARstorePHILIPPINES",
    className: "fa-facebook",
    icon: (
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8v-1.8c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2h-2.4v2.8h2.4V21h2.7z" />
    ),
  },
  {
    name: "Instagram",
    handle: "@ar_channel",
    href: "https://www.instagram.com/ar_channel/",
    className: "fa-instagram",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4.5" />
        <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16.3" cy="7.7" r="1" />
      </>
    ),
  },
  {
    name: "Shopee",
    handle: "aronman24",
    href: "https://shopee.ph/search?keyword=ar%20store",
    className: "fa-shopee",
    icon: (
      <path
        d="M7 9h10l1 11.2a1.8 1.8 0 0 1-1.8 2H7.8a1.8 1.8 0 0 1-1.8-2L7 9Z M9.2 9V7a2.8 2.8 0 0 1 5.6 0v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    ),
  },
  {
    name: "Lazada",
    handle: "ar-store",
    href: "https://www.lazada.com.ph/shop/ar-store1629968791/",
    className: "fa-lazada",
    icon: (
      <path
        d="M5 8h14l-1.2 10.4a1.6 1.6 0 0 1-1.6 1.4H7.8a1.6 1.6 0 0 1-1.6-1.4L5 8Z M9 8V6.5a3 3 0 0 1 6 0V8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-logo">Ar Store</div>
        <p className="footer-tag">Affordable, customized T-shirts for anime, games, and pop-culture fans.</p>
        <ul className="footer-socials">
          {socials.map((s) => (
            <li key={s.name}>
              <a href={s.href} className={s.className} target="_blank" rel="noreferrer" aria-label={s.name}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  {s.icon}
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="footer-bottom">
        <div className="container">&copy; {new Date().getFullYear()} Ar Store. All rights reserved.</div>
      </div>
    </footer>
  );
}
