import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Subject and message are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient(true);
    if (!supabase) {
      // In dev or offline mode without Supabase, we acknowledge receipt gracefully
      console.log('Contact inquiry received (offline mode):', { name, email, subject, message });
      return NextResponse.json({
        success: true,
        message: 'Inquiry received successfully (offline logged).',
      });
    }

    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert({
        name: name || null,
        email: email || null,
        subject,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save inquiry:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully.',
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
