// components/parts/ImageUploader.tsx
'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ImageUploader({
  name,
  bucket = 'part-photos',
  maxImages = 6,
}: {
  name: string;
  bucket?: string;
  maxImages?: number;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (images.length + files.length > maxImages) {
      setError(`You can upload up to ${maxImages} photos.`);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Sign in to upload photos.');
      return;
    }

    setError(null);
    setUploading(true);
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) { setError('Only image files are allowed.'); continue; }
      if (file.size > 5 * 1024 * 1024) { setError('Each photo must be under 5MB.'); continue; }

      const ext = file.name.split('.').pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) { setError(uploadError.message); continue; }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((i) => i !== url));
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-[#C7CDD1]">Photos</label>
      <input type="hidden" name={name} value={images.join(',')} readOnly />

      <div className="grid grid-cols-4 gap-2">
        {images.map((url, i) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-sm border border-[#3A4249] bg-[#1B2023]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded-sm bg-[#14181A]/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[#E2662D]">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => removeImage(url)}
              aria-label="Remove photo"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#14181A]/85 text-xs text-[#F2EFE9]"
            >
              ×
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-[#3A4249] text-[#8A9299] hover:border-[#E2662D] disabled:opacity-50"
          >
            <span className="text-xl leading-none">+</span>
            <span className="text-[10px]">{uploading ? 'Uploading…' : 'Add photo'}</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <p className="mt-2 text-xs text-[#5C646A]">
        First photo becomes the cover image. Up to {maxImages} photos, 5MB each.
      </p>
    </div>
  );
}
