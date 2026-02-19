import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LogEntry } from "./useLogs";

export function useLogById(id: string | undefined) {
  return useQuery({
    queryKey: ["log", id],
    enabled: !!id,
    queryFn: async (): Promise<LogEntry> => {
      const { data: log, error } = await supabase
        .from("logs")
        .select("id, user_id, date, weight_kg, reps, is_pr, notes, media_url, created_at, movement_id")
        .eq("id", id!)
        .single();
      if (error) throw error;

      const { data: movement, error: mErr } = await supabase
        .from("movements")
        .select("id, name, category")
        .eq("id", log.movement_id)
        .single();
      if (mErr) throw mErr;

      return {
        id: log.id,
        user_id: log.user_id,
        date: log.date,
        weight_kg: log.weight_kg,
        reps: log.reps,
        is_pr: log.is_pr,
        notes: log.notes,
        media_url: log.media_url,
        created_at: log.created_at,
        movement,
      };
    },
  });
}
