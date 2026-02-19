"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/incidents", label: "All Incidents" },
];

export function Sidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r bg-gray-50 flex flex-col shrink-0">
      <div className="px-4 py-5 border-b">
        <span className="font-semibold text-sm">Incident Tracker</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 ${
              pathname === href ? "bg-gray-100 font-medium" : ""
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t px-4 py-4 space-y-1">
        <p className="text-xs text-muted-foreground truncate">{email}</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-0 text-xs"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}
