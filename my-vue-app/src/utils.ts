// Утилита для объединения css-классов (аналог clsx/classnames)
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
