"use client";
import React, { useState, useEffect } from "react";
import { X, Warning, Spinner, CheckCircle } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
}: DeleteAccountModalProps) {
  const [step, setStep] = useState<"confirm" | "otp">("confirm");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (isOpen) {
      setStep("confirm");
      setOtp("");
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === "otp" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/delete/otp", { method: "POST" });
      if (!res.ok) throw new Error("Failed to send OTP");
      
      setStep("otp");
      setTimeLeft(300);
      toast.success(`Verification code sent to ${userEmail}`);
    } catch (error) {
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndDelete = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/delete/confirm", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Deletion failed");
      }

      toast.success("Account deleted successfully");
      signOut({ callbackUrl: "/" });
    } catch (error: any) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-destructive-50">
          <h3 className="text-lg font-bold text-destructive-900 flex items-center">
            <Warning className="w-5 h-5 mr-2" />
            Delete Account
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "confirm" ? (
            <div className="space-y-4">
              <p className="text-neutral-600">
                Are you sure you want to delete your account? This action is{" "}
                <strong>irreversible</strong>.
              </p>
              <ul className="text-sm text-neutral-500 list-disc list-inside space-y-1 bg-neutral-50 p-4 rounded-lg">
                <li>All your memories will be permanently deleted.</li>
                <li>You will be unsubscribed from all emails.</li>
                <li>Your username will be released.</li>
              </ul>
              <div className="pt-2">
                <Button
                  variant="destructive"
                  className="w-full justify-center"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner className="animate-spin w-5 h-5" /> : "Send Verification Code"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="text-center">
                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                       <CheckCircle className="w-6 h-6 text-blue-600" />
                   </div>
                   <h4 className="font-bold text-neutral-900">Enter Verification Code</h4>
                   <p className="text-sm text-neutral-500 mt-1">
                       We sent a 6-digit code to <strong>{userEmail}</strong>
                   </p>
               </div>

              <div>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                  autoFocus
                />
                <div className="flex justify-between items-center mt-2 text-xs text-neutral-400">
                    <span>Code expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                    {timeLeft === 0 && (
                        <button onClick={handleSendOTP} className="text-primary-600 hover:underline">Resend Code</button>
                    )}
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  variant="destructive"
                  className="w-full justify-center"
                  onClick={handleVerifyAndDelete}
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? <Spinner className="animate-spin w-5 h-5" /> : "Confirm Deletion"}
                </Button>
                <button 
                    onClick={() => setStep("confirm")}
                    className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700"
                >
                    Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
