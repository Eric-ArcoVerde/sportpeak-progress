import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  userId?: string;
};

const MediaUploader = ({ value, onChange, userId }: Props) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }

    const maxMb = 50;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Arquivo muito grande (máx ${maxMb}MB)`);
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("evidence-media")
      .upload(path, file, { upsert: false });

    if (error) {
      console.error("Upload error:", error);
      toast.error(`Erro ao enviar: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("evidence-media")
      .getPublicUrl(path);

    onChange(urlData.publicUrl);
    toast.success("Mídia enviada!");
    setUploading(false);
  };

  const isVideo = value?.match(/\.(mp4|mov|webm)$/i);

  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground mb-2 block">
        Mídia (opcional)
      </label>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          {isVideo ? (
            <video src={value} controls className="w-full max-h-48 object-cover" />
          ) : (
            <img src={value} alt="Preview" className="w-full max-h-48 object-cover" />
          )}
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={() => onChange(null)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-20 border-dashed"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Camera className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Foto ou Vídeo</span>
            </div>
          )}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
};

export default MediaUploader;
