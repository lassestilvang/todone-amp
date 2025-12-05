import React, { useState, useEffect } from 'react'
import { useLazyImage } from '@/hooks/useLazyLoad'
import clsx from 'clsx'

export interface LazyImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  className?: string
  imageClassName?: string
  wrapperClassName?: string
  fallback?: React.ReactNode
}

/**
 * Image component that lazy loads and handles errors gracefully
 * Uses Intersection Observer for better performance on mobile
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  imageClassName,
  wrapperClassName,
  fallback,
  ...props
}) => {
  const { ref, isLoaded, error } = useLazyImage(src)
  const [showPlaceholder, setShowPlaceholder] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      setShowPlaceholder(false)
    }
  }, [isLoaded])

  if (error) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg',
          className
        )}
      >
        {fallback || (
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load image</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={clsx('relative overflow-hidden', wrapperClassName, className)}>
      {/* Placeholder */}
      {showPlaceholder && placeholder && (
        <img
          src={placeholder}
          alt={alt}
          className={clsx('absolute inset-0 w-full h-full object-cover blur-md', imageClassName)}
          aria-hidden="true"
        />
      )}

      {/* Main Image */}
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={clsx(
          'w-full h-full object-cover transition-opacity duration-300',
          showPlaceholder ? 'opacity-0' : 'opacity-100',
          imageClassName
        )}
        loading="lazy"
        {...props}
      />
    </div>
  )
}
