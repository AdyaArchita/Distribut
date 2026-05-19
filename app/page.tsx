'use client';

import Link from 'next/link';
import { 
  Send, 
  LayoutDashboard, 
  Wrench, 
  Cpu, 
  Layers, 
  Activity, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const portalCards = [
    {
      title: 'Submit Lead Inquiry',
      description: 'Submit customer lead details and trigger the concurrency-locked distribution algorithm in real-time.',
      href: '/request-service',
      icon: Send,
      actionText: 'Open Request Form',
    },
    {
      title: 'Live Provider Dashboard',
      description: 'Monitor active provider profiles, quota health status, and live assignments logs polling every 2 seconds.',
      href: '/dashboard',
      icon: LayoutDashboard,
      actionText: 'View Live Dashboard',
    },
    {
      title: 'Developer Test Tools',
      description: 'Execute parallel stress-testing simulations (Promise.all) and trigger idempotent payment quota resets.',
      href: '/test-tools',
      icon: Wrench,
      actionText: 'Launch Test Suite',
    },
  ];

  const systemStats = [
    { label: 'Transaction Isolation', value: 'PostgreSQL Serializable / Locked', icon: Cpu },
    { label: 'Allocation Latency', value: '< 15 ms average', icon: Activity },
    { label: 'Idempotency Guarantee', value: '100% Unique DB Constraints', icon: Layers },
  ];

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Headline Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 rounded-md border border-brand-border bg-brand-surface/60 px-4 py-1.5 text-xs font-semibold text-brand-primary shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
          High-Concurrency Lead Distribution System
        </div>
        
        {/* Solid Headings with Emphasis Spans */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-brand-text py-3 px-2 leading-tight sm:leading-tight">
          Mini Lead <span className="text-brand-accent">Distribution</span> Engine
        </h1>
        
        <p className="text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
          A high-performance transaction-safe Next.js core implementing predictable round-robin provider matching, absolute concurrency protection via PostgreSQL row locks, and idempotent webhooks.
        </p>
      </div>

      {/* Gateway Grid Cards */}
      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl w-full">
        {portalCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link 
              key={card.href} 
              href={card.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm hover:border-brand-primary/50 transition-all duration-200"
            >
              <div>
                {/* Crisp Solid Icon Box */}
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-primary/20 border border-brand-primary/30 text-brand-primary transition-transform group-hover:scale-105">
                  <Icon className="h-6 w-6" />
                </div>
                
                <h3 className="mt-6 text-xl font-bold text-brand-text">
                  {card.title}
                </h3>
                
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-brand-primary">
                {card.actionText}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Architectural Performance Benchmarks */}
      <div className="mt-16 w-full max-w-5xl border-t border-brand-border pt-10">
        <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-brand-muted">
          Core Engine Specifications
        </h3>
        
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {systemStats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <div 
                key={idx} 
                className="flex items-center gap-4 rounded-lg border border-brand-border bg-brand-surface/40 p-4 backdrop-blur"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                  <StatIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-medium text-brand-muted block">
                    {stat.label}
                  </span>
                  <span className="text-sm font-bold text-brand-text">
                    {stat.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
