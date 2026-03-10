# Pina Mobile — Direttive di sviluppo

App di pianificazione pasti settimanale per coppie. Stack identico a `pagai-ralph-mobile`.

---

## Tech Stack

| Categoria | Tecnologia |
|---|---|
| Framework | Expo ~54 + React Native 0.81 |
| Navigazione | Expo Router v6 (file-based, typed routes) |
| Styling | NativeWind v4 (TailwindCSS) |
| Componenti UI | RN Primitives + custom in `components/ui/` |
| Stato locale | Zustand v5 |
| Stato server | React Query v5 (`@tanstack/react-query`) |
| HTTP | Axios (`lib/api/axios-instance.ts`) |
| Auth | AWS Amplify + Cognito (`lib/services/cognito.ts`) |
| Icone | lucide-react-native (con cssInterop) |
| Animazioni | react-native-reanimated v4 |
| Drag & Drop | react-native-draggable-flatlist (planner) |
| Font | BeVietnamPro (Regular, Medium, SemiBold, Bold) |

---

## Regole UI — RISPETTA SEMPRE

### 1. Solo NativeWind per lo styling
```tsx
// CORRETTO
<View className="flex-1 bg-background px-4" />

// SBAGLIATO - mai usare StyleSheet
const styles = StyleSheet.create({ ... });
```

### 2. Solo componenti da `components/ui/`
Non usare mai componenti React Native grezzi dove esiste un componente UI:
```tsx
// CORRETTO
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// SBAGLIATO
import { Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
```

Componenti UI disponibili in `components/ui/`:
- `button` — varianti: default, destructive, outline, secondary, ghost, link
- `card`, `card-header`, `card-content`, `card-footer`, `card-title`, `card-description`
- `text` — varianti: default, h1, h2, h3, h4, muted, small, lead, large
- `input` — campo testo
- `badge` — varianti: default, secondary, outline, destructive
- `label` — label per form
- `separator` — linea divisoria
- `avatar` — avatar utente
- `switch` — toggle
- `tabs` — navigazione a tab
- `select` — dropdown selezione
- `alert-dialog` — dialog di conferma
- `dropdown-menu` — menu contestuale
- `popover` — tooltip/popover
- `radio-group` — selezione singola

### 3. Icone con cssInterop
Tutte le icone usate devono essere registrate in `lib/icons-interop.ts`.
```tsx
// Import diretto, className funziona grazie a cssInterop
import { Utensils } from 'lucide-react-native';
<Utensils className="text-primary" size={24} />
```
Se usi un'icona nuova, aggiungila a `lib/icons-interop.ts`.

### 4. Colori solo via variabili CSS Tailwind
```tsx
// CORRETTO
className="bg-primary text-primary-foreground"
className="bg-muted text-muted-foreground"
className="border-border"

// SBAGLIATO — mai hardcoded
className="bg-green-600"
style={{ color: '#16a34a' }}
```

### 5. Font
Il font è BeVietnamPro, gestito automaticamente da `components/ui/text.tsx`.
Usa sempre `<Text>` di `components/ui/text` — non `<RNText>` nativo.
Il peso viene applicato tramite le classi: `font-medium`, `font-semibold`, `font-bold`.

### 6. `cn()` per classi condizionali
```tsx
import { cn } from '@/lib/utils';
<View className={cn('flex-1', isActive && 'bg-primary')} />
```

### 7. CVA per componenti con varianti
```tsx
import { cva } from 'class-variance-authority';
const myVariants = cva('base-class', {
  variants: { variant: { default: '...', outlined: '...' } }
});
```

---

## Struttura cartelle

```
app/
├── _layout.tsx               Root layout (providers)
├── index.tsx                 Redirect auth/public
├── (public)/
│   ├── _layout.tsx
│   └── login.tsx
└── (auth)/
    ├── _layout.tsx           Auth guard
    └── (tabs)/
        ├── _layout.tsx       Tab bar
        ├── index.tsx         Planner settimanale
        ├── recipes.tsx       Archivio ricette
        ├── shopping.tsx      Lista spesa condivisa
        └── pantry.tsx        Dispensa (ho/non ho)

components/ui/                Componenti UI — non modificare
lib/
├── api/axios-instance.ts     HTTP client con auth interceptor
├── config/api.ts             URL per environment
├── config/cognito.ts         Credenziali Cognito (TODO: compilare)
├── contexts/AuthContext.tsx  Auth state + Cognito session
├── hooks/                    Custom hooks (useRecipes, usePlanner, ...)
├── services/cognito.ts       Wrapper AWS Amplify
├── stores/user-store.ts      Zustand store utente
├── theme.ts                  Colori per React Navigation
├── icons-interop.ts          cssInterop per lucide icons
└── utils.ts                  cn() utility
```

---

## Architettura dati

### DynamoDB — Single Table Design
```
PK                      SK                              Cosa
FAMILY#<id>             RECIPE#<recipeId>               Ricetta (nome, tag, ingredienti, porzioni)
FAMILY#<id>             WEEK#2026-W09#MON#LUNCH         Pasto pianificato (recipeId, persone)
FAMILY#<id>             WEEK#2026-W09#MON#DINNER        Pasto pianificato
FAMILY#<id>             PANTRY#<nomeIngrediente>         hasIt: boolean
FAMILY#<id>             SHOPPINGLIST#2026-W09           items[] con checked per item
USER#<userId>           PROFILE                         email, nome, familyId
```

### Lambda (backend — non in questo repo)
- `recipes` — CRUD ricette + import da URL (cheerio + JSON-LD)
- `planner` — piano settimanale + genera lista spesa
- `pantry` — gestione dispensa
- `shopping` — lista spesa condivisa (polling ogni 3-4s)

---

## Pattern API

```tsx
// Sempre via apiClient (axios con JWT auto-inject)
import { apiClient } from '@/lib/api/axios-instance';

// Sempre con React Query
const { data, isLoading } = useQuery({
  queryKey: ['recipes'],
  queryFn: () => apiClient.get('/recipes').then(r => r.data),
});

// Mutation
const mutation = useMutation({
  mutationFn: (data) => apiClient.post('/recipes', data).then(r => r.data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
});
```

---

## Auth

- Cognito User Pool su AWS
- Credenziali in `lib/config/cognito.ts` (TODO: compilare con i valori reali)
- `AuthContext` gestisce: login, logout, restore sessione da SecureStore
- L'`axios-instance` inietta automaticamente il JWT Bearer token
- Route protette sotto `(auth)/` — redirect automatico a login se non autenticato

---

## DO / DON'T

| DO | DON'T |
|---|---|
| Usa `components/ui/` per tutto | Creare componenti UI da zero con `View`+`Text` grezzi |
| Styling con NativeWind className | Usare `StyleSheet.create()` |
| Colori via variabili Tailwind | Hardcodare colori (`#16a34a`, `green-600`) |
| `cn()` per classi condizionali | Concatenare stringhe di classi manualmente |
| React Query per dati server | Fetch diretti in componenti |
| Zustand per stato UI locale | Context API per stato semplice |
| Expo Router per navigazione | `react-navigation` direttamente |
| Registrare icone in `icons-interop.ts` | Usare icone senza cssInterop |
