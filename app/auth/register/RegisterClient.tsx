"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnvelopeSimple, Lock, GoogleLogo, ArrowRight } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { apiService } from "@/services/api.service";
import { toast } from "sonner";

export default function RegisterClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await apiService.registerUser({ email, password });
      if (res?.data.success || res?.data.requiresVerification) {
        toast.success("Account created successfully!");
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(res?.data.error || "Registration failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoadingGoogle(true);
    window.location.href = "/api/auth/google/login";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 bg-linear-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white font-serif font-bold text-xl">M</span>
            </div>
          </Link>
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            Create Account
          </h1>
          <p className="text-neutral-600">
            Start preserving your memories today
          </p>
        </div>

        <Card className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <EnvelopeSimple size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  id="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full mt-6 bg-primary-800 text-white hover:bg-primary-900"
            >
              Create Account
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-500">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            loading={loadingGoogle}
            onClick={handleGoogleSignIn}
            className="w-full h-12 space-x-3"
          >
            <GoogleLogo size={20} weight="bold" className="text-neutral-700" />
            <span className="font-medium text-neutral-700">Google</span>
          </Button>
        </Card>

        <p className="text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
