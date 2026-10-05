/**
 * Formats timestamps into natural humanized relative time (social-media style)
 * e.g. "Baru saja", "5 menit yang lalu", "2 jam yang lalu", "3 hari yang lalu",
 * or full date "12 Mei, 14:30" if older than a week.
 */
export function formatRelativeTime(dateInput: string | number | Date, customNow?: Date): string {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  const now = customNow || new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Future timestamp or immediately created (di bawah 60 detik)
  if (diffInSeconds < 60) {
    return 'Baru saja';
  }

  const diffInMinutes = Math.max(1, Math.floor(diffInSeconds / 60));
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  }

  const diffInHours = Math.max(1, Math.floor(diffInMinutes / 60));
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  }

  const diffInDays = Math.max(1, Math.floor(diffInHours / 24));
  if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`;
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}
