"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NavBar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    // Close mobile menu if open
    setIsMenuOpen(false);
  };

  const navigateToHome = () => {
    router.push("/");
    setIsMenuOpen(false);
  };

  const navigateToLogin = () => {
    router.push("/auth/login");
    setIsMenuOpen(false);
  };

  const navigateToRegister = () => {
    router.push("/auth/register");
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById("mobile-menu");
      const hamburgerButton = document.getElementById("hamburger-button");

      if (
        isMenuOpen &&
        mobileMenu &&
        hamburgerButton &&
        !mobileMenu.contains(event.target as Node) &&
        !hamburgerButton.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div>
      <div className="navbar px-4 sm:px-[50px]">
        <div className="nav-buttons-group items-center">
          <Image
            className="small-logo"
            src="/logo-quick-ticket.png" // Path relative to the public folder
            alt="logo-quick-ticket"
            onClick={navigateToHome}
            style={{ cursor: "pointer", width: "50px", height: "50px" }}
            width={50}
            height={50}
          />
          <div
            className="nav-logo-text hidden sm:block"
            onClick={navigateToHome}
            style={{ cursor: "pointer" }}
          >
            Quick Ticket
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links-group hidden lg:flex">
          <a href="#" onClick={scrollToEvents} className="links">
            Events
          </a>
          <Link href="/discover" className="links">
            Discover
          </Link>
          <Link href="/events/create" className="links">
            Create Events
          </Link>
          <Link href="/about" className="links">
            About
          </Link>
        </div>

        <div className="nav-buttons-group hidden lg:flex">
          <button className="buttonB" onClick={navigateToRegister}>
            Get Started
          </button>
          <button className="buttonA" onClick={navigateToLogin}>
            Sign In
          </button>
        </div>

        {/* Mobile & Tablet Hamburger Menu */}
        <button
          id="hamburger-button"
          className="lg:hidden flex flex-col justify-center items-center w-10 h-10 cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span
            className={`bg-black block h-1 w-6 rounded-sm transition-all duration-300 ease-out ${
              isMenuOpen ? "rotate-45 translate-y-1.5" : "-translate-y-1"
            }`}
          ></span>
          <span
            className={`bg-black block h-1 w-6 rounded-sm my-0.5 ${
              isMenuOpen ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300 ease-out`}
          ></span>
          <span
            className={`bg-black block h-1 w-6 rounded-sm transition-all duration-300 ease-out ${
              isMenuOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-1"
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile & Tablet Menu */}
      <div
        id="mobile-menu"
        className={`fixed top-[80px] left-0 w-full bg-[#F4BFBF] z-40 shadow-lg transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        } lg:hidden`}
      >
        <div className="flex flex-col p-5 space-y-4 overflow-x-hidden max-w-screen">
          <a
            href="#"
            onClick={scrollToEvents}
            className="text-[#222432] text-lg font-medium hover:text-[#6096B4]"
          >
            Events
          </a>
          <Link
            href="/discover"
            onClick={() => setIsMenuOpen(false)}
            className="text-[#222432] text-lg font-medium hover:text-[#6096B4]"
          >
            Discover
          </Link>
          <Link
            href="/events/create"
            onClick={() => setIsMenuOpen(false)}
            className="text-[#222432] text-lg font-medium hover:text-[#6096B4]"
          >
            Create Events
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMenuOpen(false)}
            className="text-[#222432] text-lg font-medium hover:text-[#6096B4]"
          >
            About
          </Link>
          <div className="flex flex-col space-y-3 pt-3">
            <button className="buttonB w-full" onClick={navigateToRegister}>
              Get Started
            </button>
            <button className="buttonA w-full" onClick={navigateToLogin}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
