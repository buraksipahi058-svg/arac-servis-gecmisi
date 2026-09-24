"use client";

import { useActionState } from "react";
import type { ProfileFormState } from "@/app/dashboard/profile/actions";
import { TitleIcon } from "@/components/profiles/title-badge";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextAreaField } from "@/components/ui/text-area-field";
import { TextField } from "@/components/ui/text-field";
import { PROVINCES } from "@/lib/profiles/provinces";
import { PROFILE_TITLES } from "@/lib/profiles/titles";
import { MAX_BIO_LENGTH, type ProfileFormValues } from "@/lib/profiles/validation";

type ProfileFormProps = {
  action: (state: ProfileFormState, formData: FormData) => Promise<ProfileFormState>;
  initialValues: ProfileFormValues;
};

export function ProfileForm({ action, initialValues }: ProfileFormProps) {
  const [state, formAction] = useActionState(action, { values: initialValues });
  const values = state.values ?? initialValues;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.formError && <FormAlert tone="error">{state.formError}</FormAlert>}
      {state.saved && <FormAlert tone="success">Profilin kaydedildi.</FormAlert>}

      <TextField
        label="Görünen ad"
        name="displayName"
        placeholder="Ad Soyad veya firma adı"
        autoComplete="name"
        maxLength={60}
        required
        defaultValue={values.displayName}
        error={errors.displayName}
        hint="Diğer kullanıcılar seni bu adla görür. E-posta adresin gösterilmez."
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="city" className="text-sm font-semibold text-ink-800">
          İl
        </label>
        <select
          id="city"
          name="city"
          defaultValue={values.city}
          aria-invalid={errors.city ? true : undefined}
          className="h-12 rounded-xl border border-sand-300 bg-white px-3 text-base text-ink-900 shadow-sm focus:border-ink-700 focus:outline-none focus:ring-4 focus:ring-gold-400/30"
        >
          <option value="">Seçilmedi</option>
          {PROVINCES.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
        {errors.city && <p className="text-sm text-red-700">{errors.city}</p>}
      </div>

      <TextField
        label="Telefon (isteğe bağlı)"
        name="phone"
        type="tel"
        placeholder="0532 123 45 67"
        autoComplete="tel"
        inputMode="tel"
        maxLength={20}
        defaultValue={values.phone}
        error={errors.phone}
        hint="Girersen profilinde diğer kullanıcılara görünür."
      />

      <TextAreaField
        label="Hakkında (isteğe bağlı)"
        name="bio"
        placeholder="Örn. 15 yıllık motor ustası, Kadıköy."
        maxLength={MAX_BIO_LENGTH}
        rows={3}
        defaultValue={values.bio}
        error={errors.bio}
      />

      <fieldset>
        <legend className="text-sm font-semibold text-ink-800">Unvanlar</legend>
        <p className="mt-1 text-xs text-ink-500">
          Birden fazla seçebilirsin. Unvanlar senin beyanındır; diğer kullanıcılar onaylayabilir.
          Bir unvanı kaldırırsan ona verilen onaylar da silinir.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {PROFILE_TITLES.map((title) => (
            <label
              key={title.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-sand-300 bg-white p-3.5 shadow-sm transition-colors hover:border-ink-300 has-checked:border-ink-900 has-checked:bg-ink-50 has-focus-visible:ring-4 has-focus-visible:ring-gold-400/40"
            >
              <input
                type="checkbox"
                name="titles"
                value={title.value}
                defaultChecked={values.titles.includes(title.value)}
                className="mt-1 size-4 accent-ink-900"
              />
              <span className="flex flex-col">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink-900">
                  <TitleIcon title={title.value} className="size-4 text-gold-700" />
                  {title.label}
                </span>
                <span className="text-sm text-ink-600">{title.description}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.titles && <p className="mt-1.5 text-sm text-red-700">{errors.titles}</p>}
      </fieldset>

      <SubmitButton pendingText="Kaydediliyor…" className="mt-2 w-full">
        Profili kaydet
      </SubmitButton>
    </form>
  );
}
