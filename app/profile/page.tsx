// app/profile/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "../actions/profile";
import { ProfileClient } from "./profile-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | مواطن الريف",
  description: "View your account information, recent cart and orders.",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/profile");

  const profile = await getUserProfile();
  if (!profile) redirect("/sign-in");

  return <ProfileClient profile={profile} />;
}
