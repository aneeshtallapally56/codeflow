import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const publicRoutes = ["/", "/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;


  const isPublic = publicRoutes.some((path) => pathname === path);


  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};