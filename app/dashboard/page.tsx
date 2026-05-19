'use client';

import useSWR from 'swr';
import { 
  Users, 
  Database, 
  Activity, 
  User, 
  MapPin, 
  Phone, 
  Layers, 
  Briefcase, 
  Hourglass,
  RefreshCw 
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProviderData {
  id: string;
  name: string;
  quota: number;
  leadsCount: number;
}

interface AssignedProvider {
  id: string;
  name: string;
  assignedAt: string;
}

interface LeadData {
  id: string;
  name: string;
  phone: string;
  city: string;
  description: string;
  serviceName: string;
  assignedProviders: AssignedProvider[];
}

interface DashboardResponse {
  success: boolean;
  providers: ProviderData[];
  leads: LeadData[];
}

export default function DashboardPage() {
  const { data, error, isLoading, isValidating } = useSWR<DashboardResponse>(
    '/api/dashboard-data',
    fetcher,
    {
      refreshInterval: 2000,
      dedupingInterval: 1000,
    }
  );

  const providers = data?.providers || [];
  const leads = data?.leads || [];

  const totalLeads = leads.length;
  const activeProvidersCount = providers.length;
  
  const avgQuota = activeProvidersCount > 0
    ? (providers.reduce((sum, p) => sum + p.quota, 0) / activeProvidersCount).toFixed(1)
    : '0.0';

  const getQuotaColor = (quota: number) => {
    if (quota > 5) return 'bg-brand-primary';
    if (quota >= 2) return 'bg-brand-accent';
    return 'bg-rose-600';
  };

  const getQuotaTextColor = (quota: number) => {
    if (quota > 5) return 'text-brand-primary';
    if (quota >= 2) return 'text-brand-accent';
    return 'text-rose-400';
  };

  const getQuotaBgColor = (quota: number) => {
    if (quota > 5) return 'bg-brand-primary/5';
    if (quota >= 2) return 'bg-brand-accent/5';
    return 'bg-rose-500/5';
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Absolute background ambient lights strictly limited */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] right-[10%] h-[70%] w-[50%] rounded-lg bg-brand-accent/5 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] h-[70%] w-[50%] rounded-lg bg-brand-primary/5 blur-[120px]" />
      </div>

      {/* Header and status indicators */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text">
            Provider Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-brand-muted">
            Monitor real-time provider quotas and distributed lead allocations.
          </p>
        </div>

        {/* Live sync pulse banner (non-pill, rounded-md) */}
        <div className="flex items-center gap-2.5 rounded-md border border-brand-border bg-brand-surface px-4 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-brand-text tracking-wide uppercase">
            Live Polling (2s)
          </span>
          {(isLoading || isValidating) && (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-muted" />
          )}
        </div>
      </div>

      {/* Statistics Cards (rounded-lg, flat, distinct bg elevation) */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Metric 1 */}
        <div className="relative overflow-hidden rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide">
                Total Leads Distributed
              </p>
              <h4 className="mt-2 text-3xl font-bold text-brand-text font-mono">
                {totalLeads}
              </h4>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <Database className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary" />
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide">
                Avg Remaining Quota
              </p>
              <h4 className="mt-2 text-3xl font-bold text-brand-text font-mono">
                {avgQuota} <span className="text-sm font-normal text-brand-muted/60">/ 10</span>
              </h4>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary" />
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide">
                Active Providers
              </p>
              <h4 className="mt-2 text-3xl font-bold text-brand-text font-mono">
                {activeProvidersCount}
              </h4>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-accent" />
        </div>
      </div>

      {/* Grid: Left - Providers, Right - Lead assignments */}
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Providers Allocation Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-brand-text flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-primary" />
              Providers & Quotas
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {providers.map((p) => {
              const quotaPercentage = (p.quota / 10) * 100;
              return (
                <div
                  key={p.id}
                  className={`rounded-lg border border-brand-border bg-brand-surface p-4 transition-all duration-150 hover:border-brand-primary/40 ${getQuotaBgColor(p.quota)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-brand-text">
                        {p.name}
                      </h4>
                      <span className="text-[10px] text-brand-muted/60 font-mono">
                        {p.id}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${getQuotaTextColor(p.quota)} font-mono`}>
                      {p.quota} / 10
                    </span>
                  </div>

                  {/* Quota Progress Bar (rounded-md, non-pill) */}
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-md bg-brand-bg border border-brand-border/50">
                    <div
                      className={`h-full rounded-md transition-all duration-300 ${getQuotaColor(p.quota)}`}
                      style={{ width: `${Math.max(0, quotaPercentage)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-brand-muted">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-brand-muted/70" />
                      Assigned Leads:
                    </span>
                    <span className="font-bold text-brand-text font-mono">
                      {p.leadsCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distributed Leads Assignments Logs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-brand-text flex items-center gap-2">
              <Layers className="h-5 w-5 text-brand-primary" />
              Lead Distribution History
            </h2>
            <span className="rounded-md bg-brand-surface border border-brand-border px-3 py-1 text-xs font-semibold text-brand-muted">
              {leads.length} Records
            </span>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-950 bg-rose-950/20 p-4 text-xs text-rose-300">
              Failed to sync real-time dashboard data. Retrying...
            </div>
          )}

          {leads.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-brand-border bg-brand-surface/50 text-center">
              <Hourglass className="h-10 w-10 text-brand-muted/40 animate-pulse" />
              <h3 className="mt-4 text-lg font-semibold text-brand-text">
                No Leads Distributed Yet
              </h3>
              <p className="mt-1 max-w-sm text-xs text-brand-muted">
                Submit a new request or use the test tools to generate concurrent lead activities!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((l) => (
                <div
                  key={l.id}
                  className="overflow-hidden rounded-lg border border-brand-border bg-brand-surface transition-all duration-150 hover:border-brand-primary/40"
                >
                  {/* Lead Info Header */}
                  <div className="border-b border-brand-border bg-brand-bg/50 px-5 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-bg text-brand-text border border-brand-border">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-text">
                            {l.name}
                          </h4>
                          <span className="text-[10px] font-mono text-brand-muted/60">
                            ID: {l.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="rounded-md bg-brand-primary/20 px-2.5 py-1 text-xs font-semibold text-brand-primary border border-brand-primary/30">
                          {l.serviceName}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-brand-muted">
                          <MapPin className="h-3.5 w-3.5" />
                          {l.city}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted/60 block">
                        Description
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-brand-text/95">
                        {l.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-brand-border pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                        <Phone className="h-3.5 w-3.5 text-brand-muted/70" />
                        <span className="font-mono">{l.phone}</span>
                      </div>

                      {/* Assigned Providers (non-pill, rounded-md) */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted/60 text-right sm:block hidden">
                          Allocated Providers (Round-Robin Locked)
                        </span>
                        <div className="flex flex-wrap gap-1.5 sm:justify-end">
                          {l.assignedProviders.map((p) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1 rounded-md bg-brand-bg border border-brand-border px-2 py-0.5 text-[11px] font-semibold text-brand-text"
                              title={`Allocated at ${new Date(p.assignedAt).toLocaleTimeString()}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                              {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
