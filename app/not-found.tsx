import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div>
        <p className="text-7xl font-extrabold text-primary">404</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">Page not found</p>
        <p className="mt-2 text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </main>
  );
}
