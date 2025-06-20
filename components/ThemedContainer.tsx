import { useHasHomeButton } from "@/hooks/useHasHomeButton";
import { Box, IBoxProps } from "./ui/box";

export type ThemedContainerProps = IBoxProps;

export function ThemedContainer({ className, ...otherProps }: ThemedContainerProps) {
  const hasHomeButton = useHasHomeButton();
  
  const classes = [
    `bg-background-light dark:bg-background-dark flex-1 px-4 pt-2 ${hasHomeButton ? 'pb-3' : ''}`,
    className,
  ].join(" ");
  return <Box className={classes} {...otherProps} />;
}
