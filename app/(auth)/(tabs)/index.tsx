import { useState } from 'react';
import { View, ScrollView, Pressable, Modal, ActivityIndicator, Animated, RefreshControl } from 'react-native';
import { useScreenEntrance } from '@/lib/hooks/useScreenEntrance';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Plus, ChevronLeft, ChevronRight, Utensils, X, Search, Clock, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import {
  usePlannerControllerGetWeek,
  getPlannerControllerGetWeekQueryKey,
  usePlannerControllerAssign,
  usePlannerControllerRemove,
} from '@/lib/api/endpoints/planner/planner';
import { useRecipesControllerFindAll } from '@/lib/api/endpoints/recipes/recipes';
import {
  useShoppingControllerGenerate,
  getShoppingControllerGetQueryKey,
} from '@/lib/api/endpoints/shopping/shopping';
import type { PlanSlotResponseDto, ResponseRecipeDto } from '@/lib/api/model';

const MONTHS = [
  'gen', 'feb', 'mar', 'apr', 'mag', 'giu',
  'lug', 'ago', 'set', 'ott', 'nov', 'dic',
];

const MONTHS_LONG = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
];

const DAYS_LONG = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buongiorno Pina 🌤';
  if (h < 18) return 'Buon pomeriggio Pina ☀️';
  return 'Buonasera Pina 🌙';
}

