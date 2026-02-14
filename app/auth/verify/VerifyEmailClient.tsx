"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { EnvelopeSimple, ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { toast } from "sonner";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState<string[]>(Array(8).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Security: Redirect if no email is provided
    if (!email) {
      router.push("/auth/login");
      return;
    }
    const firstInput = document.getElementById("code-0");
    if (firstInput) firstInput.focus();
  }, [email, router]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 7) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{8}$/.test(pastedData)) {
      toast.error("Please paste an 8-digit numeric code");
      return;
    }

    const newCode = pastedData.split("");
    setCode(newCode);
    
    // Focus the last input
    const lastInput = document.getElementById("code-7");
    if (lastInput) lastInput.focus();
    
    // Auto-verify if 8 digits are pasted
    toast.success("Code pasted!");
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 8) {
      toast.error("Please enter the complete 8-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success("Email verified!");
        setTimeout(() => router.push("/auth/login?verified=true"), 2000);
      } else {
        toast.error("Verification failed. Please check the code.");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center space-y-3 mb-8">
          <div className="w-12 h-12 bg-primary-900 rounded-xl flex items-center justify-center mx-auto shadow-lg">
            {success ? (
              <CheckCircle
                size={24}
                weight="fill"
                className="text-secondary-400"
              />
            ) : (
              <EnvelopeSimple size={24} className="text-secondary-400" />
            )}
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">
            {success ? "Email Verified!" : "Verify Your Email"}
          </h1>
          <p className="text-sm text-neutral-600">
            {success
              ? "Redirecting you to login..."
              : `Enter the 8-digit code sent to ${email}`}
          </p>
        </div>

        {!success && (
          <Card className="p-6 space-y-6 shadow-2xl shadow-primary-900/5 border-neutral-100">
            <div className="flex gap-1.5 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-9 h-11 text-center text-lg font-bold bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900/10 focus:border-primary-900 transition-all"
                />
              ))}
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleVerify}
                loading={isVerifying}
                disabled={code.join("").length !== 8}
                className="w-full h-11 rounded-xl bg-primary-900 text-white font-bold"
              >
                Verify Email
              </Button>
              <Link
                href="/auth/login"
                className="flex items-center justify-center text-[10px] text-neutral-500 hover:text-neutral-900 transition-colors font-bold uppercase tracking-widest"
              >
                <ArrowLeft size={14} className="mr-1" />
                Back to Login
              </Link>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
