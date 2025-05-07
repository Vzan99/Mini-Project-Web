"use client";

import Link from "next/link";
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();

  const scrollToEvents = (e: React.MouseEvent) => {
    e.preventDefault();

    // If on homepage, scroll to concert section
    if (window.location.pathname === "/") {
      const concertSection = document.querySelector('[data-section="concert"]');
      if (concertSection) {
        concertSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If on another page, navigate to homepage and then scroll
      router.push("/#concert");
    }
  };

  const navigateToHome = () => {
    router.push("/");
  };

  return (
    <div>
      <div className="navbar">
        <div className="nav-buttons-group items-center">
          <img
            className="small-logo"
            src="logo-quick-ticket.png"
            alt="logo-quick-ticket"
            onClick={navigateToHome}
            style={{ cursor: "pointer" }}
          ></img>
          <div
            className="nav-logo-text"
            onClick={navigateToHome}
            style={{ cursor: "pointer" }}
          >
            Quick Ticket
          </div>
        </div>
        <div className="nav-links-group">
          <a href="#" onClick={scrollToEvents} className="links">
            Events
          </a>
          <Link href="/" className="links">
            Locations
          </Link>
          <Link href="/" className="links">
            Category
          </Link>
          <Link href="/" className="links">
            About
          </Link>
        </div>
        <div className="nav-buttons-group">
          <button className="buttonA">Sign In</button>
          <button className="buttonB">Get Started</button>
        </div>
      </div>
    </div>
  );
}
