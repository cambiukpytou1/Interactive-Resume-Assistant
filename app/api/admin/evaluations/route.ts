import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check admin secret
  const secret = request.nextUrl.searchParams.get('secret');
  const adminSecret = process.env.ADMIN_SECRET?.trim();

  if (!adminSecret || secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY)?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/job_evaluations?order=created_at.desc&limit=100&select=id,created_at,job_title,company_hint,fit_score,visitor_ip,user_agent,job_description,recruiter_output,candidate_notes`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[admin] Supabase error:', err);
      return NextResponse.json({ error: 'Failed to fetch evaluations' }, { status: 502 });
    }

    const evaluations = await res.json();
    return NextResponse.json({ evaluations });
  } catch (err) {
    console.error('[admin] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
