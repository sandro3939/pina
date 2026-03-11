import { useState } from 'react';
import { View, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Camera, Plus, Trash2, X } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  usePantryControllerGetAll,
  getPantryControllerGetAllQueryKey,
  usePantryControllerToggleStock,
  usePantryControllerCreate,
  usePantryControllerRemove,
} from '@/lib/api/endpoints/pantry/pantry';

export default function PantryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');

  const { data: items = [], isLoading } = usePantryControllerGetAll();

  const toggleStock = usePantryControllerToggleStock({
    mutation: {
      onMutate: async ({ itemId, data }) => {
        await queryClient.cancelQueries({ queryKey: getPantryControllerGetAllQueryKey() });
        const previous = queryClient.getQueryData(getPantryControllerGetAllQueryKey());
        queryClient.setQueryData(
          getPantryControllerGetAllQueryKey(),
          (old: typeof items) => old.map((i) => i.itemId === itemId ? { ...i, inStock: data.inStock } : i),
        );
        return { previous };
      },
      onSuccess: (updated) => {
        queryClient.setQueryData(
          getPantryControllerGetAllQueryKey(),
          (old: typeof items) => old.map((i) => i.itemId === updated.itemId ? updated : i),
        );
      },
      onError: (_err, _vars, context: any) => {
        queryClient.setQueryData(getPantryControllerGetAllQueryKey(), context?.previous);
      },
    },
  });

  const createItem = usePantryControllerCreate({
    mutation: {
      onSuccess: (created) => {
        queryClient.setQueryData(
          getPantryControllerGetAllQueryKey(),
          (old: typeof items) => [...old, created],
        );
        setNewName('');
        setAddModal(false);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Errore durante il salvataggio';
        setAddError(typeof msg === 'string' ? msg : 'Errore');
      },
    },
  });

  const removeItem = usePantryControllerRemove({
    mutation: {
      onSuccess: (_data, { itemId }) => {
        queryClient.setQueryData(
          getPantryControllerGetAllQueryKey(),
          (old: typeof items) => old.filter((i) => i.itemId !== itemId),
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

  const handleAdd = () => {
    if (!newName.trim()) {
      setAddError('Inserisci il nome dell\'ingrediente');
      return;
    }
    setAddError('');
    createItem.mutate({ data: { name: newName.trim() } });
  };

  const renderRow = (item: typeof items[0], idx: number, total: number) => (
    <View key={item.itemId}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="flex-1 text-sm">{item.name}</Text>
        <View className="flex-row items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="w-8 h-8">
                <Trash2 className="text-muted-foreground/50" size={15} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Rimuovi dalla dispensa</AlertDialogTitle>
                <AlertDialogDescription>
                  Vuoi rimuovere "{item.name}" dalla dispensa?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="outline"><Text>Annulla</Text></Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" onPress={() => removeItem.mutate({ itemId: item.itemId })}>
                    <Text>Rimuovi</Text>
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Switch
            checked={item.inStock}
            onCheckedChange={() => handleToggle(item.itemId, item.inStock)}
          />
        </View>
      </View>
      {idx < total - 1 && <Separator className="ml-4" />}
    </View>
  );

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
        <View className="flex-row gap-2">
          <Button size="icon" variant="outline" onPress={() => router.push('/(auth)/receipt-scan')}>
            <Camera className="text-foreground" size={20} />
          </Button>
          <Button size="icon" onPress={() => { setNewName(''); setAddError(''); setAddModal(true); }}>
            <Plus className="text-primary-foreground" size={20} />
          </Button>
        </View>
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
          <View className="items-center py-16 gap-3">
            <Text variant="muted">Nessun articolo in dispensa</Text>
            <Button variant="outline" onPress={() => setAddModal(true)}>
              <Plus className="text-foreground" size={16} />
              <Text>Aggiungi il primo ingrediente</Text>
            </Button>
          </View>
        ) : search.trim() ? (
          <View className="mx-4 mt-4 rounded-xl border border-border bg-card overflow-hidden">
            {filtered.length === 0 ? (
              <View className="items-center py-10">
                <Text variant="muted">Nessun risultato</Text>
              </View>
            ) : (
              filtered.map((item, idx) => renderRow(item, idx, filtered.length))
            )}
          </View>
        ) : (
          categories.map((category) => {
            const categoryItems = items.filter((i) => i.category === category);
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
                  {categoryItems.map((item, idx) => renderRow(item, idx, categoryItems.length))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── Modal Aggiungi ─────────────────────────────────────── */}
      <Modal visible={addModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center gap-3 px-4 pt-4 pb-3">
            <Button size="icon" variant="ghost" onPress={() => setAddModal(false)}>
              <X className="text-foreground" size={20} />
            </Button>
            <Text variant="h3">Aggiungi ingrediente</Text>
          </View>
          <Separator />
          <View className="px-4 py-5 gap-5">
            <View className="gap-1.5">
              <Label nativeID="name">Nome ingrediente</Label>
              <Input
                id="name"
                placeholder="Es. Parmigiano, Pasta, Pomodori..."
                value={newName}
                onChangeText={(v) => { setNewName(v); setAddError(''); }}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
              {addError ? (
                <Text className="text-destructive text-xs">{addError}</Text>
              ) : null}
            </View>
            <View className="bg-muted/50 rounded-xl p-4">
              <Text className="text-xs text-muted-foreground">
                La categoria viene assegnata automaticamente in base al nome.
              </Text>
            </View>
            <Button onPress={handleAdd} disabled={createItem.isPending || !newName.trim()}>
              <Text>{createItem.isPending ? 'Salvataggio...' : 'Aggiungi'}</Text>
            </Button>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
