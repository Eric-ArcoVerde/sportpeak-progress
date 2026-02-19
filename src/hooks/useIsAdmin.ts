import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useIsAdmin() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) return false;
      return !!data;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  return {
    isAdmin: data ?? false,
    loading: isLoading,
  };
}
