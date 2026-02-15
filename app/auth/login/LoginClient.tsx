"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { EnvelopeSimple, Lock, GoogleLogo, ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "sonner";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const googleToken = searchParams.get("google_token");
    if (googleToken) {
      handleFinalizeGoogleLogin(googleToken);
    }

    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully! You can now sign in.");
      // Clear the session storage or URL to avoid showing the toast twice if needed
      // router.replace("/auth/login", { scroll: false });
    }
  }, [searchParams]);

  const handleFinalizeGoogleLogin = async (token: string) => {
    setLoadingGoogle(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        token,
        type: "google-token",
      });

      if (res?.error) {
        toast.error("Google authentication failed.");
        router.replace("/auth/login");
      } else {
        router.push("/timeline");
      }
    } catch {
      toast.error("An error occurred during Google Sign-In.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error || res?.code) {
        const errorCode = res.code || res.error;

        // Handle specific error cases
        if (errorCode === "EMAIL_NOT_VERIFIED") {
          toast.info("Email not verified. Resending verification code...");

          try {
            await fetch("/api/auth/resend-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
          } catch {
            toast.error("Failed to resend code. Please try again from the verification page.");
            router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
          }
          return;
        }

        const errorMap: Record<string, string> = {
          INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
          CredentialsSignin: "Invalid credentials. Please try again.",
          OAuthAccountNotLinked:
            "An account with this email already exists. Please sign in with your original method.",
          GOOGLE_AUTH_FAILED: "Google authentication failed. Please try again.",
          Configuration: "Invalid credentials. Please try again.",
        };

        toast.error(errorMap[errorCode as string] || "An error occurred during sign-in.");
      } else {
        // Check if user needs onboarding
        const { getSession } = await import("next-auth/react");
        const currentSession = await getSession();
        if (currentSession && !currentSession.user?.username) {
          router.push("/onboarding");
        } else {
          router.push("/timeline");
        }
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
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
          <h1 className="font-display text-3xl font-bold text-neutral-900">Welcome Back</h1>
          <p className="text-neutral-600">Sign in to continue your journey</p>
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="bg-primary-900 group mt-6 w-full font-bold text-white transition-all hover:bg-black"
            >
              Sign In
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
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
