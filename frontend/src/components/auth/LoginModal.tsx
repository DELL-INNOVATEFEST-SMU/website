import React, { useState } from "react";
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
  onOpenChange: (open: boolean) => void;
}

/**
 * Login modal component with email OTP authentication
 */
export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [isResending, setIsResending] = useState(false);

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

    try {
      await login({ email });
      setShowOTPInput(true);
      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      await verifyOTP(email, otpToken);
      onOpenChange(false);
      setEmail("");
      setOtpToken("");
      setShowOTPInput(false);
      toast({
        title: "Success",
        description: "You have been logged in successfully",
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
      await resendOTP(email);
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your email",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to resend OTP",
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

  const handleClose = () => {
    onOpenChange(false);
    setEmail("");
    setOtpToken("");
    setShowOTPInput(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{showOTPInput ? "Verify Email" : "Sign In"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showOTPInput ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  disabled={loading}
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground">
                  We sent a verification code to {email}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleBackToEmail}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={handleResendOTP}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? "Resending..." : "Resend Code"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
