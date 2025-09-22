import React from "react";
import { XIcon } from "lucide-react";
import { useResponsive } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  className?: string;
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  className,
}: ResponsiveModalProps) {
  const { isMobile, isSmallMobile } = useResponsive();

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md sm:max-w-lg md:max-w-xl",
    lg: "max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
    xl: "max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl",
    full: "max-w-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className={cn(
          "bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-2xl w-full overflow-y-auto max-h-[95vh]",
          sizeClasses[size],
          className
        )}
        style={{
          maxWidth: isSmallMobile ? "100%" : undefined,
        }}
      >
        {(title || description) && (
          <div className="p-4 sm:p-6 border-b border-slate-700/50">
            {title && (
              <h3 className="text-lg sm:text-xl font-semibold text-slate-100">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-2 text-sm sm:text-base text-slate-300">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="p-4 sm:p-6">{children}</div>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
