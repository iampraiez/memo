"use client";
import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { Mail, ArrowRight, Github, Chrome } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { AuthPageProps } from "@/types/types";
import { handleSignIn } from "@/app/_lib/signin";
import { registerUser, userExists } from "@/lib/api";
import { useSearchParams } from "next/navigation";
// import { passwordless } from "../_lib/auth";

const AuthPage: React.FC<AuthPageProps> = (props: {
  searchParams: { callbackUrl };
  type;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const route = useRouter();
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] =
    useState(false); // Reintroducing this state

  const pathname = usePathname();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for the error query parameter on component mount
    const urlError = searchParams.get("error");
    if (urlError === "OAuthAccountNotLinked") {
      setError(
        "An account with this email already exists. Please sign in with the method you originally used."
      );
      setTimeout(() => {
        setError("");
      }, 10000);
      route.push("/auth/login");
    }

    // if status is loading make it load or whatever
    if (status === "loading") return;
    if (session && pathname !== "/mainpage" && pathname !== "/onboarding") {
      if (localStorage.getItem("register") == "onboard") {
        route.push("/onboarding");
      } else {
        route.push("/mainpage");
      }
    } else if (
      !session &&
      (pathname == "/onboarding" || pathname == "/mainpage")
    ) {
      route.push("/auth/login");
    }
  }, [session, pathname, status, searchParams]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = {
      email: email,
      password: password,
    };
    try {
      // passwordless logic
      if (props.type === "passwordless") {
        const exists = await userExists(email);
        if (!exists) {
          // set error that user already exists
          setError("User does not exists");
          setLoading(false);
          setTimeout(() => {
            setError("");
          }, 5000);
        } else {
          const lastRequest = localStorage.getItem(
            `magicLinkRequestTimestamp_${email}`
          );
          const tenMinutes = 10 * 60 * 1000;
          if (lastRequest) {
            const timeElapsed = Date.now() - parseInt(lastRequest);
            if (timeElapsed < tenMinutes) {
              const timeLeft = Math.ceil((tenMinutes - timeElapsed) / 60000);
              setError(
                `Please wait ${timeLeft} minutes before requesting another magic link.`
              );
              setLoading(false);
              setTimeout(() => {
                setError("");
              }, 5000);
              return;
            }
          }
          const res = await handleSignIn(
            "nodemailer",
            undefined,
            undefined,
            email
          );
          console.log("Email response", res);
          if (res && res.ok == false) {
            setError("Error sending email");
            setTimeout(() => {
              setError("");
            }, 5000);
            setLoading(false);
          } else {
            localStorage.setItem(
              `magicLinkRequestTimestamp_${email}`,
              Date.now().toString()
            );
            setEmailSent(true);
            setLoading(false);
          }
        }
      } else {
        // register logic
        if (props.type == "signup") {
          if (password.length < 8) {
            setError("Password must be at least 8 characters");
            setTimeout(() => {
              setError("");
            }, 5000);
            setLoading(false);
          } else {
            if (password !== confirmPassword) {
              setError("Passwords do not match");
              setTimeout(() => {
                setError("");
              }, 5000);
              setLoading(false);
            } else {
              const res = await registerUser(formData);
              if (res?.data.success == true) {
                const emailRes = await handleSignIn(
                  "nodemailer",
                  undefined,
                  undefined,
                  email
                );

                if (emailRes && emailRes.ok === false) {
                  setError("Error sending verification email.");
                  setTimeout(() => {
                    setError("");
                  }, 5000);
                } else {
                  setShowEmailVerificationMessage(true);
                  localStorage.setItem("register", "onboard");
                }
              } else if (res?.data.error) {
                setError(res.data.error || "Error registering user");
                setTimeout(() => {
                  setError("");
                }, 5000);
              }
              setLoading(false);
            }
          }
          // login logic
        } else {
          const res = await handleSignIn(
            "credentials",
            { redirectTo: props.searchParams?.callbackUrl ?? "/mainpage" },
            formData
          );
          if (res && res?.error) {
            setError("Invalid credentials");
            setTimeout(() => {
              setError("");
            }, 5000);
          } else if (res && res.url) {
            // Check if res exists and has url property
            route.push(res.url);
          } else {
            // Handle cases where res is void or has no url
            setError("An unexpected error occurred during sign-in.");
            setTimeout(() => {
              setError("");
            }, 5000);
          }
          setLoading(false);
        }
      }
    } catch (err) {
      // console.log(err);
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
  };

  if (
    (props.type === "passwordless" && emailSent) ||
    showEmailVerificationMessage
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center space-y-6" padding="lg">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-neutral-900">
              Check your email
            </h1>
            <p className="text-neutral-600">
              {props.type === "passwordless" ? (
                <>
                  We sent a magic link to{" "}
                  <span className="font-medium">{email}</span>
                </>
              ) : (
                <>
                  We sent a verification email to{" "}
                  <span className="font-medium">{email}</span>. Please click the
                  link in the email to confirm your account to continue.
                </>
              )}
            </p>
          </div>
          <div className="text-sm text-neutral-500">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => {
                setEmailSent(false); // Reset passwordless state
                setShowEmailVerificationMessage(false); // Reset signup verification state
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              try again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md space-y-6" padding="lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-white font-bold">ML</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">
            {titles[props.type]}
          </h1>
          <p className="text-neutral-600">{subtitles[props.type]}</p>
          {props.type === "passwordless" && (
            <p className="text-neutral-600 text-sm italic mt-2">
              (You're signing in, not resetting your password!)
            </p>
          )}
        </div>

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
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
            <Button
              onClick={async () => {
                setLoading(true);
                await handleSignIn("github", {
                  redirectTo: props.searchParams?.callbackUrl ?? "/mainpage",
                });
                setLoading(false);
              }}
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              <Github className="w-5 h-5 mr-2" />
              Continue with GitHub
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">or</span>
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
            placeholder="johndoe@gmail.com"
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
          {/* if trimmed error is empty, do not display, else show error */}
          {error.trim() !== "" && (
            <p className="text-destructive-500 text-sm">{error}</p>
          )}
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {props.type === "login" && "Sign in"}
            {props.type === "signup" && "Create account"}
            {props.type === "passwordless" && "Send magic link"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {/* for callback I guess */}
        </form>

        {/* Footer Links */}
        <div className="text-center text-sm">
          {props.type === "login" && (
            <div className="space-y-2">
              <div>
                <NextLink
                  className="text-primary-600 hover:text-primary-700 font-medium"
                  href={"/auth/password"}
                >
                  Forgot your password?
                </NextLink>
              </div>
              <div className="text-neutral-500">
                Don&apos;t have an account?
                <NextLink
                  className="text-primary-600 hover:text-primary-700 font-medium"
                  href={"/auth/register"}
                >
                  Sign up
                </NextLink>
              </div>
            </div>
          )}

          {props.type === "signup" && (
            <div className="text-neutral-500">
              Already have an account?{" "}
              <NextLink
                className="text-primary-600 hover:text-primary-700 font-medium"
                href={"/auth/login"}
              >
                Sign in
              </NextLink>
            </div>
          )}

          {props.type === "passwordless" && (
            <div className="text-neutral-500">
              Prefer a password?{" "}
              <NextLink
                className="text-primary-600 hover:text-primary-700 font-medium"
                href={"/auth/login"}
              >
                Sign in with password
              </NextLink>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;
