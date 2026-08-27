export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>&copy; {new Date().getFullYear()} Ar Store. All rights reserved.</p>
        <p className="footer-tag">Affordable, customized T-shirts.</p>
      </div>
    </footer>
  );
}
