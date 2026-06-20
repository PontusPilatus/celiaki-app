"use client";

type Props = { onFile: (file: File) => void; disabled?: boolean };

export function CameraButton({ onFile, disabled }: Props) {
  return (
    <label className={`block w-full cursor-pointer rounded-2xl bg-blue-600 px-6 py-8 text-center text-xl font-semibold text-white ${disabled ? "opacity-50" : ""}`}>
      📷 Ta foto på innehållsförteckningen
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}
