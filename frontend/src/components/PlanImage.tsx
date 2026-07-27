import { useState } from "react";
import { WORKOUT_PLACEHOLDER } from "../utils/planImages";

type PlanImageVariant = "cover" | "card" | "thumb";

interface PlanImageProps {
  src: string;
  alt: string;
  variant?: PlanImageVariant;
  /** Shown if `src` fails to load. Defaults to the workout placeholder. */
  fallbackSrc?: string;
  /** Above-the-fold hero images should load eagerly; everything else is lazy. */
  priority?: boolean;
  className?: string;
}

/**
 * Fallback-safe image: on load error it swaps to `fallbackSrc` once (never
 * loops), so an unresolved or missing local asset can never leave a broken
 * image icon in the layout.
 */
export function PlanImage({
  src,
  alt,
  variant = "cover",
  fallbackSrc = WORKOUT_PLACEHOLDER,
  priority = false,
  className,
}: PlanImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedSrc = failedSrc === src ? fallbackSrc : src;

  return (
    <div className={`ff-image ff-image-${variant} ${className ?? ""}`}>
      <img
        src={resolvedSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onError={() => {
          if (failedSrc !== src) setFailedSrc(src);
        }}
      />
    </div>
  );
}
