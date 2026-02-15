"use client";
import React, { useState } from "react";
import Link from "next/link";
import { EnvelopeSimple, ArrowLeft, Sparkle } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { handleSignIn } from "@/lib/signin";
import { toast } from "sonner";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      toast.info("If an account with that email exists, a magic link will be sent.");
      const res = await handleSignIn("nodemailer", undefined, undefined, email);
      if (res?.ok) {
        setEmailSent(true);
        toast.success("Magic link sent!");
      } else {
        toast.error("Failed to send magic link.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="from-primary-50 to-secondary-50 flex min-h-screen items-center justify-center bg-linear-to-br via-white px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <Card className="shadow-primary-900/5 space-y-8 border-neutral-100 p-12 shadow-2xl">
            <div className="bg-primary-900 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl">
              <EnvelopeSimple size={40} weight="bold" className="text-secondary-400" />
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-3xl font-bold text-neutral-900">Check Your Email</h1>
              <p className="leading-relaxed font-light text-neutral-600">
                We've sent a magic recovery link to{" "}
                <span className="text-primary-900 font-bold">{email}</span>. Click the link to
                regain access to your sanctuary.
              </p>
            </div>
            <Button
              variant="secondary"
              className="h-12 w-full rounded-2xl font-bold"
              onClick={() => setEmailSent(false)}
            >
              Request Another Link
            </Button>
            <Link
              href="/login"
              className="flex items-center justify-center text-xs font-bold tracking-widest text-neutral-500 uppercase transition-colors hover:text-neutral-900"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Login
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="from-primary-50 to-secondary-50 flex min-h-screen items-center justify-center bg-linear-to-br via-white px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <Link href="/" className="inline-block">
            <div className="bg-primary-900 mx-auto flex h-12 w-12 items-center justify-center rounded-xl shadow-lg">
              <span className="font-serif text-xl font-bold text-white">M</span>
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900">
              Restore Access
            </h1>
            <p className="font-light text-neutral-600">Securely recover your legacy sanctuary</p>
          </div>
        </div>

        <Card className="shadow-primary-900/5 space-y-6 border-neutral-100 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-neutral-700">Archive Email</label>
              <div className="group/input relative">
                <div className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-400">
                  <EnvelopeSimple size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recovery@legacy.com"
                  autoComplete="email"
                  className="focus:ring-primary-900/10 focus:border-primary-900 w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3.5 pr-4 pl-12 text-neutral-900 transition-all placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="bg-primary-900 h-12 w-full rounded-xl font-bold text-white transition-all hover:bg-black"
            >
              Send Magic Link
              <Sparkle size={18} className="ml-2" />
            </Button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center text-center text-xs font-bold tracking-widest text-neutral-500 uppercase transition-colors hover:text-neutral-900"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Sanctuary Entry
          </Link>
        </Card>
      </div>
    </div>
  );
}
