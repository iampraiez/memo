"use client";
import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { EnvelopeSimple, ArrowRight, GoogleLogo } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { AuthPageProps } from "@/types/types";
import { handleSignIn } from "@/lib/signin";
import { registerUser, userExists } from "@/lib/api";
import { useSearchParams } from "next/navigation";

const AuthPage: React.FC<AuthPageProps> = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const route = useRouter();
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] =
    useState(false);

  const pathname = usePathname();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "OAuthAccountNotLinked") {
      setError(
        "An account with this email already exists. Please sign in with the method you originally used.",
      );
      setTimeout(() => setError(""), 10000);
      route.push("/auth/login");
    }

    if (status === "loading") return;

    if (session && pathname !== "/mainpage" && pathname !== "/onboarding") {
      if (localStorage.getItem("register") === "onboard") {
        route.push("/onboarding");
      } else {
        route.push("/mainpage");
      }
      localStorage.removeItem("register");
    } else if (
      !session &&
      (pathname === "/onboarding" || pathname === "/mainpage")
    ) {
      route.push("/auth/login");
    }
  }, [session, pathname, status, searchParams, route]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = { email, password };

    try {
      // Passwordless magic link
      if (props.type === "passwordless") {
        const exists = await userExists(email);
        if (!exists) {
          setError("User does not exist");
          setLoading(false);
          setTimeout(() => setError(""), 5000);
          return;
        }

        const lastRequest = localStorage.getItem(
          `magicLinkRequestTimestamp_${email}`,
        );
        const tenMinutes = 10 * 60 * 1000;

        if (lastRequest) {
          const timeElapsed = Date.now() - parseInt(lastRequest);
          if (timeElapsed < tenMinutes) {
            const timeLeft = Math.ceil((tenMinutes - timeElapsed) / 60000);
            setError(
              `Please wait ${timeLeft} minutes before requesting another magic link.`,
            );
            setLoading(false);
            setTimeout(() => setError(""), 5000);
            return;
          }
        }

        const res = await handleSignIn(
          "nodemailer",
          undefined,
          undefined,
          email,
        );

        if (res && res.ok === false) {
          setError("Error sending email");
          setTimeout(() => setError(""), 5000);
          setLoading(false);
        } else {
          localStorage.setItem(
            `magicLinkRequestTimestamp_${email}`,
            Date.now().toString(),
          );
          setEmailSent(true);
          setLoading(false);
        }
      }
      // Signup
      else if (props.type === "signup") {
        if (password.length < 8) {
          setError("Password must be at least 8 characters");
          setTimeout(() => setError(""), 5000);
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setTimeout(() => setError(""), 5000);
          setLoading(false);
          return;
        }

        const res = await registerUser(formData);
        if (res?.data.success || res?.data.requiresVerification) {
          route.push(`/auth/verify?email=${encodeURIComponent(email)}`);
        } else if (res?.data.error) {
          setError(res.data.error || "Error registering user");
          setTimeout(() => setError(""), 5000);
        }
        setLoading(false);
      }
      // Login
      else {
        const res = await handleSignIn(
          "credentials",
          { redirectTo: props.searchParams?.callbackUrl ?? "/mainpage" },
          formData,
        );

        if (res?.error) {
          if (res.error === "EMAIL_NOT_VERIFIED") {
            route.push(`/auth/verify?email=${encodeURIComponent(email)}`);
          } else {
            setError("Invalid credentials");
            setTimeout(() => setError(""), 5000);
          }
        } else if (res?.url) {
          route.push(res.url);
        } else {
          setError("An unexpected error occurred during sign-in.");
          setTimeout(() => setError(""), 5000);
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setLoading(false);
    }
  };

  const titles = {
    login: "Welcome back",
    signup: "Create your account",
    passwordless: "Sign in with email",
  };

  const subtitles = {
    login: "Sign in to your Memory Lane account",
    signup: "Start preserving your memories today",
    passwordless: "Sign in with a magic link",
  };

  // Email sent confirmation screen
  if (
    (props.type === "passwordless" && emailSent) ||
    showEmailVerificationMessage
  ) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto">
            <EnvelopeSimple className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900">
              Check your email
            </h1>
            <p className="text-neutral-600 text-sm">
              {props.type === "passwordless" ? (
                <>
                  We sent a magic link to{" "}
                  <span className="font-medium">{email}</span>
                </>
              ) : (
                <>
                  We sent a verification email to{" "}
                  <span className="font-medium">{email}</span>. Please click the
                  link to confirm your account.
                </>
              )}
            </p>
          </div>
          <div className="text-sm text-neutral-500">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={() => {
                setEmailSent(false);
                setShowEmailVerificationMessage(false);
              }}
              className="text-neutral-900 hover:underline font-medium"
            >
              try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main auth form
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mx-auto">
            <button onClick={() => route.push("/")}>
              <span className="text-white font-bold text-sm">ML</span>
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {titles[props.type]}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              {subtitles[props.type]}
            </p>
          </div>
        </div>

        {/* OAuth Buttons */}
        {props.type !== "passwordless" && (
          <div className="space-y-3">
            <Button
              onClick={async () => {
                setLoading(true);
                await handleSignIn("google", {
                  redirectTo: props.searchParams?.callbackUrl ?? "/mainpage",
                });
                setLoading(false);
              }}
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              <GoogleLogo className="w-5 h-5 mr-2" weight="bold" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-neutral-400 uppercase tracking-wider">
                  or
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          {props.type !== "passwordless" && (
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          )}

          {props.type === "signup" && (
            <Input
              type="password"
              label="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {props.type === "login" && "Sign in"}
            {props.type === "signup" && "Create account"}
            {props.type === "passwordless" && "Send magic link"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Footer Links */}
        <div className="text-center text-sm space-y-3">
          {props.type === "login" && (
            <>
              <div>
                <NextLink
                  className="text-neutral-600 hover:text-neutral-900 font-medium"
                  href="/auth/password"
                >
                  Forgot your password?
                </NextLink>
              </div>
              <div className="text-neutral-500">
                Don't have an account?{" "}
                <NextLink
                  className="text-neutral-900 hover:underline font-medium"
                  href="/auth/register"
                >
                  Sign up
                </NextLink>
              </div>
            </>
          )}

          {props.type === "signup" && (
            <div className="text-neutral-500">
              Already have an account?{" "}
              <NextLink
                className="text-neutral-900 hover:underline font-medium"
                href="/auth/login"
              >
                Sign in
              </NextLink>
            </div>
          )}

          {props.type === "passwordless" && (
            <div className="text-neutral-500">
              Prefer a password?{" "}
              <NextLink
                className="text-neutral-900 hover:underline font-medium"
                href="/auth/login"
              >
                Sign in with password
              </NextLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
