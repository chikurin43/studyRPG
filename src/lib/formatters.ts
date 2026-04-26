export function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

export function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${`${minutes}`.padStart(2, "0")}:${`${seconds}`.padStart(2, "0")}`;
  }

  return `${minutes}:${`${seconds}`.padStart(2, "0")}`;
}

export function formatDateTime(isoString: string | null | undefined) {
  if (!isoString) {
    return "未記録";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

export function formatPercent(value: number) {
  return `${value}%`;
}
