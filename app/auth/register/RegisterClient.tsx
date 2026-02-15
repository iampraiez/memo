"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnvelopeSimple, Lock, GoogleLogo, ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { apiService } from "@/services/api.service";
import { toast } from "sonner";

export default function RegisterClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

      // Handle existing but unverified user (returns 200 OK with requiresVerification)
      if (res.status === 200 && res.data.requiresVerification) {
        toast.info(res.data.message || "Email not verified. A new code has been sent.");
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      }
      // Handle new user registration (returns 201 Created)
      else if (res.status === 201 || res.data.success) {
        toast.success("Account created successfully! Please verify your email.");
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(
          res.data.message ||
            res.data.error ||
            "Registration failed. This email might already be in use.",
        );
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoadingGoogle(true);
    window.location.href = "/api/auth/google/login";
  };

  return (
    <div className="from-primary-50 to-secondary-50 flex min-h-screen items-center justify-center bg-linear-to-br via-white px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <Link href="/" className="inline-block">
            <div className="bg-primary-900 mx-auto flex h-12 w-12 items-center justify-center rounded-xl shadow-lg">
              <span className="font-serif text-xl font-bold text-white">M</span>
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-neutral-900">Create Account</h1>
          <p className="text-neutral-600">Start preserving your memories today</p>
        </div>

        <Card className="space-y-6 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Email</label>
              <div className="relative">
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400">
                  <EnvelopeSimple size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="focus:ring-primary-500 w-full rounded-lg border border-neutral-200 py-3 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Password</label>
              <div className="relative">
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className="focus:ring-primary-500 w-full rounded-lg border border-neutral-200 py-3 pr-12 pl-10 transition-all focus:border-transparent focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Confirm Password</label>
              <div className="relative">
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="focus:ring-primary-500 w-full rounded-lg border border-neutral-200 py-3 pr-12 pl-10 transition-all focus:border-transparent focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="bg-primary-900 group mt-6 w-full font-bold text-white transition-all hover:bg-black"
            >
              Create Account
              <ArrowRight
                weight="duotone"
                size={20}
                className="ml-2 transition-transform group-hover:translate-x-1"
              />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-neutral-500">Or continue with</span>
            </div>
          </div>

          <Button
            variant="secondary"
            loading={loadingGoogle}
            onClick={handleGoogleSignIn}
            className="h-12 w-full space-x-3"
          >
            <GoogleLogo size={20} weight="bold" className="text-neutral-700" />
            <span className="font-medium text-neutral-700">Google</span>
          </Button>
        </Card>

        <p className="text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
