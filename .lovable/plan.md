

# Redirecionamento apos Salvar Registro

## Objetivo
Apos salvar um registro com sucesso, redirecionar automaticamente o usuario para a Home (Dashboard), mantendo o toast de confirmacao visivel durante a transicao.

## Alteracoes

### Arquivo: `src/components/log/LogForm.tsx`

1. Importar `useNavigate` de `react-router-dom`.
2. Instanciar `const navigate = useNavigate()` no corpo do componente.
3. No bloco de sucesso do `handleSubmit` (quando nao e PR): apos o `toast.success` e `reset()`, chamar `navigate("/")`.
4. No callback `onClose` do `ConfettiCelebration` (quando e PR): apos o `toast.success` e `reset()`, chamar `navigate("/")`.

O toast do Sonner permanece visivel mesmo apos a navegacao, pois ele e renderizado no nivel do App (fora das rotas), garantindo que o usuario veja a confirmacao enquanto a pagina muda.

