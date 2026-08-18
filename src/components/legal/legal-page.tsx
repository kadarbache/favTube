import Link from "next/link";
import type { ReactNode } from "react";

/** Both documents carry one date so they're never seen to disagree. */
export const LAST_UPDATED = "18 August 2026";

/** Where data and takedown requests go. Also the footer's "Contact us". */
export const CONTACT_EMAIL = "khadarbaashe35@gmail.com";

// There's no @tailwindcss/typography in this project and no `prose` classes
// anywhere, so long-form copy styles itself. Keeping that in one place is what
// stops the two legal pages from drifting apart.

export function LegalPage({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[620px] flex-1 px-7 pt-14">
      <h1 className="text-[28px] font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{lede}</p>
      <p className="mt-4 text-[13px] text-muted">
        Last updated {LAST_UPDATED}
      </p>
      {children}
    </main>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-relaxed">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
      {children}
    </ul>
  );
}

/** For the clauses Google requires us to state outright — worth the emphasis. */
export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-subtle px-4 py-3 text-[15px] leading-relaxed">
      {children}
    </div>
  );
}

/**
 * Internal hrefs get a client-side transition; anything external opens in its
 * own tab so a reader following a link to YouTube's terms doesn't lose theirs.
 */
export function A({ href, children }: { href: string; children: ReactNode }) {
  const className =
    "font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noreferrer noopener"
    >
      {children}
    </a>
  );
}
