import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Globe, Clock, Users, CheckCircle2, RotateCcw } from 'lucide-react-native';
import { useRecipesStore } from '@/lib/stores/recipes-store';
import type { Recipe } from '@/lib/data/mock';

type ScreenState = 'input' | 'loading' | 'preview';

// Ricetta mock "estratta" dall'URL
const MOCK_EXTRACTED: Omit<Recipe, 'id'> = {
  name: 'Lasagne al Ragù della Nonna',
  description:
    'La classica lasagne della domenica, con ragù lento cotto per ore e besciamella cremosa fatta in casa.',
  tags: ['comfort'],
  servings: 6,
  timeMinutes: 90,
  rating: 0,
  ingredients: [
    { name: 'Sfoglie di pasta fresca', amount: '500g' },
    { name: 'Carne macinata mista', amount: '500g' },
    { name: 'Passata di pomodoro', amount: '400ml' },
    { name: 'Besciamella', amount: '500ml' },
    { name: 'Parmigiano grattugiato', amount: '100g' },
    { name: 'Mozzarella', amount: '200g' },
    { name: 'Cipolla', amount: '1' },
    { name: 'Carota', amount: '1' },
    { name: 'Sedano', amount: '1 costa' },
    { name: 'Vino rosso', amount: '100ml' },
  ],
  steps: [
    'Prepara il ragù: soffriggi cipolla, carota e sedano in olio, aggiungi la carne e rosola.',
    'Sfuma con il vino, aggiungi la passata e cuoci a fuoco basso per almeno 1 ora.',
    'Preriscalda il forno a 180°C.',
    'In una teglia, stendi un velo di besciamella sul fondo.',
    'Alterna strati di sfoglie, ragù, besciamella e parmigiano per 4-5 volte.',
    "Termina con besciamella abbondante, mozzarella e parmigiano.",
    'Cuoci in forno per 35-40 minuti fino a doratura. Lascia riposare 10 min prima di servire.',
  ],
};

