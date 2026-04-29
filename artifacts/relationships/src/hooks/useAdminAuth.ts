import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const useAdminAuth = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const check = async () => {
    try {
      const data = await api.get<{ id: string; email: string }>("/auth/me");
      setUserId(data.id);
      setIsAdmin(true);
    } catch {
      setIsAdmin(false);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check();
  }, []);

  return { loading, isAdmin, userId, refresh: check };
};
