import { useState, type ImgHTMLAttributes, type ReactNode } from 'react'

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  /** What takes the picture's place if it does not load. It must keep the layout in one piece. */
  fallback: ReactNode
}

// An image that never leaves a broken-image icon: if the file is missing or fails to load, the
// fallback is shown instead (REQ-WEB-HOME-011). It tries again when `src` changes.
export function SafeImage({ fallback, onError, src, ...props }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>()
  if (src && failedSrc === src) return <>{fallback}</>
  return (
    <img
      {...props}
      src={src}
      onError={(event) => {
        setFailedSrc(src)
        onError?.(event)
      }}
    />
  )
}
