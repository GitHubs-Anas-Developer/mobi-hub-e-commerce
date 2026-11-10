import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E2E8F0] bg-[#0F172A] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-2xl font-extrabold tracking-tight text-white"
            >
              MOBI<span className="text-[#60A5FA]"> HUB</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              Discover quality tech accessories designed to make your everyday
              digital life smarter, easier, and better.
            </p>

            {/* Social Links */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
              <a
                href="#"
                aria-label="Facebook"
                className="text-slate-400 transition hover:text-white"
              >
                Facebook
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="text-slate-400 transition hover:text-white"
              >
                Instagram
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="text-slate-400 transition hover:text-white"
              >
                YouTube
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">Shop</h3>

            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/products" className="hover:text-white">
                  All Products
                </Link>
              </li>

              <li>
                <Link href="/categories" className="hover:text-white">
                  Categories
                </Link>
              </li>

              <li>
                <Link href="/products?sort=newest" className="hover:text-white">
                  New Arrivals
                </Link>
              </li>

              <li>
                <Link
                  href="/products?isFeatured=true"
                  className="hover:text-white"
                >
                  Featured Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Customer Service
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/account" className="hover:text-white">
                  My Account
                </Link>
              </li>

              <li>
                <Link href="/account/orders" className="hover:text-white">
                  Track Orders
                </Link>
              </li>

              <li>
                <Link href="/account/returns" className="hover:text-white">
                  Returns & Refunds
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Get In Touch
            </h3>

            <ul className="mt-5 space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 shrink-0" />
                <span>support@mobihub.com</span>
              </li>

              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 shrink-0" />
                <span>Contact support for assistance</span>
              </li>

              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 flex flex-col gap-4 border-t border-slate-700 pt-6 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© 2026 MOBI HUB. All rights reserved.</p>
          <div className="flex justify-center gap-5">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>

            <Link href="/terms" className="hover:text-white">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
