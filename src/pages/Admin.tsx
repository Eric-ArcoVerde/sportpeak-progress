import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Shield, Star, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Movement = {
  id: string;
  name: string;
  category: string;
  created_by: string | null;
  created_at: string;
};

type AdminLog = {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number | null;
  reps: number | null;
  is_pr: boolean;
  movement_id: string;
  movement_name?: string;
};

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- Fetch all movements ---
  const { data: movements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ["admin-movements"],
    queryFn: async (): Promise<Movement[]> => {
      const { data, error } = await supabase
        .from("movements")
        .select("id, name, category, created_by, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // --- Fetch all logs (admin can see all via RLS) ---
  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async (): Promise<AdminLog[]> => {
      const { data, error } = await supabase
        .from("logs")
        .select("id, user_id, date, weight_kg, reps, is_pr, movement_id")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      const movIds = [...new Set(data.map((l) => l.movement_id))];
      const { data: movs } = await supabase
        .from("movements")
        .select("id, name")
        .in("id", movIds);

      const movMap = new Map((movs ?? []).map((m) => [m.id, m.name]));

      return data.map((l) => ({
        ...l,
        movement_name: movMap.get(l.movement_id) ?? "—",
      }));
    },
  });

  // --- Make Official ---
  const makeOfficialMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("movements")
        .update({ created_by: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-movements"] });
      toast({ title: "Movimento tornado oficial ✓" });
    },
    onError: () => toast({ title: "Erro ao atualizar", variant: "destructive" }),
  });

  // --- Delete movement ---
  const deleteMovementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("movements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-movements"] });
      toast({ title: "Movimento deletado" });
    },
    onError: () => toast({ title: "Erro ao deletar", variant: "destructive" }),
  });

  // --- Delete log ---
  const deleteLogMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      toast({ title: "Registro deletado" });
    },
    onError: () => toast({ title: "Erro ao deletar", variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Painel Admin</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <Tabs defaultValue="movements">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="movements" className="flex-1">
              Movimentos
              <Badge variant="secondary" className="ml-2 text-xs">
                {movements.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex-1">
              Registros
              <Badge variant="secondary" className="ml-2 text-xs">
                {logs.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* === ABA MOVIMENTOS === */}
          <TabsContent value="movements">
            {loadingMovements ? (
              <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>
            ) : (
              <div className="space-y-2">
                {movements.map((mov) => (
                  <div
                    key={mov.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{mov.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs capitalize">
                          {mov.category}
                        </Badge>
                        {mov.created_by === null ? (
                          <Badge className="text-xs bg-primary/20 text-primary border-0">
                            <Star className="h-3 w-3 mr-1" />
                            Oficial
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">
                            {mov.created_by.slice(0, 8)}…
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {mov.created_by !== null && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => makeOfficialMutation.mutate(mov.id)}
                          disabled={makeOfficialMutation.isPending}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Oficial
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar movimento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja apagar "{mov.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteMovementMutation.mutate(mov.id)}
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* === ABA LOGS === */}
          <TabsContent value="logs">
            {loadingLogs ? (
              <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{log.movement_name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.user_id.slice(0, 8)}…
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.date), "dd/MM/yy", { locale: ptBR })}
                        </span>
                        {log.weight_kg && (
                          <span className="text-xs text-muted-foreground">{log.weight_kg}kg</span>
                        )}
                        {log.reps && (
                          <span className="text-xs text-muted-foreground">{log.reps} reps</span>
                        )}
                        {log.is_pr && (
                          <Badge variant="secondary" className="text-xs border-0">PR</Badge>
                        )}
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deletar registro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja apagar este registro? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteLogMutation.mutate(log.id)}
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
