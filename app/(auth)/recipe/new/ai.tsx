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
import { ArrowLeft, Wand2, Clock, Users, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react-native';
import { useRecipesStore } from '@/lib/stores/recipes-store';
import type { Recipe } from '@/lib/data/mock';

type ScreenState = 'input' | 'loading' | 'preview';

const AVAILABLE_TAGS = ['veloce', 'vegetariano', 'vegano', 'proteico', 'leggero', 'comfort'];

// Ricetta mock "generata" dall'AI
const MOCK_AI_RECIPE: Omit<Recipe, 'id'> = {
  name: 'Pollo Thai al Cocco con Riso Jasmine',
  description:
    'Ricetta ispirata alla cucina thai: pollo tenero in una salsa vellutata al latte di cocco con citronella, zenzero e una punta di piccante.',
  tags: ['proteico', 'comfort'],
  servings: 4,
  timeMinutes: 35,
  rating: 0,
  ingredients: [
    { name: 'Petto di pollo', amount: '600g' },
    { name: 'Latte di cocco', amount: '400ml' },
    { name: 'Citronella (steli)', amount: '2' },
    { name: 'Zenzero fresco', amount: '2cm' },
    { name: 'Aglio', amount: '2 spicchi' },
    { name: 'Peperoncino rosso', amount: '1' },
    { name: 'Salsa di pesce (o soia)', amount: '2 cucchiai' },
    { name: 'Lime', amount: '1' },
    { name: 'Riso jasmine', amount: '300g' },
    { name: 'Coriandolo fresco', amount: 'q.b.' },
  ],
  steps: [
    'Taglia il pollo a bocconcini e marinalo con salsa di pesce e succo di lime per 10 minuti.',
    'Prepara il riso jasmine seguendo le istruzioni della confezione.',
    'Scalda olio di cocco in un wok o padella capiente a fuoco medio-alto.',
    'Soffriggi aglio, zenzero tritato e citronella pestata per 2 minuti.',
    'Aggiungi il pollo e cuoci 4-5 minuti fino a doratura.',
    'Versa il latte di cocco e il peperoncino tagliato, porta a bollore e cuoci 12 minuti.',
    'Regola di sale e salsa di pesce. Servi sul riso con coriandolo fresco e spicchi di lime.',
  ],
};

const LOADING_MESSAGES = [
  'Claude sta pensando...',
  'Analizzo le tue preferenze...',
  'Bilancio ingredienti e sapori...',
  'Costruisco il procedimento...',
];

export default function AiRecipeScreen() {
  const router = useRouter();
  const addRecipe = useRecipesStore((s) => s.addRecipe);

  const [prompt, setPrompt] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [servings, setServings] = useState('4');
  const [state, setState] = useState<ScreenState>('input');
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [promptError, setPromptError] = useState('');

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setPromptError('Descrivi cosa vuoi cucinare');
      return;
    }
    setPromptError('');
    setState('loading');

    // Mock: cicla i messaggi di loading
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 700);

    await new Promise((r) => setTimeout(r, 2800));
    clearInterval(interval);
    setState('preview');
  };

  const handleRegenerate = async () => {
    setState('loading');
    setLoadingMsg(LOADING_MESSAGES[0]);
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 700);
    await new Promise((r) => setTimeout(r, 2000));
    clearInterval(interval);
    setState('preview');
  };

  const handleReset = () => {
    setState('input');
    setPrompt('');
    setSelectedTags([]);
    setServings('4');
  };

  const handleSave = () => {
    addRecipe({ ...MOCK_AI_RECIPE, servings: parseInt(servings, 10) || 4 });
    router.back();
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
            <Text variant="h3">Chiedi all'AI</Text>
            <Text variant="muted">Claude genera la ricetta per te</Text>
          </View>
        </View>

        <Separator />

        {/* Input state */}
        {state === 'input' && (
          <ScrollView
            contentContainerClassName="px-4 py-5 gap-5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Prompt */}
            <View className="gap-1.5">
              <Label nativeID="prompt">Cosa vuoi cucinare?</Label>
              <Input
                id="prompt"
                className="h-24 py-3"
                placeholder={
                  'Descrivi liberamente...\nEs. "qualcosa di leggero con il pesce" oppure "una pasta veloce con quello che ho in frigo"'
                }
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {promptError ? (
                <Text className="text-destructive text-xs">{promptError}</Text>
              ) : null}
            </View>

            {/* Tag filtri opzionali */}
            <View className="gap-2">
              <Label nativeID="filters">Preferenze (opzionale)</Label>
              <View className="flex-row flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    onPress={() => toggleTag(tag)}
                    className="rounded-full"
                  >
                    <Text className="capitalize">{tag}</Text>
                  </Button>
                ))}
              </View>
            </View>

            {/* Porzioni */}
            <View className="gap-1.5">
              <Label nativeID="srv">Porzioni</Label>
              <Input
                id="srv"
                placeholder="4"
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
                className="w-28"
              />
            </View>

            <Button onPress={handleGenerate} className="mt-2 flex-row gap-2">
              <Sparkles className="text-primary-foreground" size={16} />
              <Text>Genera con AI</Text>
            </Button>
          </ScrollView>
        )}

        {/* Loading state */}
        {state === 'loading' && (
          <View className="flex-1 items-center justify-center gap-6 px-8">
            <View className="w-24 h-24 rounded-3xl bg-primary/10 items-center justify-center">
              <ActivityIndicator size="large" color="hsl(142, 76%, 36%)" />
            </View>
            <View className="items-center gap-2">
              <Text className="text-base font-semibold">{loadingMsg}</Text>
              <Text className="text-sm text-muted-foreground text-center">
                Claude sta creando una ricetta personalizzata per te
              </Text>
            </View>
            {prompt.trim() ? (
              <Card className="w-full">
                <CardContent className="pt-3 pb-3">
                  <Text className="text-xs text-muted-foreground italic">"{prompt}"</Text>
                </CardContent>
              </Card>
            ) : null}
          </View>
        )}

        {/* Preview state */}
        {state === 'preview' && (
          <ScrollView
            contentContainerClassName="px-4 py-4 gap-4"
            showsVerticalScrollIndicator={false}
          >
            {/* AI badge */}
            <View className="flex-row items-center gap-3 bg-primary/10 rounded-xl px-4 py-3 border border-primary/20">
              <Wand2 className="text-primary" size={20} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary">Ricetta generata da Claude</Text>
                <Text className="text-xs text-muted-foreground">
                  Controlla e salva, oppure rigenera
                </Text>
              </View>
            </View>

            {/* Recipe preview */}
            <Card>
              <CardContent className="pt-4 gap-3">
                <Text className="text-lg font-bold">{MOCK_AI_RECIPE.name}</Text>
                <Text className="text-sm text-muted-foreground">{MOCK_AI_RECIPE.description}</Text>

                <View className="flex-row gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <Clock className="text-muted-foreground" size={13} />
                    <Text className="text-xs text-muted-foreground">{MOCK_AI_RECIPE.timeMinutes} min</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Users className="text-muted-foreground" size={13} />
                    <Text className="text-xs text-muted-foreground">
                      {parseInt(servings, 10) || 4} pers.
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-1.5">
                  {MOCK_AI_RECIPE.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Text className="capitalize">{tag}</Text>
                    </Badge>
                  ))}
                  {selectedTags
                    .filter((t) => !MOCK_AI_RECIPE.tags.includes(t))
                    .map((tag) => (
                      <Badge key={tag} variant="outline">
                        <Text className="capitalize">{tag}</Text>
                      </Badge>
                    ))}
                </View>

                <Separator />

                <Text className="text-sm font-semibold">
                  Ingredienti ({MOCK_AI_RECIPE.ingredients.length})
                </Text>
                {MOCK_AI_RECIPE.ingredients.map((ing, i) => (
                  <View key={i} className="flex-row justify-between">
                    <Text className="text-sm flex-1">{ing.name}</Text>
                    <Text className="text-sm text-muted-foreground">{ing.amount}</Text>
                  </View>
                ))}

                <Separator />

                <Text className="text-sm font-semibold">
                  Procedimento ({MOCK_AI_RECIPE.steps.length} passi)
                </Text>
                {MOCK_AI_RECIPE.steps.map((step, i) => (
                  <View key={i} className="flex-row gap-2">
                    <Text className="text-xs font-bold text-primary w-4">{i + 1}.</Text>
                    <Text className="text-sm text-muted-foreground flex-1">{step}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <Button onPress={handleSave}>
              <CheckCircle2 className="text-primary-foreground" size={16} />
              <Text>Salva ricetta</Text>
            </Button>
            <Button variant="outline" onPress={handleRegenerate} className="flex-row gap-2">
              <RotateCcw className="text-foreground" size={16} />
              <Text>Rigenera</Text>
            </Button>
            <Button variant="ghost" onPress={handleReset}>
              <Text>Ricomincia</Text>
            </Button>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
