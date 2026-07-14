import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const userId = await getSession();
  if (userId) {
    redirect("/dashboard");
  } else {
    redirect("/onboarding");
  }
}
