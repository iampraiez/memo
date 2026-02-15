"use client";
import { ArrowLeft, House } from "lucide-react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="animate-fade-in w-full max-w-md space-y-8 text-center">
        {/* Graphic */}
        <div className="relative mx-auto h-48 w-48">
          <div className="bg-primary-100/50 absolute inset-0 animate-pulse rounded-full blur-3xl" />
          <div className="relative rotate-6 rounded-[2rem] border border-neutral-100 bg-white p-8 shadow-xl transition-transform duration-500 hover:rotate-0">
            <span className="font-display from-primary-600 to-secondary-600 bg-gradient-to-br bg-clip-text text-8xl font-bold text-transparent">
              404
            </span>
          </div>
          <div className="bg-secondary-400 text-primary-900 absolute -right-4 -bottom-4 -rotate-12 rounded-xl p-3 shadow-lg">
            <span className="text-2xl">🤔</span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h1 className="font-display text-3xl font-bold text-neutral-900">Page Not Found</h1>
          <p className="text-lg leading-relaxed text-neutral-500">
            The memory you are looking for seems to have faded away or never existed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button
            size="lg"
            onClick={() => router.push("/timeline")}
            className="shadow-primary-900/10 w-full rounded-full shadow-lg sm:w-auto"
          >
            <House className="mr-2 h-4 w-4" />
            Return Home
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => router.back()}
            className="w-full rounded-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
