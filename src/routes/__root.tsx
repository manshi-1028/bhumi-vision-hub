import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth";
import { SearchIcon } from "../components/ui/icons";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="panel max-w-lg p-8 text-center sm:p-10">
        <span
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-[var(--border)] bg-[var(--primary-soft)] text-[var(--primary)]"
          aria-hidden="true"
        >
          <SearchIcon className="h-5 w-5" />
        </span>
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-2 font-serif text-3xl">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
          This page does not exist. It may have been moved, or the address may be incomplete.
        </p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[var(--muted-foreground)]">
          Every dashboard, research and simulator view is reachable from the main navigation.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link to="/" className="btn">
            Go to dashboard
          </Link>
          <Link to="/library" className="btn-outline">
            Browse the research library
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="panel max-w-md p-6 text-center">
        <h1 className="text-xl font-semibold">This page did not load</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            className="btn"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a href="/" className="btn-outline">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BhoomiSetu, national platform for evidence-based land governance" },
      {
        name: "description",
        content:
          "National digital platform for research, policy innovation and evidence-based land governance in India. Prototype for SIH26019 using sample data.",
      },
      { property: "og:title", content: "BhoomiSetu, evidence-based land governance" },
      {
        property: "og:description",
        content: "Dashboard, research repository and policy simulator for land governance in India. Sample data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Required: nested routes render here. */}
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
