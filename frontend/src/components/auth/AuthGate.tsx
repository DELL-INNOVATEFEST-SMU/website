import { useEffect, useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/**
 * AuthGate component that shows a one-time authentication choice
 * Users can either "Continue as guest" or "Sign in" with email
 *
 * Gate rules:
 * - Show when no session exists and interstellar-gate-choice not set
 * - Hide if a session exists (anon or logged-in) OR if the user just chose an option
 * - After sign out, clear the choice so the gate returns
 */
export function AuthGate() {
  const { session, signInWithEmail, continueAsGuest, loading } =
    useAuthContext();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;
    const choice = localStorage.getItem("interstellar-gate-choice");
    setOpen(!session && !choice);
  }, [session, loading]);

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
      await signInWithEmail(email);
      localStorage.setItem("interstellar-gate-choice", "email");
      setOpen(false);
      toast({
        title: "Magic Link Sent!",
        description: "Check your email for a magic link to complete sign in.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send magic link",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Welcome to Interstellar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
            {isSubmitting ? "Setting up guest session..." : "Continue as guest"}
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
              {isSubmitting ? "Sending magic link..." : "Send magic link"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              We'll only use your email to keep your data across devices.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
