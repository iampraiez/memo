import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function is404Error(error: unknown): boolean {
  if (!error) return false;
  
  if (error instanceof Error && error.message.includes("404")) {
    return true;
  }
  
  if (typeof error === 'object') {
    const err = error as Record<string, unknown>;
    
    if (err.status === 404) return true;
    
    if (err.response && typeof err.response === 'object') {
      const response = err.response as Record<string, unknown>;
      if (response.status === 404) return true;
    }
  }
  
  return false;
}