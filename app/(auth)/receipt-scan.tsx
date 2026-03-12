import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScanAnimation } from '@/components/ui/scan-animation';
import { ArrowLeft, Camera, Image, ScanLine, CheckCircle2 } from 'lucide-react-native';
import {
  receiptControllerGetUploadUrl,
  useReceiptControllerProcess,
} from '@/lib/api/endpoints/receipt/receipt';
import type { ProcessReceiptResponseDto } from '@/lib/api/model/processReceiptResponseDto';
import { useQueryClient } from '@tanstack/react-query';
import { getPantryControllerGetAllQueryKey } from '@/lib/api/endpoints/pantry/pantry';

type ScreenState = 'camera' | 'loading' | 'success' | 'error';

const LOADING_STEPS = [
  'Caricamento immagine...',
  'Analisi AI in corso...',
  'Riconoscimento articoli...',
  'Aggiornamento dispensa...',
];

export default function ReceiptScanScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = useState<ScreenState>('camera');
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ProcessReceiptResponseDto | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const processReceipt = useReceiptControllerProcess({
    mutation: {
      onSuccess: (data) => {
        // Invalidate pantry and shopping caches
        queryClient.invalidateQueries({ queryKey: getPantryControllerGetAllQueryKey() });
        setResult(data);
        setState('success');
      },
      onError: (err: any) => {
        console.log('[Receipt] process error:', JSON.stringify(err?.response?.data ?? err?.message ?? err));
        const msg = err?.response?.data?.message || err?.message || 'Errore durante l\'elaborazione';
        setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
        setState('error');
      },
    },
  });

  const handlePickAndProcess = async (useCamera: boolean) => {
    try {
      // 1. Pick image
      const pickerResult = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: false,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: false,
          });

      if (pickerResult.canceled || !pickerResult.assets[0]) return;

      const asset = pickerResult.assets[0];
      const imageUri = asset.uri;
      const mimeType = asset.mimeType ?? 'image/jpeg';

      setState('loading');
      setLoadingStep(0);

      // 2. Get presigned upload URL
      const stepTimer = setInterval(() => {
        setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
      }, 1500);

      try {
        const { uploadUrl, s3Key } = await receiptControllerGetUploadUrl();

        // 3. Upload image to S3
        const imageBlob = await (await fetch(imageUri)).blob();
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: imageBlob,
          headers: { 'Content-Type': mimeType },
        });
        if (!uploadRes.ok) {
          throw new Error(`Caricamento immagine fallito (${uploadRes.status})`);
        }

        clearInterval(stepTimer);
        setLoadingStep(3);

        // 4. Process receipt
        processReceipt.mutate({ data: { s3Key, mimeType } });
      } catch (err) {
        clearInterval(stepTimer);
        throw err;
      }
    } catch (err: any) {
      const msg = err?.message || 'Errore durante il caricamento';
      setErrorMsg(msg);
      setState('error');
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">

      {/* ── Camera / Pick state ────────────────────────────────── */}
      {state === 'camera' && (
        <View className="flex-1">
          <View className="flex-row items-center px-4 pt-4 pb-3">
            <Button size="icon" variant="ghost" onPress={() => router.back()}>
              <ArrowLeft className="text-foreground" size={20} />
            </Button>
            <Text variant="h3" className="ml-3">Scansiona scontrino</Text>
          </View>

          <Separator />

          <View className="flex-1 items-center justify-center px-8 gap-8">
            {/* Illustration */}
            <View className="w-32 h-32 rounded-3xl bg-primary/10 items-center justify-center">
              <ScanLine className="text-primary" size={56} />
            </View>

            <View className="items-center gap-2">
              <Text className="text-lg font-semibold text-center">
                Fotografa lo scontrino
              </Text>
              <Text className="text-sm text-muted-foreground text-center leading-relaxed">
                L'AI riconoscerà gli articoli acquistati e aggiornerà automaticamente la tua dispensa
              </Text>
            </View>

            <View className="w-full gap-3">
              <Button onPress={() => handlePickAndProcess(true)} className="gap-3">
                <Camera className="text-primary-foreground" size={18} />
                <Text>Scatta una foto</Text>
              </Button>
              <Button variant="outline" onPress={() => handlePickAndProcess(false)} className="gap-3">
                <Image className="text-foreground" size={18} />
                <Text>Scegli dalla galleria</Text>
              </Button>
            </View>

            <Text className="text-xs text-muted-foreground text-center">
              Assicurati che il testo dello scontrino sia leggibile
            </Text>
          </View>
        </View>
      )}

      {/* ── Loading state ─────────────────────────────────────── */}
      {state === 'loading' && (
        <View className="flex-1 items-center justify-center px-8 gap-8">
          <ScanAnimation Icon={ScanLine} />

          <View className="items-center gap-3 w-full">
            <Text className="text-base font-semibold">{LOADING_STEPS[loadingStep]}</Text>
            <View className="flex-row gap-2">
              {LOADING_STEPS.map((_, i) => (
                <View
                  key={i}
                  className={i <= loadingStep ? 'w-2 h-2 rounded-full bg-primary' : 'w-2 h-2 rounded-full bg-muted'}
                />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* ── Success state ─────────────────────────────────────── */}
      {state === 'success' && result && (
        <View className="flex-1">
          {/* Banner header */}
          <View className="mx-4 mt-4 mb-3 bg-primary/10 rounded-2xl border border-primary/20 px-4 py-4 gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-primary/20 items-center justify-center">
                <CheckCircle2 className="text-primary" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-primary">Scontrino elaborato!</Text>
                <Text className="text-xs text-muted-foreground">
                  {result.items.length} articoli riconosciuti
                  {result.addedToPantry > 0 ? ` · ${result.addedToPantry} nuovi in dispensa` : ''}
                </Text>
              </View>
            </View>

            {(result.newItems ?? []).length > 0 && (
              <View className="gap-1">
                {(result.newItems ?? []).map((item, idx) => (
                  <View key={idx} className="flex-row items-center gap-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    <Text className="text-sm text-primary/90 flex-1">{item.name}</Text>
                    {item.quantity ? (
                      <Text className="text-xs text-muted-foreground">{item.quantity}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>

          <Separator />

          <ScrollView contentContainerClassName="px-4 py-4 gap-4" showsVerticalScrollIndicator={false}>

            {/* Tutti gli articoli riconosciuti */}
            {result.items.length > 0 && (
              <View>
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">
                  Tutti gli articoli
                </Text>
                <Card>
                  <CardContent className="pt-3 pb-1">
                    {result.items.map((item, idx) => {
                      const isNew = result.newItems.some((n) => n.name === item.name);
                      return (
                        <View key={idx}>
                          <View className="flex-row items-center justify-between py-3">
                            <Text className={`flex-1 text-sm${isNew ? '' : ' text-muted-foreground'}`}>{item.name}</Text>
                            {item.quantity ? (
                              <Badge variant="secondary">
                                <Text className="text-[10px]">{item.quantity}</Text>
                              </Badge>
                            ) : null}
                          </View>
                          {idx < result.items.length - 1 && <Separator />}
                        </View>
                      );
                    })}
                  </CardContent>
                </Card>
              </View>
            )}
          </ScrollView>

          <View className="px-4 pb-6 pt-3 border-t border-border bg-background gap-2">
            <Button onPress={() => router.back()}>
              <Text>Torna alla dispensa</Text>
            </Button>
            <Button variant="outline" onPress={() => setState('camera')}>
              <Text>Scansiona un altro scontrino</Text>
            </Button>
          </View>
        </View>
      )}

      {/* ── Error state ───────────────────────────────────────── */}
      {state === 'error' && (
        <View className="flex-1 items-center justify-center px-8 gap-6">
          <View className="w-20 h-20 rounded-full bg-destructive/15 items-center justify-center">
            <ScanLine className="text-destructive" size={36} />
          </View>
          <View className="items-center gap-2">
            <Text className="text-lg font-semibold text-center">Errore elaborazione</Text>
            <Text className="text-sm text-muted-foreground text-center">{errorMsg}</Text>
          </View>
          <View className="w-full gap-3">
            <Button onPress={() => setState('camera')}>
              <Text>Riprova</Text>
            </Button>
            <Button variant="outline" onPress={() => router.back()}>
              <Text>Annulla</Text>
            </Button>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}
