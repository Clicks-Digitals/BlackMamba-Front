"use client";
import { useState } from "react";
import { ForgotPasswordView,VerifyOtpView,ResetPasswordView} from "@/features/auth";

export function ResetPasswordFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  if (step === 1) {
    return (
      <ForgotPasswordView 
        onSuccess={(emailSubmitted) => {
          setEmail(emailSubmitted);
          setStep(2);
        }} 
      />
    );
  }

  if (step === 2) {
    return (
      <VerifyOtpView 
        email={email}
        onSuccess={(codeSubmitted) => {
          setOtpCode(codeSubmitted);
          setStep(3);
        }} 
      />
    );
  }

  return (
    <ResetPasswordView 
      email={email}
      otpCode={otpCode}
    />
  );
}
