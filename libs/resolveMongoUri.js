import dns from "dns";
import { promisify } from "util";
import { configureMongoDns } from "@/libs/mongoDns";

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

async function resolveSrvRecords(host) {
  configureMongoDns();

  try {
    return await resolveSrv(`_mongodb._tcp.${host}`);
  } catch (error) {
    if (!error.message?.includes("querySrv")) {
      throw error;
    }
  }

  const response = await fetch(
    `https://dns.google/resolve?name=_mongodb._tcp.${encodeURIComponent(host)}&type=SRV`
  );

  if (!response.ok) {
    throw new Error(`DNS lookup failed for MongoDB cluster (${host})`);
  }

  const data = await response.json();
  const answers = data.Answer || [];

  return answers
    .filter((answer) => answer.type === 33)
    .map((answer) => {
      const [priority, weight, port, name] = answer.data.split(" ");
      return {
        priority: Number(priority),
        weight: Number(weight),
        port: Number(port),
        name: name.endsWith(".") ? name.slice(0, -1) : name,
      };
    });
}

async function resolveTxtRecords(host) {
  configureMongoDns();

  try {
    return await resolveTxt(host);
  } catch {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=TXT`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const answers = data.Answer || [];

    return answers
      .filter((answer) => answer.type === 16)
      .map((answer) => [answer.data.replace(/^"|"$/g, "")]);
  }
}

export async function resolveMongoUri(uri) {
  if (!uri?.startsWith("mongodb+srv://")) {
    return uri;
  }

  const withoutProtocol = uri.slice("mongodb+srv://".length);
  const atIndex = withoutProtocol.lastIndexOf("@");
  if (atIndex === -1) {
    throw new Error("Invalid MONGODB_URI format");
  }

  const credentials = withoutProtocol.slice(0, atIndex);
  const rest = withoutProtocol.slice(atIndex + 1);
  const slashIndex = rest.indexOf("/");
  const host = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
  const pathAndQuery = slashIndex === -1 ? "" : rest.slice(slashIndex + 1);

  const queryIndex = pathAndQuery.indexOf("?");
  const dbName = queryIndex === -1 ? pathAndQuery : pathAndQuery.slice(0, queryIndex);
  const existingQuery = queryIndex === -1 ? "" : pathAndQuery.slice(queryIndex + 1);

  const srvRecords = await resolveSrvRecords(host);
  if (!srvRecords.length) {
    throw new Error(`No MongoDB SRV records found for ${host}`);
  }

  const hosts = srvRecords.map((record) => `${record.name}:${record.port}`).join(",");

  let replicaSet = "";
  const txtRecords = await resolveTxtRecords(host);
  const txt = txtRecords.flat().join("");
  const replicaSetMatch = txt.match(/replicaSet=([^&]+)/);
  if (replicaSetMatch) {
    replicaSet = replicaSetMatch[1];
  }

  const params = new URLSearchParams(existingQuery);
  if (!params.has("tls") && !params.has("ssl")) {
    params.set("tls", "true");
  }
  if (replicaSet && !params.has("replicaSet")) {
    params.set("replicaSet", replicaSet);
  }
  if (!params.has("authSource")) {
    params.set("authSource", "admin");
  }

  const dbSegment = dbName ? `/${dbName}` : "";
  const query = params.toString();

  return `mongodb://${credentials}@${hosts}${dbSegment}${query ? `?${query}` : ""}`;
}
