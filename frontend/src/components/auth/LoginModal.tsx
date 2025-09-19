import React, { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

// Token Input Component for better UX
const TokenInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  length?: number;
}> = ({ value, onChange, disabled = false, length = 6 }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // Only digits

    const newValue = value.split("");
    newValue[index] = val;
    const result = newValue.join("").slice(0, length);
    onChange(result);

    // Auto-focus next input
    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData?.getData("text") || "";
    const digits = paste.replace(/\D/g, "").slice(0, length);
    if (digits.length > 0) {
      onChange(digits);
      // Focus the next empty input or the last one
      const nextIndex = Math.min(digits.length, length - 1);
      inputs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      ))}
    </div>
  );
};

/**
 * Enhanced Login modal component with token-based OTP authentication and smart detection
 */
export function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const { login, verifyOTP, resendOTP, loading } = useAuthContext();
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await login(email);
      setIsNewUser(result.isNewUser);
      setShowOTPInput(true);

      toast({
        title: result.isNewUser ? "Welcome!" : "Welcome back!",
        description: result.isNewUser
          ? "We sent a 6-digit verification code to your email to complete your signup"
          : "We sent a 6-digit verification code to your email to sign you in",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send verification code",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async () => {
    if (otpToken.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      await verifyOTP(email, otpToken);
      onClose();
      resetForm();

      toast({
        title: "Success!",
        description: isNewUser
          ? "Account created successfully! Welcome to our platform."
          : "You have been signed in successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      });
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const result = await resendOTP(email);
      setIsNewUser(result.isNewUser);

      toast({
        title: "Code Resent",
        description:
          "A new 6-digit verification code has been sent to your email",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToEmail = () => {
    setShowOTPInput(false);
    setOtpToken("");
    setIsNewUser(false);
  };

  const resetForm = () => {
    setEmail("");
    setOtpToken("");
    setShowOTPInput(false);
    setIsNewUser(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showOTPInput
              ? isNewUser
                ? "Complete Your Signup"
                : "Verify Your Email"
              : "Sign In / Sign Up"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showOTPInput ? (
            <>
              <div className="text-sm text-gray-600 mb-4">
                Enter your email address and we'll send you a verification code
                to sign in or create your account.
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      handleSendOTP();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Launch Code"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    {isNewUser
                      ? "We sent a 6-digit code to complete initiation:"
                      : "We sent a 6-digit code to your email:"}
                  </div>
                  <div className="font-medium text-blue-600">{email}</div>
                </div>

                <div className="space-y-2">
                  <Label className="block text-center">Verification Code</Label>
                  <TokenInput
                    value={otpToken}
                    onChange={setOtpToken}
                    disabled={loading}
                  />
                </div>

                <div className="text-xs text-gray-500 text-center">
                  T-10 minutes to launch! (This code will expire in 10 minutes.)
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleBackToEmail}
                  disabled={loading}
                  className="flex-1"
                >
                  Change Email
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otpToken.length !== 6}
                  className="flex-1"
                >
                  {loading
                    ? "Verifying..."
                    : isNewUser
                    ? "Initiate Launch!"
                    : "Launch!"}
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={handleResendOTP}
                disabled={isResending}
                className="w-full text-sm"
              >
                {isResending
                  ? "Resending..."
                  : "Didn't receive the code? Resend"}
              </Button>
            </>
          )}
        </div>

        {showOTPInput && (
          <div className="text-xs text-gray-500 text-center mt-4 border-t pt-4">
            {isNewUser
              ? "🎉 Creating your new account..."
              : "👋 Welcome back! Signing you in..."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
