export default function SocialMedia() {
  return (
    <div>
      <div className="social-links-container">
        <a
          href="https://www.facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img className="social-links" src="/logo-fb.png" alt="Facebook"></img>
        </a>
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="social-links"
            src="/logo-ig.png"
            alt="Instagram"
          ></img>
        </a>
        <a href="https://x.com/" target="_blank" rel="noopener noreferrer">
          <img
            className="social-links"
            src="/logo-twitter.png"
            alt="Twitter"
          ></img>
        </a>
        <a
          href="https://www.linkedin.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="social-links"
            src="/logo-linkedin.png"
            alt="LinkedIn"
          ></img>
        </a>
        <a
          href="https://www.youtube.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="social-links"
            src="/logo-youtube.png"
            alt="YouTube"
          ></img>
        </a>
      </div>
    </div>
  );
}
