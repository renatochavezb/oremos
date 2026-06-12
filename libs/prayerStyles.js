export function getPrivatePrayerCardClasses({ attended = false } = {}) {
  if (attended) {
    return "prayer-card-private prayer-card-private--attended";
  }

  return "prayer-card-private";
}

export function getPublicPrayerCardClasses({ hasActiveCandle = false } = {}) {
  if (hasActiveCandle) {
    return "border-amber-300 ring-2 ring-amber-100/50 bg-gradient-to-b from-base-100 to-amber-50/10";
  }

  return "border-base-content/5 bg-base-100";
}
