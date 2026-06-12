const INTERCESSOR_ROLES = ["admin", "intercessor"];

export function canAccessPrivateWall(role) {
  return INTERCESSOR_ROLES.includes(role);
}

export { INTERCESSOR_ROLES };
