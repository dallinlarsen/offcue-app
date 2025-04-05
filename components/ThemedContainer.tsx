import { Box, IBoxProps } from "./ui/box";

export type ThemedContainerProps = IBoxProps;

export function ThemedContainer({ className, ...otherProps }: ThemedContainerProps) {
  const classes = [
    "bg-background-light dark:bg-background-dark flex-1",
    className,
  ].join(" ");
  return <Box className={classes} {...otherProps} />;
}
