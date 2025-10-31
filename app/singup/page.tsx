"use client"
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [name, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [tempToken, setTempToken] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await axios.post(`${API_URL}/signup`, { name, email, password });
      if (res.data?.requiresVerification) {
        setTempToken(res.data.tempToken || null);
        setAwaitingVerification(true);
        setSuccessMsg(res.data.message || "Verification code sent to your email.");
      } else {
        setSuccessMsg(res.data?.message || "Signup successful!");
        setTimeout(() => router.push(".."), 900);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Signup failed");
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    try {
      const res = await axios.post(`${API_URL}/verify-signup`, {
        email,
        code: verificationCode,
        tempToken,
      });
      if (res.data?.success) {
        setSuccessMsg(res.data.message || "Verified. Redirecting to login...");
        setAwaitingVerification(false);
        setTempToken(null);
        setTimeout(() => router.push(".."), 900);
      } else {
        setErrorMsg(res.data?.message || "Verification failed");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Verification request failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cover p-8">
      <div className="w-full max-w-sm">
        {!awaitingVerification ? (
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white/10 backdrop-blur-md rounded-xl shadow p-6 flex flex-col gap-3"
          >
            <h1 className="text-2xl font-semibold text-center">Sign up</h1>
            {errorMsg && <div className="text-red-600 p-2 bg-red-100 rounded">{errorMsg}</div>}
            {successMsg && <div className="text-green-700 p-2 bg-green-100 rounded">{successMsg}</div>}
            <input value={name} onChange={e => setUsername(e.target.value)} placeholder="Username" className="p-2 rounded bg-white/30" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" type="email" className="p-2 rounded bg-white/30" />
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type={showPassword ? "text" : "password"} className="p-2 rounded w-full bg-white/30" />
              <button type="button" className="absolute right-2 top-2 text-sm" onClick={() => setShowPassword(s => !s)}>{showPassword ? "Hide" : "Show"}</button>
            </div>
            <button type="submit" className="bg-green-900 text-white py-2 rounded">Submit</button>
            <div className="text-sm flex justify-between">
              <a href=".." className="text-blue-400">Wanna login?</a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="w-full bg-white/10 backdrop-blur-md rounded-xl shadow p-6 flex flex-col gap-3">
            <h2 className="text-xl text-center">Verify your email</h2>
            {errorMsg && <div className="text-red-600 p-2 bg-red-100 rounded">{errorMsg}</div>}
            {successMsg && <div className="text-green-700 p-2 bg-green-100 rounded">{successMsg}</div>}
            <input value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="Verification code" className="p-2 rounded bg-white/30" required />
            <button type="submit" className="bg-blue-600 text-white py-2 rounded">Verify</button>
            <button type="button" className="bg-gray-500 text-white py-2 rounded" onClick={() => { setAwaitingVerification(false); setTempToken(null); }}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
}