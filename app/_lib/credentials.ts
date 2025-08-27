"use server";
import { redirect } from "next/navigation";
import { signIn } from "./auth";
import { AuthError } from "next-auth";

const SIGNIN_ERROR_URL = "/error";

export async function handleSignIn(
  provider: string,
  formData?: { email: string; password: string }
) {
  try {
    return await signIn(provider, formData);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`);
    }
    throw error;
  }
}