function todayLabel(): string {
  const d = new Date();
  return `${DAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;
}
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

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

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

type MealPlan = {
  primo: { recipeId: string; recipeName: string } | null;
  secondo: { recipeId: string; recipeName: string } | null;
};

type DayPlan = {
  pranzo: MealPlan;
  cena: MealPlan;
};

function parsePlannerData(slots: Record<string, PlanSlotResponseDto>): DayPlan[] {
  const empty = (): MealPlan => ({ primo: null, secondo: null });
  const result: DayPlan[] = Array.from({ length: 7 }, () => ({
    pranzo: empty(),
    cena: empty(),
  }));

  for (const [slotKey, slot] of Object.entries(slots)) {
    // slotKey: "2026-W11#00#PRANZO"
    const parts = slotKey.split('#');
    if (parts.length < 3) continue;
    const dayIndex = parseInt(parts[1], 10);
    const meal = parts[2].toLowerCase() as 'pranzo' | 'cena';
    if (dayIndex >= 0 && dayIndex < 7 && (meal === 'pranzo' || meal === 'cena')) {
      result[dayIndex][meal] = {
        primo: slot.primo ?? null,
        secondo: slot.secondo ?? null,
      };
    }
  }

  return result;
}

type PickerSlot = {
  dayIndex: number;
  meal: 'pranzo' | 'cena';
  course: 'primo' | 'secondo';
};

export default function PlannerScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  const entrance = useScreenEntrance();
  const [pickerSlot, setPickerSlot] = useState<PickerSlot | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  const weekKey = getWeekKey(weekOffset);

  const { data: slotsRecord = {}, isLoading: plannerLoading, refetch: refetchPlanner } =
    usePlannerControllerGetWeek(weekKey);
  const { data: allRecipes = [], refetch: refetchRecipes } = useRecipesControllerFindAll();

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

  const removeMutation = usePlannerControllerRemove({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getPlannerControllerGetWeekQueryKey(weekKey),
        });
        generateShopping.mutate({ weekKey });
      },
    },
  });

  const monday = getWeekStart(weekOffset);
  const allWeekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekDays = weekOffset === 0
    ? allWeekDays.filter((d) => d >= today)
    : allWeekDays;

  const first = allWeekDays[0];
  const last = allWeekDays[6];
  const weekLabel = `${first.getDate()} ${MONTHS[first.getMonth()]} — ${last.getDate()} ${MONTHS[last.getMonth()]}`;

  const currentPlan = parsePlannerData(slotsRecord);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchPlanner(), refetchRecipes()]);
    setIsRefreshing(false);
  };

  const openPicker = (dayIndex: number, meal: 'pranzo' | 'cena', course: 'primo' | 'secondo') => {
    setPickerSlot({ dayIndex, meal, course });
    setPickerSearch('');
  };

  const closePicker = () => {
    setPickerSlot(null);
    setPickerSearch('');
  };

  const assignRecipe = (recipe: ResponseRecipeDto) => {
    if (!pickerSlot) return;
    const { dayIndex, meal, course } = pickerSlot;
    assignMutation.mutate({
      weekKey,
      dayIndex,
      meal,
      course,
      data: { recipeId: recipe.recipeId, recipeName: recipe.name },
    });
    closePicker();
  };

  const removeRecipe = (dayIndex: number, meal: 'pranzo' | 'cena', course: 'primo' | 'secondo') => {
    removeMutation.mutate({ weekKey, dayIndex, meal, course });
  };

  const pickerRecipes = allRecipes.filter((r) =>
    r.name.toLowerCase().includes(pickerSearch.toLowerCase()),
  );

  return (
    <Animated.View style={entrance.style}>
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >

        {/* Header */}
        <View className="px-4 pt-4 pb-3 gap-3">
          {/* Title row */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text variant="h3">{greeting()}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">{todayLabel()}</Text>
            </View>
            <Button
              size="sm"
              variant="outline"
              onPress={() => setWeekOffset(0)}
              disabled={weekOffset === 0}
              className={cn(weekOffset === 0 && 'opacity-0')}
            >
              <Text>Oggi</Text>
            </Button>
          </View>

          {/* Week navigator */}
          <View
            className="flex-row items-center bg-card rounded-2xl border border-border"
            style={{
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: colorScheme === 'dark' ? 0.15 : 0.08,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Button size="icon" variant="outline" onPress={() => setWeekOffset((o) => o - 1)} className="m-1.5">
              <ChevronLeft className="text-foreground" size={18} />
            </Button>
            <View className="flex-1 items-center py-2.5">
              <Text className="text-sm font-bold">{weekLabel}</Text>
              <Text className="text-[10px] text-muted-foreground mt-0.5">
                {weekOffset === 0
                  ? 'Questa settimana'
                  : weekOffset === 1
                  ? 'Prossima settimana'
                  : weekOffset === -1
                  ? 'Settimana scorsa'
                  : weekOffset > 0
                  ? `+${weekOffset} settimane`
                  : `${weekOffset} settimane`}
              </Text>
            </View>
            <Button size="icon" variant="outline" onPress={() => setWeekOffset((o) => o + 1)} className="m-1.5">
              <ChevronRight className="text-foreground" size={18} />
            </Button>
          </View>
        </View>

        <Separator />

        {/* Day cards */}
        {plannerLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator />
          </View>
        ) : (
          <View className="px-4 pt-3 gap-3">
            {weekDays.map((date) => {
              const i = allWeekDays.findIndex((d) => d.getTime() === date.getTime());
              const plan = currentPlan[i] ?? {
                pranzo: { primo: null, secondo: null },
                cena: { primo: null, secondo: null },
              };
              const isCurrentDay = isToday(date);

              return (
                <View
                  key={i}
                  className={cn(
                    'rounded-xl border',
                    isCurrentDay ? 'border-primary bg-primary/5' : 'border-border bg-card',
                  )}
                >
                  {/* Day header */}
                  <View className="flex-row items-center gap-2 px-3 py-2.5">
                    <Text
                      className={cn(
                        'text-sm font-semibold',
                        isCurrentDay ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {DAY_LABELS[i]}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {date.getDate()} {MONTHS[date.getMonth()]}
                    </Text>
                    {isCurrentDay && (
                      <Badge className="px-1.5">
                        <Text className="text-[10px]">oggi</Text>
                      </Badge>
                    )}
                  </View>

                  <Separator />

                  {/* Meal slots */}
                  <View className="px-3 py-2.5 gap-3">
                    {(['pranzo', 'cena'] as const).map((meal) => {
                      const { primo, secondo } = plan[meal];
                      const hasBoth = primo !== null && secondo !== null;

                      return (
                        <View key={meal} className="flex-row items-start gap-2">
                          {/* Label pasto */}
                          <Text
                            className={cn(
                              'text-xs text-muted-foreground w-12 capitalize',
                              primo ? 'pt-2.5' : 'pt-2',
                            )}
                          >
                            {meal}
                          </Text>

                          <View className="flex-1 gap-1.5">
                            {/* ── Primo / Unico ── */}
                            {primo ? (
                              <View className="flex-row items-center gap-2 bg-primary/10 rounded-lg px-2.5 py-2">
                                {hasBoth && (
                                  <Text className="text-[10px] text-primary/60 font-bold w-4">1°</Text>
                                )}
                                <Pressable
                                  onPress={() =>
                                    router.push({
                                      pathname: '/(auth)/recipe/[id]',
                                      params: { id: primo.recipeId },
                                    })
                                  }
                                  className="flex-1 flex-row items-center gap-2 active:opacity-70"
                                >
                                  <Utensils className="text-primary" size={13} />
                                  <Text
                                    className="text-sm font-medium text-primary flex-1"
                                    numberOfLines={1}
                                  >
                                    {primo.recipeName}
                                  </Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => removeRecipe(i, meal, 'primo')}
                                  className="p-0.5 active:opacity-50"
                                >
                                  <X className="text-primary/60" size={14} />
                                </Pressable>
                              </View>
                            ) : (
                              <Pressable
                                onPress={() => openPicker(i, meal, 'primo')}
                                className="flex-row items-center gap-1.5 border border-dashed border-border rounded-lg px-2.5 py-2 active:opacity-70"
                              >
                                <Plus className="text-muted-foreground" size={13} />
                                <Text className="text-xs text-muted-foreground">Aggiungi ricetta</Text>
                              </Pressable>
                            )}

                            {/* ── Secondo (visibile solo se primo è impostato) ── */}
                            {primo && (
                              secondo ? (
                                <View className="flex-row items-center gap-2 bg-primary/10 rounded-lg px-2.5 py-2">
                                  <Text className="text-[10px] text-primary/60 font-bold w-4">2°</Text>
                                  <Pressable
                                    onPress={() =>
                                      router.push({
                                        pathname: '/(auth)/recipe/[id]',
                                        params: { id: secondo.recipeId },
                                      })
                                    }
                                    className="flex-1 flex-row items-center gap-2 active:opacity-70"
                                  >
                                    <Utensils className="text-primary" size={13} />
                                    <Text
                                      className="text-sm font-medium text-primary flex-1"
                                      numberOfLines={1}
                                    >
                                      {secondo.recipeName}
                                    </Text>
                                  </Pressable>
                                  <Pressable
                                    onPress={() => removeRecipe(i, meal, 'secondo')}
                                    className="p-0.5 active:opacity-50"
                                  >
                                    <X className="text-primary/60" size={14} />
                                  </Pressable>
                                </View>
                              ) : (
                                <Pressable
                                  onPress={() => openPicker(i, meal, 'secondo')}
                                  className="flex-row items-center gap-1.5 pl-1 py-0.5 active:opacity-70"
                                >
                                  <Plus className="text-muted-foreground/50" size={12} />
                                  <Text className="text-xs text-muted-foreground/50">Aggiungi secondo</Text>
                                </Pressable>
                              )
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Recipe Picker Modal ─────────────────────────────────── */}
      <Modal
        visible={pickerSlot !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePicker}
      >
        <SafeAreaView className="flex-1 bg-background">
          {/* Handle */}
          <View className="items-center pt-2 pb-1">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3">
            <View>
              <Text variant="h3">Scegli ricetta</Text>
              {pickerSlot && (
                <Text variant="muted" className="capitalize">
                  {DAY_LABELS[pickerSlot.dayIndex]} · {pickerSlot.meal}
                  {' · '}
                  {pickerSlot.course === 'primo' ? 'Primo' : 'Secondo'}
                </Text>
              )}
            </View>
            <Button size="icon" variant="ghost" onPress={closePicker}>
              <X className="text-foreground" size={20} />
            </Button>
          </View>

          {/* Search */}
          <View className="px-4 pb-3">
            <View className="flex-row items-center gap-2 bg-muted rounded-xl px-3 h-12">
              <Search className="text-muted-foreground" size={16} />
              <Input
                className="flex-1 border-0 bg-transparent px-0 h-full"
                placeholder="Cerca ricette..."
                value={pickerSearch}
                onChangeText={setPickerSearch}
              />
            </View>
          </View>

          <Separator />

          {/* Recipe list */}
          <ScrollView
            contentContainerClassName="px-4 py-3 gap-2"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {pickerRecipes.length === 0 ? (
              <View className="items-center py-12">
                <Text variant="muted">Nessuna ricetta trovata</Text>
              </View>
            ) : (
              pickerRecipes.map((recipe) => (
                <Pressable
                  key={recipe.recipeId}
                  onPress={() => assignRecipe(recipe)}
                  className="flex-row items-center gap-3 p-3 rounded-xl border border-border bg-card active:bg-muted"
                >
                  <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center shrink-0">
                    <Utensils className="text-primary" size={18} />
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="text-sm font-semibold" numberOfLines={1}>
                      {recipe.name}
                    </Text>
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Clock className="text-muted-foreground" size={11} />
                        <Text className="text-xs text-muted-foreground">{recipe.timeMinutes} min</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Users className="text-muted-foreground" size={11} />
                        <Text className="text-xs text-muted-foreground">{recipe.servings} pers.</Text>
                      </View>
                    </View>
                  </View>
                  <View className="gap-1 items-end">
                    {recipe.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        <Text className="capitalize text-[10px]">{tag}</Text>
                      </Badge>
                    ))}
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    </Animated.View>
  );
}
