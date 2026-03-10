import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Search, Camera } from 'lucide-react-native';
import { usePantryStore } from '@/lib/stores/pantry-store';

export default function PantryScreen() {
  const { items, categories, toggle } = usePantryStore();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const hasCount = items.filter((i) => i.hasIt).length;

  const filtered = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

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
        {search.trim() ? (
          <View className="mx-4 mt-4 rounded-xl border border-border bg-card overflow-hidden">
            {filtered.length === 0 ? (
              <View className="items-center py-10">
                <Text variant="muted">Nessun risultato</Text>
              </View>
            ) : (
              filtered.map((item, idx) => (
                <View key={item.id}>
                  <View className="flex-row items-center justify-between px-4 py-3.5">
                    <Text className="flex-1 text-sm">{item.name}</Text>
                    <Switch checked={item.hasIt} onCheckedChange={() => toggle(item.id)} />
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
            const catHas = categoryItems.filter((i) => i.hasIt).length;

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
                    <View key={item.id}>
                      <View className="flex-row items-center justify-between px-4 py-3.5">
                        <Text className="flex-1 text-sm">{item.name}</Text>
                        <Switch
                          checked={item.hasIt}
                          onCheckedChange={() => toggle(item.id)}
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
