import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as AlertDialogPrimitive from '@rn-primitives/alert-dialog';
import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const FullWindowOverlay =
  Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

const AlertDialogOverlay = React.forwardRef<
  AlertDialogPrimitive.OverlayRef,
  AlertDialogPrimitive.OverlayProps
>(({ className, ...props }, ref) => {
  return (
    <AlertDialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'z-50 bg-black/80',
        Platform.select({
          web: 'fixed inset-0',
        }),
        className
      )}
      style={Platform.select({ native: StyleSheet.absoluteFill })}
      {...props}
    />
  );
});
AlertDialogOverlay.displayName = 'AlertDialogOverlay';

const AlertDialogContent = React.forwardRef<
  AlertDialogPrimitive.ContentRef,
  AlertDialogPrimitive.ContentProps & { portalHost?: string }
>(({ className, portalHost, ...props }, ref) => {
  return (
    <AlertDialogPortal hostName={portalHost}>
      <FullWindowOverlay>
        <AlertDialogOverlay>
          <NativeOnlyAnimatedView
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="flex-1 justify-center items-center p-4"
          >
            <TextClassContext.Provider value="text-foreground">
              <AlertDialogPrimitive.Content
                ref={ref}
                className={cn(
                  'z-50 w-full max-w-lg gap-4 rounded-lg border border-border bg-background p-6 shadow-lg',
                  Platform.select({
                    web: 'animate-in fade-in-0 zoom-in-95',
                  }),
                  className
                )}
                {...props}
              />
            </TextClassContext.Provider>
          </NativeOnlyAnimatedView>
        </AlertDialogOverlay>
      </FullWindowOverlay>
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogHeader = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof View>) => (
  <View
    className={cn('flex flex-col gap-2', className)}
    {...props}
  />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof View>) => (
  <View
    className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
    {...props}
  />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogTitle = React.forwardRef<
  AlertDialogPrimitive.TitleRef,
  AlertDialogPrimitive.TitleProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
));
AlertDialogTitle.displayName = 'AlertDialogTitle';

const AlertDialogDescription = React.forwardRef<
  AlertDialogPrimitive.DescriptionRef,
  AlertDialogPrimitive.DescriptionProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
AlertDialogDescription.displayName = 'AlertDialogDescription';

const AlertDialogAction = React.forwardRef<
  AlertDialogPrimitive.ActionRef,
  AlertDialogPrimitive.ActionProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn('', className)}
    {...props}
  />
));
AlertDialogAction.displayName = 'AlertDialogAction';

const AlertDialogCancel = React.forwardRef<
  AlertDialogPrimitive.CancelRef,
  AlertDialogPrimitive.CancelProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn('', className)}
    {...props}
  />
));
AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
