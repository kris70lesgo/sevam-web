"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** Server action: clear both session cookies and redirect to /login. */
export async function logout() {
  const jar = await cookies();
  jar.delete("sevam_session");
  jar.delete("sevam_refresh");
  redirect("/login");
}
