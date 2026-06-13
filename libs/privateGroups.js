import PrivateGroup from "@/models/PrivateGroup";

export function isGroupMember(group, userId, userEmail) {
  if (!group) return false;

  const uid = userId?.toString();
  const email = userEmail?.toLowerCase();

  return group.members.some(
    (member) =>
      member.user?.toString() === uid || (email && member.email === email)
  );
}

export function isGroupOwner(group, userId) {
  if (!group || !userId) return false;
  return group.owner?.toString() === userId.toString();
}

export async function getGroupIfMember(groupId, userId, userEmail) {
  const group = await PrivateGroup.findById(groupId);
  if (!group || !isGroupMember(group, userId, userEmail)) {
    return null;
  }
  return group;
}

export function parseInviteEmails(raw) {
  if (!raw || typeof raw !== "string") return [];

  return [
    ...new Set(
      raw
        .split(/[,;\n]+/)
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email && email.includes("@"))
    ),
  ];
}

export function formatGroupForClient(group, userId) {
  const memberCount = group.members?.length || 0;
  const pendingCount = group.pendingInvites?.length || 0;

  return {
    id: group._id?.toString() || group.id,
    name: group.name,
    description: group.description,
    inviteCode: group.inviteCode,
    memberCount,
    pendingCount,
    isOwner: isGroupOwner(group, userId),
    members: (group.members || []).map((member) => ({
      email: member.email,
      role: member.role,
      joinedAt: member.joinedAt,
    })),
    pendingInvites: (group.pendingInvites || []).map((invite) => ({
      email: invite.email,
      invitedAt: invite.invitedAt,
    })),
    createdAt: group.createdAt,
  };
}
