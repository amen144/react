"use client"
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [awaiting2FA, setAwaiting2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [tempToken, setTempToken] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await axios.post(`${API_URL}/login`, { name, password });
      if (res.data?.requires2FA) {
        setTempToken(res.data.tempToken || null);
        setAwaiting2FA(true);
      } else if (res.data?.token && res.data?.user) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", res.data.user.name);
        localStorage.setItem("userID", String(res.data.user.id));
        router.push("/home");
      } else {
        setErrorMsg(res.data?.message || "Login failed");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Login request failed");
    }
  };

  const handleVerifyLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    try {
      const res = await axios.post(`${API_URL}/verify-login`, { code: verificationCode, tempToken });
      if (res.data?.token && res.data?.user) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", res.data.user.name);
        localStorage.setItem("userID", String(res.data.user.id));
        router.push("/home");
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
        {!awaiting2FA ? (
          <form onSubmit={handleSubmit} className="w-full bg-white/10 backdrop-blur-md rounded-xl shadow p-6 flex flex-col gap-3">
            <h1 className="text-2xl font-semibold text-center">Login</h1>
            {errorMsg && <div className="text-red-600 p-2 bg-red-100 rounded">{errorMsg}</div>}
            <input value={name} onChange={e => setUsername(e.target.value)} placeholder="Name" className="p-2 rounded bg-white/30" />
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type={showPassword ? "text" : "password"} className="p-2 rounded w-full bg-white/30" />
              <button type="button" className="absolute right-2 top-2 text-sm" onClick={() => setShowPassword(s => !s)}>{showPassword ? "Hide" : "Show"}</button>
            </div>
            <button type="submit" className="bg-green-900 text-white py-2 rounded">Submit</button>
            <div className="text-sm flex justify-between">
              <a href="/forgotpass" className="text-blue-400">Forgot Password?</a>
              <a href="./singup/" className="text-blue-400">Sign Up</a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyLogin} className="w-full bg-white/10 backdrop-blur-md rounded-xl shadow p-6 flex flex-col gap-3">
            <h2 className="text-xl text-center">Enter verification code</h2>
            {errorMsg && <div className="text-red-600 p-2 bg-red-100 rounded">{errorMsg}</div>}
            <input value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="Code" className="p-2 rounded bg-white/30" required />
            <button type="submit" className="bg-blue-600 text-white py-2 rounded">Verify & Login</button>
            <button type="button" className="bg-gray-500 text-white py-2 rounded" onClick={() => { setAwaiting2FA(false); setTempToken(null); }}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
}