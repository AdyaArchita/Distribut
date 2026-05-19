import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idempotencyKey } = body;

    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      return NextResponse.json(
        { success: false, error: 'idempotencyKey is required and must be a string.' },
        { status: 400 }
      );
    }

    try {
      // Attempt to record the processed webhook inside a record
      await prisma.processedWebhook.create({
        data: { idempotencyKey },
      });
    } catch (dbError: any) {
      // Catch duplicate constraint error P2002
      if (dbError.code === 'P2002') {
        console.log(`Duplicate webhook blocked: ${idempotencyKey}`);
        return NextResponse.json(
          {
            success: true,
            message: 'Webhook already processed (Idempotent OK).',
            isDuplicate: true,
          },
          { status: 200 }
        );
      }
      throw dbError;
    }

    // Since recording the webhook succeeded, update all Providers' quotas to 10
    await prisma.provider.updateMany({
      data: { quota: 10 },
    });

    console.log(`Processed webhook reset for key: ${idempotencyKey}`);
    return NextResponse.json(
      {
        success: true,
        message: 'All quotas successfully reset to 10.',
        isDuplicate: false,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook.' },
      { status: 500 }
    );
  }
}
