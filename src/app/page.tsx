// Landing page — redirect to /login or /home depending on auth state
import Button from "@/components/shared/Button";
import Link from "next/link";
export default function LandingPage() {
  return (
    <main className="flex flex-col  min-h-screen items-center justify-center gap-10 overflow-hidden bg-green p-6">
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
      
      <div className="flex flex-col justify-center items-center  text-heading/70 text-[200px] "> <div className="font-heading font-bold text-background/50 text-[20px] ">welcome to</div><div className="font-logo -m-[30px]">Calmly</div> <div className=" font-heading font-bold text-background/50 text-[20px] ">a mental wellnes companion</div></div>
      
      <div className="flex"><Button fillColor="rgb(var(--color-background))" className="text-green"><Link  href="/signup">Signup</Link></Button>
      <Button fillColor="rgb(var(--color-background))" className="text-green"><Link  href="/login">Login</Link></Button></div>
    </main>
  );
}