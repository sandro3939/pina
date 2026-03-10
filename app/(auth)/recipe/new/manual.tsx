import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import { useRecipesStore } from '@/lib/stores/recipes-store';

const AVAILABLE_TAGS = ['veloce', 'vegetariano', 'vegano', 'proteico', 'leggero', 'comfort'];

interface Ingredient {
  name: string;
  amount: string;
}

export default function ManualRecipeScreen() {
  const router = useRouter();
  const addRecipe = useRecipesStore((s) => s.addRecipe);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [timeMinutes, setTimeMinutes] = useState('');
  const [servings, setServings] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [error, setError] = useState('');

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const addIngredient = () => setIngredients((p) => [...p, { name: '', amount: '' }]);
  const removeIngredient = (i: number) => setIngredients((p) => p.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: keyof Ingredient, val: string) =>
    setIngredients((p) => p.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)));

  const addStep = () => setSteps((p) => [...p, '']);
  const removeStep = (i: number) => setSteps((p) => p.filter((_, idx) => idx !== i));
  const updateStep = (i: number, val: string) =>
    setSteps((p) => p.map((s, idx) => (idx === i ? val : s)));

  const handleSave = () => {
    if (!name.trim()) {
      setError('Il nome della ricetta è obbligatorio');
      return;
    }
    setError('');
    addRecipe({
      name: name.trim(),
      description: description.trim(),
      tags: selectedTags,
      servings: parseInt(servings, 10) || 4,
      timeMinutes: parseInt(timeMinutes, 10) || 30,
      rating: 0,
      ingredients: ingredients.filter((i) => i.name.trim()),
      steps: steps.filter((s) => s.trim()),
    });
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
            <Text variant="h3">Nuova ricetta</Text>
          </View>
          <Button onPress={handleSave}>
            <Text>Salva</Text>
          </Button>
        </View>

        <Separator />

        <ScrollView
          contentContainerClassName="px-4 py-4 gap-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <Text className="text-destructive text-sm">{error}</Text>
          ) : null}

          {/* Nome */}
          <View className="gap-1.5">
            <Label nativeID="name">Nome ricetta *</Label>
            <Input
              id="name"
              placeholder="Es. Risotto ai funghi"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Descrizione */}
          <View className="gap-1.5">
            <Label nativeID="desc">Descrizione</Label>
            <Input
              id="desc"
              placeholder="Breve descrizione del piatto..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              className="h-20 py-2"
              textAlignVertical="top"
            />
          </View>

          {/* Tempo + Porzioni */}
          <View className="flex-row gap-3">
            <View className="flex-1 gap-1.5">
              <Label nativeID="time">Tempo (min)</Label>
              <Input
                id="time"
                placeholder="30"
                value={timeMinutes}
                onChangeText={setTimeMinutes}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1 gap-1.5">
              <Label nativeID="servings">Porzioni</Label>
              <Input
                id="servings"
                placeholder="4"
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Tag */}
          <View className="gap-2">
            <Label nativeID="tags">Tag</Label>
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

          <Separator />

          {/* Ingredienti */}
          <View className="gap-3">
            <Text className="text-base font-semibold">Ingredienti</Text>
            <Card>
              <CardContent className="pt-3 pb-2 gap-2">
                {ingredients.map((ing, i) => (
                  <View key={i} className="flex-row items-center gap-2">
                    <Input
                      className="flex-1"
                      placeholder="Ingrediente"
                      value={ing.name}
                      onChangeText={(v) => updateIngredient(i, 'name', v)}
                    />
                    <Input
                      className="w-24"
                      placeholder="Qtà"
                      value={ing.amount}
                      onChangeText={(v) => updateIngredient(i, 'amount', v)}
                    />
                    {ingredients.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onPress={() => removeIngredient(i)}
                        className="shrink-0"
                      >
                        <Trash2 className="text-muted-foreground" size={16} />
                      </Button>
                    )}
                  </View>
                ))}
              </CardContent>
            </Card>
            <Button variant="outline" onPress={addIngredient} className="flex-row gap-2">
              <Plus className="text-foreground" size={16} />
              <Text>Aggiungi ingrediente</Text>
            </Button>
          </View>

          <Separator />

          {/* Procedimento */}
          <View className="gap-3">
            <Text className="text-base font-semibold">Procedimento</Text>
            <View className="gap-3">
              {steps.map((step, i) => (
                <View key={i} className="flex-row items-start gap-3">
                  <View className="w-7 h-7 rounded-full bg-primary items-center justify-center shrink-0 mt-1.5">
                    <Text className="text-xs font-bold text-primary-foreground">{i + 1}</Text>
                  </View>
                  <Input
                    className="flex-1 h-16 py-2"
                    placeholder={`Passo ${i + 1}...`}
                    value={step}
                    onChangeText={(v) => updateStep(i, v)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  {steps.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onPress={() => removeStep(i)}
                      className="mt-1"
                    >
                      <Trash2 className="text-muted-foreground" size={16} />
                    </Button>
                  )}
                </View>
              ))}
            </View>
            <Button variant="outline" onPress={addStep} className="flex-row gap-2">
              <Plus className="text-foreground" size={16} />
              <Text>Aggiungi passo</Text>
            </Button>
          </View>

          <Button onPress={handleSave} className="mt-2">
            <Text>Salva ricetta</Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
