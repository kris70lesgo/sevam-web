"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Sparkles, Phone } from "lucide-react";
import { supabase } from "@/lib/db/supabase";

const PROFILE_STORAGE_KEY = "sevam_profile";

type AuthMode = "login" | "signup";

interface LoginPageProps {
  initialMode?: AuthMode;
}

type PersistedProfile = {
  name: string;
  email: string;
  phone: string;
};

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
        overflow: "hidden",
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  );
};

function LoginPage({ initialMode = "login" }: LoginPageProps) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [useOtpForPhoneLogin, setUseOtpForPhoneLogin] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [signupPhoneOtp, setSignupPhoneOtp] = useState("");
  const [isSignupOtpSent, setIsSignupOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => clearTimeout(timer);
    }

    setIsLookingAtEachOther(false);
  }, [isTyping]);

  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };

      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    }

    setIsPurplePeeking(false);
  }, [password, showPassword, isPurplePeeking]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const normalizePhone = (rawPhone: string) => {
    const cleaned = rawPhone.replace(/\s+/g, "").trim();
    if (!cleaned) return "";
    if (cleaned.startsWith("+")) return cleaned;
    return `+91${cleaned.replace(/^0+/, "")}`;
  };

  const persistProfile = (profile: PersistedProfile) => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  };

  const syncProfileToBackend = async (profile: PersistedProfile, accessToken?: string) => {
    if (!accessToken) return profile;

    try {
      const response = await fetch("/api/auth/sync-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) return profile;
      const data = (await response.json()) as { profile?: PersistedProfile };
      return data.profile ?? profile;
    } catch {
      return profile;
    }
  };

  const resolveAccessToken = async (candidate?: string) => {
    if (candidate) return candidate;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const handleGetOtp = async (target: "login" | "signup") => {
    if (!phone.trim()) {
      setError("Please enter phone number first.");
      return;
    }

    setError("");

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      setIsLoading(true);
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone: normalizedPhone });

      if (otpError) {
        setError(otpError.message || "Failed to send OTP.");
        return;
      }

      setPhone(normalizedPhone);
    } catch {
      setError("Failed to send OTP.");
      return;
    } finally {
      setIsLoading(false);
    }

    if (target === "login") {
      setIsPhoneOtpSent(true);
    } else {
      setIsSignupOtpSent(true);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError("");
      setIsLoading(true);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/customer/dashboard`,
        },
      });

      if (oauthError) {
        setError(oauthError.message || "Google auth failed.");
      }
    } catch {
      setError("Google auth failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const normalizedPhone = normalizePhone(phone);

    try {
      if (authMode === "signup") {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        setIsLoading(false);
        return;
      }

      if (loginMethod === "phone") {
        if (!isSignupOtpSent) {
          setError("Please click Get OTP for your phone number.");
          setIsLoading(false);
          return;
        }

        if (!signupPhoneOtp.trim()) {
          setError("Please enter the OTP sent to your phone.");
          setIsLoading(false);
          return;
        }

        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          phone: normalizedPhone,
          token: signupPhoneOtp,
          type: "sms",
        });

        if (verifyError || !data.user) {
          setError(verifyError?.message || "OTP verification failed.");
          setIsLoading(false);
          return;
        }

          const fallbackProfile: PersistedProfile = {
          name: fullName,
          email: data.user.email ?? "",
          phone: normalizedPhone,
          };
          const token = await resolveAccessToken(data.session?.access_token);
          const syncedProfile = await syncProfileToBackend(fallbackProfile, token);
          persistProfile(syncedProfile);
        router.push("/customer/dashboard");
        setIsLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: normalizedPhone,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Signup failed.");
        setIsLoading(false);
        return;
      }

      const fallbackProfile: PersistedProfile = {
        name: fullName,
        email: data.user?.email ?? email,
        phone: normalizedPhone,
      };
      const token = await resolveAccessToken(data.session?.access_token);
      const syncedProfile = await syncProfileToBackend(fallbackProfile, token);
      persistProfile(syncedProfile);
      router.push("/customer/dashboard");
    } else if (loginMethod === "phone") {
      if (!useOtpForPhoneLogin) {
        setError("Please use OTP for phone login.");
        setIsLoading(false);
        return;
      }

      if (!isPhoneOtpSent) {
        setError("Please click Get OTP for phone login.");
        setIsLoading(false);
        return;
      }

      if (!phoneOtp.trim()) {
        setError("Please enter OTP to continue.");
        setIsLoading(false);
        return;
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: phoneOtp,
        type: "sms",
      });

      if (verifyError || !data.user) {
        setError(verifyError?.message || "OTP verification failed.");
        setIsLoading(false);
        return;
      }

      const fallbackProfile: PersistedProfile = {
        name: (data.user.user_metadata?.full_name as string | undefined) ?? "Customer",
        email: data.user.email ?? "",
        phone: normalizedPhone,
      };
      const token = await resolveAccessToken(data.session?.access_token);
      const syncedProfile = await syncProfileToBackend(fallbackProfile, token);
      persistProfile(syncedProfile);
      router.push("/customer/dashboard");
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError || !data.user) {
        setError(signInError?.message || "Login failed.");
        setIsLoading(false);
        return;
      }

      const fallbackProfile: PersistedProfile = {
        name: (data.user.user_metadata?.full_name as string | undefined) ?? "Customer",
        email: data.user.email ?? email,
        phone: (data.user.phone as string | undefined) ?? normalizedPhone,
      };
      const token = await resolveAccessToken(data.session?.access_token);
      const syncedProfile = await syncProfileToBackend(fallbackProfile, token);
      persistProfile(syncedProfile);
      router.push("/customer/dashboard");
    }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#d7d7da] via-[#d0d0d3] to-[#c8c8cc] p-12 text-[#202020]">
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="size-8 rounded-lg bg-black/10 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <span>YourBrand</span>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <div className="relative" style={{ width: "550px", height: "400px" }}>
            <div
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "70px",
                width: "180px",
                height: isTyping || (password.length > 0 && !showPassword) ? "440px" : "400px",
                backgroundColor: "#6C3FF5",
                borderRadius: "10px 10px 0 0",
                zIndex: 1,
                transform:
                  password.length > 0 && showPassword
                    ? "skewX(0deg)"
                    : isTyping || (password.length > 0 && !showPassword)
                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                    : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `${20}px`
                      : isLookingAtEachOther
                      ? `${55}px`
                      : `${45 + purplePos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `${35}px`
                      : isLookingAtEachOther
                      ? `${65}px`
                      : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall
                  size={18}
                  pupilSize={7}
                  maxDistance={5}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={
                    password.length > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined
                  }
                />
                <EyeBall
                  size={18}
                  pupilSize={7}
                  maxDistance={5}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={
                    password.length > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined
                  }
                />
              </div>
            </div>

            <div
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "240px",
                width: "120px",
                height: "310px",
                backgroundColor: "#2D2D2D",
                borderRadius: "8px 8px 0 0",
                zIndex: 2,
                transform:
                  password.length > 0 && showPassword
                    ? "skewX(0deg)"
                    : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : isTyping || (password.length > 0 && !showPassword)
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                    : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `${10}px`
                      : isLookingAtEachOther
                      ? `${32}px`
                      : `${26 + blackPos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `${28}px`
                      : isLookingAtEachOther
                      ? `${12}px`
                      : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall
                  size={16}
                  pupilSize={6}
                  maxDistance={4}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
                <EyeBall
                  size={16}
                  pupilSize={6}
                  maxDistance={4}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
              </div>
            </div>

            <div
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "0px",
                width: "240px",
                height: "200px",
                zIndex: 3,
                backgroundColor: "#FF9B6B",
                borderRadius: "120px 120px 0 0",
                transform: password.length > 0 && showPassword ? "skewX(0deg)" : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: password.length > 0 && showPassword ? `${50}px` : `${82 + (orangePos.faceX || 0)}px`,
                  top: password.length > 0 && showPassword ? `${85}px` : `${90 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
              </div>
            </div>

            <div
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "310px",
                width: "140px",
                height: "230px",
                backgroundColor: "#E8D754",
                borderRadius: "70px 70px 0 0",
                zIndex: 4,
                transform: password.length > 0 && showPassword ? "skewX(0deg)" : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: password.length > 0 && showPassword ? `${20}px` : `${52 + (yellowPos.faceX || 0)}px`,
                  top: password.length > 0 && showPassword ? `${35}px` : `${40 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
              </div>
              <div
                className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                style={{
                  left: password.length > 0 && showPassword ? `${10}px` : `${40 + (yellowPos.faceX || 0)}px`,
                  top: password.length > 0 && showPassword ? `${88}px` : `${88 + (yellowPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-[#5e5e5e]">
          <a href="#" className="hover:text-primary-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-primary-foreground transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-primary-foreground transition-colors">
            Contact
          </a>
        </div>

        <div className="absolute inset-0 bg-grid-black/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-8 bg-[#020202] text-white">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12 text-white">
            <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Sparkles className="size-4 text-white" />
            </div>
            <span>YourBrand</span>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">{authMode === "login" ? "Welcome back!" : "Create account"}</h1>
            <p className="text-[#9ca3af] text-sm">{authMode === "login" ? "Please enter your details" : "Join Sevam in a few seconds"}</p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-[#101010] p-1 border border-[#1f2937]">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`h-10 rounded-lg text-sm font-semibold transition-colors ${authMode === "login" ? "bg-[#d4d4d8] text-black" : "text-[#9ca3af]"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`h-10 rounded-lg text-sm font-semibold transition-colors ${authMode === "signup" ? "bg-[#d4d4d8] text-black" : "text-[#9ca3af]"}`}
            >
              Sign Up
            </button>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-[#101010] p-1 border border-[#1f2937]">
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`h-10 rounded-lg text-sm font-semibold transition-colors ${loginMethod === "email" ? "bg-[#d4d4d8] text-black" : "text-[#9ca3af]"}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`h-10 rounded-lg text-sm font-semibold transition-colors ${loginMethod === "phone" ? "bg-[#d4d4d8] text-black" : "text-[#9ca3af]"}`}
            >
              Phone No.
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {authMode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-white">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12 bg-[#020202] border-[#1f2937] text-white placeholder:text-[#6b7280] focus:border-[#4b5563]"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={loginMethod === "email" ? "email" : "phone"} className="text-sm font-medium text-white">
                {loginMethod === "email" ? "Email" : "Phone Number"}
              </Label>
              {loginMethod === "email" ? (
                <Input
                  id="email"
                  type="email"
                  placeholder="anna@gmail.com"
                  value={email}
                  autoComplete="off"
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  required
                  className="h-12 bg-[#020202] border-[#1f2937] text-white placeholder:text-[#6b7280] focus:border-[#4b5563]"
                />
              ) : (
                <div className="space-y-3">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    className="h-12 bg-[#020202] border-[#1f2937] text-white placeholder:text-[#6b7280] focus:border-[#4b5563]"
                  />

                  {authMode === "signup" && phone.trim().length > 0 && (
                    <Button
                      type="button"
                      onClick={() => handleGetOtp("signup")}
                      className="h-10 px-4 text-sm font-semibold !bg-[#d4d4d8] !text-black hover:!bg-[#e4e4e7]"
                    >
                      {isSignupOtpSent ? "Resend OTP" : "Get OTP"}
                    </Button>
                  )}

                  {authMode === "signup" && isSignupOtpSent && (
                    <Input
                      id="signupOtp"
                      type="text"
                      placeholder="Enter OTP"
                      value={signupPhoneOtp}
                      onChange={(e) => setSignupPhoneOtp(e.target.value)}
                      required
                      className="h-12 bg-[#020202] border-[#1f2937] text-white placeholder:text-[#6b7280] focus:border-[#4b5563]"
                    />
                  )}

                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => setUseOtpForPhoneLogin((current) => !current)}
                      className="text-sm text-[#d4d4d8] hover:underline"
                    >
                      {useOtpForPhoneLogin ? "Use password instead" : "Use OTP instead of password"}
                    </button>
                  )}

                  {authMode === "login" && useOtpForPhoneLogin && (
                    <div className="space-y-3">
                      <Button
                        type="button"
                        onClick={() => handleGetOtp("login")}
                        className="h-10 px-4 text-sm font-semibold !bg-[#d4d4d8] !text-black hover:!bg-[#e4e4e7]"
                      >
                        {isPhoneOtpSent ? "Resend OTP" : "Get OTP"}
                      </Button>

                      {isPhoneOtpSent && (
                        <Input
                          id="loginOtp"
                          type="text"
                          placeholder="Enter OTP"
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          required
                          className="h-12 bg-[#020202] border-[#1f2937] text-white placeholder:text-[#6b7280] focus:border-[#4b5563]"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!(authMode === "login" && loginMethod === "phone" && useOtpForPhoneLogin) && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10 bg-[#020202] border-[#1f2937] text-white placeholder:text-[#6b7280] focus:border-[#4b5563]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-[#e5e7eb]">
                  Remember for 30 days
                </Label>
              </div>
              <a href="#" className="text-sm text-[#e5e7eb] hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            {error && <div className="p-3 text-sm text-red-300 bg-red-950/20 border border-red-900/40 rounded-lg">{error}</div>}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold !bg-[#d4d4d8] !text-black hover:!bg-[#e4e4e7]"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (authMode === "login" ? "Signing in..." : "Creating account...") : authMode === "login" ? "Log in" : "Create account"}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full h-12 !bg-[#020202] !border-[#1f2937] !text-[#f3f4f6] hover:!bg-[#0b0b0b]"
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              <Mail className="mr-2 size-5" />
              {authMode === "signup" ? "Sign up with Google" : "Log in with Google"}
            </Button>
          </div>

          <div className="text-center text-sm text-[#9ca3af] mt-8">
            {authMode === "login" ? "Don\'t have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              className="text-white font-semibold hover:underline"
            >
              {authMode === "login" ? "Sign Up" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Component = LoginPage;
