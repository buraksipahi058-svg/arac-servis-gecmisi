const DEFAULT_REDIRECT = "/dashboard";

// Açık yönlendirmeyi (open redirect) önlemek için yalnızca site içi yollara izin verir.
export function safeNextPath(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return DEFAULT_REDIRECT;
  }
  return value;
}
