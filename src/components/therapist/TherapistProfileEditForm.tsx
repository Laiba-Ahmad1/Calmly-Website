// // src/components/therapist/TherapistProfileEditForm.tsx
// "use client";

// // Therapist-editable fields only: bio and profile picture. Verification
// // status and documents stay under admin control.
// import { useRouter } from "next/navigation";
// import { useRef, useState } from "react";
// import { useTheme } from "@/components/theme/ThemeProvider";


// export interface ProfileEditLabels {
//   aboutYou: string;
//   bioPlaceholder: string;
//   changePicture: string;
//   uploadPicture: string;
//   removeSelected: string;
//   save: string;
//   saving: string;
//   saved: string;
//   errorSave: string;
//   errorGeneric: string;
// }

// export default function TherapistProfileEditForm({
//   initialBio,
//   avatarUrl,
//   initialLetter,
//   labels,
// }: {
//   initialBio: string;
//   avatarUrl?: string | null;
//   initialLetter: string;
//   labels: ProfileEditLabels;
// }) {
//   const router = useRouter();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [bio, setBio] = useState(initialBio);
//   const [preview, setPreview] = useState<string | null>(avatarUrl ?? null);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setSelectedFile(file);
//     setPreview(URL.createObjectURL(file));
//     setSaved(false);
//   }

//   function clearFile() {
//     setSelectedFile(null);
//     setPreview(avatarUrl ?? null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError("");
//     setSaving(true);
//     setSaved(false);

//     try {
//       const formData = new FormData();
//       formData.set("bio", bio);
//       if (selectedFile) formData.set("avatar", selectedFile);

//       const res = await fetch("/api/therapist/profile", {
//         method: "PATCH",
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         setError(data.error || labels.errorSave);
//         return;
//       }

//       setSaved(true);
//       setSelectedFile(null);
//       router.refresh();
//     } catch {
//       setError(labels.errorGeneric);
//     } finally {
//       setSaving(false);
//     }
//   }

//   const initial = initialLetter || "?";

//   return (
//     <div>
//     <form onSubmit={handleSubmit} className="mt-4">
//       {/* avatar */}
//       <div className="flex items-center gap-5">
//         {preview ? (
//           // eslint-disable-next-line @next/next/no-img-element
//           <img
//             src={preview}
//             alt=""
//             className="h-20 w-20 rounded-full border border-blue/25 object-cover"
//           />
//         ) : (
//           <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue/15 font-body text-2xl font-bold text-heading">
//             {initial}
//           </span>
//         )}

//         <div className="flex flex-col items-start gap-2">
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             className="hidden"
//           />
//           <button
//             type="button"
//             onClick={() => fileInputRef.current?.click()}
//             className="rounded-full border border-blue/30 px-4 py-2 font-body text-sm font-semibold text-heading transition hover:bg-blue/10"
//           >
//             {avatarUrl ? labels.changePicture : labels.uploadPicture}
//           </button>
//           {selectedFile && (
//             <button
//               type="button"
//               onClick={clearFile}
//               className="font-body text-xs text-text/50 underline-offset-2 hover:underline"
//             >
//               {labels.removeSelected}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* bio */}
//       <label className="mt-6 block">
//         <span className="font-body text-sm font-bold text-heading">
//           {labels.aboutYou}
//         </span>
//         <textarea
//           value={bio}
//           onChange={(e) => {
//             setBio(e.target.value);
//             setSaved(false);
//           }}
//           rows={4}
//           maxLength={300}
//           placeholder={labels.bioPlaceholder}
//           className="mt-1.5 w-full resize-none rounded-xl border border-blue/25 bg-background px-4 py-3 font-body text-sm leading-relaxed text-text outline-none placeholder:text-text/35 focus:border-blue/60"
//         />
//         <span className="mt-1 block font-body text-xs text-text/40">
//           {bio.length}/300
//         </span>
//       </label>

//       <div className="mt-4 flex items-center gap-3">
//         <button
//           type="submit"
//           disabled={saving}
//           className="rounded-full bg-blue px-6 py-2.5 font-body text-sm font-semibold text-background transition hover:bg-blue/85 disabled:opacity-50"
//         >
//           {saving ? labels.saving : labels.save}
//         </button>
//         {saved && (
//           <span className="font-body text-sm font-semibold text-blue">
//             {labels.saved}
//           </span>
//         )}
//         {error && <p className="font-body text-sm text-red-500">{error}</p>}
//       </div>
//     </form>
    
