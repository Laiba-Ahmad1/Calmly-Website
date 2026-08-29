// import PlantBlob from "@/components/shared/PlantBlobAuth";

// export default function AuthLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#809660] p-6">
//       <div className="relative flex w-full max-w-4xl overflow-hidden rounded-[2rem] bg-[rgb(var(--color-green))] shadow-xl min-h-[600px]">
//         <div className="relative hidden w-1/2 md:block">
//           <PlantBlob />
//           <div className="absolute top-8 left-8 z-10 text-sm font-medium text-[rgb(var(--color-heading))]">
//             Calmly
//           </div>
//           <div className="absolute bottom-8 left-8 z-10 text-xs text-[rgb(var(--color-text))]">
//             grow a little, every day
//           </div>
//         </div>

//         <div className="flex w-full items-center justify-center bg-[rgb(var(--color-background))] px-8 py-12 md:w-1/2">
//           <div className="w-full max-w-sm">{children}</div>
//         </div>
//       </div>
//     </div>
//   );
// }

import PlantBlob from "@/components/shared/PlantBlobAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-authbg p-6">
      {/* ---- decorative blobby bubbles, scattered around the card ---- */}
      <div
        className="pointer-events-none absolute -top-16 -left-16 h-72 w-72 bg-white/10"
        style={{ borderRadius: "63% 37% 30% 70% / 50% 45% 55% 50%" }}
      />
      <div
        className="pointer-events-none absolute top-1/4 -right-10 h-40 w-40 bg-white/10"
        style={{ borderRadius: "42% 58% 65% 35% / 40% 62% 38% 60%" }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-24 h-96 w-96 bg-white/10"
        style={{ borderRadius: "55% 45% 38% 62% / 60% 40% 60% 40%" }}
      />
      <div
        className="pointer-events-none absolute bottom-10 left-4 h-24 w-24 bg-white/10"
        style={{ borderRadius: "70% 30% 45% 55% / 45% 55% 45% 55%" }}
      />
      <div
        className="pointer-events-none absolute top-8 left-1/3 h-16 w-16 bg-white/10"
        style={{ borderRadius: "48% 52% 60% 40% / 55% 40% 60% 45%" }}
      />
      <div
        className="pointer-events-none absolute bottom-1/3 -left-8 h-32 w-32 bg-white/10"
        style={{ borderRadius: "60% 40% 50% 50% / 35% 65% 35% 65%" }}
      />

      <div className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-[2rem] bg-canvas shadow-xl min-h-[600px]">
        <div className="relative hidden w-1/2 md:block">
          <PlantBlob />
          <div className="absolute top-8 left-8 z-10 text-sm font-logo text-xl text-heading">
            Calmly
          </div>
          <div className="absolute bottom-8 left-8 z-10 text-xs text-text">
            grow a little, every day
          </div>
        </div>

        <div className="flex w-full items-center justify-center border-l border-dashed  border-background bg-canvas px-8 py-12 md:w-1/2">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}