import { NextResponse } from 'next/server';
import { submitLead } from '@/actions/submitLead';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, phone, city, description, serviceId } = body;

    const result = await submitLead({
      name,
      phone,
      city,
      description,
      serviceId,
    });

    if (result.success) {
      return NextResponse.json({ success: true, leadId: result.leadId }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API submit-lead error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
