import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const formatE164Phone = (phone, defaultCountryCode = "+91") => {
  if (!phone) return "";
  let cleaned = String(phone).replace(/[\s\-\(\)]/g, "").trim();
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("0")) cleaned = cleaned.slice(1);
  return `${defaultCountryCode}${cleaned}`;
};

export const maskPhoneNumber = (phone) => {
  if (!phone) return "";
  const cleaned = String(phone).trim();
  if (cleaned.length < 4) return cleaned;
  const last4 = cleaned.slice(-4);
  const prefix = cleaned.startsWith("+") ? cleaned.slice(0, 3) : "+91";
  return `${prefix} ******${last4}`;
};

export const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (typeof window === "undefined") return null;

  try {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Recaptcha container #${containerId} not found in DOM`);
      return null;
    }

    container.innerHTML = "";

    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) {}
          window.recaptchaVerifier = null;
        }
      }
    });

    return window.recaptchaVerifier;
  } catch (error) {
    console.error("Error setting up RecaptchaVerifier:", error);
    throw error;
  }
};

export const requestPhoneOtp = async (phone, containerId = "recaptcha-container") => {
  const formatted = formatE164Phone(phone);
  if (!formatted || formatted.length < 10) {
    throw new Error("Please enter a valid phone number.");
  }

  const verifier = setupRecaptcha(containerId);
  if (!verifier) {
    throw new Error("Verification container is not ready. Please try again.");
  }

  const confirmation = await signInWithPhoneNumber(auth, formatted, verifier);
  return { confirmation, formattedPhone: formatted };
};

export const verifyPhoneOtp = async (confirmationResult, code) => {
  if (!confirmationResult || !confirmationResult.confirm) {
    throw new Error("No active OTP session. Please request a new OTP.");
  }
  const cleanCode = String(code).trim();
  if (!cleanCode || cleanCode.length !== 6) {
    throw new Error("Please enter a valid 6-digit OTP code.");
  }

  const userCredential = await confirmationResult.confirm(cleanCode);
  return userCredential.user;
};
