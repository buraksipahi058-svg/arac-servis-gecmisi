import { Bus, BusFront, Car, CircleHelp, Motorbike, Tractor, Truck, Van, type LucideProps } from "lucide-react";
import type { VehicleType } from "@/lib/vehicles/vehicle-types";

const ICONS: Record<VehicleType, React.ComponentType<LucideProps>> = {
  car: Car,
  motorcycle: Motorbike,
  bus: Bus,
  minibus: BusFront,
  van: Van,
  truck: Truck,
  tractor: Tractor,
  other: CircleHelp,
};

export function VehicleTypeIcon({ type, ...props }: { type: string } & LucideProps) {
  const Icon = ICONS[type as VehicleType] ?? CircleHelp;
  return <Icon aria-hidden {...props} />;
}
