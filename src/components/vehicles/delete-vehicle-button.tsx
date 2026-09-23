"use client";

import type { FormEvent } from "react";
import { deleteVehicle } from "@/app/dashboard/vehicles/actions";
import { SubmitButton } from "@/components/ui/submit-button";

type DeleteVehicleButtonProps = {
  vehicleId: string;
  plateLabel: string;
};

export function DeleteVehicleButton({ vehicleId, plateLabel }: DeleteVehicleButtonProps) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`${plateLabel} plakalı araç silinsin mi? Bu işlem geri alınamaz.`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteVehicle.bind(null, vehicleId)} onSubmit={confirmDelete}>
      <SubmitButton
        variant="secondary"
        pendingText="Siliniyor…"
        className="w-full border-red-300 text-red-700 hover:bg-red-50"
      >
        Aracı sil
      </SubmitButton>
    </form>
  );
}
