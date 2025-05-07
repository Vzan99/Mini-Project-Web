import SocialMedia from "./socialMedia";

export default function Footer() {
  return (
    <div>
      <div className="footer">
        <div className="footer-content">
          <div className="footer-group">
            <img
              className="big-logo"
              src="logo-quick-ticket.png"
              alt="logo-quick-ticket-img"
            ></img>
            <h3 className="title pb-10">
              Ticketing made simple. Events made epic.
            </h3>
            <SocialMedia />
          </div>
          <div className="footer-group">
            <div className="flex gap-10 px-10">
              <div className="text-group">
                <a className="medium-text">Company & legal</a>
                <a className="small-text">Our story</a>
                <a className="small-text">Careers</a>
                <a className="small-text">Terms of use</a>
                <a className="small-text">Terms and conditions</a>
                <a className="small-text">Acceptable use policy</a>
                <a className="small-text">Cookie policy</a>
                <a className="small-text">Privacy policy</a>
              </div>
              <div className="text-group">
                <a className="medium-text">Support</a>
                <a className="small-text">Contact Us</a>
                <a className="small-text">Book a demo</a>
                <a className="small-text">Pricing</a>
                <a className="small-text">Help centre</a>
                <a className="small-text">Partner programs</a>
                <a className="small-text">Accesibility</a>
                <a className="small-text">Developers</a>
              </div>
              <div className="text-group">
                <a className="medium-text">Quicklinks</a>
                <a className="small-text">Ticketing and Event News</a>
                <a className="small-text">Discover live events</a>
                <a className="small-text">Eventbritte alternative</a>
                <a className="small-text">Ticket spice alternative</a>
                <a className="small-text">Ticket source alternative</a>
                <a className="small-text">Venue ticketing</a>
                <a className="small-text">Workshop ticketing</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
