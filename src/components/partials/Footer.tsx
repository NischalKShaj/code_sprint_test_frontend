// components/Footer.js

import Link from "next/link";
import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#F0E6E6] py-4 mt-auto">
      <div className="mx-auto w-full max-w-screen-xl px-4">
        <div className="flex flex-col md:flex-row md:justify-between">
          {/* Logo Section */}
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/image/test-removebg-preview.png"
                width={200}
                height={200}
                alt="logo"
              />
            </Link>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3">
            {/* Services */}
            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-900 uppercase dark:text-black">
                Services
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium space-y-2">
                <li>
                  <Link href="/course" className="hover:underline">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="/contest" className="hover:underline">
                    Contest
                  </Link>
                </li>
                <li>
                  <Link href="/problems" className="hover:underline">
                    Problems
                  </Link>
                </li>
                <li>
                  <Link href="/discuss" className="hover:underline">
                    Discuss
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-900 uppercase dark:text-black">
                Follow us
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium space-y-2">
                <li>
                  <Link
                    href="https://github.com/NischalKShaj"
                    className="hover:underline"
                  >
                    Github
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/in/nischal-k-shaj-71407126b/"
                    className="hover:underline"
                  >
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-900 uppercase dark:text-black">
                Legal
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium space-y-2">
                <li>
                  <Link href="/contact" className="hover:underline">
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:underline">
                    About us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2024{" "}
            <Link href="/" className="hover:underline">
              Code Sprint™
            </Link>
            . All Rights Reserved.
          </span>
          <div className="flex flex-wrap justify-center sm:justify-start mt-4 sm:mt-0">
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white mx-2"
            >
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 8 19"
              >
                <path
                  fillRule="evenodd"
                  d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Facebook page</span>
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white mx-2"
            >
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 21 16"
              >
                <path d="M16.942 1.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z" />
              </svg>
              <span className="sr-only">Discord community</span>
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white mx-2"
            >
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 17"
              >
                <path
                  fillRule="evenodd"
                  d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.106 4.106 0 0 1-1.857-.506v.051a4.053 4.053 0 0 0 3.285 3.97 4.05 4.05 0 0 1-1.853.07 4.107 4.107 0 0 0 3.834 2.812A8.262 8.262 0 0 1 0 15.008 11.7 11.7 0 0 0 6.29 17c7.547 0 11.675-6.154 11.675-11.489 0-.174-.005-.346-.013-.517A8.195 8.195 0 0 0 20 1.892Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Twitter page</span>
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white mx-2"
            >
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0a10 10 0 1 0 7.546 3.125A10.004 10.004 0 0 0 10 0ZM8.336 14.674H6.048V7.508h2.288v7.166ZM7.19 6.575a1.367 1.367 0 1 1 1.366-1.367 1.366 1.366 0 0 1-1.366 1.367Zm8.82 8.099h-2.285v-3.468c0-.827-.016-1.892-1.153-1.892-1.154 0-1.331.902-1.331 1.832v3.528H9.017V7.508h2.192v.989h.032a2.407 2.407 0 0 1 2.164-1.189c2.313 0 2.739 1.521 2.739 3.497v3.869Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">LinkedIn page</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
