import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/incidents"];
const authRoutes = ["/signin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (authRoutes.some((r) => pathname.startsWith(r)) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next|api/auth).*)", "/"],
};
