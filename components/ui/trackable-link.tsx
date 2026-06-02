"use client";

import * as React from "react";
import { trackEvent, type EventName } from "@/lib/utils";

interface TrackableLinkProps {
  href: string;
  event: EventName;
  eventParams?: Record<string, string | number>;
  external?: boolean;
  download?: boolean | string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}

/**
 * Server-component-friendly wrapper for external/internal links
 * that need to fire a GA4 event on click. Avoids passing event
 * handlers from server components to client components.
 */
export function TrackableLink({
  href,
  event,
  eventParams,
  external = true,
  download,
  className,
  children,
  ariaLabel,
}: TrackableLinkProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={download}
      aria-label={ariaLabel}
      onClick={() => trackEvent(event, eventParams)}
      className={className}
    >
      {children}
    </a>
  );
}
