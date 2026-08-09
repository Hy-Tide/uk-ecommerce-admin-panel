import React, { useState } from 'react';

export const ImageWithFallback = ({
  src,
  alt = 'Image',
  fallbackSrc = '/logo.png',
  opacity = 0.3,
  style = {},
  className = '',
  fit = 'cover',
  containerStyle = {},
  onError: customOnError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const isValidSrc = src && typeof src === 'string' && src.trim().length > 0;

  if (!isValidSrc || hasError) {
    return (
      <div
        className={`image-fallback-container ${className}`}
        style={{
          width: style.width || '100%',
          height: style.height || '100%',
          minWidth: style.minWidth,
          minHeight: style.minHeight,
          maxWidth: style.maxWidth,
          maxHeight: style.maxHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)',
          borderRadius: style.borderRadius || 'inherit',
          overflow: 'hidden',
          padding: '6px',
          boxSizing: 'border-box',
          position: 'relative',
          ...containerStyle
        }}
      >
        <img
          src={fallbackSrc}
          alt={alt || "Logo"}
          style={{
            maxWidth: '65%',
            maxHeight: '65%',
            objectFit: 'contain',
            opacity: opacity,
            filter: 'grayscale(30%)'
          }}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        objectFit: fit,
        ...style
      }}
      className={className}
      onError={(e) => {
        setHasError(true);
        if (customOnError) customOnError(e);
      }}
      {...props}
    />
  );
};

export default ImageWithFallback;
