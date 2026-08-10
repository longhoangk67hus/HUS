import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h4>About Us</h4>
            <ul>
              <li>About Movie</li>
              <li>Careers</li>
              <li>Press Release</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Help</h4>
            <ul>
              <li>FAQs</li>
              <li>Contact Us</li>
              <li>Feedback</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
              <li>Refund Policy</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Follow</h4>
            <ul>
              <li>Facebook</li>
              <li>Twitter</li>
              <li>Instagram</li>
            </ul>
          </div>
        </div>

        <div className="footer-divider">
          <p>&copy; 2025 Movie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
