import {
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <Sonner
      position="top-right"
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="h-4 w-4" />,
        info: <InfoIcon className="h-4 w-4" />,
        warning: <TriangleAlertIcon className="h-4 w-4" />,
        error: <OctagonXIcon className="h-4 w-4" />,
      }}
      toastOptions={{
        style: {
          borderRadius: "var(--radius)",
        },
      }}
      {...props} />
  );
}

export { Toaster }
