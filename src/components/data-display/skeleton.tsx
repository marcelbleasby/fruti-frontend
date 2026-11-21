import {
  Skeleton as ChakraSkeleton,
  SkeletonCircle as ChakraSkeletonCircle,
  type SkeletonCircleProps,
  type SkeletonProps,
  SkeletonText as ChakraSkeletonText,
  type SkeletonTextProps,
} from "@chakra-ui/react";
import { forwardRef } from "react";

export type { SkeletonCircleProps, SkeletonProps, SkeletonTextProps };

/** Sem animação quando o usuário pede menos movimento. */
const reducedMotion = { _motionReduce: { animation: "none" } } as const;

/**
 * Skeleton — bloco bg.emphasized com pulso; raio 8px.
 * Use o mesmo formato do conteúdo final (sem salto de layout).
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(props, ref) {
  return <ChakraSkeleton ref={ref} borderRadius="sm" {...reducedMotion} {...props} />;
});

export const SkeletonCircle = forwardRef<HTMLDivElement, SkeletonCircleProps>(function SkeletonCircle(props, ref) {
  return <ChakraSkeletonCircle ref={ref} {...reducedMotion} {...props} />;
});

export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(function SkeletonText(props, ref) {
  return <ChakraSkeletonText ref={ref} borderRadius="sm" gap="1.5" {...reducedMotion} {...props} />;
});
