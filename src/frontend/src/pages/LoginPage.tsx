import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Fingerprint, Loader2, MapPin, Shield } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) navigate("/", { replace: true });
  }, [identity, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 gradient-hero">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            FindIt
          </h1>
          <p className="text-muted-foreground mt-1">Lost & Found Portal</p>
        </div>

        <Card className="border border-border shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-display text-xl">
              Sign In to Continue
            </CardTitle>
            <CardDescription>
              Use Internet Identity to securely authenticate. No passwords
              needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              data-ocid="login.submit_button"
              className="w-full h-12 text-base font-semibold"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing
                  in...
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-5 w-5" /> Sign in with Internet
                  Identity
                </>
              )}
            </Button>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-0.5">
                  Secure & Private
                </p>
                <p>
                  Internet Identity provides cryptographic authentication. Your
                  identity stays on-chain.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
