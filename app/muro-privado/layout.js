import { redirect } from "next/navigation";
import { auth } from "@/libs/auth";
import config from "@/config";
import { canAccessPrivateWall } from "@/libs/roles";

export default async function MuroPrivadoLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect(`${config.auth.loginUrl}?callbackUrl=/muro-privado`);
  }

  if (!canAccessPrivateWall(session.user.role)) {
    redirect("/muro");
  }

  return children;
}
