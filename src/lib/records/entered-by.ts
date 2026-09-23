// Kaynak bilgisi yalnızca kaydı kimin girdiğini söyler; doğrulama iddiası taşımaz.
export function enteredByLabel(enteredBy: string): string {
  return enteredBy === "service" ? "Servis tarafından eklendi" : "Araç sahibi tarafından eklendi";
}
