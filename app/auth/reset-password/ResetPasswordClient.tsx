"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Sparkle, Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "sonner";

export default function ResetPasswordClient() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      router.push("/auth/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        toast.success("Password reset successfully!");
      } else {
        toast.error(data.message || "Failed to reset password.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="from-primary-50 to-secondary-50 flex min-h-screen items-center justify-center bg-linear-to-br via-white px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <Card className="shadow-primary-900/5 space-y-8 border-neutral-100 p-12 shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-green-500 shadow-xl">
              <CheckCircle size={40} weight="bold" className="text-white" />
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-3xl font-bold text-neutral-900">
                Succesfully Reset
              </h1>
              <p className="leading-relaxed font-light text-neutral-600">
                Your password has been updated. You can now use your new credentials to enter your
                sanctuary.
              </p>
            </div>
            <Link href="/auth/login" className="block w-full">
              <Button className="bg-primary-900 h-12 w-full rounded-2xl font-bold text-white transition-all hover:bg-black">
                Go to Login
              </Button>
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
              New Password
            </h1>
            <p className="font-light text-neutral-600">Create a new key to your sanctuary</p>
          </div>
        </div>

        <Card className="shadow-primary-900/5 space-y-6 border-neutral-100 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="ml-1 text-sm font-medium text-neutral-700">New Password</label>
                <div className="group/input relative">
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="focus:ring-primary-900/10 focus:border-primary-900 w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3.5 pr-12 pl-12 text-neutral-900 transition-all placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-medium text-neutral-700">
                  Confirm Password
                </label>
                <div className="group/input relative">
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="focus:ring-primary-900/10 focus:border-primary-900 w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3.5 pr-12 pl-12 text-neutral-900 transition-all placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="bg-primary-900 h-12 w-full rounded-xl font-bold text-white transition-all hover:bg-black"
            >
              Reset Password
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
