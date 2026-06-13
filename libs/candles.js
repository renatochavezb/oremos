const CANDLE_DURATION_MS = 24 * 60 * 60 * 1000;

export function getCandleExpiryDate(from = new Date()) {
  return new Date(from.getTime() + CANDLE_DURATION_MS);
}

export function getActiveCandles(prayer, now = new Date()) {
  const activeFromUsers = (prayer.candles || []).filter(
    (candle) => new Date(candle.expiresAt) > now
  );

  const activeFromLegacy = (prayer.candlesExpiry || [])
    .filter((expiry) => new Date(expiry) > now)
    .map((expiresAt) => ({ expiresAt, user: null }));

  return [...activeFromUsers, ...activeFromLegacy];
}

export function hasUserActiveCandle(prayer, userId, now = new Date()) {
  if (!userId) return false;

  return (prayer.candles || []).some(
    (candle) =>
      candle.user?.toString() === userId.toString() &&
      new Date(candle.expiresAt) > now
  );
}

export function getPrayerOwnerId(prayer) {
  if (!prayer?.user) return null;
  return prayer.user._id?.toString() || prayer.user.toString();
}

export function mapPrayerCandleFields(prayer, userId, now = new Date()) {
  const activeCandles = getActiveCandles(prayer, now);

  return {
    activeCandlesCount: activeCandles.length,
    hasActiveCandle: activeCandles.length > 0,
    hasUserLitCandle: hasUserActiveCandle(prayer, userId, now),
  };
}