//      </div>
//   );
// }
// src/components/therapist/TherapistProfileEditForm.tsx
"use client";

// Therapist-editable fields only: bio, profile picture, and appearance.
// Verification status and documents stay under admin control.
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

export interface ProfileEditLabels {
  aboutYou: string;
  bioPlaceholder: string;
  changePicture: string;
  uploadPicture: string;
  removeSelected: string;
  save: string;
  saving: string;
  saved: string;
  errorSave: string;
  errorGeneric: string;
}

export interface AppearanceLabels {
  appearance: string;
  appearanceDesc: string;
  darkMode: string;
}

export default function TherapistProfileEditForm({
  initialBio,
  avatarUrl,
  initialLetter,
  labels,
  appearanceLabels,
}: {
  initialBio: string;
  avatarUrl?: string | null;
  initialLetter: string;
  labels: ProfileEditLabels;
  appearanceLabels: AppearanceLabels;
}) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState(initialBio);
  const [preview, setPreview] = useState<string | null>(avatarUrl ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setSaved(false);
  }

  function clearFile() {
    setSelectedFile(null);
    setPreview(avatarUrl ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);

    try {
      const formData = new FormData();
      formData.set("bio", bio);
      if (selectedFile) formData.set("avatar", selectedFile);

      const res = await fetch("/api/therapist/profile", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || labels.errorSave);
        return;
      }

      setSaved(true);
      setSelectedFile(null);
      router.refresh();
    } catch {
      setError(labels.errorGeneric);
    } finally {
      setSaving(false);
    }
  }

  const initial = initialLetter || "?";

  return (
    <div>
      <form onSubmit={handleSubmit} className="mt-4">
        {/* avatar */}
        <div className="flex items-center gap-5">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="h-20 w-20 rounded-full border border-blue/25 object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue/15 font-body text-2xl font-bold text-heading">
              {initial}
            </span>
          )}

          <div className="flex flex-col items-start gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-blue/30 px-4 py-2 font-body text-sm font-semibold text-heading transition hover:bg-blue/10"
            >
              {avatarUrl ? labels.changePicture : labels.uploadPicture}
            </button>
            {selectedFile && (
              <button
                type="button"
                onClick={clearFile}
                className="font-body text-xs text-text/50 underline-offset-2 hover:underline"
              >
                {labels.removeSelected}
              </button>
            )}
          </div>
        </div>

        {/* bio */}
        <label className="mt-6 block">
          <span className="font-body text-sm font-bold text-heading">
            {labels.aboutYou}
          </span>
          <textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setSaved(false);
            }}
            rows={4}
            maxLength={300}
            placeholder={labels.bioPlaceholder}
            className="mt-1.5 w-full resize-none rounded-xl border border-blue/25 bg-background px-4 py-3 font-body text-sm leading-relaxed text-text outline-none placeholder:text-text/35 focus:border-blue/60"
          />
          <span className="mt-1 block font-body text-xs text-text/40">
            {bio.length}/300
          </span>
        </label>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-blue px-6 py-2.5 font-body text-sm font-semibold text-background transition hover:bg-blue/85 disabled:opacity-50"
          >
            {saving ? labels.saving : labels.save}
          </button>
          {saved && (
            <span className="font-body text-sm font-semibold text-blue">
              {labels.saved}
            </span>
          )}
          {error && <p className="font-body text-sm text-red-500">{error}</p>}
        </div>
      </form>

      {/* ---------- appearance ---------- */}
      <div className="mt-6 rounded-2xl border border-green/20 bg-background p-6 shadow-sm">
        <p className="font-semibold text-text">{appearanceLabels.appearance}</p>
        <p className="mt-1 text-sm text-text/60">{appearanceLabels.appearanceDesc}</p>

        <button
          type="button"
          onClick={toggleTheme}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-blue/20 bg-blue/10 px-4 py-3"
        >
          <span className="text-sm font-medium text-text">{appearanceLabels.darkMode}</span>
         <span
  className={`relative h-6 w-11 rounded-full transition-colors ${
    theme === "dark" ? "bg-blue" : "bg-blue/30"
  }`}
>
  <span
    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${
      theme === "dark" ? "translate-x-5" : "translate-x-0"
    }`}
  />
</span>
        </button>
      </div>
    </div>
  );
}