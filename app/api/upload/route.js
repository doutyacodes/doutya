import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('coverImage');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const uploadUrl = 'https://wowfy.in/xortcut/upload.php';
    const proxyFormData = new FormData();
    proxyFormData.append('coverImage', file);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: proxyFormData,
    });

    const data = await response.json();

    if (data.success && data.filePath) {
      const fullUrl = data.filePath.startsWith('http')
        ? data.filePath
        : `https://wowfy.in/xortcut/images/${data.filePath}`;

      return NextResponse.json({
        success: true,
        filePath: data.filePath,
        url: fullUrl,
      });
    } else {
      return NextResponse.json(
        { error: data.error || 'Upload to storage failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Image upload proxy error:', error);
    return NextResponse.json(
      { error: 'Server upload error: ' + error.message },
      { status: 500 }
    );
  }
}
