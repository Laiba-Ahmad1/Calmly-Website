// src/components/shared/LoadingScreen.tsx
export default function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-green/20 border-t-green" />
      <p className="font-body text-sm text-text/50">Loading...</p>
    </div>
  );
}