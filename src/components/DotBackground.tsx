import { cn } from "@/lib/utils";
import React from "react";

interface DotBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function DotBackground({ children, className }: DotBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex w-full h-full items-center justify-center overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 h-full w-full opacity-50",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#9ca3af_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
          "[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]",
        )}
      />

      {/* Content */}
      <div className="relative z-20 w-full h-full">{children}</div>
    </div>
  );
}
