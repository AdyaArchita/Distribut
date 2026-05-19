import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Query providers with their lead assignments count
    const providers = await prisma.provider.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    // Query leads with service details and associated providers
    const leads = await prisma.lead.findMany({
      include: {
        service: true,
        assignments: {
          include: {
            provider: true,
          },
          orderBy: {
            assignedAt: 'asc',
          },
        },
      },
    });

    // Sort leads by their first assignment's assignedAt timestamp (newest leads first)
    const sortedLeads = leads.sort((a, b) => {
      const aTime = a.assignments[0]?.assignedAt.getTime() || 0;
      const bTime = b.assignments[0]?.assignedAt.getTime() || 0;
      return bTime - aTime;
    });

    // Format data for easier frontend consumption
    const formattedProviders = providers.map((p) => ({
      id: p.id,
      name: p.name,
      quota: p.quota,
      leadsCount: p._count.assignments,
    }));

    const formattedLeads = sortedLeads.map((l) => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      city: l.city,
      description: l.description,
      serviceName: l.service.name,
      assignedProviders: l.assignments.map((a) => ({
        id: a.provider.id,
        name: a.provider.name,
        assignedAt: a.assignedAt.toISOString(),
      })),
    }));

    return NextResponse.json(
      {
        success: true,
        providers: formattedProviders,
        leads: formattedLeads,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data.' },
      { status: 500 }
    );
  }
}
