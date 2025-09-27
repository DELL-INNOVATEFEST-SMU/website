import { useEffect, useState, useRef } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Token Input Component for OTP
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
          ref={(el) => {
            inputs.current[index] = el;
          }}
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
 * AuthGate component that shows a one-time authentication choice
 * Users can either "Continue as guest" or "Sign in" with email
 *
 * Gate rules:
 * - Show when no choice has been made (interstellar-gate-choice not set)
 * - Hide if the user has already made a choice (guest or email)
 * - After sign out, clear the choice so the gate returns
 */
export function AuthGate() {
  const { login, verifyOTP, resendOTP, continueAsGuest, loading } =
    useAuthContext();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;
    const choice = localStorage.getItem("interstellar-gate-choice");
    setOpen(!choice);
  }, [loading]);

  const handleGuest = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await continueAsGuest();
      setOpen(false);
      toast({
        title: "Welcome, Guest!",
        description:
          "You're now exploring as a guest. Your data will be private and auto-purged later.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to continue as guest",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

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

    setIsSubmitting(true);

    try {
      await login(email);
      setShowOTPInput(true);

      toast({
        title: "Verification Code Sent",
        description: "We sent a 6-digit verification code to your email",
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
    } finally {
      setIsSubmitting(false);
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

    setIsSubmitting(true);

    try {
      await verifyOTP(email, otpToken);
      localStorage.setItem("interstellar-gate-choice", "email");
      setOpen(false);
      resetForm();

      toast({
        title: "Success!",
        description: "You have been signed in successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await resendOTP(email);

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
  };

  const resetForm = () => {
    setEmail("");
    setOtpToken("");
    setShowOTPInput(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {showOTPInput ? "Verify Your Email" : "Welcome to Interstellar"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {showOTPInput
              ? "Enter the 6-digit verification code sent to your email"
              : "Choose how you'd like to continue your journey"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!showOTPInput ? (
            <>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Continue as a guest (private, auto-purged later) or sign in to
                  save your progress.
                </p>
              </div>

              <Button
                onClick={handleGuest}
                variant="outline"
                className="w-full h-12"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Setting up guest session..."
                  : "Continue as guest"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    disabled={isSubmitting}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSubmitting) {
                        handleEmail(e);
                      }
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Sending verification code..."
                    : "Send verification code"}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  We'll only use your email to keep your data across devices.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    "We sent a 6-digit verification code to sign you in:"
                  </p>
                  <p className="font-medium text-blue-600">{email}</p>
                </div>

                <div className="space-y-2">
                  <Label className="block text-center">Verification Code</Label>
                  <TokenInput
                    value={otpToken}
                    onChange={setOtpToken}
                    disabled={isSubmitting}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  This code will expire in 10 minutes
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleBackToEmail}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Change Email
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={isSubmitting || otpToken.length !== 6}
                  className="flex-1"
                >
                  {isSubmitting ? "Verifying..." : "Sign In"}
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

              <div className="text-xs text-muted-foreground text-center border-t pt-4">
                "👋 Signing you in..."
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
