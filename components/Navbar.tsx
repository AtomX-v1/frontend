'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#9333ea] bg-black">
      <div className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-sm font-bold font-mono text-[#9333ea]">
              ATOMX://
            </span>
          </Link>

          <div className="flex items-center gap-6 font-mono text-xs">
            <Link
              href="/combo"
              className="text-gray-500 hover:text-[#9333ea] transition-colors"
            >
              [COMBO]
            </Link>
            <Link
              href="/arbitrage"
              className="text-gray-500 hover:text-[#9333ea] transition-colors"
            >
              [ARBI]
            </Link>
            <Link
              href="/vault"
              className="text-gray-500 hover:text-[#9333ea] transition-colors"
            >
              [VAULT]
            </Link>
            <button className="border border-[#9333ea] px-3 py-1 text-[#9333ea] hover:bg-[#9333ea] hover:text-black transition-colors">
              [CONNECT]
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
