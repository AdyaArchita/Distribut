'use client';

import { useState } from 'react';
import { submitLead } from '@/actions/submitLead';
import { Send, User, Phone, MapPin, AlignLeft, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function RequestServicePage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    description: '',
    serviceId: 'service-1',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    if (!formData.name.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.description.trim()) {
      setStatus({ type: 'error', message: 'All fields are required.' });
      setLoading(false);
      return;
    }

    try {
      const response = await submitLead(formData);
      if (response.success) {
        setStatus({
          type: 'success',
          message: 'Lead submitted successfully! Our system has concurrency-locked, deducted quotas, and distributed this lead to exactly 3 matching providers in real-time.',
        });
        setFormData({
          name: '',
          phone: '',
          city: '',
          description: '',
          serviceId: 'service-1',
        });
      } else {
        setStatus({
          type: 'error',
          message: response.error || 'Failed to submit lead.',
        });
      }
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'An unexpected client-side error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Absolute background ambient lights strictly limited */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[60%] rounded-lg bg-brand-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[20%] h-[80%] w-[60%] rounded-lg bg-brand-accent/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-xl rounded-lg border border-brand-border bg-brand-surface/90 shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-brand-accent" />
            <span className="text-xs font-semibold tracking-wide text-brand-primary uppercase">
              Submit a Request
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text">
            Request <span className="text-brand-accent">Service</span>
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Enter your details and select a service. Our round-robin distribution algorithm will instantly allocate this lead to 3 eligible providers.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Display status banners */}
            {status.type && (
              <div
                className={`flex items-start gap-3 rounded-md p-4 text-sm transition-all duration-150 animate-fadeIn ${
                  status.type === 'success'
                    ? 'bg-emerald-950/20 border border-emerald-900/40 text-emerald-300'
                    : 'bg-rose-950/20 border border-rose-900/40 text-rose-300'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
                )}
                <div>
                  <h4 className="font-semibold">{status.type === 'success' ? 'Success' : 'Allocation Failed'}</h4>
                  <p className="mt-1 leading-relaxed text-xs">{status.message}</p>
                  {status.type === 'success' && (
                    <div className="mt-3 flex gap-4">
                      <Link
                        href="/dashboard"
                        className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover underline underline-offset-2"
                      >
                        View Live Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Name field */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Full Name
                </label>
                <div className="relative mt-1.5 rounded-md">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4.5 w-4.5 text-brand-muted/70" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    disabled={loading}
                    className="block w-full rounded-md border border-brand-border bg-brand-bg py-2.5 pl-10 pr-4 text-sm text-brand-text placeholder-brand-muted/40 transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>
              </div>

              {/* Phone and City fields in a row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Phone Number
                  </label>
                  <div className="relative mt-1.5 rounded-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Phone className="h-4.5 w-4.5 text-brand-muted/70" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 019-2834"
                      disabled={loading}
                      className="block w-full rounded-md border border-brand-border bg-brand-bg py-2.5 pl-10 pr-4 text-sm text-brand-text placeholder-brand-muted/40 transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    City / Location
                  </label>
                  <div className="relative mt-1.5 rounded-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MapPin className="h-4.5 w-4.5 text-brand-muted/70" />
                    </div>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="San Francisco, CA"
                      disabled={loading}
                      className="block w-full rounded-md border border-brand-border bg-brand-bg py-2.5 pl-10 pr-4 text-sm text-brand-text placeholder-brand-muted/40 transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Service Select field */}
              <div>
                <label htmlFor="serviceId" className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Select Required Service
                </label>
                <select
                  id="serviceId"
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="mt-1.5 block w-full rounded-md border border-brand-border bg-brand-bg px-4 py-2.5 text-sm text-brand-text transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="service-1">Service 1 (Mandatory P1 + 2 of [P2, P3, P4])</option>
                  <option value="service-2">Service 2 (Mandatory P5 + 2 of [P6, P7, P8])</option>
                  <option value="service-3">Service 3 (Mandatory P1, P4 + 1 of [P2, P3, P5, P6, P7, P8])</option>
                </select>
              </div>

              {/* Description field */}
              <div>
                <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Project Description
                </label>
                <div className="relative mt-1.5 rounded-md">
                  <div className="pointer-events-none absolute top-3.5 left-0 flex items-center pl-3">
                    <AlignLeft className="h-4.5 w-4.5 text-brand-muted/70" />
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide details about your project needs..."
                    disabled={loading}
                    className="block w-full rounded-md border border-brand-border bg-brand-bg py-2.5 pl-10 pr-4 text-sm text-brand-text placeholder-brand-muted/40 transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-primary py-3 text-sm font-semibold text-brand-text shadow-md transition-all duration-150 hover:bg-brand-primary-hover disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-text border-t-transparent" />
                  Allocating Providers...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Request & Distribute
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
