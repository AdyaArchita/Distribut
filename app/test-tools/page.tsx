'use client';

import { useState } from 'react';
import { 
  Wrench, 
  Terminal, 
  Key, 
  RefreshCw, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';

export default function TestToolsPage() {
  // Idempotency State
  const [currentKey, setCurrentKey] = useState<string>('');
  const [webhookLogs, setWebhookLogs] = useState<{
    timestamp: string;
    action: string;
    key: string;
    status: number;
    data: any;
  }[]>([]);
  const [webhookLoading, setWebhookLoading] = useState(false);

  // Concurrency State
  const [concurrencyLogs, setConcurrencyLogs] = useState<{
    timestamp: string;
    leadNum: number;
    phone: string;
    status: 'success' | 'failed';
    info: string;
  }[]>([]);
  const [concurrencyLoading, setConcurrencyLoading] = useState(false);
  const [selectedService, setSelectedService] = useState('service-1');

  // Helper: Generate a new random idempotency key
  const generateNewKey = () => {
    const key = `idemp-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
    setCurrentKey(key);
  };

  // Helper: Trigger webhook
  const triggerWebhook = async (useSameKey: boolean) => {
    let keyToUse = currentKey;
    if (!useSameKey || !keyToUse) {
      const newKey = `idemp-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
      keyToUse = newKey;
      setCurrentKey(newKey);
    }

    setWebhookLoading(true);
    const actionName = useSameKey ? 'Webhook (SAME KEY)' : 'Webhook (NEW KEY)';
    
    try {
      const response = await fetch('/api/webhook/reset-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idempotencyKey: keyToUse }),
      });
      const data = await response.json();
      
      setWebhookLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          action: actionName,
          key: keyToUse,
          status: response.status,
          data,
        },
        ...prev,
      ]);
    } catch (err: any) {
      setWebhookLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          action: actionName,
          key: keyToUse,
          status: 500,
          data: { success: false, error: err.message || 'Network error' },
        },
        ...prev,
      ]);
    } finally {
      setWebhookLoading(false);
    }
  };

  // Helper: Trigger 10 simultaneous leads in parallel
  const triggerConcurrencySimulation = async () => {
    setConcurrencyLoading(true);
    setConcurrencyLogs([]);

    const timestamp = new Date().toLocaleTimeString();
    const basePhone = Math.floor(Math.random() * 9000000) + 1000000;
    
    const leadPromises = Array.from({ length: 10 }).map((_, index) => {
      const leadNum = index + 1;
      const phone = `+1 (555) 010-${basePhone + index}`;
      const payload = {
        name: `Concurrent Lead ${leadNum}`,
        phone: phone,
        city: ['Chicago', 'Houston', 'Miami', 'Seattle', 'Boston', 'Denver', 'Austin', 'Portland'][index % 8],
        description: `High-concurrency parallel lead activity number ${leadNum}.`,
        serviceId: selectedService,
      };

      return fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const data = await res.json() as any;
          return {
            leadNum,
            phone,
            status: res.status === 200 && data.success ? 'success' as const : 'failed' as const,
            info: data.success 
              ? `Success: Lead created! Allocated ID: ${data.leadId}`
              : `Failed: ${data.error || 'Allocation error'}`,
          };
        })
        .catch((err) => ({
          leadNum,
          phone,
          status: 'failed' as const,
          info: `Network Error: ${err.message || 'Failed request'}`,
        }));
    });

    try {
      const results = await Promise.all(leadPromises);
      setConcurrencyLogs(
        results.map((r) => ({
          timestamp,
          ...r,
        }))
      );
    } catch (err: any) {
      console.error('Promise.all crashed:', err);
    } finally {
      setConcurrencyLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Absolute background ambient lights strictly limited */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] h-[70%] w-[50%] rounded-lg bg-brand-primary/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] h-[70%] w-[50%] rounded-lg bg-brand-accent/5 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="border-b border-brand-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-brand-text flex items-center gap-2">
          <Wrench className="h-7 w-7 text-brand-primary" />
          Test Tools Suite
        </h1>
        <p className="mt-1.5 text-sm text-brand-muted">
          Verify and stress-test the backend transaction locks, fair round-robin allocation, and webhook idempotency.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Idempotent Webhook Panel */}
        <div className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-text">
                  Idempotent Reset Webhook
                </h2>
                <p className="text-xs text-brand-muted">
                  Simulates payment gateway webhook to reset all quotas to 10.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-brand-bg p-4 border border-brand-border">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted block">
                Active Idempotency Key
              </span>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <code className="text-xs font-mono font-bold text-brand-text break-all">
                  {currentKey || 'No Key Generated (Will generate on trigger)'}
                </code>
                <button
                  onClick={generateNewKey}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-bg border border-brand-border text-brand-muted hover:bg-brand-surface hover:text-brand-text"
                  title="Generate New Key"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Explanatory Note */}
            <div className="mt-4 flex gap-2 rounded-lg bg-brand-primary/5 border border-brand-primary/10 p-3 text-xs text-brand-primary">
              <HelpCircle className="h-4 w-4 shrink-0 text-brand-primary" />
              <p>
                <strong>How it works:</strong> The first request registers the key and resets quotas. The second request with the same key triggers a unique constraint violation in <code>ProcessedWebhook</code>, returns 200 OK early, and skips re-execution.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => triggerWebhook(false)}
                disabled={webhookLoading}
                className="flex items-center justify-center gap-2 rounded-md bg-brand-primary py-3 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-primary-hover disabled:opacity-50"
              >
                <Zap className="h-4 w-4 text-brand-accent" />
                Trigger (New Key)
              </button>

              <button
                onClick={() => triggerWebhook(true)}
                disabled={webhookLoading}
                className="flex items-center justify-center gap-2 rounded-md border border-brand-border bg-brand-bg py-3 text-sm font-semibold text-brand-text shadow-sm transition-colors hover:bg-brand-surface disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4 text-brand-primary" />
                Trigger (Same Key)
              </button>
            </div>

            {/* Webhook Output Console (flat dark, rounded-md) */}
            <div className="rounded-md bg-brand-bg/80 border border-brand-border/50 p-4 font-mono text-xs text-[#d5d8d5]">
              <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2 mb-2 text-[10px] uppercase font-bold text-brand-muted/60">
                <Terminal className="h-3.5 w-3.5" />
                Webhook Response Console
              </div>
              <div className="h-40 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-brand-border pr-1">
                {webhookLogs.length === 0 ? (
                  <span className="text-brand-muted/40 italic">No responses logged yet. Click a trigger above...</span>
                ) : (
                  webhookLogs.map((log, index) => (
                    <div key={index} className="border-b border-brand-border/20 pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between text-[10px] text-brand-muted/60 mb-1">
                        <span>[{log.timestamp}] {log.action}</span>
                        <span className={log.status === 200 ? 'text-emerald-400' : 'text-rose-400'}>
                          HTTP {log.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-brand-accent/80 break-all mb-1">
                        Key: {log.key}
                      </div>
                      <pre className="text-emerald-400 overflow-x-auto bg-brand-bg/50 p-1.5 rounded-md border border-brand-border/20">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Concurrency Simulator Panel */}
        <div className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-text">
                  Concurrency Stress Tester
                </h2>
                <p className="text-xs text-brand-muted">
                  Simulates 10 simultaneous leads hitting the database at the exact same moment.
                </p>
              </div>
            </div>

            {/* Service Selection */}
            <div className="mt-6">
              <label htmlFor="concurrencyService" className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Choose Target Service
              </label>
              <select
                id="concurrencyService"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                disabled={concurrencyLoading}
                className="mt-1.5 block w-full rounded-md border border-brand-border bg-brand-bg px-3 py-2.5 text-sm text-brand-text transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="service-1">Service 1 (Pool P2, P3, P4 - 2 slots)</option>
                <option value="service-2">Service 2 (Pool P6, P7, P8 - 2 slots)</option>
                <option value="service-3">Service 3 (Pool P2, P3, P5, P6, P7, P8 - 1 slot)</option>
              </select>
            </div>

            {/* Explanatory Note */}
            <div className="mt-4 flex gap-2 rounded-lg bg-brand-primary/5 border border-brand-primary/10 p-3 text-xs text-brand-primary">
              <HelpCircle className="h-4 w-4 shrink-0 text-brand-primary" />
              <p>
                <strong>Race-Condition Proofing:</strong> Triggers <code>Promise.all()</code>. PostgreSQL row-level locks force the database to serialize these requests, ensuring round-robin works correctly without duplicate allocations or quota over-deductions.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={triggerConcurrencySimulation}
              disabled={concurrencyLoading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-primary py-3 text-sm font-semibold text-brand-text shadow-md transition-all duration-150 hover:bg-brand-primary-hover disabled:opacity-50"
            >
              {concurrencyLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-text border-t-transparent" />
                  Processing Concurrency Stress...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Generate 10 Simultaneous Leads
                </>
              )}
            </button>

            {/* Concurrency Output Console (flat dark, rounded-md) */}
            <div className="rounded-md bg-brand-bg/80 border border-brand-border/50 p-4 font-mono text-xs text-[#d5d8d5]">
              <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2 mb-2 text-[10px] uppercase font-bold text-brand-muted/60">
                <Terminal className="h-3.5 w-3.5" />
                Concurrency Execution Log
              </div>
              <div className="h-40 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-brand-border pr-1">
                {concurrencyLogs.length === 0 ? (
                  <span className="text-brand-muted/40 italic">No executions triggered yet. Click play button above...</span>
                ) : (
                  concurrencyLogs.map((log) => (
                    <div key={log.leadNum} className="flex items-start gap-2 text-[11px] leading-relaxed border-b border-brand-border/10 pb-2 last:border-0 last:pb-0">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                      )}
                      <div>
                        <div className="flex gap-2">
                          <span className="text-brand-muted/40">[{log.timestamp}]</span>
                          <span className="font-semibold text-brand-accent/80">Lead #{log.leadNum} ({log.phone})</span>
                        </div>
                        <span className={log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
                          {log.info}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
