import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, contactName, contactEmail, contactPhone, website, message } = body || {};

    if (!companyName || !contactName || !contactEmail || !contactPhone) {
      return NextResponse.json({ success: false, error: 'Lütfen zorunlu alanları doldurunuz.' }, { status: 400 });
    }

    // Forward application to Admin API if available
    try {
      await fetch('https://app.pagapp.com.tr/api/v1/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: String(companyName).trim(),
          contactName: String(contactName).trim(),
          contactEmail: String(contactEmail).trim().toLowerCase(),
          contactPhone: String(contactPhone).trim(),
          website: website ? String(website).trim() : null,
          message: message ? String(message).trim() : null
        })
      });
    } catch (fwdErr) {
      console.warn('Forward to Admin API failed:', fwdErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Firma başvurunuz başarıyla alındı.'
    });
  } catch (err: any) {
    console.error('Company Application Error:', err);
    return NextResponse.json({
      success: false,
      error: 'Başvuru işlenirken hata oluştu: ' + (err.message || 'Bilinmeyen hata')
    }, { status: 500 });
  }
}
