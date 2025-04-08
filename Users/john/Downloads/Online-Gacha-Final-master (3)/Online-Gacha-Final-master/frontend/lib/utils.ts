import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasApplePay(): boolean {
  return typeof window !== "undefined" && window.ApplePaySession !== undefined;
}
