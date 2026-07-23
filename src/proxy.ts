import { NextRequest, NextResponse } from "next/server";

import { verifyJwt } from "@/lib/auth/jwt";

const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
];


const PROTECTED_ROUTES = [
  "/dashboard",
  "/sales",
  "/inventory",
  "/customers",
  "/suppliers",
  "/purchases",
  "/pharmacy",
  "/clinical",
  "/finance",
  "/reports",
  "/settings",
  "/users",
];


const SESSION_COOKIE = "getaxe-session";


export async function proxy(
  request: NextRequest
) {

  const { pathname } = request.nextUrl;


  const token =
    request.cookies.get(
      SESSION_COOKIE
    )?.value;



  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname);


  const isProtectedRoute =
    PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );



  let authenticated = false;



  /*
    Validate existing session
  */
  if (token) {

    try {

      await verifyJwt(token);

      authenticated = true;

    } catch {

      authenticated = false;

    }

  }



  /*
    Logged in users should not see login page
  */
  if (
    isPublicRoute &&
    authenticated
  ) {

    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );

  }



  /*
    Protect private routes
  */
  if (
    isProtectedRoute &&
    !authenticated
  ) {

    const response =
      NextResponse.redirect(
        new URL("/login", request.url)
      );


    response.cookies.delete(
      SESSION_COOKIE
    );


    return response;

  }



  return NextResponse.next();
}



export const config = {

  matcher: [

    "/dashboard/:path*",
    "/sales/:path*",
    "/inventory/:path*",
    "/customers/:path*",
    "/suppliers/:path*",
    "/purchases/:path*",
    "/pharmacy/:path*",
    "/clinical/:path*",
    "/finance/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/users/:path*",

    "/login",
    "/forgot-password",
    "/reset-password",

  ],

};