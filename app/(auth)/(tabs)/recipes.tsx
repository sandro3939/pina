import { useState } from 'react';
import { View, ScrollView, Pressable, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Clock, Users, X, FileEdit, Globe, Wand2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useRecipesControllerFindAll } from '@/lib/api/endpoints/recipes/recipes';

const ALL_TAGS = ['tutti', 'veloce', 'vegetariano', 'vegano', 'proteico', 'leggero', 'comfort'];

interface AddOption {
  id: 'manual' | 'url' | 'ai';
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  comingSoon?: boolean;
}

export default function RecipesScreen() {
  const router = useRouter();
  const { data: recipes = [], isLoading } = useRecipesControllerFindAll();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('tutti');
  const [addModalVisible, setAddModalVisible] = useState(false);

  const filtered = recipes.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag === 'tutti' || r.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const options: AddOption[] = [
    {
      id: 'manual',
      label: 'Inserimento manuale',
      description: 'Compila tu tutti i campi della ricetta',
      icon: <FileEdit className="text-primary" size={22} />,
      route: '/(auth)/recipe/new/manual',
    },
    {
      id: 'url',
      label: 'Importa da link',
      description: 'Incolla un URL e estraiamo la ricetta in automatico',
      icon: <Globe className="text-primary" size={22} />,
      route: '/(auth)/recipe/new/url',
    },
    {
      id: 'ai',
      label: "Chiedi all'AI",
      description: 'Descrivi cosa vuoi cucinare, ci pensa Claude',
      icon: <Wand2 className="text-muted-foreground" size={22} />,
      route: '/(auth)/recipe/new/ai',
      comingSoon: true,
    },
  ];

  const handleOption = (route: string) => {
    setAddModalVisible(false);
    setTimeout(() => router.push(route as any), 100);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
        <View>
          <Text variant="h3">Ricette</Text>
          <Text variant="muted">{recipes.length} ricette salvate</Text>
        </View>
        <Button size="icon" onPress={() => setAddModalVisible(true)}>
          <Plus className="text-primary-foreground" size={20} />
        </Button>
      </View>

      {/* Search */}
      <View className="px-4 pb-3">
        <View className="flex-row items-center gap-2 bg-muted rounded-xl px-3 h-12">
          <Search className="text-muted-foreground" size={16} />
          <Input
            className="flex-1 border-0 bg-transparent px-0 h-full"
            placeholder="Cerca ricette..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Tag filter */}
      <View className="pb-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-2"
        >
          {ALL_TAGS.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? 'default' : 'outline'}
              size="sm"
              onPress={() => setActiveTag(tag)}
              className="rounded-full"
            >
              <Text className="capitalize">{tag}</Text>
            </Button>
          ))}
        </ScrollView>
      </View>

      <Separator />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pt-3 pb-6 gap-3"
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View className="items-center py-16 gap-3">
              <Text variant="muted">Nessuna ricetta trovata</Text>
              <Button variant="outline" onPress={() => setAddModalVisible(true)}>
                <Plus className="text-foreground" size={16} />
                <Text>Aggiungi ricetta</Text>
              </Button>
            </View>
          ) : (
            filtered.map((recipe) => (
              <Pressable
                key={recipe.recipeId}
                onPress={() =>
                  router.push({ pathname: '/(auth)/recipe/[id]', params: { id: recipe.recipeId } })
                }
                className="active:opacity-80"
              >
                <Card>
                  <CardContent className="pt-4">
                    <View className="flex-row items-start justify-between gap-2">
                      <Text className="text-base font-semibold flex-1" numberOfLines={1}>
                        {recipe.name}
                      </Text>
                      <View className="flex-row shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Text key={i} className={i < (recipe.rating ?? 0) ? 'text-sm text-primary' : 'text-sm text-muted-foreground/25'}>
                            ★
                          </Text>
                        ))}
                      </View>
                    </View>

                    {recipe.description ? (
                      <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
                        {recipe.description}
                      </Text>
                    ) : null}

                    <View className="flex-row items-center gap-4 mt-3">
                      <View className="flex-row items-center gap-1.5">
                        <Clock className="text-muted-foreground" size={13} />
                        <Text className="text-xs text-muted-foreground">{recipe.timeMinutes} min</Text>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <Users className="text-muted-foreground" size={13} />
                        <Text className="text-xs text-muted-foreground">{recipe.servings} pers.</Text>
                      </View>
                    </View>

                    {recipe.tags.length > 0 && (
                      <View className="flex-row flex-wrap gap-1.5 mt-2.5">
                        {recipe.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            <Text className="capitalize">{tag}</Text>
                          </Badge>
                        ))}
                      </View>
                    )}
                  </CardContent>
                </Card>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}

      {/* ── Add Option Modal ──────────────────────────────────── */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-background">
          {/* Handle */}
          <View className="items-center pt-2 pb-1">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text variant="h3">Aggiungi ricetta</Text>
            <Button size="icon" variant="ghost" onPress={() => setAddModalVisible(false)}>
              <X className="text-foreground" size={20} />
            </Button>
          </View>

          <Text className="px-4 pb-4 text-muted-foreground text-sm">
            Come vuoi aggiungere la ricetta?
          </Text>

          <View className="px-4 gap-3">
            {options.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => !opt.comingSoon && handleOption(opt.route)}
                className={opt.comingSoon ? 'opacity-50' : 'active:opacity-80'}
              >
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <View className="flex-row items-center gap-4">
                      <View className={`w-12 h-12 rounded-xl items-center justify-center shrink-0 ${opt.comingSoon ? 'bg-muted' : 'bg-primary/10'}`}>
                        {opt.icon}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-sm font-semibold">{opt.label}</Text>
                          {opt.comingSoon && (
                            <Badge variant="secondary">
                              <Text className="text-[10px]">Prossimamente</Text>
                            </Badge>
                          )}
                        </View>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                          {opt.description}
                        </Text>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
