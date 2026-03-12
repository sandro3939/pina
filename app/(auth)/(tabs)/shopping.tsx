import { useState } from 'react';
import { View, ScrollView, Pressable, Modal, Animated, RefreshControl } from 'react-native';
import { useScreenEntrance } from '@/lib/hooks/useScreenEntrance';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {
  Check,
  RefreshCcw,
  ShoppingCart,
  Camera,
  Star,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import {
  useShoppingControllerGet,
  getShoppingControllerGetQueryKey,
  useShoppingControllerToggleItem,
  useShoppingControllerReset,
  useShoppingControllerToggleFavCart,
  useShoppingControllerToggleFavChecked,
} from '@/lib/api/endpoints/shopping/shopping';
import {
  useFavoritesControllerGetAll,
  useFavoritesControllerCreate,
  useFavoritesControllerRemove,
  getFavoritesControllerGetAllQueryKey,
} from '@/lib/api/endpoints/favorites/favorites';
import { usePantryControllerGetAll } from '@/lib/api/endpoints/pantry/pantry';

function getWeekStart(offset: number): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekKey(offset: number): string {
  const monday = getWeekStart(offset);
  const year = getISOWeekYear(monday);
  const week = getISOWeek(monday);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export default function ShoppingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const weekKey = getWeekKey(0);
  const entrance = useScreenEntrance();

  const [favExpanded, setFavExpanded] = useState(true);
  const [addFavModal, setAddFavModal] = useState(false);
  const [newFavName, setNewFavName] = useState('');
  const [newFavQty, setNewFavQty] = useState('');

  const { data: shoppingData, refetch: refetchShopping } = useShoppingControllerGet(weekKey, {
    query: { refetchInterval: 4000 },
  });
  const { data: allFavorites = [], refetch: refetchFavorites } = useFavoritesControllerGetAll();
  const { data: pantryItems = [], refetch: refetchPantry } = usePantryControllerGetAll();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchShopping(), refetchFavorites(), refetchPantry()]);
    setIsRefreshing(false);
  };

  const items = shoppingData?.items ?? [];
  const favCart = shoppingData?.favCart ?? [];
  const shoppingCategories = [...new Set(items.map((i) => i.category))].sort();

  const toggleItem = useShoppingControllerToggleItem({
    mutation: {
      onMutate: async ({ data }) => {
        await queryClient.cancelQueries({ queryKey: getShoppingControllerGetQueryKey(weekKey) });
        const previous = queryClient.getQueryData(getShoppingControllerGetQueryKey(weekKey));
        queryClient.setQueryData(getShoppingControllerGetQueryKey(weekKey), (old: typeof shoppingData) => {
          if (!old) return old;
          return { ...old, items: old.items.map((i) => i.id === data.itemId ? { ...i, checked: data.checked } : i) };
        });
        return { previous };
      },
      onSuccess: (updated) => {
        queryClient.setQueryData(getShoppingControllerGetQueryKey(weekKey), updated);
      },
      onError: (_err, _vars, context: any) => {
        queryClient.setQueryData(getShoppingControllerGetQueryKey(weekKey), context?.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getShoppingControllerGetQueryKey(weekKey) });
      },
    },
  });

  const resetMutation = useShoppingControllerReset({
    mutation: {
      onSuccess: (updated) => {
        queryClient.setQueryData(getShoppingControllerGetQueryKey(weekKey), updated);
      },
    },
  });

  const toggleFavCart = useShoppingControllerToggleFavCart({
    mutation: {
      onMutate: async ({ data }) => {
        await queryClient.cancelQueries({ queryKey: getShoppingControllerGetQueryKey(weekKey) });
        const previous = queryClient.getQueryData(getShoppingControllerGetQueryKey(weekKey));
        queryClient.setQueryData(getShoppingControllerGetQueryKey(weekKey), (old: typeof shoppingData) => {
          if (!old) return old;
          if (data.inCart) {
            return { ...old, favCart: [...old.favCart, { favId: data.favId, checked: false }] };
          }
          return { ...old, favCart: old.favCart.filter((f) => f.favId !== data.favId) };
        });
        return { previous };
      },
      onSuccess: (updated) => {
        queryClient.setQueryData(getShoppingControllerGetQueryKey(weekKey), updated);
      },
      onError: (_err, _vars, context: any) => {
        queryClient.setQueryData(getShoppingControllerGetQueryKey(weekKey), context?.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getShoppingControllerGetQueryKey(weekKey) });
      },
    },
  });

  const toggleFavChecked = useShoppingControllerToggleFavChecked({
    mutation: {
      onMutate: async ({ data }) => {
        await queryClient.cancelQueries({ queryKey: getShoppingControllerGetQueryKey(weekKey) });
        const previous = queryClient.getQueryData(getShoppingControllerGetQueryKey(weekKey));
        queryClient.setQueryData(getShoppingControllerGetQueryKey(weekKey), (old: typeof shoppingData) => {
          if (!old) return old;
          return { ...old, favCart: old.favCart.map((f) => f.favId === data.favId ? { ...f, checked: data.checked } : f) };
        });
        return { previous };
      },
      onSuccess: (updated) => {
        queryClient.setQueryData(getShoppingControllerGetQueryKey(weekKey), updated);
      },
      onError: (_err, _vars, context: any) => {
        queryClient.setQueryData(getShoppingControllerGetQueryKey(weekKey), context?.previous);
      },
    },
  });

  const createFavorite = useFavoritesControllerCreate({
    mutation: {
      onMutate: async ({ data }) => {
        await queryClient.cancelQueries({ queryKey: getFavoritesControllerGetAllQueryKey() });
        const previous = queryClient.getQueryData(getFavoritesControllerGetAllQueryKey());
        queryClient.setQueryData(getFavoritesControllerGetAllQueryKey(), (old: any[]) => [
          ...(old ?? []),
          { favId: `temp-${Date.now()}`, name: data.name, defaultQty: data.defaultQty ?? '1 pz', category: data.category ?? 'Snack' },
        ]);
        return { previous };
      },
      onError: (_err, _vars, context: any) => {
        queryClient.setQueryData(getFavoritesControllerGetAllQueryKey(), context?.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getFavoritesControllerGetAllQueryKey() });
      },
    },
  });

  const removeFavorite = useFavoritesControllerRemove({
    mutation: {
      onMutate: async ({ favId }) => {
        await queryClient.cancelQueries({ queryKey: getFavoritesControllerGetAllQueryKey() });
        const previous = queryClient.getQueryData(getFavoritesControllerGetAllQueryKey());
        queryClient.setQueryData(getFavoritesControllerGetAllQueryKey(), (old: any[]) =>
          (old ?? []).filter((f) => f.favId !== favId),
        );
        return { previous };
      },
      onError: (_err, _vars, context: any) => {
        queryClient.setQueryData(getFavoritesControllerGetAllQueryKey(), context?.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getFavoritesControllerGetAllQueryKey() });
      },
    },
  });

  const isInPantry = (shopName: string): boolean => {
    const sn = shopName.toLowerCase();
    return pantryItems.some(
      (p) => p.inStock && (sn.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(sn)),
    );
  };

  // Build favCart lookup maps
  const inCartMap = Object.fromEntries(favCart.map((e) => [e.favId, true]));
  const favCheckedMap = Object.fromEntries(favCart.map((e) => [e.favId, e.checked]));

  const activeItems = items.filter((i) => !i.checked && !isInPantry(i.name));
  const doneItems = items.filter((i) => i.checked || isInPantry(i.name));

  const cartFavorites = allFavorites.filter((f) => inCartMap[f.favId]);
  const cartFavDone = cartFavorites.filter((f) => favCheckedMap[f.favId]);

  const totalItems = items.length + cartFavorites.length;
  const totalDone = doneItems.length + cartFavDone.length;
  const pendingCount = activeItems.length + (cartFavorites.length - cartFavDone.length);

  const handleAddFavorite = () => {
    if (!newFavName.trim()) return;
    createFavorite.mutate({
      data: { name: newFavName.trim(), defaultQty: newFavQty.trim() || '1 pz', category: 'Snack' },
    });
    // Also add to cart for this week
    // After favorite is created, we'd need to toggle it into cart.
    // For simplicity, create the favorite and let user toggle it.
    setNewFavName('');
    setNewFavQty('');
    setAddFavModal(false);
  };

  return (
    <Animated.View style={entrance.style}>
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
        <View>
          <Text variant="h3">Lista spesa</Text>
          <Text variant="muted">{pendingCount} articoli da acquistare</Text>
        </View>
        <View className="flex-row gap-2">
          <Button
            size="icon"
            variant="outline"
            onPress={() => resetMutation.mutate({ weekKey })}
          >
            <RefreshCcw className="text-foreground" size={18} />
          </Button>
        </View>
      </View>

      {/* Progress bar */}
      <View className="mx-4 mb-3 h-1.5 bg-muted rounded-full overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${totalItems > 0 ? (totalDone / totalItems) * 100 : 0}%` }}
        />
      </View>

      {/* Banner "Ho fatto la spesa" */}
      <Pressable
        onPress={() => router.push('/(auth)/receipt-scan')}
        className="mx-4 mb-3 flex-row items-center gap-3 bg-primary/10 rounded-xl px-4 py-3 border border-primary/20 active:opacity-80"
      >
        <View className="w-9 h-9 rounded-lg bg-primary/20 items-center justify-center">
          <Camera className="text-primary" size={18} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-primary">Hai fatto la spesa?</Text>
          <Text className="text-xs text-muted-foreground">
            Scansiona lo scontrino per aggiornare la dispensa
          </Text>
        </View>
      </Pressable>

      <Separator />

      <ScrollView contentContainerClassName="pb-6" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        {/* ── Lista da ricette ──────────────────────────────────── */}
        {shoppingCategories.map((category) => {
          const catItems = items.filter((i) => i.category === category);
          if (catItems.length === 0) return null;

          const catDone = catItems.filter((i) => i.checked || isInPantry(i.name));

          return (
            <View key={category}>
              <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {category}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {catDone.length}/{catItems.length}
                </Text>
              </View>

              <View className="mx-4 rounded-xl border border-border bg-card overflow-hidden">
                {catItems.map((item, idx) => {
                  const inPantry = isInPantry(item.name);
                  const isDone = item.checked || inPantry;

                  return (
                    <View key={item.id}>
                      <Pressable
                        onPress={() =>
                          !inPantry &&
                          toggleItem.mutate({
                            weekKey,
                            data: { itemId: item.id, checked: !item.checked },
                          })
                        }
                        className={cn(
                          'flex-row items-center gap-3 px-4 py-3.5',
                          isDone ? 'opacity-50' : 'active:bg-muted/50',
                        )}
                      >
                        <View
                          className={cn(
                            'w-5 h-5 rounded-md border-2 items-center justify-center shrink-0',
                            isDone ? 'bg-primary border-primary' : 'border-border bg-background',
                          )}
                        >
                          {isDone && <Check className="text-primary-foreground" size={12} />}
                        </View>
                        <Text
                          className={cn(
                            'flex-1 text-sm',
                            isDone && 'line-through text-muted-foreground',
                          )}
                        >
                          {item.name}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          {inPantry && (
                            <Badge variant="secondary">
                              <Text className="text-[10px]">dispensa</Text>
                            </Badge>
                          )}
                          <View className="flex-row items-center gap-1">
                            <Text className="text-xs text-muted-foreground">{item.qty}</Text>
                            {item.count > 1 && (
                              <Text className="text-xs font-semibold text-primary">×{item.count}</Text>
                            )}
                          </View>
                        </View>
                      </Pressable>
                      {idx < catItems.length - 1 && <Separator className="ml-12" />}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Empty state */}
        {activeItems.length === 0 && cartFavorites.length === 0 && items.length === 0 && (
          <View className="mx-4 mt-6 items-center gap-2 p-6 rounded-xl bg-primary/10 border border-primary/20">
            <ShoppingCart className="text-primary" size={32} />
            <Text className="font-semibold text-primary">Lista vuota</Text>
            <Text className="text-sm text-muted-foreground text-center">
              Pianifica la settimana per generare la lista spesa.
            </Text>
          </View>
        )}

        {activeItems.length === 0 && cartFavorites.length > 0 && doneItems.length === items.length && (
          <View className="mx-4 mt-6 items-center gap-2 p-6 rounded-xl bg-primary/10 border border-primary/20">
            <ShoppingCart className="text-primary" size={32} />
            <Text className="font-semibold text-primary">Spesa completata!</Text>
            <Text className="text-sm text-muted-foreground text-center">
              Tutti gli articoli sono acquistati o già in dispensa.
            </Text>
          </View>
        )}

        {/* ── Preferiti & Snack ─────────────────────────────────── */}
        <View className="mt-6 mx-4">
          {/* Header sezione */}
          <Pressable
            onPress={() => setFavExpanded((v) => !v)}
            className="flex-row items-center justify-between pb-2 active:opacity-70"
          >
            <View className="flex-row items-center gap-2">
              <Star className="text-primary" size={14} />
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Preferiti & Snack
              </Text>
              {cartFavorites.length > 0 && (
                <Badge variant="secondary">
                  <Text className="text-[10px]">
                    {cartFavDone.length}/{cartFavorites.length}
                  </Text>
                </Badge>
              )}
            </View>
            <View className="flex-row items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onPress={() => setAddFavModal(true)}
              >
                <Plus className="text-primary" size={13} />
                <Text className="text-xs text-primary ml-1">Aggiungi</Text>
              </Button>
              {favExpanded ? (
                <ChevronUp className="text-muted-foreground" size={16} />
              ) : (
                <ChevronDown className="text-muted-foreground" size={16} />
              )}
            </View>
          </Pressable>

          {favExpanded && (
            <View className="rounded-xl border border-border bg-card overflow-hidden">
              {allFavorites.length === 0 ? (
                <View className="items-center py-8 gap-2 px-4">
                  <Star className="text-muted-foreground/40" size={28} />
                  <Text className="text-sm text-muted-foreground text-center">
                    Nessun preferito ancora.{'\n'}Aggiungi snack e prodotti ricorrenti.
                  </Text>
                </View>
              ) : (
                allFavorites.map((fav, idx) => {
                  const isInCartFav = !!inCartMap[fav.favId];
                  const isCheckedFav = !!favCheckedMap[fav.favId];

                  return (
                    <View key={fav.favId}>
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
                              onPress={() => removeFavorite.mutate({ favId: fav.favId })}
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
                        <View
                          className={cn(
                            'flex-row items-center gap-3 px-4 py-3.5 bg-card',
                            isCheckedFav && 'opacity-50',
                          )}
                        >
                          {/* Checkbox — attivo solo se in cart */}
                          <Pressable
                            onPress={() =>
                              isInCartFav &&
                              toggleFavChecked.mutate({
                                weekKey,
                                data: { favId: fav.favId, checked: !isCheckedFav },
                              })
                            }
                            disabled={!isInCartFav}
                          >
                            <View
                              className={cn(
                                'w-5 h-5 rounded-md border-2 items-center justify-center shrink-0',
                                isCheckedFav
                                  ? 'bg-primary border-primary'
                                  : isInCartFav
                                    ? 'border-border bg-background'
                                    : 'border-muted-foreground/20 bg-muted/30',
                              )}
                            >
                              {isCheckedFav && (
                                <Check className="text-primary-foreground" size={12} />
                              )}
                            </View>
                          </Pressable>

                          {/* Nome */}
                          <Text
                            className={cn(
                              'flex-1 text-sm',
                              isCheckedFav && 'line-through text-muted-foreground',
                              !isInCartFav && 'text-muted-foreground',
                            )}
                          >
                            {fav.name}
                          </Text>

                          {/* Quantità */}
                          <Text className="text-xs text-muted-foreground mr-2">{fav.defaultQty}</Text>

                          {/* Toggle in/out cart */}
                          <Button
                            size="icon"
                            variant={isInCartFav ? 'default' : 'outline'}
                            onPress={() =>
                              toggleFavCart.mutate({
                                weekKey,
                                data: { favId: fav.favId, inCart: !isInCartFav },
                              })
                            }
                            className="w-7 h-7 rounded-full"
                          >
                            {isInCartFav ? (
                              <X className="text-primary-foreground" size={12} />
                            ) : (
                              <Plus className="text-foreground" size={12} />
                            )}
                          </Button>
                        </View>
                      </Swipeable>
                      {idx < allFavorites.length - 1 && <Separator className="ml-12" />}
                    </View>
                  );
                })
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Modal Nuovo Preferito ──────────────────────────────── */}
      <Modal visible={addFavModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center gap-3 px-4 pt-4 pb-3">
            <Button size="icon" variant="ghost" onPress={() => setAddFavModal(false)}>
              <X className="text-foreground" size={20} />
            </Button>
            <Text variant="h3">Nuovo preferito</Text>
          </View>
          <Separator />
          <View className="px-4 py-5 gap-5">
            <View className="gap-2">
              <Text className="text-sm font-medium">Nome</Text>
              <Input
                placeholder="es. Yogurt greco"
                value={newFavName}
                onChangeText={setNewFavName}
                autoFocus
              />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium">Quantità</Text>
              <Input
                placeholder="es. 4 pz"
                value={newFavQty}
                onChangeText={setNewFavQty}
              />
            </View>
            <View className="bg-muted/50 rounded-xl p-4">
              <Text className="text-xs text-muted-foreground">
                Verrà salvato tra i preferiti e potrai aggiungerlo alla spesa settimanale.
              </Text>
            </View>
            <Button onPress={handleAddFavorite} disabled={!newFavName.trim()}>
              <Text>Salva preferito</Text>
            </Button>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    </Animated.View>
  );
}
