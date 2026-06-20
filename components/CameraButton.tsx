"use client";

type Props = { onFile: (file: File) => void; disabled?: boolean };

export function CameraButton({ onFile, disabled }: Props) {
  return (
    <label
      className={`block w-full rounded-[1.8rem] bg-berry text-white py-7 shadow-xl flex flex-col items-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-[#ef6a49] focus-within:ring-4 focus-within:ring-berry/40 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      style={{ boxShadow: "0 12px 40px rgba(255,122,89,0.4)" }}
    >
      <svg
        width="42"
        height="42"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3.4"/>
      </svg>
      <span className="font-display font-extrabold text-2xl">Ta ett foto</span>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={disabled}
        aria-label="Ta ett foto på ingrediensförteckningen"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}
