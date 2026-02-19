import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type LogEntry = {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number | null;
  reps: number | null;
  is_pr: boolean;
  notes: string | null;
  media_url: string | null;
  created_at: string;
  movement: {
    id: string;
    name: string;
    category: string;
  };
};

export function useLogs(movementFilter?: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["logs", user?.id, movementFilter],
    enabled: !!user,
    queryFn: async (): Promise<LogEntry[]> => {
      let query = supabase
        .from("logs")
        .select("id, user_id, date, weight_kg, reps, is_pr, notes, media_url, created_at, movement_id")
        .order("created_at", { ascending: false })
        .limit(50);

      if (movementFilter) {
        query = query.eq("movement_id", movementFilter);
      }

      const { data: logs, error } = await query;
      if (error) throw error;

      // Fetch movements for these logs
      const movementIds = [...new Set(logs.map((l) => l.movement_id))];
      const { data: movements, error: mErr } = await supabase
        .from("movements")
        .select("id, name, category")
        .in("id", movementIds);
      if (mErr) throw mErr;

      const movMap = new Map(movements.map((m) => [m.id, m]));

      return logs.map((l) => ({
        id: l.id,
        user_id: l.user_id,
        date: l.date,
        weight_kg: l.weight_kg,
        reps: l.reps,
        is_pr: l.is_pr,
        notes: l.notes,
        media_url: l.media_url,
        created_at: l.created_at,
        movement: movMap.get(l.movement_id) ?? { id: l.movement_id, name: "—", category: "strength" },
      }));
    },
  });
}

export function useUserMovements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-movements", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get distinct movement IDs the user has logged
      const { data: logs, error } = await supabase
        .from("logs")
        .select("movement_id")
        .limit(500);
      if (error) throw error;

      const ids = [...new Set(logs.map((l) => l.movement_id))];
      if (ids.length === 0) return [];

      const { data: movements, error: mErr } = await supabase
        .from("movements")
        .select("id, name, category")
        .in("id", ids)
        .order("name");
      if (mErr) throw mErr;

      return movements;
    },
  });
}
