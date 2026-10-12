import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../lib/supabase.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/upload
 * Accepts an image payload (base64 or binary data), validates size and MIME type,
 * uploads to Supabase Storage bucket 'campaign-posters', and returns public URL.
 */
export async function uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      res.status(503).json({
        error: 'StorageServiceUnavailable',
        message: 'Storage service is not configured.',
      });
      return;
    }

    const { file, filename, contentType } = req.body;

    if (!file) {
      res.status(400).json({
        error: 'BadRequest',
        message: 'No file data provided in upload payload.',
      });
      return;
    }

    const mime = contentType || 'image/jpeg';
    if (!ALLOWED_MIME_TYPES.includes(mime.toLowerCase())) {
      res.status(400).json({
        error: 'InvalidFileType',
        message: 'Only JPEG, PNG, and WebP images are supported.',
      });
      return;
    }

    // Convert base64 data to buffer
    const base64Data = file.includes(';base64,') ? file.split(';base64,')[1] : file;
    const fileBuffer = Buffer.from(base64Data, 'base64');

    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      res.status(400).json({
        error: 'FileTooLarge',
        message: 'File size exceeds maximum allowed limit of 5MB.',
      });
      return;
    }

    const ext = filename?.split('.').pop() || (mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg');
    const uniquePath = `posters/poster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('campaign-posters')
      .upload(uniquePath, fileBuffer, {
        contentType: mime,
        cacheControl: '3600',
        upsert: false,
      });

    if (error || !data) {
      console.error('[STORAGE UPLOAD ERROR]', error);
      res.status(500).json({
        error: 'UploadFailed',
        message: error?.message || 'Failed to upload image to storage bucket.',
      });
      return;
    }

    const { data: pubData } = supabase.storage.from('campaign-posters').getPublicUrl(data.path);

    res.status(200).json({
      message: 'Image uploaded successfully.',
      data: {
        url: pubData.publicUrl,
        path: data.path,
        size: fileBuffer.length,
        contentType: mime,
      },
    });
  } catch (err) {
    next(err);
  }
}
