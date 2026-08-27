import PlantBlob from "@/components/shared/PlantBlobAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#809660] p-6">
      <div className="relative flex w-full max-w-4xl overflow-hidden rounded-[2rem] bg-[rgb(var(--color-green))] shadow-xl min-h-[600px]">
        <div className="relative hidden w-1/2 md:block">
          <PlantBlob />
          <div className="absolute top-8 left-8 z-10 text-sm font-medium text-[rgb(var(--color-heading))]">
            Calmly
          </div>
          <div className="absolute bottom-8 left-8 z-10 text-xs text-[rgb(var(--color-text))]">
            grow a little, every day
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-[rgb(var(--color-background))] px-8 py-12 md:w-1/2">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}