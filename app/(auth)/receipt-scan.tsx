import { useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Camera, ScanLine, CheckCircle2, Check } from 'lucide-react-native';
import { usePantryStore } from '@/lib/stores/pantry-store';
import { useShoppingStore } from '@/lib/stores/shopping-store';
import { useFavoritesStore } from '@/lib/stores/favorites-store';

// ── Dati mock "estratti dall'AI dallo scontrino" ─────────────────────────────
interface RecognizedItem {
  id: string;
  name: string;
  category: string;
  shopItemId?: string;   // id in shopping store (se presente)
  pantryItemId?: string; // id in pantry store (se già esiste)
}

const MOCK_RECOGNIZED: RecognizedItem[] = [
  { id: 'r1',  name: 'Parmigiano',            category: 'Latticini',        shopItemId: 's10', pantryItemId: 'p11' },
  { id: 'r2',  name: 'Mozzarella fior di latte', category: 'Latticini',     shopItemId: 's11' },
  { id: 'r3',  name: 'Feta',                  category: 'Latticini',        shopItemId: 's12' },
  { id: 'r4',  name: 'Burro',                 category: 'Latticini',        shopItemId: 's13', pantryItemId: 'p13' },
  { id: 'r5',  name: 'Petto di pollo',         category: 'Carne e Pesce',   shopItemId: 's8'  },
  { id: 'r6',  name: 'Riso Arborio',           category: 'Cereali e Legumi', shopItemId: 's15', pantryItemId: 'p7' },
  { id: 'r7',  name: 'Pomodori',               category: 'Verdure',          shopItemId: 's1'  },
  { id: 'r8',  name: 'Funghi misti',           category: 'Verdure',          shopItemId: 's2'  },
  { id: 'r9',  name: 'Limoni',                 category: 'Verdure',          shopItemId: 's3'  },
  { id: 'r10', name: 'Passata di pomodoro',    category: 'Conserve',         shopItemId: 's17', pantryItemId: 'p15' },
  { id: 'r11', name: 'Lenticchie',             category: 'Cereali e Legumi', pantryItemId: 'p10' },
  { id: 'r12', name: 'Latte',                  category: 'Latticini',        pantryItemId: 'p14' },
];

type ScreenState = 'camera' | 'loading' | 'review' | 'success';

const LOADING_STEPS = [
  'Rilevamento scontrino...',
  'Lettura articoli...',
  'Normalizzazione nomi...',
  'Abbinamento dispensa...',
];

