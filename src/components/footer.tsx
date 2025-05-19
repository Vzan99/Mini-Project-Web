import SocialMedia from "./socialMedia";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#FFD9C0] py-8 md:py-12 relative">
      <div className="container mx-auto px-6 md:px-10">
        <div className="flex flex-col lg:flex-row lg:justify-between">
          {/* Logo and Tagline Section */}
          <div className="flex flex-col items-center md:items-start mb-8 lg:mb-0 lg:max-w-[60%]">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10 mb-6">
              <Image
                className="h-[80px] w-[100px] md:h-[100px] md:w-[120px]"
                src="/logo-quick-ticket.png" 
                alt="Quick Ticket Logo"
                width={120}
                height={100}
              />
              <div className="flex flex-col gap-2 text-center md:text-left">
                <p className="text-2xl md:text-3xl lg:text-4xl font-fraunces font-bold">
                  Ticketing made simple.
                </p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-fraunces font-bold">
                  Events make epic.
                </p>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-4">
              <SocialMedia />
            </div>
          </div>

          {/* Links Section - Hidden on mobile only */}
          <div className="hidden md:block lg:max-w-[55%]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 lg:gap-16">
              {/* Company & Legal */}
              <div className="flex flex-col">
                <h3 className="text-lg font-bold mb-4">Company & legal</h3>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Our story
                </a>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Careers
                </a>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Terms of use
                </a>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Privacy policy
                </a>
              </div>

              {/* Support */}
              <div className="flex flex-col">
                <h3 className="text-lg font-bold mb-4">Support</h3>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Contact Us
                </a>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Book a demo
                </a>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Pricing
                </a>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Help centre
                </a>
              </div>

              {/* Quicklinks */}
              <div className="flex flex-col">
                <h3 className="text-lg font-bold mb-4">Quicklinks</h3>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Ticketing News
                </a>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Discover events
                </a>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Venue ticketing
                </a>
                <a className="text-sm mb-2 hover:underline cursor-pointer">
                  Workshop ticketing
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright - Visible on all screens */}
        <div className="mt-8 pt-6 border-t border-black text-center md:text-left">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Quick Ticket. All rights reserved.
          </p>
        </div>
      </div>

      {/* Test Review Link - Bottom Right Corner */}
      <div className="absolute bottom-4 right-4">
        <div className="flex flex-row gap-2">
          <Link
            href="/past-events"
            className="bg-[#222432] text-white px-4 py-2 rounded-full hover:bg-opacity-90 text-sm flex items-center shadow-lg"
          >
            Past Events
          </Link>
        </div>
      </div>
    </footer>
  );
}
