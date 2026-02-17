

# Correcao do Upload de Midia - Estrategia de Pastas de Usuario

## Problema

As policies do bucket `evidence-media` ja estao configuradas corretamente, exigindo que o arquivo seja salvo dentro de uma pasta com o ID do usuario (`foldername(name)[1] = auth.uid()`). Porem, o frontend envia o arquivo com caminho `{uuid}.{ext}` (sem pasta), causando erro 403.

## Solucao

Apenas uma alteracao no frontend e necessaria. Nenhuma migracao de banco de dados.

### Arquivo: `src/components/log/MediaUploader.tsx`

1. **Receber `userId` como prop** (o componente pai `LogForm` ja tem acesso ao `user` via `useAuth`).

2. **Alterar o caminho de upload** de:
   ```text
   ${crypto.randomUUID()}.${ext}
   ```
   Para:
   ```text
   ${userId}/${crypto.randomUUID()}.${ext}
   ```

3. **Bloquear upload se nao houver usuario** autenticado (seguranca extra).

4. **Melhorar feedback de erro/sucesso:**
   - Sucesso: `toast.success("Midia enviada!")`
   - Erro: `toast.error("Erro ao enviar: [mensagem real]")`
   - Adicionar `console.error("Upload error:", error)` para debug

5. **Alterar `upsert: true` para `upsert: false`** para evitar sobrescrita acidental.

### Arquivo: `src/components/log/LogForm.tsx`

1. Passar `userId={user?.id}` como prop para o componente `MediaUploader`.

## Detalhes Tecnicos

### Policies existentes (ja corretas, sem alteracao)

| Operacao | Regra |
|----------|-------|
| SELECT | Publico (qualquer um pode ver) |
| INSERT | `authenticated` + `foldername(name)[1] = auth.uid()` |
| UPDATE | `authenticated` + `foldername(name)[1] = auth.uid()` |
| DELETE | `authenticated` + `foldername(name)[1] = auth.uid()` |

### Mudanca na Props do MediaUploader

```text
type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  userId?: string;  // NOVO
};
```

### Caminho do arquivo resultante

```text
Antes:  a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
Depois: user-uuid/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
```

Isso garante que cada usuario so pode fazer upload, editar e deletar arquivos dentro da sua propria pasta, mantendo a seguranca por design.

