
# Grid Responsivo para LogCards

## Alteracoes

### 1. `src/pages/Index.tsx` - Container do feed

Substituir o container atual dos cards (linha 34):

```text
Antes:  <div className="mt-4 space-y-3 pb-4">
Depois: <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
```

O header, filtros e estados vazios/loading permanecem fora do grid, ocupando largura total.

### 2. `src/components/dashboard/LogCard.tsx` - Altura consistente da midia

Padronizar a area de midia/icone para altura uniforme no grid:

- Midia (imagem/video): trocar `h-36` para `h-48` e manter `object-cover`
- Placeholder sem midia: trocar `h-20` para `h-48` para alinhar com cards que tem midia
- Adicionar `relative` ao container sem midia (necessario para o badge PR com `absolute`)

Isso garante que todos os cards tenham a mesma altura na area visual, evitando desalinhamento no grid.

## Resumo

| Breakpoint | Colunas | Largura minima |
|------------|---------|----------------|
| Base       | 1       | 0px            |
| md         | 2       | 768px          |
| lg         | 3       | 1024px         |
| xl         | 4       | 1280px         |
