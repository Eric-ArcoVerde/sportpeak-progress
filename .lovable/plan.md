
# Formulario Inteligente com UI Condicional

## Objetivo
Tornar o formulario de registro dinamico: quando o usuario selecionar um movimento do tipo **Strength**, exibir campos de Peso e Reps. Quando selecionar **Skill**, esconder peso/reps e mostrar um checkbox "Executado com sucesso?" com destaque no upload de video.

## Alteracoes

### Arquivo: `src/components/log/LogForm.tsx`

1. **Adicionar estado `executedSuccessfully`** para o checkbox de Skill.

2. **Derivar a categoria** a partir do `movement` selecionado (`movement?.category`).

3. **Renderizacao condicional dos campos:**
   - Se `category === "strength"` (ou nenhum movimento selecionado): mostrar bloco de Peso (com UnitConverter) e Reps como esta hoje.
   - Se `category === "skill"`: esconder peso/reps e exibir:
     - Checkbox "Executado com sucesso?" com estilo destacado.
     - MediaUploader com label enfatizando video ("Registre em video!").

4. **Ajustar `handleSubmit`:**
   - Para Skill: enviar `weight_kg: null`, `reps: null`, e usar o campo `notes` para registrar se foi executado com sucesso (ou adicionar essa info ao payload).
   - Para Strength: manter comportamento atual.

5. **Ajustar `reset`:** limpar tambem o estado `executedSuccessfully`.

6. **Animacao de transicao:** usar classes CSS de fade/slide para suavizar a troca entre os modos.

### Nenhuma alteracao de banco de dados necessaria
A tabela `logs` ja aceita `weight_kg` e `reps` como nullable, entao registros de Skill funcionam perfeitamente com esses campos como `null`.

## Detalhes Tecnicos

```text
+---------------------------+
| Movimento selecionado     |
+---------------------------+
         |
    category?
    /         \
strength      skill
  |              |
Peso (Kg)     Checkbox:
+ Converter   "Executado com
Reps          sucesso?"
  |              |
MediaUploader  MediaUploader
(opcional)     (destaque)
  |              |
Observacoes   Observacoes
PR checkbox   PR checkbox
Salvar        Salvar
```

- O campo `is_pr` continua disponivel em ambos os modos (um Skill tambem pode ser PR).
- Para Skill, o campo `notes` recebera automaticamente o prefixo "[Sucesso]" ou "[Tentativa]" baseado no checkbox, alem de qualquer observacao adicional do usuario.
- O MediaUploader aparece em ambos os modos, mas no modo Skill recebe destaque visual (borda accent, label diferente).
