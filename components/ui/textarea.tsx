import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  /** Show character counter when provided a positive number */
  maxChars?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, maxChars, id, value, onChange, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const charCount = typeof value === "string" ? value.length : 0;
    const overLimit = maxChars ? charCount > maxChars : false;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full rounded-xl border border-border bg-input",
            "px-4 py-3 text-sm text-foreground placeholder:text-muted",
            "resize-y min-h-[100px]",
            "transition-colors duration-150",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            (error || overLimit) && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          {...props}
        />

        <div className="flex items-center justify-between">
          {error ? (
            <p className="text-xs text-error" role="alert">
              {error}
            </p>
          ) : (
            <span />
          )}

          {maxChars && (
            <span
              className={cn(
                "text-xs tabular-nums",
                overLimit ? "text-error" : "text-muted"
              )}
            >
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
