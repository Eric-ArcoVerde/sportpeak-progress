
# Painel de Administrador

## Visão Geral

Implementar um sistema de administração para curadoria de movimentos e moderação, com proteção de rota, painel com abas e acesso condicional na navegação.

## Aviso de Segurança Importante

A solicitação original pede uma coluna `is_admin` na tabela `profiles`. Isso representa um risco de segurança crítico: se um usuário editar seu próprio perfil (o que a RLS atual permite), ele poderia se promover a admin. Para evitar isso, o campo `is_admin` **não será armazenado na tabela `profiles`**. Em vez disso, usaremos uma tabela separada `user_roles` (seguindo as melhores práticas já documentadas no projeto), com uma função `SECURITY DEFINER` para que as verificações de permissão nunca sejam manipuláveis pelo cliente.

## Parte 1: Banco de Dados (Migrações)

### Migração 1: Criar tabela `user_roles` e função `has_role`

```sql
-- Enum para os papéis disponíveis
CREATE TYPE public.app_role AS ENUM ('admin');

-- Tabela de papéis (separada de profiles por segurança)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Somente admins podem ver a tabela de roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Função SECURITY DEFINER para verificar roles sem recursão de RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### Migração 2: Atualizar RLS das tabelas `movements` e `logs`

Adicionar policies permissivas (`PERMISSIVE`) que usam `has_role` para que admins tenham acesso total, sem remover as policies existentes dos usuários normais:

**Tabela `movements`:**
- `SELECT` — admins leem todos os movimentos (já funciona via policy existente "Anyone can read movements")
- `UPDATE` — nova policy para admins atualizarem qualquer movimento
- `DELETE` — nova policy para admins deletarem qualquer movimento

**Tabela `logs`:**
- `SELECT` — nova policy para admins verem todos os logs (sem restrição de `user_id`)
- `UPDATE` — nova policy para admins editarem qualquer log
- `DELETE` — nova policy para admins deletarem qualquer log

## Parte 2: Hook `useIsAdmin`

Criar `src/hooks/useIsAdmin.ts`: um hook que faz `SELECT` na tabela `user_roles` filtrando pelo `user_id` e `role = 'admin'`, retornando `{ isAdmin: boolean, loading: boolean }`. Esse hook é a única fonte de verdade para o estado de admin no frontend.

## Parte 3: Componente `AdminRoute`

Criar `src/components/layout/AdminRoute.tsx`: similar ao `ProtectedRoute` existente. Usa `useIsAdmin()`:
- Se `loading`: exibe spinner.
- Se `!isAdmin`: redireciona para `/`.
- Se `isAdmin`: renderiza os filhos.

## Parte 4: Página `Admin.tsx`

Criar `src/pages/Admin.tsx` com layout em abas (Shadcn `Tabs`):

**Aba 1 — Curadoria de Movimentos:**
- Lista todos os movimentos do banco (query sem filtro de `user_id`, pois admin tem acesso total via nova RLS).
- Exibe: nome do movimento, categoria (badge), e se foi criado por usuário (mostra `created_by` truncado) ou é oficial (`created_by IS NULL`, exibe badge "Oficial").
- Botão **"Tornar Oficial"**: executa `UPDATE movements SET created_by = NULL WHERE id = ...`. Visível apenas para movimentos com `created_by` não nulo.
- Botão **"Deletar"**: abre `AlertDialog` de confirmação, depois executa `DELETE FROM movements WHERE id = ...`.

**Aba 2 — Registros (Logs):**
- Lista os últimos 100 logs de todos os usuários (query sem filtro de `user_id`).
- Exibe: movimento, usuário (`user_id` truncado), data, carga, reps.
- Botão **"Deletar"** com confirmação via `AlertDialog`.

## Parte 5: Rota e Navegação

**`src/App.tsx`:** Adicionar rota `/admin` protegida pelo `AdminRoute`:
```tsx
<Route path="/admin" element={
  <AdminRoute><Admin /></AdminRoute>
} />
```

**`src/components/layout/BottomNav.tsx`:** Usando `useIsAdmin()`, adicionar condicionalmente um ícone de `Shield` com link para `/admin`. Só renderiza se `isAdmin === true`. Como a bottom nav tem espaço limitado (3 itens), o link de admin será inserido apenas para admins, substituindo ou expandindo a lista de forma condicional.

## Fluxo de Dados

```text
[Usuário abre o app]
       │
       ├── useIsAdmin() → SELECT user_roles WHERE user_id = auth.uid()
       │
       ├── isAdmin = true → Exibe link "Admin" na BottomNav
       │
       └── Acessa /admin → AdminRoute verifica → renderiza Admin.tsx
                                │
                                ├── Aba "Movimentos"
                                │     ├── SELECT * FROM movements (sem filtro)
                                │     ├── UPDATE movements SET created_by = NULL
                                │     └── DELETE FROM movements WHERE id = ...
                                │
                                └── Aba "Logs"
                                      ├── SELECT * FROM logs (sem filtro)
                                      └── DELETE FROM logs WHERE id = ...
```

## Detalhes Técnicos

- A tabela `user_roles` é populada manualmente pelo banco de dados (View Backend → SQL Editor: `INSERT INTO user_roles (user_id, role) VALUES ('uuid-do-admin', 'admin')`). Não há UI para promover usuários — isso é intencional por segurança.
- As novas policies de admin são `PERMISSIVE`, ou seja, se qualquer policy (a do usuário normal ou a do admin) permitir a ação, ela é concedida. As policies existentes não são alteradas.
- O hook `useIsAdmin` usa `useQuery` do TanStack Query para cache automático, evitando múltiplas requisições ao banco a cada render.
- A coluna `created_by` em `movements` não tem constraint de NOT NULL, então setar `NULL` é válido pelo schema atual.
