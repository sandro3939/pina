import { useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Search, Camera } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  usePantryControllerGetAll,
  getPantryControllerGetAllQueryKey,
} from '@/lib/api/endpoints/pantry/pantry';
import { usePantryControllerToggleStock } from '@/lib/api/endpoints/pantry/pantry';

export default function PantryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: items = [], isLoading } = usePantryControllerGetAll();

  const toggleStock = usePantryControllerToggleStock({
    mutation: {
      onSuccess: (updated) => {
        queryClient.setQueryData(
          getPantryControllerGetAllQueryKey(),
          (old: typeof items) =>
            old.map((i) => (i.itemId === updated.itemId ? updated : i)),
        );
      },
    },
  });

  const categories = [...new Set(items.map((i) => i.category))].sort();
  const hasCount = items.filter((i) => i.inStock).length;

  const filtered = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  const handleToggle = (itemId: string, currentInStock: boolean) => {
    toggleStock.mutate({ itemId, data: { inStock: !currentInStock } });
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
        <View>
          <Text variant="h3">Dispensa</Text>
          <Text variant="muted">
            {hasCount}/{items.length} ingredienti disponibili
          </Text>
        </View>
        <Button
          size="icon"
          variant="outline"
          onPress={() => router.push('/(auth)/receipt-scan')}
        >
          <Camera className="text-foreground" size={20} />
        </Button>
      </View>

      {/* Search */}
      <View className="px-4 pb-3">
        <View className="flex-row items-center gap-2 bg-muted rounded-xl px-3 h-12">
          <Search className="text-muted-foreground" size={16} />
          <Input
            className="flex-1 border-0 bg-transparent px-0 h-full"
            placeholder="Cerca ingrediente..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <Separator />

      <ScrollView contentContainerClassName="pb-6" showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View className="items-center py-16">
            <Text variant="muted">Nessun articolo in dispensa</Text>
          </View>
        ) : search.trim() ? (
          <View className="mx-4 mt-4 rounded-xl border border-border bg-card overflow-hidden">
            {filtered.length === 0 ? (
              <View className="items-center py-10">
                <Text variant="muted">Nessun risultato</Text>
              </View>
            ) : (
              filtered.map((item, idx) => (
                <View key={item.itemId}>
                  <View className="flex-row items-center justify-between px-4 py-3.5">
                    <Text className="flex-1 text-sm">{item.name}</Text>
                    <Switch
                      checked={item.inStock}
                      onCheckedChange={() => handleToggle(item.itemId, item.inStock)}
                    />
                  </View>
                  {idx < filtered.length - 1 && <Separator className="ml-4" />}
                </View>
              ))
            )}
          </View>
        ) : (
          categories.map((category) => {
            const categoryItems = filtered.filter((i) => i.category === category);
            if (categoryItems.length === 0) return null;
            const catHas = categoryItems.filter((i) => i.inStock).length;

            return (
              <View key={category}>
                <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {category}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {catHas}/{categoryItems.length}
                  </Text>
                </View>
                <View className="mx-4 rounded-xl border border-border bg-card overflow-hidden">
                  {categoryItems.map((item, idx) => (
                    <View key={item.itemId}>
                      <View className="flex-row items-center justify-between px-4 py-3.5">
                        <Text className="flex-1 text-sm">{item.name}</Text>
                        <Switch
                          checked={item.inStock}
                          onCheckedChange={() => handleToggle(item.itemId, item.inStock)}
                        />
                      </View>
                      {idx < categoryItems.length - 1 && <Separator className="ml-4" />}
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
