"use client";

import { SessionProvider, useSession } from "next-auth/react";
import Navbar from "./components/layout/navbar";

function NavbarContent() {
  const { data: session, status } = useSession();

  const user =
    session?.user ?
      {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
        id: (session.user as { id?: string }).id ?? null,
      }
    : null;

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <Navbar user={user} isAdmin={isAdmin} loading={status === "loading"} />
  );
}

export default function NavbarWrapper() {
  return (
    <SessionProvider>
      <NavbarContent />
    </SessionProvider>
  );
}
