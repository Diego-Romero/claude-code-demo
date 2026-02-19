import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-lg">Incident Tracker</span>
        <Link href="/signin">
          <Button variant="outline" size="sm">Sign in</Button>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="space-y-3 max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight">
            Incident management for engineering teams
          </h1>
          <p className="text-lg text-muted-foreground">
            Create incidents, assign responders, track timelines, and write
            post-mortems — all in real time.
          </p>
        </div>

        <Link href="/signin">
          <Button size="lg">Get started</Button>
        </Link>
      </main>
    </div>
  );
}
