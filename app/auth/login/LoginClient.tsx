"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { EnvelopeSimple, Lock, GoogleLogo, ArrowRight } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { toast } from "sonner";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    } catch (err) {
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
          } catch (resendError) {
            toast.error("Failed to resend code. Please try again from the verification page.");
            router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
          }
          return;
        }

        const errorMap: Record<string, string> = {
          "INVALID_CREDENTIALS": "Invalid email or password. Please try again.",
          "CredentialsSignin": "Invalid credentials. Please try again.",
          "OAuthAccountNotLinked": "An account with this email already exists. Please sign in with your original method.",
          "GOOGLE_AUTH_FAILED": "Google authentication failed. Please try again.",
          "Configuration": "Invalid credentials. Please try again.",
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
    } catch (err) {
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
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 bg-linear-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white font-serif font-bold text-xl">M</span>
            </div>
          </Link>
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            Welcome Back
          </h1>
          <p className="text-neutral-600">Sign in to continue your journey</p>
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
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  id="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              Sign In
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
