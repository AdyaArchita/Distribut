'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Send, Wrench } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/request-service', label: 'Submit Lead', icon: Send },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/test-tools', label: 'Test Tools', icon: Wrench },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-surface/95 backdrop-blur-sm transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-brand-text shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-brand-text group-hover:text-brand-primary transition-colors">
                Prowider
              </span>
              <span className="rounded-md bg-brand-primary/20 px-2 py-0.5 text-xs font-semibold text-brand-primary border border-brand-primary/30">
                v1.0
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-primary text-brand-text font-semibold'
                        : 'text-brand-muted hover:bg-brand-bg hover:text-brand-text'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-brand-text' : 'text-brand-muted/70'}`} />
                    <span className="hidden sm:inline">{link.label}</span>
                    <span className="inline sm:hidden">{link.label.split(' ')[0]}</span>
                  </Link>
                );
              })}
            </div>

            {/* Dark Theme Accent Badge */}
            <div className="flex h-9 items-center justify-center rounded-md border border-brand-border bg-brand-bg px-3 text-xs font-medium text-brand-muted shadow-inner">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
              Secure Console
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
