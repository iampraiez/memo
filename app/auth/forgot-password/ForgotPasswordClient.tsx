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
     toast.info(
       "If an account with that email exists, a magic link will be sent.",
     );
      const res = await handleSignIn("nodemailer", undefined, undefined, email);
      if (res?.ok) {
        setEmailSent(true);
        toast.success("Magic link sent!");
      } else {
        toast.error("Failed to send magic link.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <Card className="p-12 space-y-8 shadow-2xl shadow-primary-900/5 border-neutral-100">
            <div className="w-20 h-20 bg-primary-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
              <EnvelopeSimple
                size={40}
                weight="bold"
                className="text-secondary-400"
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-display font-bold text-neutral-900">
                Check Your Email
              </h1>
              <p className="text-neutral-600 leading-relaxed font-light">
                We've sent a magic recovery link to{" "}
                <span className="text-primary-900 font-bold">{email}</span>.
                Click the link to regain access to your sanctuary.
              </p>
            </div>
            <Button
              variant="secondary"
              className="w-full rounded-2xl font-bold h-12"
              onClick={() => setEmailSent(false)}
            >
              Request Another Link
            </Button>
            <Link
              href="/login"
              className="flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors text-xs font-bold uppercase tracking-widest"
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
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 bg-primary-900 rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-secondary-400/40 font-serif font-bold text-xl">
                M
              </span>
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold text-neutral-900 tracking-tight">
              Restore Access
            </h1>
            <p className="text-neutral-600 font-light">
              Securely recover your legacy sanctuary
            </p>
          </div>
        </div>

        <Card className="p-8 space-y-6 shadow-2xl shadow-primary-900/5 border-neutral-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 ml-1">
                Archive Email
              </label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <EnvelopeSimple size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recovery@legacy.com"
                  autoComplete="email"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3.5 pl-12 pr-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-900/10 focus:border-primary-900 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 rounded-xl bg-primary-900 text-white font-bold hover:bg-black transition-all"
            >
              Send Magic Link
              <Sparkle size={18} className="ml-2" />
            </Button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors text-xs font-bold uppercase tracking-widest text-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Sanctuary Entry
          </Link>
        </Card>
      </div>
    </div>
  );
}
