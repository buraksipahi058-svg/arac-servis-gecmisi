// Araç tipleri: DB'deki vehicles_vehicle_type_values kısıtıyla aynı liste.
export const VEHICLE_TYPES = [
  { value: "car", label: "Otomobil" },
  { value: "motorcycle", label: "Motosiklet" },
  { value: "bus", label: "Otobüs" },
  { value: "minibus", label: "Minibüs" },
  { value: "van", label: "Kamyonet / Panelvan" },
  { value: "truck", label: "Kamyon / Tır" },
  { value: "tractor", label: "Traktör" },
  { value: "other", label: "Diğer" },
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number]["value"];

export const DEFAULT_VEHICLE_TYPE: VehicleType = "car";

export function isVehicleType(value: string): value is VehicleType {
  return VEHICLE_TYPES.some((type) => type.value === value);
}

export function vehicleTypeLabel(value: string): string {
  return VEHICLE_TYPES.find((type) => type.value === value)?.label ?? "Diğer";
}
