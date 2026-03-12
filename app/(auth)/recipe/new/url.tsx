import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Globe, Clock, Users, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react-native';
import { ScanAnimation } from '@/components/ui/scan-animation';
import { useQueryClient } from '@tanstack/react-query';
import { useRecipesControllerImportFromUrl } from '@/lib/api/endpoints/recipes/recipes';
import {
  useRecipesControllerCreate,
  getRecipesControllerFindAllQueryKey,
} from '@/lib/api/endpoints/recipes/recipes';
import type { ImportedRecipeDto } from '@/lib/api/model';

type ScreenState = 'input' | 'loading' | 'preview';

export default function UrlRecipeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [url, setUrl] = useState('');
  const [state, setState] = useState<ScreenState>('input');
  const [urlError, setUrlError] = useState('');
  const [extracted, setExtracted] = useState<ImportedRecipeDto | null>(null);

  const importMutation = useRecipesControllerImportFromUrl({
    mutation: {
      onSuccess: (data) => {
        setExtracted(data);
        setState('preview');
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Errore durante l\'importazione';
        setUrlError(typeof msg === 'string' ? msg : 'Impossibile estrarre la ricetta da questo link.');
        setState('input');
      },
    },
  });

  const createRecipe = useRecipesControllerCreate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getRecipesControllerFindAllQueryKey() });
        router.back();
      },
    },
  });

  const handleImport = () => {
    if (!url.trim()) {
      setUrlError('Inserisci un URL valido');
      return;
    }
    setUrlError('');
    setState('loading');
    importMutation.mutate({ data: { url: url.trim() } });
  };

  const handleReset = () => {
    setState('input');
    setUrl('');
    setUrlError('');
    setExtracted(null);
  };

  const handleSave = () => {
    if (!extracted) return;
    createRecipe.mutate({
      data: {
        name: extracted.name,
        description: extracted.description,
        tags: extracted.tags,
        servings: extracted.servings,
        timeMinutes: extracted.timeMinutes,
        rating: 0,
        ingredients: extracted.ingredients,
        steps: extracted.steps,
      },
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
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
            <View className="gap-1.5">
              <Label nativeID="url">URL della ricetta</Label>
              <View className="flex-row items-center gap-2 border border-border rounded-md px-3 bg-background">
                <Globe className="text-muted-foreground" size={16} />
                <Input
                  id="url"
                  className="flex-1 border-0 bg-transparent px-0"
                  placeholder="https://www.giallozafferano.it/ricetta/..."
                  value={url}
                  onChangeText={(v) => { setUrl(v); setUrlError(''); }}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="go"
                  onSubmitEditing={handleImport}
                />
              </View>
              {urlError ? (
                <View className="flex-row items-center gap-1.5">
                  <AlertCircle className="text-destructive" size={13} />
                  <Text className="text-destructive text-xs flex-1">{urlError}</Text>
                </View>
              ) : null}
            </View>

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

            <Button onPress={handleImport} className="flex-row gap-2 mt-2">
              <Globe className="text-primary-foreground" size={16} />
              <Text>Importa ricetta</Text>
            </Button>
          </ScrollView>
        )}

        {/* Loading state */}
        {state === 'loading' && (
          <View className="flex-1 items-center justify-center gap-8 px-8">
            <ScanAnimation Icon={Globe} />
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
        {state === 'preview' && extracted && (
          <ScrollView
            contentContainerClassName="px-4 py-4 gap-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-center gap-3 bg-primary/10 rounded-xl px-4 py-3 border border-primary/20">
              <CheckCircle2 className="text-primary" size={20} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary">Ricetta trovata!</Text>
                <Text className="text-xs text-muted-foreground">Controlla i dettagli prima di salvare</Text>
              </View>
            </View>

            <Card>
              <CardContent className="pt-4 gap-3">
                <Text className="text-lg font-bold">{extracted.name}</Text>
                {extracted.description ? (
                  <Text className="text-sm text-muted-foreground">{extracted.description}</Text>
                ) : null}

                <View className="flex-row gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <Clock className="text-muted-foreground" size={13} />
                    <Text className="text-xs text-muted-foreground">{extracted.timeMinutes} min</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Users className="text-muted-foreground" size={13} />
                    <Text className="text-xs text-muted-foreground">{extracted.servings} pers.</Text>
                  </View>
                </View>

                {extracted.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5">
                    {extracted.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        <Text className="capitalize text-xs">{tag}</Text>
                      </Badge>
                    ))}
                  </View>
                )}

                <Separator />

                <Text className="text-sm font-semibold">
                  Ingredienti ({extracted.ingredients.length})
                </Text>
                {extracted.ingredients.map((ing, i) => (
                  <View key={i} className="flex-row justify-between">
                    <Text className="text-sm flex-1">{ing.name}</Text>
                    <Text className="text-sm text-muted-foreground">{ing.amount}</Text>
                  </View>
                ))}

                {extracted.steps.length > 0 && (
                  <>
                    <Separator />
                    <Text className="text-sm font-semibold">
                      Procedimento ({extracted.steps.length} passi)
                    </Text>
                    {extracted.steps.map((step, i) => (
                      <View key={i} className="flex-row gap-2">
                        <Text className="text-xs font-bold text-primary w-4">{i + 1}.</Text>
                        <Text className="text-sm text-muted-foreground flex-1">{step}</Text>
                      </View>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            <Button onPress={handleSave} disabled={createRecipe.isPending}>
              <Text>{createRecipe.isPending ? 'Salvataggio...' : 'Salva ricetta'}</Text>
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
