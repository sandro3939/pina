import { useState } from 'react';
import { View, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { useShoppingStore } from '@/lib/stores/shopping-store';
import { usePantryStore } from '@/lib/stores/pantry-store';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { SHOPPING_CATEGORIES } from '@/lib/data/mock';

export default function ShoppingScreen() {
  const router = useRouter();
  const { items, checked: shoppingChecked, toggle, reset } = useShoppingStore();
  const pantryItems = usePantryStore((s) => s.items);
  const {
    favorites,
    inCart,
    checked: favChecked,
    toggleInCart,
    toggleChecked: toggleFavChecked,
    addFavorite,
  } = useFavoritesStore();

  const [favExpanded, setFavExpanded] = useState(true);
  const [addFavModal, setAddFavModal] = useState(false);
  const [newFavName, setNewFavName] = useState('');
  const [newFavQty, setNewFavQty] = useState('');

  const isInPantry = (shopName: string): boolean => {
    const sn = shopName.toLowerCase();
    return pantryItems.some(
      (p) => p.hasIt && (sn.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(sn)),
    );
  };

  const activeItems = items.filter((i) => !shoppingChecked[i.id] && !isInPantry(i.name));
  const doneItems = items.filter((i) => shoppingChecked[i.id] || isInPantry(i.name));

  const cartFavorites = favorites.filter((f) => inCart[f.id]);
  const cartFavDone = cartFavorites.filter((f) => favChecked[f.id]);

  const totalItems = items.length + cartFavorites.length;
  const totalDone = doneItems.length + cartFavDone.length;
  const pendingCount = activeItems.length + (cartFavorites.length - cartFavDone.length);

  const handleAddFavorite = () => {
    if (!newFavName.trim()) return;
    addFavorite(
      { name: newFavName.trim(), quantity: newFavQty.trim() || '1 pz', category: 'Snack' },
      true,
    );
    setNewFavName('');
    setNewFavQty('');
    setAddFavModal(false);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
        <View>
          <Text variant="h3">Lista spesa</Text>
          <Text variant="muted">{pendingCount} articoli da acquistare</Text>
        </View>
        <View className="flex-row gap-2">
          <Button size="icon" variant="outline" onPress={reset}>
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

      <ScrollView contentContainerClassName="pb-6" showsVerticalScrollIndicator={false}>
        {/* ── Lista da ricette ──────────────────────────────────── */}
        {SHOPPING_CATEGORIES.map((category) => {
          const catItems = items.filter((i) => i.category === category);
          if (catItems.length === 0) return null;

          const catDone = catItems.filter((i) => shoppingChecked[i.id] || isInPantry(i.name));

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
                  const isBought = !!shoppingChecked[item.id];
                  const inPantry = isInPantry(item.name);
                  const isDone = isBought || inPantry;

                  return (
                    <View key={item.id}>
                      <Pressable
                        onPress={() => !inPantry && toggle(item.id)}
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
                          <Text className="text-xs text-muted-foreground">{item.quantity}</Text>
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

        {/* Empty state (solo ricette) */}
        {activeItems.length === 0 && cartFavorites.length === 0 && (
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
              {favorites.length === 0 ? (
                <View className="items-center py-8 gap-2 px-4">
                  <Star className="text-muted-foreground/40" size={28} />
                  <Text className="text-sm text-muted-foreground text-center">
                    Nessun preferito ancora.{'\n'}Aggiungi snack e prodotti ricorrenti.
                  </Text>
                </View>
              ) : (
                favorites.map((fav, idx) => {
                  const isInCartFav = !!inCart[fav.id];
                  const isCheckedFav = !!favChecked[fav.id];

                  return (
                    <View key={fav.id}>
                      <View
                        className={cn(
                          'flex-row items-center gap-3 px-4 py-3.5',
                          isCheckedFav && 'opacity-50',
                        )}
                      >
                        {/* Checkbox — attivo solo se in cart */}
                        <Pressable
                          onPress={() => isInCartFav && toggleFavChecked(fav.id)}
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
                        <Text className="text-xs text-muted-foreground mr-2">{fav.quantity}</Text>

                        {/* Toggle in/out cart */}
                        <Button
                          size="icon"
                          variant={isInCartFav ? 'default' : 'outline'}
                          onPress={() => toggleInCart(fav.id)}
                          className="w-7 h-7 rounded-full"
                        >
                          {isInCartFav ? (
                            <X className="text-primary-foreground" size={12} />
                          ) : (
                            <Plus className="text-foreground" size={12} />
                          )}
                        </Button>
                      </View>
                      {idx < favorites.length - 1 && <Separator className="ml-12" />}
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
                Verrà aggiunto subito alla spesa di questa settimana e salvato per le prossime.
              </Text>
            </View>
            <Button onPress={handleAddFavorite} disabled={!newFavName.trim()}>
              <Text>Salva e aggiungi alla spesa</Text>
            </Button>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
