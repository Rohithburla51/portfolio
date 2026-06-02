"use client";

import * as React from "react";
import Link from "next/link";
import { trackEvent, type EventName } from "@/lib/utils";

interface TrackableNextLinkProps {
  href: string;
  event: EventName;
  eventParams?: Record<string, string | number>;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}

/**
 * Server-component-friendly wrapper for next/link that fires
 * a GA4 event on click. Used for internal blog/post routes.
 */
export function TrackableNextLink({
  href,
  event,
  eventParams,
  className,
  children,
  ariaLabel,
}: TrackableNextLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onClick={() => trackEvent(event, eventParams)}
      className={className}
    >
      {children}
    </Link>
  );
}
