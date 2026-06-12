import dns from "dns";

let configured = false;

export function configureMongoDns() {
  if (configured) return;
  // Always use public DNS: some local routers refuse SRV lookups for mongodb+srv://
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  configured = true;
}