export default function ReceiptScanScreen() {
  const router = useRouter();
  const bulkSetHasIt = usePantryStore((s) => s.bulkSetHasIt);
  const addPantryItems = usePantryStore((s) => s.addItems);
  const bulkCheck = useShoppingStore((s) => s.bulkCheck);
  const bulkCheckFavorites = useFavoritesStore((s) => s.bulkCheckByName);

  const [state, setState] = useState<ScreenState>('camera');
  const [loadingMsg, setLoadingMsg] = useState(LOADING_STEPS[0]);
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(MOCK_RECOGNIZED.map((i) => [i.id, true])),
  );
  const [result, setResult] = useState({ pantryUpdated: 0, shoppingChecked: 0 });

  const toggleItem = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCapture = async () => {
    setState('loading');
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % LOADING_STEPS.length;
      setLoadingMsg(LOADING_STEPS[step]);
    }, 600);
    await new Promise((r) => setTimeout(r, 2500));
    clearInterval(interval);
    setState('review');
  };

  const handleConfirm = () => {
    const confirmed = MOCK_RECOGNIZED.filter((i) => selected[i.id]);

    // 1. Aggiorna pantry — item già esistenti
    const existingNames = confirmed
      .filter((i) => i.pantryItemId)
      .map((i) => i.name);
    if (existingNames.length) bulkSetHasIt(existingNames, true);

    // 2. Aggiungi nuovi item alla pantry
    const newItems = confirmed
      .filter((i) => !i.pantryItemId)
      .map((i) => ({ name: i.name, category: i.category }));
    if (newItems.length) addPantryItems(newItems);

    // 3. Segna come acquistati nella lista spesa
    const shopIds = confirmed
      .filter((i) => i.shopItemId)
      .map((i) => i.shopItemId as string);
    if (shopIds.length) bulkCheck(shopIds);

    // 4. Segna come acquistati i preferiti in cart che matchano i nomi riconosciuti
    const recognizedNames = confirmed.map((i) => i.name);
    bulkCheckFavorites(recognizedNames);

    setResult({ pantryUpdated: confirmed.length, shoppingChecked: shopIds.length });
    setState('success');
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <SafeAreaView className="flex-1 bg-background">

      {/* ── Camera state ──────────────────────────────────────── */}
      {state === 'camera' && (
        <View className="flex-1">
          {/* Header trasparente su sfondo scuro */}
          <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center px-4 pt-4 pb-3">
            <Button size="icon" variant="ghost" onPress={() => router.back()}>
              <ArrowLeft className="text-foreground" size={20} />
            </Button>
          </View>

          {/* Finto viewport camera */}
          <View className="flex-1 bg-zinc-900 items-center justify-center gap-8">
            {/* Frame guida scontrino */}
            <View className="items-center gap-4">
              <View className="w-64 h-80 rounded-2xl border-2 border-white/60 items-center justify-center gap-3">
                <ScanLine className="text-white/60" size={32} />
                <Text className="text-white/60 text-sm text-center px-4">
                  Inquadra lo scontrino
                </Text>
              </View>
              <Text className="text-white/40 text-xs text-center">
                Tieni il telefono fermo e assicurati{'\n'}che il testo sia leggibile
              </Text>
            </View>

            {/* Bottone cattura */}
            <Button
              onPress={handleCapture}
              className="w-16 h-16 rounded-full bg-white"
              variant="ghost"
            >
              <Camera className="text-zinc-900" size={28} />
            </Button>
          </View>
        </View>
      )}

      {/* ── Loading state ─────────────────────────────────────── */}
      {state === 'loading' && (
        <View className="flex-1 items-center justify-center gap-6 px-8">
          <View className="w-24 h-24 rounded-3xl bg-primary/10 items-center justify-center">
            <ActivityIndicator size="large" color="hsl(152, 52%, 35%)" />
          </View>
          <View className="items-center gap-2">
            <Text className="text-base font-semibold">{loadingMsg}</Text>
            <Text className="text-sm text-muted-foreground text-center">
              L'AI sta analizzando lo scontrino
            </Text>
          </View>
        </View>
      )}

      {/* ── Review state ──────────────────────────────────────── */}
      {state === 'review' && (
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center gap-3 px-4 pt-4 pb-3">
            <Button size="icon" variant="ghost" onPress={() => router.back()}>
              <ArrowLeft className="text-foreground" size={20} />
            </Button>
            <View className="flex-1">
              <Text variant="h3">Articoli trovati</Text>
              <Text variant="muted">{selectedCount} di {MOCK_RECOGNIZED.length} selezionati</Text>
            </View>
          </View>

          <Separator />

          <ScrollView contentContainerClassName="px-4 py-4 gap-3" showsVerticalScrollIndicator={false}>
            {/* Info banner */}
            <View className="bg-primary/10 rounded-xl px-4 py-3 border border-primary/20">
              <Text className="text-sm text-primary font-medium">
                L'AI ha riconosciuto {MOCK_RECOGNIZED.length} articoli dallo scontrino
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                Deseleziona gli articoli errati prima di confermare
              </Text>
            </View>

            {/* Items list */}
            <Card>
              <CardContent className="pt-3 pb-1">
                {MOCK_RECOGNIZED.map((item, idx) => {
                  const isSelected = selected[item.id];
                  const inShop = !!item.shopItemId;
                  const inPantry = !!item.pantryItemId;

                  return (
                    <View key={item.id}>
                      <Button
                        variant="ghost"
                        onPress={() => toggleItem(item.id)}
                        className="flex-row items-center justify-start gap-3 px-0 h-auto py-3"
                      >
                        {/* Checkbox */}
                        <View
                          className={
                            isSelected
                              ? 'w-5 h-5 rounded-md bg-primary items-center justify-center'
                              : 'w-5 h-5 rounded-md border-2 border-border'
                          }
                        >
                          {isSelected && <Check className="text-primary-foreground" size={12} />}
                        </View>

                        {/* Nome */}
                        <Text className="flex-1 text-sm">{item.name}</Text>

                        {/* Badges */}
                        <View className="flex-row gap-1">
                          {inShop && (
                            <Badge variant="secondary">
                              <Text className="text-[10px]">spesa</Text>
                            </Badge>
                          )}
                          {inPantry && (
                            <Badge variant="outline">
                              <Text className="text-[10px]">dispensa</Text>
                            </Badge>
                          )}
                          {!inShop && !inPantry && (
                            <Badge>
                              <Text className="text-[10px]">nuovo</Text>
                            </Badge>
                          )}
                        </View>
                      </Button>
                      {idx < MOCK_RECOGNIZED.length - 1 && <Separator />}
                    </View>
                  );
                })}
              </CardContent>
            </Card>

            {/* Legend */}
            <View className="flex-row gap-3 px-1">
              <View className="flex-row items-center gap-1.5">
                <Badge variant="secondary"><Text className="text-[10px]">spesa</Text></Badge>
                <Text className="text-xs text-muted-foreground">rimosso dalla lista</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Badge variant="outline"><Text className="text-[10px]">dispensa</Text></Badge>
                <Text className="text-xs text-muted-foreground">aggiornato</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Badge><Text className="text-[10px]">nuovo</Text></Badge>
                <Text className="text-xs text-muted-foreground">aggiunto</Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky confirm */}
          <View className="px-4 pb-6 pt-3 border-t border-border bg-background">
            <Button onPress={handleConfirm} disabled={selectedCount === 0}>
              <Text>Conferma e aggiorna ({selectedCount})</Text>
            </Button>
          </View>
        </View>
      )}

      {/* ── Success state ─────────────────────────────────────── */}
      {state === 'success' && (
        <View className="flex-1 items-center justify-center px-8 gap-6">
          <View className="w-20 h-20 rounded-full bg-primary/15 items-center justify-center">
            <CheckCircle2 className="text-primary" size={40} />
          </View>

          <View className="items-center gap-2">
            <Text className="text-xl font-bold text-center">Dispensa aggiornata!</Text>
            <Text className="text-sm text-muted-foreground text-center leading-relaxed">
              L'AI ha elaborato lo scontrino e aggiornato i tuoi dati
            </Text>
          </View>

          {/* Stats */}
          <View className="w-full gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-primary/10 rounded-xl p-4 items-center gap-1 border border-primary/20">
                <Text className="text-2xl font-bold text-primary">{result.pantryUpdated}</Text>
                <Text className="text-xs text-muted-foreground text-center">articoli in dispensa</Text>
              </View>
              <View className="flex-1 bg-muted rounded-xl p-4 items-center gap-1">
                <Text className="text-2xl font-bold">{result.shoppingChecked}</Text>
                <Text className="text-xs text-muted-foreground text-center">rimossi dalla spesa</Text>
              </View>
            </View>
          </View>

          <Button onPress={() => router.back()} className="w-full">
            <Text>Torna alla dispensa</Text>
          </Button>
        </View>
      )}

    </SafeAreaView>
  );
}
