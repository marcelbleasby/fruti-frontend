import { Flex, Spinner as ChakraSpinner, type SpinnerProps as ChakraSpinnerProps } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

/** xs 12 · sm 16 · md 24 · lg 32 (borda 2px, trilha green.200, arco primário). */
const SIZES: Record<SpinnerSize, string> = { xs: "12px", sm: "16px", md: "24px", lg: "32px" };

export interface SpinnerProps extends Omit<ChakraSpinnerProps, "size"> {
  size?: SpinnerSize;
  /** Texto visível ao lado; com ele o conjunto vira role="status". */
  label?: ReactNode;
}

/**
 * Spinner — para esperas curtas. Acima de 1 s, prefira Skeleton (LoadingState).
 * Chakra v3: Spinner · role=status.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", label, ...rest },
  ref,
) {
  const spinner = (
    <ChakraSpinner
      ref={ref}
      aria-hidden={label ? true : undefined}
      css={{ "--spinner-size": SIZES[size], "--spinner-track-color": "colors.green.200" }}
      borderWidth="2px"
      color="green.200"
      borderTopColor="primary"
      animationDuration="0.8s"
      flexShrink={0}
      {...rest}
    />
  );
  if (!label) return spinner;
  return (
    <Flex role="status" align="center" gap="2.5" fontSize="sm" color="fg">
      {spinner}
      {label}
    </Flex>
  );
});
