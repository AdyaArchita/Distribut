'use server';

import prisma from '@/lib/prisma';

interface ServiceConfig {
  mandatory: string[];
  pool: string[];
  poolSlots: number;
}

const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  'service-1': {
    mandatory: ['provider-1'],
    pool: ['provider-2', 'provider-3', 'provider-4'],
    poolSlots: 2,
  },
  'service-2': {
    mandatory: ['provider-5'],
    pool: ['provider-6', 'provider-7', 'provider-8'],
    poolSlots: 2,
  },
  'service-3': {
    mandatory: ['provider-1', 'provider-4'],
    pool: ['provider-2', 'provider-3', 'provider-5', 'provider-6', 'provider-7', 'provider-8'],
    poolSlots: 1,
  },
};

export async function submitLead(formData: {
  name: string;
  phone: string;
  city: string;
  description: string;
  serviceId: string;
}) {
  const { name, phone, city, description, serviceId } = formData;

  // Input Validation
  if (!name.trim()) return { success: false, error: 'Name is required.' };
  if (!phone.trim()) return { success: false, error: 'Phone number is required.' };
  if (!city.trim()) return { success: false, error: 'City is required.' };
  if (!description.trim()) return { success: false, error: 'Description is required.' };
  
  const config = SERVICE_CONFIGS[serviceId];
  if (!config) {
    return { success: false, error: 'Invalid service selected.' };
  }

  const allProviderIds = Array.from(new Set([...config.mandatory, ...config.pool]));

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the lead first (Catches duplicate phone/service immediately)
      const lead = await tx.lead.create({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
          description: description.trim(),
          serviceId,
        },
      });

      // 2. Lock the specific providers using SELECT FOR UPDATE
      const providerIdsString = allProviderIds.map(id => `'${id}'`).join(', ');
      const lockedProviders = await tx.$queryRawUnsafe<any[]>(
        `SELECT id, name, quota FROM "Provider" WHERE id IN (${providerIdsString}) FOR UPDATE`
      );

      // Create a fast lookup map for in-memory checks
      const providerMap = new Map<string, { id: string; name: string; quota: number }>();
      for (const p of lockedProviders) {
        providerMap.set(p.id, p);
      }

      // 3. Lock the tracker using SELECT FOR UPDATE
      const lockedTracker = await tx.$queryRawUnsafe<any[]>(
        `SELECT id, "serviceId", "lastProviderId" FROM "RoundRobinTracker" WHERE "serviceId" = '${serviceId}' FOR UPDATE`
      );
      
      const tracker = lockedTracker[0];
      if (!tracker) {
        throw new Error('TRACKER_NOT_FOUND');
      }

      // 4. Calculate who gets the lead in memory
      const selectedProviders: string[] = [];

      // 4a. Check mandatory providers
      for (const pId of config.mandatory) {
        const p = providerMap.get(pId);
        if (!p || p.quota <= 0) {
          throw new Error('MANDATORY_PROVIDER_OUT_OF_QUOTA');
        }
        selectedProviders.push(pId);
      }

      // 4b. Select from pool using Round-Robin
      const lastProviderId = tracker.lastProviderId;
      const pool = config.pool;
      let startIndex = 0;

      if (lastProviderId) {
        const idx = pool.indexOf(lastProviderId);
        if (idx !== -1) {
          startIndex = (idx + 1) % pool.length;
        }
      }

      const poolSelection: string[] = [];
      let currentIndex = startIndex;
      let checkedCount = 0;

      while (poolSelection.length < config.poolSlots && checkedCount < pool.length) {
        const candidateId = pool[currentIndex];
        const candidate = providerMap.get(candidateId);

        // Crucial: Filter out any providers whose quota <= 0
        if (candidate && candidate.quota > 0 && !selectedProviders.includes(candidateId)) {
          poolSelection.push(candidateId);
        }

        currentIndex = (currentIndex + 1) % pool.length;
        checkedCount++;
      }

      if (poolSelection.length < config.poolSlots) {
        throw new Error('POOL_PROVIDERS_OUT_OF_QUOTA');
      }

      selectedProviders.push(...poolSelection);

      // Ensure exactly 3 unique providers are selected
      const uniqueSelected = Array.from(new Set(selectedProviders));
      if (uniqueSelected.length !== 3) {
        throw new Error('ALLOCATION_FAILED_UNIQUE_CONSTRAINT');
      }

      // 5. Update Provider quotas (-1) within the transaction
      for (const pId of uniqueSelected) {
        await tx.provider.update({
          where: { id: pId },
          data: { quota: { decrement: 1 } },
        });
      }

      // 6. Create LeadAssignment records
      for (const pId of uniqueSelected) {
        await tx.leadAssignment.create({
          data: {
            leadId: lead.id,
            providerId: pId,
          },
        });
      }

      // 7. Update RoundRobinTracker
      const newLastProviderId = poolSelection[poolSelection.length - 1] || lastProviderId;
      await tx.roundRobinTracker.update({
        where: { serviceId },
        data: { lastProviderId: newLastProviderId },
      });

      return { leadId: lead.id };
    });

    return { success: true, leadId: result.leadId };
  } catch (error: any) {
    console.error('Lead allocation error:', error);
    
    // Handle Prisma unique constraint error gracefully (P2002)
    if (error.code === 'P2002') {
      return {
        success: false,
        error: 'A lead with this phone number and service already exists.',
      };
    }

    if (
      error.message === 'MANDATORY_PROVIDER_OUT_OF_QUOTA' ||
      error.message === 'POOL_PROVIDERS_OUT_OF_QUOTA'
    ) {
      return {
        success: false,
        error: 'Allocation failed: Not enough providers with remaining quota.',
      };
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred during lead distribution.',
    };
  }
}
