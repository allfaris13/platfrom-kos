import React, { useState } from 'react'
import Image from 'next/image'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { src, alt, style, className, width, height, priority, ...rest } = props
  /* eslint-enable @typescript-eslint/no-unused-vars */

  if (didError || !src) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle relative overflow-hidden ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full relative">
          <Image
            src={ERROR_IMG_SRC}
            alt="Error loading image"
            unoptimized
            fill
            className="object-none"
            {...rest}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={style}>
      <Image
        src={src as string}
        alt={alt ?? 'Image'}
        fill
        className="object-cover"
        unoptimized
        onError={handleError}
        priority={priority}
        {...rest}
      />
    </div>
  )
}
