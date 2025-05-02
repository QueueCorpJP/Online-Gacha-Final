"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Loader2 } from "lucide-react";

export default function LineCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (code) {
      api.get(`/user/line/callback?code=${code}`)
        .then((res) => res.data)
        .then((data) => {
          setUserId(data.userId);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [code]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-card-foreground">
          LINE Login Callback
        </h1>
        <div className="flex justify-center">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <p className="text-center text-card-foreground">
              User ID: <span className="font-medium">{userId}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
