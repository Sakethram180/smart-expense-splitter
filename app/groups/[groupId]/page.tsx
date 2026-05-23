import { redirect } from "next/navigation";

import { GroupDetailShell } from "@/components/group-detail-shell";
import { getSessionUser } from "@/lib/auth";

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const { groupId } = await params;

  return <GroupDetailShell groupId={groupId} user={user} />;
}
