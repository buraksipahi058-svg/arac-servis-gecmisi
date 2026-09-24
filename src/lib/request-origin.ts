import "server-only";
import { headers } from "next/headers";

// İsteğin geldiği adres (örn. "http://192.168.1.13:3001"); kullanıcıya bağlantı göstermek için.
export async function getRequestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}
