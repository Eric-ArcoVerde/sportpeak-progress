import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Share2, Pencil, Trash2, Dumbbell, PersonStanding, Trophy, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLogById } from "@/hooks/useLogById";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const LogDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: log, isLoading } = useLogById(id);
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = !!user && !!log && user.id === log.user_id;
  const isSkill = log?.movement.category === "skill";
  const isVideo = log?.media_url?.match(/\.(mp4|mov|webm)$/i);
  const successTag = log?.notes?.startsWith("[Sucesso]");

  const handleShare = async () => {
    const url = window.location.href;
    const text = log
      ? `${log.movement.name}${log.weight_kg ? ` — ${log.weight_kg}kg` : ""}${log.reps ? ` x ${log.reps}` : ""}${log.is_pr ? " 🏆 PR!" : ""}`
      : "";

    if (navigator.share) {
      try {
        await navigator.share({ title: "SportPeak", text, url });
      } catch (_) {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado! 📋");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    const { error } = await supabase.from("logs").delete().eq("id", id);
    setDeleting(false);
    if (error) {
      toast.error("Erro ao deletar registro");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["logs"] });
    toast.success("Registro deletado");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <Skeleton className="w-full h-72" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-muted-foreground">
        <p>Registro não encontrado.</p>
        <Button variant="link" onClick={() => navigate("/")}>Voltar para Home</Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-6 pb-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold text-muted-foreground">Detalhes</span>
          {isOwner ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/log/${id}/edit`)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="w-9" />
          )}
        </div>

        {/* Media */}
        <div className="w-full bg-muted relative">
          {log.media_url ? (
            isVideo ? (
              <video
                src={log.media_url}
                controls
                className="w-full max-h-[60vh] object-contain bg-black"
              />
            ) : (
              <img
                src={log.media_url}
                alt={log.movement.name}
                className="w-full max-h-[60vh] object-contain"
              />
            )
          ) : (
            <div className="flex items-center justify-center h-56 bg-muted/40">
              {isSkill ? (
                <PersonStanding className="h-16 w-16 text-accent/30" />
              ) : (
                <Dumbbell className="h-16 w-16 text-primary/30" />
              )}
            </div>
          )}
        </div>

        {/* Info block */}
        <div className="px-4 pt-5 pb-4 space-y-4 flex-1">
          {/* Title row */}
          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="text-2xl font-black flex-1">{log.movement.name}</h1>
            <div className="flex gap-2 flex-wrap">
              <span className={cn(
                "text-xs font-semibold px-2 py-1 rounded-full",
                isSkill ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
              )}>
                {isSkill ? "Skill" : "Força"}
              </span>
              {log.is_pr && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent text-accent-foreground flex items-center gap-1 glow-accent">
                  <Trophy className="h-3 w-3" /> PR
                </span>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {format(parseISO(log.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>

          {/* Skill status */}
          {isSkill && (
            <p className={cn(
              "text-sm font-semibold",
              successTag ? "text-[hsl(var(--success))]" : "text-muted-foreground"
            )}>
              {successTag ? "✅ Executado com sucesso" : "🔄 Tentativa"}
            </p>
          )}

          {/* Stats */}
          {!isSkill && (log.weight_kg != null || log.reps != null) && (
            <div className="flex gap-6">
              {log.weight_kg != null && (
                <div className="glass-card px-4 py-3 text-center">
                  <p className="text-2xl font-black font-mono">{log.weight_kg}</p>
                  <p className="text-xs text-muted-foreground">kg</p>
                </div>
              )}
              {log.reps != null && (
                <div className="glass-card px-4 py-3 text-center">
                  <p className="text-2xl font-black font-mono">{log.reps}</p>
                  <p className="text-xs text-muted-foreground">reps</p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {log.notes && (
            <div className="glass-card p-3">
              <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Observações</p>
              <p className="text-sm leading-relaxed">
                {log.notes.replace(/^\[(Sucesso|Tentativa)\]\s*/, "")}
              </p>
            </div>
          )}
        </div>

        {/* Share button */}
        <div className="px-4 pb-24">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LogDetails;
