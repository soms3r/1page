"use client";

import NextLink from "next/link";
import type { LinkProps as NextLinkProps } from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Props = NextLinkProps &
  Omit<ComponentProps<"a">, "href" | "prefetch"> & { children?: ReactNode };

export default function Link({ prefetch = false, ...props }: Props) {
  return <NextLink prefetch={prefetch} {...props} />;
}
