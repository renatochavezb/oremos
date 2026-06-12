const DB_ERROR_PATTERNS = [
  "querySrv",
  "ECONNREFUSED",
  "ENOTFOUND",
  "MongoServerSelectionError",
  "buffering timed out",
  "MONGODB_URI",
];

export function isDbConnectionError(error) {
  const message = error?.message || String(error);
  return DB_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

export function getDbErrorMessage(error) {
  if (isDbConnectionError(error)) {
    return "No se pudo conectar con la base de datos. Verifica tu conexión a internet e intenta de nuevo.";
  }

  return error?.message || "Algo salió mal. Intenta de nuevo.";
}
