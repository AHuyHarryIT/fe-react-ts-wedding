import { Image } from 'antd';
import type { ComponentProps } from 'react';

type AntdImageProps = ComponentProps<typeof Image>;

interface CloudinaryImageProps extends Omit<AntdImageProps, 'src'> {
  src: string;
  previewOriginal?: boolean;
  cloudinaryCropMode?: 'fill' | 'fit' | 'thumb' | 'scale';
}

const toCloudinaryTransformedUrl = (
  url: string,
  width?: number | string,
  height?: number | string,
  mode: CloudinaryImageProps['cloudinaryCropMode'] = 'fill'
) => {
  const numericWidth = typeof width === 'number' ? width : undefined;
  const numericHeight = typeof height === 'number' ? height : undefined;

  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }
  const transformations = [
    mode && `c_${mode}`,
    numericWidth && `w_${numericWidth}`,
    numericHeight && `h_${numericHeight}`,
  ].join(',');

  return url.replace('/upload/', `/upload/${transformations}/`);
};

export function CloudinaryImage({
  src,
  width,
  height,
  preview,
  previewOriginal = true,
  cloudinaryCropMode = 'fill',
  ...imageProps
}: CloudinaryImageProps) {
  const transformedSrc = toCloudinaryTransformedUrl(
    src,
    width,
    height,
    cloudinaryCropMode
  );

  return (
    <Image
      width={width}
      height={height}
      src={transformedSrc}
      preview={preview ?? (previewOriginal ? { src } : true)}
      {...imageProps}
    />
  );
}
