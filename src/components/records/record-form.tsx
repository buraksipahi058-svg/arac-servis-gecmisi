"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { RecordFormState } from "@/app/dashboard/vehicles/[vehicleId]/records/actions";
import { DocumentPicker } from "@/components/documents/document-picker";
import { OdometerInputWarning } from "@/components/records/odometer-warning";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextAreaField } from "@/components/ui/text-area-field";
import { TextField } from "@/components/ui/text-field";
import { MAX_DOCUMENTS_PER_RECORD } from "@/lib/documents/constants";
import { uploadRecordDocuments } from "@/lib/documents/upload";
import { checkOdometerValue, type OdometerPoint } from "@/lib/records/odometer";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_SERVICE_NAME_LENGTH,
  parseKm,
  type RecordFormValues,
} from "@/lib/records/validation";
import { createClient } from "@/lib/supabase/client";

type RecordFormProps = {
  action: (state: RecordFormState, formData: FormData) => Promise<RecordFormState>;
  initialValues: RecordFormValues;
  maxDate: string;
  submitLabel: string;
  pendingText: string;
  // Aracın diğer kayıtları: girilen km'yi kaydetmeden önce karşılaştırmak için.
  odometerPoints: OdometerPoint[];
  // Verilirse (yeni kayıt) formda belge/fotoğraf seçilebilir.
  documentUpload?: { userId: string; vehicleId: string };
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function RecordForm({
  action,
  initialValues,
  maxDate,
  submitLabel,
  pendingText,
  odometerPoints,
  documentUpload,
}: RecordFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, { values: initialValues });
  const [files, setFiles] = useState<File[]>([]);
  const uploadStartedFor = useRef<string | null>(null);
  const values = state.values ?? initialValues;
  const errors = state.errors ?? {};
  const [serviceDate, setServiceDate] = useState(values.serviceDate);
  const [odometerInput, setOdometerInput] = useState(values.odometerKm);
  const odometerKm = parseKm(odometerInput);
  const odometerCheck =
    odometerKm !== null && ISO_DATE_PATTERN.test(serviceDate)
      ? checkOdometerValue(odometerPoints, serviceDate, odometerKm)
      : { lowerThanPrevious: null, higherThanNext: null };
  // Kayıt oluştu, belgeler yükleniyor.
  const uploading = Boolean(state.createdRecordId);

  useEffect(() => {
    const recordId = state.createdRecordId;
    if (!recordId || !documentUpload || uploadStartedFor.current === recordId) return;
    uploadStartedFor.current = recordId;

    const target = { ...documentUpload, recordId };
    void uploadRecordDocuments(createClient(), target, files).then(({ failed }) => {
      const query = failed.length > 0 ? `?yuklenemeyen=${failed.length}` : "";
      router.push(`/dashboard/vehicles/${target.vehicleId}/records/${recordId}${query}`);
    });
  }, [state.createdRecordId, documentUpload, files, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.formError && <FormAlert tone="error">{state.formError}</FormAlert>}

      <TextField
        label="Tarih"
        name="serviceDate"
        type="date"
        max={maxDate}
        required
        defaultValue={values.serviceDate}
        onChange={(event) => setServiceDate(event.target.value)}
        error={errors.serviceDate}
      />
      <TextField
        label="Kilometre"
        name="odometerKm"
        placeholder="58700"
        inputMode="numeric"
        autoComplete="off"
        required
        defaultValue={values.odometerKm}
        onChange={(event) => setOdometerInput(event.target.value)}
        error={errors.odometerKm}
      />
      <OdometerInputWarning {...odometerCheck} />
      <TextField
        label="Servis"
        name="serviceName"
        placeholder="ABC Oto"
        autoComplete="off"
        maxLength={MAX_SERVICE_NAME_LENGTH}
        required
        defaultValue={values.serviceName}
        error={errors.serviceName}
      />
      <TextAreaField
        label="İşlem açıklaması"
        name="description"
        placeholder="Motor yağı ve yağ filtresi değiştirildi."
        maxLength={MAX_DESCRIPTION_LENGTH}
        rows={4}
        required
        defaultValue={values.description}
        error={errors.description}
      />

      {documentUpload && (
        <>
          <input type="hidden" name="hasDocuments" value={files.length > 0 ? "1" : "0"} />
          <DocumentPicker
            files={files}
            onChange={setFiles}
            maxFiles={MAX_DOCUMENTS_PER_RECORD}
            disabled={uploading}
          />
        </>
      )}

      <SubmitButton pendingText={pendingText} disabled={uploading} className="mt-2 w-full">
        {uploading ? "Belgeler yükleniyor…" : submitLabel}
      </SubmitButton>
    </form>
  );
}
