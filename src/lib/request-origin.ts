import "server-only";
import { headers } from "next/headers";

// Next, isteğin protokolünü x-forwarded-proto'ya yazar (TLS veya ters vekil varsa "https").
async function requestProtocol(): Promise<string> {
  return (await headers()).get("x-forwarded-proto") === "https" ? "https" : "http";
}

// İsteğin geldiği adres (örn. "http://192.168.1.13:3001"); kullanıcıya bağlantı göstermek için.
export async function getRequestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost";
  return `${await requestProtocol()}://${host}`;
}

// Çerezlerin "secure" bayrağı için: HTTPS üzerinden gelen isteklerde true.
export async function isHttpsRequest(): Promise<boolean> {
  return (await requestProtocol()) === "https";
}
