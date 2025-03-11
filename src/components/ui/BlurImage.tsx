
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function BlurImage({ src, alt, className, width, height }: BlurImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset loading state when src changes
    setIsLoading(true);
  }, [src]);

  return (
    <div className={cn("overflow-hidden relative", className)}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-secondary animate-pulse" 
          style={{ width, height }}
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={() => setIsLoading(false)}
        className={cn(
          "transition-all duration-500",
          isLoading ? "scale-110 blur-2xl" : "scale-100 blur-0"
        )}
      />
    </div>
  );
}
