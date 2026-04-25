import { useState, useEffect } from 'react';
import { Image, Skeleton } from 'antd';
import { PictureOutlined } from '@ant-design/icons';

// Default placeholder image (light gray placeholder with camera icon)
const DEFAULT_IMAGE_PLACEHOLDER_URL =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2224%22 fill=%22%238c8c8c%22%3E📷%3C/text%3E%3C/svg%3E';

interface LazyImageProps {
  /** Direct image URL (preferred — no extra request) */
  src?: string;
  /** Async function that resolves to the image URL (legacy) */
  loadSrc?: () => Promise<string>;
  alt?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  /** false to disable preview, or a string URL for the original image to show on click */
  preview?: boolean | { src: string };
  /** Cache key to are-fetching the same image */
  cacheKey?: string;
}

// Module-level cache so thumbnails persist across re-renders
const urlCache = new Map<string, string>();

export function LazyImage({
  src: directSrc,
  loadSrc,
  alt = '',
  width = '100%',
  height = '100%',
  style,
  preview,
  cacheKey,
}: LazyImageProps) {
  // If a direct src is provided, use it immediately (no loading state needed)
  const initialSrc =
    directSrc || (cacheKey ? (urlCache.get(cacheKey) ?? null) : null);
  const [src, setSrc] = useState<string | null>(initialSrc);
  const [loading, setLoading] = useState(!initialSrc && !!loadSrc);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If direct src provided, update if it changes
    if (directSrc) {
      setSrc(directSrc);
      setLoading(false);
      setError(false);
      return;
    }

    // Already have from cache
    if (src) return;

    // No async loader provided
    if (!loadSrc) return;

    let cancelled = false;

    setLoading(true);
    setError(false);

    loadSrc()
      .then((url) => {
        if (cancelled) return;
        if (url) {
          if (cacheKey) urlCache.set(cacheKey, url);
          setSrc(url);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  if (loading) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
          borderRadius: '4px',
          ...style,
        }}
      >
        <Skeleton.Image active style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  if (error || !src) {
    return (
      <div
        style={{
          width,
          height,
          background: '#f0f0f0',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8c8c8c',
          ...style,
        }}
      >
        <PictureOutlined style={{ fontSize: '20px' }} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{ objectFit: 'cover', borderRadius: '4px', ...style }}
      fallback={DEFAULT_IMAGE_PLACEHOLDER_URL}
      preview={preview}
    />
  );
}
