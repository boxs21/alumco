import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import CertificateTemplate from '@/components/certificate/CertificateTemplate';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import React from 'react';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Fetch certificate data
    const { data: certificate, error: certError } = await adminSupabase
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single();

    if (certError || !certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Check authorization
    if (certificate.user_id !== user.id) {
       const { data: currentUserProfile } = await adminSupabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

       if (!currentUserProfile || (currentUserProfile.role !== 'ADMIN' && currentUserProfile.role !== 'PROFESOR')) {
           return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
    }

    // Fetch related profile and training separately
    const [{ data: profile }, { data: training }] = await Promise.all([
      adminSupabase.from('profiles').select('name').eq('id', certificate.user_id).single(),
      adminSupabase.from('trainings').select('title').eq('id', certificate.training_id).single(),
    ]);

    if (!profile || !training) {
      return NextResponse.json({ error: 'Certificate data incomplete' }, { status: 404 });
    }

    const issueDate = new Date(certificate.issued_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create the PDF stream
    const pdfStream = await renderToStream(
      React.createElement(CertificateTemplate, {
        studentName: profile.name || 'Estudiante',
        courseName: training.title,
        issueDate: issueDate,
        verificationCode: certificate.verification_code,
        score: certificate.score ?? null,
        logoSrc: path.join(process.cwd(), 'public', 'logo.png'),
      }) as any
    );

    // Convert stream to Buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream as any) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Upload to Supabase bucket
    const fileName = `${certificate.id}.pdf`;
    const { error: uploadError } = await adminSupabase.storage
      .from('certificates')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading certificate:', uploadError);
      // We can still return the generated PDF even if upload fails
    } else {
      // Get the URL (if it's private, we just store the path or signed url. Plan says "Updatea certificates.pdf_url con la URL")
      // We will store the path or a public URL. If bucket is private, we store the file path and generate signed urls on demand, or we can just store the path.
      // Let's store the path.
      const { data: updateData, error: updateError } = await adminSupabase
        .from('certificates')
        .update({ pdf_url: fileName })
        .eq('id', id);
        
      if (updateError) {
        console.error('Error updating certificate record:', updateError);
      }
    }

    const inline = request.nextUrl.searchParams.get('mode') === 'inline';
    const filename = `Certificado_${training.title.replace(/\s+/g, '_')}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
