-- Araç tipi (otomobil, motosiklet, otobüs...). Mevcut araçlar "car" (otomobil) kabul edilir.
alter table public.vehicles
  add column vehicle_type text not null default 'car';

alter table public.vehicles
  add constraint vehicles_vehicle_type_values
  check (vehicle_type in ('car', 'motorcycle', 'bus', 'minibus', 'van', 'truck', 'tractor', 'other'));

comment on column public.vehicles.vehicle_type is
  'car: otomobil, motorcycle: motosiklet, bus: otobüs, minibus: minibüs, van: kamyonet/panelvan, truck: kamyon/tır, tractor: traktör, other: diğer';

-- Sütun düzeyi yetkiler: araç sahibi tipi ekleme ve düzenlemede belirleyebilir.
grant insert (vehicle_type) on table public.vehicles to authenticated;
grant update (vehicle_type) on table public.vehicles to authenticated;
