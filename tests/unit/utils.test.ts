import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatDistanceToNow } from "@/lib/utils";

describe("formatDistanceToNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns seconds for recent timestamps", () => {
    const now = Date.now();
    expect(formatDistanceToNow(now - 30_000)).toBe("30s");
  });

  it("returns minutes for timestamps < 1 hour ago", () => {
    const now = Date.now();
    expect(formatDistanceToNow(now - 5 * 60_000)).toBe("5m");
  });

  it("returns hours for timestamps < 1 day ago", () => {
    const now = Date.now();
    expect(formatDistanceToNow(now - 3 * 3_600_000)).toBe("3h");
  });

  it("returns days for timestamps >= 1 day ago", () => {
    const now = Date.now();
    expect(formatDistanceToNow(now - 2 * 86_400_000)).toBe("2d");
  });

  it("returns 0s for the current timestamp", () => {
    expect(formatDistanceToNow(Date.now())).toBe("0s");
  });
});
