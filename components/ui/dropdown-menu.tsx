import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as DropdownMenuPrimitive from '@rn-primitives/dropdown-menu';
import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuSubTrigger = DropdownMenuPrimitive.SubTrigger;

const FullWindowOverlay =
  Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

const DropdownMenuSubContent = React.forwardRef<
  DropdownMenuPrimitive.SubContentRef,
  DropdownMenuPrimitive.SubContentProps
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md shadow-black/5',
        className
      )}
      {...props}
    />
  );
});
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

const DropdownMenuContent = React.forwardRef<
  DropdownMenuPrimitive.ContentRef,
  DropdownMenuPrimitive.ContentProps & { portalHost?: string }
>(({ className, portalHost, ...props }, ref) => {
  return (
    <DropdownMenuPortal hostName={portalHost}>
      <FullWindowOverlay>
        <DropdownMenuPrimitive.Overlay
          style={Platform.select({ native: StyleSheet.absoluteFill })}
        >
          <NativeOnlyAnimatedView
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          >
            <TextClassContext.Provider value="text-popover-foreground">
              <DropdownMenuPrimitive.Content
                ref={ref}
                className={cn(
                  'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md shadow-black/5',
                  Platform.select({
                    web: 'animate-in fade-in-0 zoom-in-95',
                  }),
                  className
                )}
                {...props}
              />
            </TextClassContext.Provider>
          </NativeOnlyAnimatedView>
        </DropdownMenuPrimitive.Overlay>
      </FullWindowOverlay>
    </DropdownMenuPortal>
  );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<
  DropdownMenuPrimitive.ItemRef,
  DropdownMenuPrimitive.ItemProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none flex-row items-center gap-2 rounded-sm px-2 py-1.5 outline-none web:focus:bg-accent active:bg-accent',
      props.disabled && 'opacity-50',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold text-foreground', className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuSeparator = React.forwardRef<
  DropdownMenuPrimitive.SeparatorRef,
  DropdownMenuPrimitive.SeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Text>) => {
  return (
    <Text
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
