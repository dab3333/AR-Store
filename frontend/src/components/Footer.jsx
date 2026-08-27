export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-tag">&copy; {new Date().getFullYear()} Ar Store. All rights reserved.</p>
          <p className="footer-tag">Affordable, customized T-shirts.</p>
        </div>
        <ul className="footer-socials">
          <li>
            <a href="https://www.facebook.com/ARstorePHILIPPINES" className="fa-facebook" target="_blank" rel="noreferrer">
              Facebook
            </a>
            AR store
          </li>
          <li>
            <a href="https://www.instagram.com/ar_channel/" className="fa-instagram" target="_blank" rel="noreferrer">
              Instagram
            </a>
            @ar_channel
          </li>
          <li>
            <a href="https://shopee.ph/search?keyword=ar%20store" className="fa-shopee" target="_blank" rel="noreferrer">
              Shopee
            </a>
            aronman24
          </li>
          <li>
            <a
              href="https://www.lazada.com.ph/shop/ar-store1629968791/"
              className="fa-lazada"
              target="_blank"
              rel="noreferrer"
            >
              Lazada
            </a>
            ar-store
          </li>
        </ul>
      </div>
    </footer>
  );
}