export default function UrlRecipeScreen() {
  const router = useRouter();
  const addRecipe = useRecipesStore((s) => s.addRecipe);

  const [url, setUrl] = useState('');
  const [state, setState] = useState<ScreenState>('input');
  const [urlError, setUrlError] = useState('');

  const handleImport = async () => {
    if (!url.trim()) {
      setUrlError('Inserisci un URL valido');
      return;
    }
    setUrlError('');
    setState('loading');
    // Mock delay — simula l'estrazione dalla pagina web
    await new Promise((r) => setTimeout(r, 2200));
    setState('preview');
  };

  const handleReset = () => {
    setState('input');
    setUrl('');
    setUrlError('');
  };

  const handleSave = () => {
    addRecipe(MOCK_EXTRACTED);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 pt-4 pb-3">
          <Button size="icon" variant="ghost" onPress={() => router.back()}>
            <ArrowLeft className="text-foreground" size={20} />
          </Button>
          <View className="flex-1">
            <Text variant="h3">Importa da link</Text>
            <Text variant="muted">Estrai automaticamente la ricetta</Text>
          </View>
        </View>

        <Separator />

        {/* Input state */}
        {state === 'input' && (
          <ScrollView
            contentContainerClassName="px-4 py-5 gap-5"
            keyboardShouldPersistTaps="handled"
          >
            {/* URL field */}
            <View className="gap-1.5">
              <Label nativeID="url">URL della ricetta</Label>
              <View className="flex-row items-center gap-2 border border-border rounded-md px-3 bg-background">
                <Globe className="text-muted-foreground" size={16} />
                <Input
                  id="url"
                  className="flex-1 border-0 bg-transparent px-0"
                  placeholder="https://www.esempio.com/ricetta/..."
                  value={url}
                  onChangeText={setUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="go"
                  onSubmitEditing={handleImport}
                />
              </View>
              {urlError ? (
                <Text className="text-destructive text-xs">{urlError}</Text>
              ) : null}
            </View>

            {/* Info box */}
            <Card>
              <CardContent className="pt-4 pb-4">
                <Text className="text-sm font-semibold mb-1">Come funziona</Text>
                <Text className="text-xs text-muted-foreground leading-relaxed">
                  Incolla il link di una ricetta da qualsiasi sito di cucina. Estraiamo
                  automaticamente nome, ingredienti e procedimento grazie ai metadati JSON-LD
                  della pagina. Puoi modificare tutto prima di salvare.
                </Text>
              </CardContent>
            </Card>

            <Button onPress={handleImport} className="mt-2">
              <Globe className="text-primary-foreground" size={16} />
              <Text>Importa ricetta</Text>
            </Button>
          </ScrollView>
        )}

        {/* Loading state */}
        {state === 'loading' && (
          <View className="flex-1 items-center justify-center gap-5 px-8">
            <View className="w-20 h-20 rounded-2xl bg-primary/10 items-center justify-center">
              <ActivityIndicator size="large" color="hsl(142, 76%, 36%)" />
            </View>
            <View className="items-center gap-2">
              <Text className="text-base font-semibold">Estrazione in corso...</Text>
              <Text className="text-sm text-muted-foreground text-center">
                Stiamo analizzando la pagina e identificando la ricetta
              </Text>
            </View>
            <Text className="text-xs text-muted-foreground opacity-60 text-center" numberOfLines={1}>
              {url}
            </Text>
          </View>
        )}

        {/* Preview state */}
        {state === 'preview' && (
          <ScrollView
            contentContainerClassName="px-4 py-4 gap-4"
            showsVerticalScrollIndicator={false}
          >
            {/* Success banner */}
            <View className="flex-row items-center gap-3 bg-primary/10 rounded-xl px-4 py-3 border border-primary/20">
              <CheckCircle2 className="text-primary" size={20} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary">Ricetta trovata!</Text>
                <Text className="text-xs text-muted-foreground">Controlla i dettagli prima di salvare</Text>
              </View>
            </View>

            {/* Recipe preview */}
            <Card>
              <CardContent className="pt-4 gap-3">
                <Text className="text-lg font-bold">{MOCK_EXTRACTED.name}</Text>
                <Text className="text-sm text-muted-foreground">{MOCK_EXTRACTED.description}</Text>

                <View className="flex-row gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <Clock className="text-muted-foreground" size={13} />
                    <Text className="text-xs text-muted-foreground">{MOCK_EXTRACTED.timeMinutes} min</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Users className="text-muted-foreground" size={13} />
                    <Text className="text-xs text-muted-foreground">{MOCK_EXTRACTED.servings} pers.</Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-1.5">
                  {MOCK_EXTRACTED.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Text className="capitalize">{tag}</Text>
                    </Badge>
                  ))}
                </View>

                <Separator />

                <Text className="text-sm font-semibold">
                  Ingredienti ({MOCK_EXTRACTED.ingredients.length})
                </Text>
                {MOCK_EXTRACTED.ingredients.map((ing, i) => (
                  <View key={i} className="flex-row justify-between">
                    <Text className="text-sm flex-1">{ing.name}</Text>
                    <Text className="text-sm text-muted-foreground">{ing.amount}</Text>
                  </View>
                ))}

                <Separator />

                <Text className="text-sm font-semibold">
                  Procedimento ({MOCK_EXTRACTED.steps.length} passi)
                </Text>
                {MOCK_EXTRACTED.steps.map((step, i) => (
                  <View key={i} className="flex-row gap-2">
                    <Text className="text-xs font-bold text-primary w-4">{i + 1}.</Text>
                    <Text className="text-sm text-muted-foreground flex-1">{step}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <Button onPress={handleSave}>
              <Text>Salva ricetta</Text>
            </Button>
            <Button variant="outline" onPress={handleReset} className="flex-row gap-2">
              <RotateCcw className="text-foreground" size={16} />
              <Text>Riprova con altro URL</Text>
            </Button>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
