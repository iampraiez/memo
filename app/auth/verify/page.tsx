"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { EnvelopeSimple, ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const VerifyEmailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState<string[]>(Array(8).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auto-focus first input on mount
  useEffect(() => {
    const firstInput = document.getElementById("code-0");
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last digit
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 7) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 8);
    const newCode = pastedData.split("").concat(Array(8).fill("")).slice(0, 8);
    setCode(newCode);

    // Focus the last filled input
    const lastIndex = Math.min(pastedData.length, 7);
    const lastInput = document.getElementById(`code-${lastIndex}`);
    if (lastInput) {
      lastInput.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 8) {
      setError("Please enter the complete 8-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login?verified=true");
        }, 2000);
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendCooldown(60); // 1 minute cooldown
        setCode(Array(8).fill(""));
        // Focus first input
        const firstInput = document.getElementById("code-0");
        if (firstInput) {
          firstInput.focus();
        }
      } else {
        setError(data.message || "Failed to resend code");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <p className="text-neutral-600">
            No email provided. Please register first.
          </p>
          <Button
            onClick={() => router.push("/auth/register")}
            className="mt-4"
          >
            Go to Register
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto"
            >
              {success ? (
                <CheckCircle className="w-8 h-8 text-white" weight="fill" />
              ) : (
                <EnvelopeSimple className="w-8 h-8 text-white" />
              )}
            </motion.div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {success ? "Email Verified!" : "Verify Your Email"}
            </h1>
            <p className="text-neutral-600">
              {success
                ? "Redirecting you to login..."
                : `We sent a verification code to ${email}`}
            </p>
          </div>

          {!success && (
            <>
              {/* Code Input */}
              <div className="space-y-4">
                <div
                  className="flex gap-2 justify-center"
                  onPaste={handlePaste}
                >
                  {code.map((digit, index) => (
                    <motion.input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-600 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleVerify}
                  loading={isVerifying}
                  disabled={code.join("").length !== 8 || isVerifying}
                  className="w-full"
                >
                  Verify Email
                </Button>

                <div className="text-center text-sm">
                  <span className="text-neutral-600">
                    Didn't receive the code?{" "}
                  </span>
                  <button
                    onClick={handleResend}
                    disabled={isResending || resendCooldown > 0}
                    className="text-primary-600 font-medium hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending
                      ? "Sending..."
                      : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend code"}
                  </button>
                </div>
              </div>

              {/* Back to Login */}
              <button
                onClick={() => router.push("/auth/login")}
                className="flex items-center justify-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
            </>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-green-600 font-medium">
                Your email has been successfully verified!
              </p>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
