'use client';

import { useMemo, useState } from 'react';

const STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const;
type StateCode = (typeof STATES)[number];

type FormState = {
  suburb: string;
  postcode: string; // keep as string; we validate digits
  state: '' | StateCode;
};

type Props = {
  loading?: boolean; // allow parent to show "Checking…" later
  onVerify?: (form: { suburb: string; postcode: string; state: StateCode }) => void;
  initialData?: { suburb: string; postcode: string; state: string } | null;
};

export default function VerifierFormUI({ loading = false, onVerify, initialData }: Props) {
  const [form, setForm] = useState<FormState>({ 
    suburb: initialData?.suburb || '', 
    postcode: initialData?.postcode || '', 
    state: (initialData?.state as StateCode) || '' 
  });
  const [touched, setTouched] = useState({ suburb: false, postcode: false, state: false });

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    const suburb = form.suburb.trim();

    if (!suburb) e.suburb = 'Suburb is required';
    else if (!/^[A-Za-z][A-Za-z\s\-']{1,63}$/.test(suburb)) {
      e.suburb = 'Use letters, spaces, hyphens or apostrophes';
    }

    if (!/^\d{4}$/.test(form.postcode)) e.postcode = 'Enter a 4-digit postcode';

    if (!form.state) e.state = 'Select a state';

    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const markTouched = (field: keyof FormState) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const inputBase =
    'border rounded-lg px-3 py-2 w-full outline-none focus-visible:ring-2 focus-visible:ring-black/20';
  const errorClass = 'border-red-500';
  const okClass = 'border-gray-300';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ suburb: true, postcode: true, state: true });
    if (isValid && onVerify) {
      onVerify({
        suburb: form.suburb.trim(),
        postcode: form.postcode,
        state: form.state as StateCode,
      });
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Suburb */}
        <div className="flex flex-col gap-1">
          <label htmlFor="suburb" className="text-sm font-medium">
            Suburb
          </label>
          <input
            id="suburb"
            name="suburb"
            placeholder="e.g. Richmond"
            className={`${inputBase} ${
              touched.suburb && errors.suburb ? errorClass : okClass
            }`}
            value={form.suburb}
            onChange={(e) => setForm({ ...form, suburb: e.target.value })}
            onBlur={() => markTouched('suburb')}
            autoComplete="address-level2"
            aria-invalid={!!(touched.suburb && errors.suburb)}
            aria-describedby={touched.suburb && errors.suburb ? 'suburb-error' : undefined}
            required
          />
          {touched.suburb && errors.suburb && (
            <p id="suburb-error" className="text-sm text-red-600">
              {errors.suburb}
            </p>
          )}
        </div>

        {/* Postcode */}
        <div className="flex flex-col gap-1">
          <label htmlFor="postcode" className="text-sm font-medium">
            Postcode
          </label>
          <input
            id="postcode"
            name="postcode"
            placeholder="e.g. 3121"
            className={`${inputBase} ${
              touched.postcode && errors.postcode ? errorClass : okClass
            }`}
            value={form.postcode}
            onChange={(e) =>
              setForm({
                ...form,
                // only digits, max 4
                postcode: e.target.value.replace(/\D/g, '').slice(0, 4),
              })
            }
            onBlur={() => markTouched('postcode')}
            inputMode="numeric"
            maxLength={4}
            aria-invalid={!!(touched.postcode && errors.postcode)}
            aria-describedby={touched.postcode && errors.postcode ? 'postcode-error' : undefined}
            required
          />
          {touched.postcode && errors.postcode && (
            <p id="postcode-error" className="text-sm text-red-600">
              {errors.postcode}
            </p>
          )}
        </div>

        {/* State */}
        <div className="flex flex-col gap-1">
          <label htmlFor="state" className="text-sm font-medium">
            State
          </label>
          <select
            id="state"
            name="state"
            className={`${inputBase} ${
              touched.state && errors.state ? errorClass : okClass
            }`}
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value as FormState['state'] })}
            onBlur={() => markTouched('state')}
            aria-invalid={!!(touched.state && errors.state)}
            aria-describedby={touched.state && errors.state ? 'state-error' : undefined}
            required
          >
            <option value="">Select state</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {touched.state && errors.state && (
            <p id="state-error" className="text-sm text-red-600">
              {errors.state}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            type="submit"
            className="bg-black text-white rounded-lg px-4 py-2 w-full disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading || !isValid}
          >
            {loading ? 'Checking…' : 'Verify'}
          </button>
        </div>
      </form>

      {/* Placeholder for result area (we’ll wire this up in the next step) */}
      {/* <div className="space-y-2">
        // success / error messages go here later
      </div> */}
    </div>
  );
}


// Container component will be created separately to use Apollo and Map
