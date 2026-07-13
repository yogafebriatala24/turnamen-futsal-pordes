"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../libs/supabase";
import { MainLayout } from "../../components/templates/MainLayout";
import { Button } from "../../components/atoms/Button";
import { Input } from "../../components/atoms/Input";
import { FormField } from "../../components/molecules/FormField";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if already authenticated and redirect
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        throw authError;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Gagal masuk. Periksa kembali email dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Form Title & Icon */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500/10 items-center justify-center text-emerald-450 border border-emerald-500/20 mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white uppercase">
              Admin Login
            </h2>
            <p className="text-xs text-zinc-500 font-semibold tracking-wide uppercase">
              Masuk untuk kelola turnamen futsal
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form fields */}
          <form onSubmit={handleLogin} className="space-y-4">
            <FormField label="Email Admin" required>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  className="pl-11"
                  required
                />
              </div>
            </FormField>

            <FormField label="Password" required>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11"
                  required
                />
              </div>
            </FormField>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 text-sm font-bold tracking-wider uppercase mt-6"
              isLoading={isLoading}
            >
              Masuk
            </Button>
          </form>

          {/* Tip Note */}
          <div className="text-[10px] text-center text-zinc-550 border-t border-zinc-800/80 pt-4 leading-relaxed font-medium">
            <strong>Catatan:</strong> Akun admin dikonfigurasi melalui panel Supabase Anda. Hubungi administrator database untuk pendaftaran admin baru.
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
