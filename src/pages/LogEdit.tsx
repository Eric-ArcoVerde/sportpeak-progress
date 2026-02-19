import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLogById } from "@/hooks/useLogById";
import LogForm from "@/components/log/LogForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const LogEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: log, isLoading } = useLogById(id);

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black">Editar Registro</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !log ? (
        <p className="text-muted-foreground text-center py-16">Registro não encontrado.</p>
      ) : (
        <LogForm mode="edit" initialData={log} />
      )}
    </div>
  );
};

export default LogEdit;
