import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center space-y-4",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="text-muted-foreground/50">
          {icon}
        </div>
      )}

      {title && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {description}
            </p>
          )}
        </div>
      )}

      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  )
}

export { EmptyState }
