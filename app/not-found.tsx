import Link from "next/link";
import { ArrowLeft, House } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Graphic */}
        <div className="relative mx-auto w-48 h-48">
          <div className="absolute inset-0 bg-primary-100/50 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-white rounded-[2rem] shadow-xl p-8 border border-neutral-100 rotate-6 hover:rotate-0 transition-transform duration-500">
            <span className="text-8xl font-display font-bold bg-gradient-to-br from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              404
            </span>
          </div>
          <div className="absolute -bottom-4 -right-4 bg-secondary-400 text-primary-900 rounded-xl p-3 shadow-lg -rotate-12">
            <span className="text-2xl">🤔</span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            Page Not Found
          </h1>
          <p className="text-neutral-500 text-lg leading-relaxed">
            The memory you are looking for seems to have faded away or never existed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/timeline" className="w-full sm:w-auto">
            <Button size="lg" className="w-full rounded-full shadow-lg shadow-primary-900/10">
              <House className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
          <Link href="javascript:history.back()" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
