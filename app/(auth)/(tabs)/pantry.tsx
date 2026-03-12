import { useState } from 'react';
import { View, ScrollView, ActivityIndicator, Modal, Animated, Pressable, RefreshControl } from 'react-native';
import { useScreenEntrance } from '@/lib/hooks/useScreenEntrance';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Search, Camera, Plus, X, Trash2, LogOut } from 'lucide-react-native';
import { useAuth } from '@/lib/contexts/AuthContext';
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
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(public)/login');
  };
  const entrance = useScreenEntrance();
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');

  const { data: items = [], isLoading, refetch } = usePantryControllerGetAll();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

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
      <Swipeable
        renderRightActions={(progress) => {
          const scale = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
            extrapolate: 'clamp',
          });
          const opacity = progress.interpolate({
            inputRange: [0, 0.6, 1],
            outputRange: [0, 0.7, 1],
            extrapolate: 'clamp',
          });
          return (
            <Pressable
              onPress={() => removeItem.mutate({ itemId: item.itemId })}
              className="bg-destructive items-center justify-center w-20 active:opacity-80"
            >
              <Animated.View style={{ opacity, transform: [{ scale }] }}>
                <Trash2 size={18} color="white" />
              </Animated.View>
            </Pressable>
          );
        }}
        overshootRight={false}
      >
        <View className="flex-row items-center justify-between px-4 py-3 bg-card">
          <Text className="flex-1 text-sm">{item.name}</Text>
          <Switch
            checked={item.inStock}
            onCheckedChange={() => handleToggle(item.itemId, item.inStock)}
          />
        </View>
      </Swipeable>
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
    <Animated.View style={entrance.style}>
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <LogOut className="text-muted-foreground" size={18} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Esci dall'account</AlertDialogTitle>
                <AlertDialogDescription>
                  Vuoi uscire dall'account?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="outline"><Text>Annulla</Text></Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" onPress={handleLogout}><Text>Esci</Text></Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

      <ScrollView contentContainerClassName="pb-6" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
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
    </Animated.View>
  );
}
