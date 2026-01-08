import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload API] Request received');

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log('[Upload API] Unauthorized - no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Upload API] User authenticated:', user.id);

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'hero' or 'logo'

    if (!file) {
      console.log('[Upload API] No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`[Upload API] File received: ${file.name}, type: ${file.type}, size: ${Math.round(file.size / 1024)}KB`);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.log(`[Upload API] Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: `Neplatný typ súboru: ${file.type}. Povolené: JPEG, PNG, WebP, GIF` },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.log(`[Upload API] File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: 'Súbor je príliš veľký. Maximum je 5MB' },
        { status: 400 }
      );
    }

    // Convert to buffer
    console.log('[Upload API] Converting to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`[Upload API] Buffer created: ${buffer.length} bytes`);

    // Process with sharp - resize and convert to WebP
    console.log('[Upload API] Processing with sharp...');
    let processedImage: Buffer;

    if (type === 'hero') {
      // Hero images: max 1920x1080, quality 80
      processedImage = await sharp(buffer)
        .resize(1920, 1080, {
          fit: 'cover',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();
    } else if (type === 'logo') {
      // Logos: max 400x400, quality 85
      processedImage = await sharp(buffer)
        .resize(400, 400, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
    } else if (type === 'gallery') {
      // Gallery images: max 1200x800, quality 80
      processedImage = await sharp(buffer)
        .resize(1200, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();
    } else {
      // Default: max 1200px, quality 80
      processedImage = await sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();
    }

    console.log(`[Upload API] Sharp processing complete: ${processedImage.length} bytes`);

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `${user.id}/${type || 'image'}-${timestamp}-${randomId}.webp`;
    const thumbFilename = `${user.id}/${type || 'image'}-${timestamp}-${randomId}-thumb.webp`;

    // Generate thumbnail for gallery images (200x200 cover crop)
    let thumbnailBuffer: Buffer | null = null;
    if (type === 'gallery') {
      console.log('[Upload API] Generating thumbnail...');
      thumbnailBuffer = await sharp(buffer)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 75 })
        .toBuffer();
      console.log(`[Upload API] Thumbnail generated: ${thumbnailBuffer.length} bytes`);
    }

    // Upload main image to Supabase Storage
    console.log(`[Upload API] Uploading to Supabase: ${filename}`);
    const { data, error } = await supabase.storage
      .from('partner-images')
      .upload(filename, processedImage, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year cache
      });

    if (error) {
      console.error('[Upload API] Storage upload error:', error);
      return NextResponse.json(
        { error: 'Chyba pri nahrávaní: ' + error.message },
        { status: 500 }
      );
    }

    console.log('[Upload API] Main image uploaded successfully');

    // Upload thumbnail if generated
    if (thumbnailBuffer) {
      const { error: thumbError } = await supabase.storage
        .from('partner-images')
        .upload(thumbFilename, thumbnailBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000', // 1 year cache
        });

      if (thumbError) {
        console.warn('Thumbnail upload failed:', thumbError.message);
        // Continue anyway, main image was uploaded successfully
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('partner-images')
      .getPublicUrl(data.path);

    // Get thumbnail URL if available
    let thumbnailUrl: string | undefined;
    if (thumbnailBuffer) {
      const { data: thumbUrlData } = supabase.storage
        .from('partner-images')
        .getPublicUrl(thumbFilename);
      thumbnailUrl = thumbUrlData.publicUrl;
    }

    console.log(`[Upload API] Success! URL: ${urlData.publicUrl}`);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      thumbnailUrl,
      path: data.path,
      size: processedImage.length,
    });
  } catch (error) {
    console.error('[Upload API] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Neznáma chyba';
    return NextResponse.json(
      { error: `Chyba servera: ${errorMessage}` },
      { status: 500 }
    );
  }
}
