
# Página de Detalhes do Registro (LogDetails)

## Visão Geral

Transformar os cards do Dashboard em elementos clicáveis que levam a uma página de detalhes rica, com visualização de mídia, informações completas, compartilhamento via Web Share API e ações de Editar/Deletar protegidas por autenticação.

## Arquivos a Criar

### `src/pages/LogDetails.tsx` (novo)

Página completa de detalhes com as seguintes seções:

- **Cabeçalho**: Botão "Voltar" (seta) à esquerda + Menu Dropdown (3 pontinhos) à direita — visível apenas para o dono do registro.
- **Mídia principal**: Vídeo com controles nativos completos (`<video controls>`) ou imagem em largura total. Placeholder com ícone caso não haja mídia.
- **Bloco de informações**: Nome do movimento, data formatada, categoria (badge Skill/Força), badge PR em destaque (dourado/glow), carga (kg), repetições e notas.
- **Botão Compartilhar**: Chama `navigator.share()` com título, texto e URL do registro. Fallback para `navigator.clipboard` em browsers que não suportam a API.
- **Modal de Confirmação de Exclusão**: Usa `AlertDialog` do Shadcn UI com mensagem "Tem certeza que deseja apagar este registro?". Ao confirmar, executa `DELETE` no banco e redireciona para `/`.

### `src/hooks/useLogById.ts` (novo)

Hook dedicado para buscar um registro único por ID, reutilizando o padrão já estabelecido em `useLogs.ts`:

```
useQuery(["log", id]) → SELECT + JOIN movements
```

Retorna o mesmo tipo `LogEntry` já existente.

### `src/pages/LogEdit.tsx` (novo)

Página de edição que carrega os dados do registro e renderiza o `LogForm` pré-preenchido. Requer refatoração leve do `LogForm` para aceitar dados iniciais via props (`initialData?`).

## Arquivos a Editar

### `src/App.tsx`
Adicionar duas novas rotas dentro do bloco protegido:
- `/log/:id` → `<LogDetails />`
- `/log/:id/edit` → `<LogEdit />`

### `src/components/dashboard/LogCard.tsx`
Envolver o card inteiro em um `<Link to={/log/${log.id}}>` do `react-router-dom`. Adicionar `cursor-pointer` e `hover:ring-1 hover:ring-primary/30` para feedback visual.

### `src/components/log/LogForm.tsx`
Adicionar suporte a prop `initialData` opcional para pré-preencher os campos no modo de edição. Em modo de edição, o botão executa `UPDATE` em vez de `INSERT`, e o título do botão muda para "Salvar Alterações".

## Fluxo de Dados

```text
[LogCard clicável]
       │
       ▼ navigate("/log/:id")
[LogDetails.tsx]
       │
       ├── useLogById(id)  →  SELECT log + movement
       │
       ├── [Botão Voltar]  →  navigate(-1)
       │
       ├── [Dropdown] (somente se user.id === log.user_id)
       │       ├── Editar  →  navigate("/log/:id/edit")
       │       └── Deletar →  AlertDialog → DELETE → navigate("/")
       │
       └── [Compartilhar]  →  navigator.share()

[LogEdit.tsx]
       │
       ├── useLogById(id)
       └── <LogForm initialData={log} />  →  UPDATE → navigate("/log/:id")
```

## Segurança

- Os botões de Editar e Deletar são renderizados condicionalmente: `{user?.id === log.user_id && <DropdownMenu>}`.
- A exclusão no banco é protegida pela RLS já existente: `DELETE WHERE user_id = auth.uid()`, então mesmo que alguém force a chamada sem permissão, o banco rejeita.
- A rota de edição também é protegida pelo `ProtectedRoute` já existente no `App.tsx`.

## Detalhes Técnicos

- O tipo `LogEntry` em `useLogs.ts` não possui o campo `user_id` — será necessário adicioná-lo na query e no tipo para permitir a comparação de propriedade no componente de detalhes.
- A Web Share API pode não estar disponível em todos os browsers/ambientes. Será implementado um fallback: copia o link para a área de transferência e mostra um toast "Link copiado!".
- O `LogForm` receberá uma prop `mode: "create" | "edit"` e `initialData?: LogEntry` para diferenciar os comportamentos de INSERT vs UPDATE.
