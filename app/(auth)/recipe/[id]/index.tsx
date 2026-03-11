import { useState } from 'react';
import { View, ScrollView, Modal, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { ArrowLeft, Clock, Users, Check, X, CalendarPlus, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import {
  useRecipesControllerFindOne,
  useRecipesControllerRemove,
  getRecipesControllerFindAllQueryKey,
} from '@/lib/api/endpoints/recipes/recipes';
import {
  usePlannerControllerGetWeek,
  getPlannerControllerGetWeekQueryKey,
  usePlannerControllerAssign,
} from '@/lib/api/endpoints/planner/planner';
import {
  useShoppingControllerGenerate,
  getShoppingControllerGetQueryKey,
} from '@/lib/api/endpoints/shopping/shopping';

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

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

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [plannerOpen, setPlannerOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayIndex, setDayIndex] = useState<number | null>(null);
  const [meal, setMeal] = useState<'pranzo' | 'cena' | null>(null);
  const [course, setCourse] = useState<'primo' | 'secondo' | null>(null);
  const [added, setAdded] = useState(false);

  const weekKey = getWeekKey(weekOffset);

  const { data: recipe, isLoading } = useRecipesControllerFindOne(id ?? '');
  const { data: slotsRecord = {} } = usePlannerControllerGetWeek(weekKey, {
    query: { enabled: plannerOpen },
  });

  const generateShopping = useShoppingControllerGenerate({
    mutation: {
      onSuccess: (updated) => {
        queryClient.setQueryData(getShoppingControllerGetQueryKey(weekKey), updated);
      },
    },
  });

  const assignMutation = usePlannerControllerAssign({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getPlannerControllerGetWeekQueryKey(weekKey),
        });
        generateShopping.mutate({ weekKey });
      },
    },
  });

  const removeMutation = useRecipesControllerRemove({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getRecipesControllerFindAllQueryKey() });
        router.back();
      },
    },
  });


  const monday = getWeekStart(weekOffset);
  const allWeekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const weekDays = weekOffset === 0
    ? allWeekDays.filter((d) => d >= todayMidnight)
    : allWeekDays;

  const first = allWeekDays[0];
  const last = allWeekDays[6];
  const weekLabel = `${first.getDate()} ${MONTHS[first.getMonth()]} — ${last.getDate()} ${MONTHS[last.getMonth()]}`;

  const currentSlotKey =
    dayIndex !== null && meal
      ? `${weekKey}#${String(dayIndex).padStart(2, '0')}#${meal.toUpperCase()}`
      : null;
  const currentSlot = currentSlotKey ? slotsRecord[currentSlotKey] : null;
  const primoPieno = !!(currentSlot?.primo);
  const secondoPieno = !!(currentSlot?.secondo);

  const canAddPrimo = !primoPieno;
  const canAddSecondo = primoPieno && !secondoPieno;

  const resetPicker = () => {
    setDayIndex(null);
    setMeal(null);
    setCourse(null);
  };

  const handleConfirm = () => {
    if (dayIndex === null || !meal || !course || !recipe) return;
    assignMutation.mutate(
      {
        weekKey,
        dayIndex,
        meal,
        course,
        data: { recipeId: recipe.recipeId, recipeName: recipe.name },
      },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => {
            setPlannerOpen(false);
            resetPicker();
            setAdded(false);
          }, 1200);
        },
      },
    );
  };

  const canConfirm = dayIndex !== null && meal !== null && course !== null;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text variant="muted">Ricetta non trovata</Text>
        <Button variant="ghost" onPress={() => router.back()} className="mt-4">
          <Text>Torna indietro</Text>
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
        {/* Hero + back button */}
        <View className="h-48 bg-primary/15 items-start justify-end px-4 pb-4">
          <Button
            size="icon"
            variant="outline"
            className="absolute top-4 left-4 bg-background/80"
            onPress={() => router.back()}
          >
            <ArrowLeft className="text-foreground" size={20} />
          </Button>

          {/* Edit + Delete buttons */}
          <View className="absolute top-4 right-4 flex-row gap-2">
            <Button
              size="icon"
              variant="outline"
              className="bg-background/80"
              onPress={() => router.push({ pathname: '/(auth)/recipe/[id]/edit', params: { id } })}
            >
              <Pencil className="text-foreground" size={16} />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-background/80"
                  disabled={removeMutation.isPending}
                >
                  <Trash2 className="text-destructive" size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Elimina ricetta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vuoi eliminare "{recipe?.name}"? L'operazione non è reversibile.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button variant="outline">
                      <Text>Annulla</Text>
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onPress={() => removeMutation.mutate({ recipeId: id ?? '' })}
                    >
                      <Text>Elimina</Text>
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </View>

          {/* Tags overlay */}
          <View className="flex-row flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-background/80">
                <Text className="capitalize text-xs">{tag}</Text>
              </Badge>
            ))}
          </View>
        </View>

        <View className="px-4 pt-5">
          {/* Title + rating */}
          <View className="flex-row items-start justify-between gap-2">
            <Text variant="h2" className="flex-1 border-0 pb-0">
              {recipe.name}
            </Text>
            <View className="flex-row shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Text key={i} className={i < (recipe.rating ?? 0) ? 'text-lg text-primary' : 'text-lg text-muted-foreground/25'}>
                  ★
                </Text>
              ))}
            </View>
          </View>

          {/* Description */}
          <Text className="text-muted-foreground mt-2 leading-relaxed">{recipe.description}</Text>

          {/* Meta chips */}
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1 flex-row items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
              <Clock className="text-muted-foreground" size={16} />
              <View>
                <Text className="text-xs text-muted-foreground">Tempo</Text>
                <Text className="text-sm font-semibold">{recipe.timeMinutes} min</Text>
              </View>
            </View>
            <View className="flex-1 flex-row items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
              <Users className="text-muted-foreground" size={16} />
              <View>
                <Text className="text-xs text-muted-foreground">Porzioni</Text>
                <Text className="text-sm font-semibold">{recipe.servings} pers.</Text>
              </View>
            </View>
          </View>

          <Separator className="my-5" />

          {/* Ingredients */}
          <Text className="text-base font-semibold mb-3">Ingredienti</Text>
          <View className="rounded-xl border border-border bg-card overflow-hidden">
            {recipe.ingredients.map((ing, idx) => (
              <View key={idx}>
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-sm flex-1">{ing.name}</Text>
                  <Text className="text-sm text-muted-foreground">{ing.amount}</Text>
                </View>
                {idx < recipe.ingredients.length - 1 && <Separator />}
              </View>
            ))}
          </View>

          <Separator className="my-5" />

          {/* Steps */}
          <Text className="text-base font-semibold mb-3">Procedimento</Text>
          <View className="gap-4">
            {recipe.steps.map((step, idx) => (
              <View key={idx} className="flex-row gap-3">
                <View className="w-7 h-7 rounded-full bg-primary items-center justify-center shrink-0 mt-0.5">
                  <Text className="text-xs font-bold text-primary-foreground">{idx + 1}</Text>
                </View>
                <Text className="flex-1 text-sm leading-relaxed text-foreground">{step}</Text>
              </View>
            ))}
          </View>

          <Separator className="my-5" />

          {/* Action */}
          <Button onPress={() => setPlannerOpen(true)} className="flex-row gap-2">
            <CalendarPlus className="text-primary-foreground" size={16} />
            <Text>Aggiungi al planner</Text>
          </Button>
        </View>
      </ScrollView>

      {/* ── Planner Picker Modal ─────────────────────────────────── */}
      <Modal
        visible={plannerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setPlannerOpen(false); resetPicker(); }}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="items-center pt-2 pb-1">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>

          <View className="flex-row items-center justify-between px-4 py-3">
            <View>
              <Text variant="h3">Aggiungi al planner</Text>
              <Text variant="muted" className="capitalize">{recipe.name}</Text>
            </View>
            <Button size="icon" variant="ghost" onPress={() => { setPlannerOpen(false); resetPicker(); }}>
              <X className="text-foreground" size={20} />
            </Button>
          </View>

          <Separator />

          <ScrollView contentContainerClassName="px-4 py-4 gap-5" showsVerticalScrollIndicator={false}>

            <View className="gap-2">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Settimana</Text>
              <View className="flex-row items-center justify-between bg-muted rounded-xl px-2 py-1">
                <Button size="icon" variant="ghost" disabled={weekOffset === 0} onPress={() => { setWeekOffset((o) => o - 1); resetPicker(); }}>
                  <ChevronLeft className="text-foreground" size={20} />
                </Button>
                <Text className="text-sm font-medium">
                  {weekOffset === 0 ? 'Questa settimana' : weekOffset === 1 ? 'Prossima settimana' : weekLabel}
                </Text>
                <Button size="icon" variant="ghost" onPress={() => { setWeekOffset((o) => o + 1); resetPicker(); }}>
                  <ChevronRight className="text-foreground" size={20} />
                </Button>
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Giorno</Text>
              <View className="flex-row gap-1.5">
                {weekDays.map((date) => {
                  const actualIndex = allWeekDays.findIndex((d) => d.getTime() === date.getTime());
                  return (
                    <Pressable
                      key={actualIndex}
                      onPress={() => { setDayIndex(actualIndex); setMeal(null); setCourse(null); }}
                      className={cn(
                        'flex-1 items-center py-2 rounded-xl border',
                        dayIndex === actualIndex ? 'bg-primary border-primary' : 'border-border bg-card',
                      )}
                    >
                      <Text className={cn('text-[10px]', dayIndex === actualIndex ? 'text-primary-foreground' : 'text-muted-foreground')}>
                        {DAY_LABELS[actualIndex]}
                      </Text>
                      <Text className={cn('text-sm font-semibold mt-0.5', dayIndex === actualIndex ? 'text-primary-foreground' : 'text-foreground')}>
                        {date.getDate()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {dayIndex !== null && (
              <View className="gap-2">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pasto</Text>
                <View className="flex-row gap-2">
                  {(['pranzo', 'cena'] as const).map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => { setMeal(m); setCourse(null); }}
                      className={cn(
                        'flex-1 items-center py-3 rounded-xl border',
                        meal === m ? 'bg-primary border-primary' : 'border-border bg-card',
                      )}
                    >
                      <Text className={cn('text-sm font-semibold capitalize', meal === m ? 'text-primary-foreground' : 'text-foreground')}>
                        {m}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {dayIndex !== null && meal !== null && (
              <View className="gap-2">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Portata</Text>
                {!canAddPrimo && !canAddSecondo ? (
                  <View className="bg-muted rounded-xl px-4 py-3">
                    <Text className="text-sm text-muted-foreground text-center">
                      Questo pasto è già completo (primo e secondo occupati)
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => canAddPrimo && setCourse('primo')}
                      className={cn(
                        'flex-1 items-center py-3 rounded-xl border',
                        !canAddPrimo && 'opacity-40',
                        course === 'primo' ? 'bg-primary border-primary' : 'border-border bg-card',
                      )}
                    >
                      <Text className={cn('text-sm font-semibold', course === 'primo' ? 'text-primary-foreground' : 'text-foreground')}>
                        Primo
                      </Text>
                      {primoPieno && <Text className="text-[10px] text-muted-foreground mt-0.5">occupato</Text>}
                    </Pressable>
                    <Pressable
                      onPress={() => canAddSecondo && setCourse('secondo')}
                      className={cn(
                        'flex-1 items-center py-3 rounded-xl border',
                        !canAddSecondo && 'opacity-40',
                        course === 'secondo' ? 'bg-primary border-primary' : 'border-border bg-card',
                      )}
                    >
                      <Text className={cn('text-sm font-semibold', course === 'secondo' ? 'text-primary-foreground' : 'text-foreground')}>
                        Secondo
                      </Text>
                      {!primoPieno && <Text className="text-[10px] text-muted-foreground mt-0.5">prima il primo</Text>}
                      {secondoPieno && <Text className="text-[10px] text-muted-foreground mt-0.5">occupato</Text>}
                    </Pressable>
                  </View>
                )}
              </View>
            )}

          </ScrollView>

          <View className="px-4 pb-6 pt-3 border-t border-border bg-background">
            {added ? (
              <View className="flex-row items-center justify-center gap-2 h-11">
                <Check className="text-primary" size={18} />
                <Text className="text-primary font-semibold">Aggiunto!</Text>
              </View>
            ) : (
              <Button onPress={handleConfirm} disabled={!canConfirm || assignMutation.isPending}>
                <Text>Conferma</Text>
              </Button>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
