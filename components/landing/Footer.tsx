import React from "react";
import Link from "next/link";
import {
  TwitterLogo,
  LinkedinLogo,
  InstagramLogo,
  GithubLogo,
} from "@phosphor-icons/react/dist/ssr";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-100 bg-white py-16 text-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:grid-cols-3">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <span className="font-display text-2xl font-bold tracking-tight text-[#8B5CF6]">
                Memory Lane
              </span>
            </div>
            <p className="max-w-sm text-base leading-relaxed font-light text-neutral-500">
              AI-powered legacy preservation and memory tracking for thoughtful individuals.
            </p>
            <div className="flex items-center space-x-5 text-neutral-400">
              <a
                href="https://x.com/iampraiez"
                className="hover:text-primary-900 transition-colors"
                target="_blank"
              >
                <TwitterLogo weight="duotone" className="white-inner-icon" size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/thepraiseolaoye"
                className="hover:text-primary-900 transition-colors"
                target="_blank"
              >
                <LinkedinLogo weight="duotone" className="white-inner-icon" size={20} />
              </a>
              <a
                href="https://www.instagram.com/iampraiez_?igsh=enI4OWcxOHN1Yml3"
                className="hover:text-primary-900 transition-colors"
                target="_blank"
              >
                <InstagramLogo weight="duotone" className="white-inner-icon" size={20} />
              </a>
              <a
                href="https://github.com/iampraiez/memo"
                className="hover:text-primary-900 transition-colors"
                target="_blank"
              >
                <GithubLogo weight="duotone" className="white-inner-icon" size={20} />
              </a>
            </div>
          </div>

          {/* Product Section */}
          <div>
            <h4 className="mb-6 text-lg font-bold text-neutral-950">Product</h4>
            <ul className="space-y-3 text-base font-medium text-neutral-500">
              <li>
                <Link href="#features" className="transition-colors hover:text-neutral-900">
                  Features
                </Link>
              </li>
              <li>
                <a
                  href="mailto:himpraise571@gmail.com"
                  className="transition-colors hover:text-neutral-900"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/iampraiez/memo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-neutral-900"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://iampraiez.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-neutral-900"
                >
                  About Me
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="mb-6 text-lg font-bold text-neutral-950">Legal</h4>
            <ul className="space-y-3 text-base font-medium text-neutral-500">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-neutral-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-neutral-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-neutral-100 pt-8 text-xs font-medium tracking-widest text-neutral-400 uppercase md:flex-row">
          <p>&copy; {new Date().getFullYear()} Memory Lane. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Built by Praiez</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
