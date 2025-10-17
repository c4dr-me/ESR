import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Provider = {
  name: string;
  address: string;
};
export const TEST_PROVIDERS: Provider[] = [
  { name: "Gmail 001", address: "testwith001@gmail.com" },
  { name: "Gmail 002", address: "testwith002@gmail.com" },
  { name: "Gmail 003", address: "testwith003@gmail.com" },
  { name: "Gmail 004", address: "testwith004@gmail.com" },
  { name: "Outlook 001", address: "testwith001@outlook.com" },
];

export const ALL_PROVIDER_EMAILS = TEST_PROVIDERS.map((p) => p.address);

export const Test_providers = TEST_PROVIDERS;
