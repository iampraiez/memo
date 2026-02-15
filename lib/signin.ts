"use client";
import { signIn } from "next-auth/react";
import { AuthError } from "next-auth";

export async function handleSignIn(
  provider?: string,
  options?: { redirectTo?: string },
  formData?: { email: string; password: string },
  emailFromForm?: string,
) {
  try {
    if (provider === "nodemailer" && emailFromForm) {
      return await signIn(provider, {
        email: emailFromForm,
        redirect: false,
      });
    }

    if (emailFromForm) {
      return await signIn(provider, {
        email: emailFromForm,
        redirect: false,
      });
    }

    if (formData) {
      return await signIn(provider, {
        ...options,
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
    }

    return await signIn(
      provider,
      options || {
        email: emailFromForm,
        callbackUrl: "/timeline",
      },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw error;
  }
}
