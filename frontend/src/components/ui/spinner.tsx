import { cn } from "@/utils/cn";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

const sizeMap = {
  sm: "h-4 w-4",
  default: "h-5 w-5", 
  lg: "h-6 w-6"
};

export function Spinner({ size = "default", className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeMap[size],
        className
      )}
      {...props}
    />
  );
}