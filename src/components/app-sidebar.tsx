import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, useWindowDimensions, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const SidebarWidth = 240;
/** Ab dieser Breite schiebt die Leiste den Inhalt zur Seite, darunter liegt sie darüber. */
const WideBreakpoint = 768;

export default function AppSidebar() {
  const { width } = useWindowDimensions();
  const isWide = width >= WideBreakpoint;
  const insets = useSafeAreaInsets();

  // null = automatisch: auf breiten Bildschirmen offen, auf schmalen geschlossen.
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? isWide;
  const [progress] = useState(() => new Animated.Value(open ? 1 : 0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [open, progress]);

  const closeIfOverlay = () => {
    if (!isWide) setUserOpen(false);
  };

  return (
    <Tabs style={styles.root}>
      <TabList asChild>
        <Sidebar
          progress={progress}
          open={open}
          isWide={isWide}
          topInset={insets.top}
          onClose={() => setUserOpen(false)}>
          <TabTrigger name="index" href="/" onPress={closeIfOverlay} asChild>
            <NavButton icon="📅">Kalender</NavButton>
          </TabTrigger>
          <TabTrigger name="todos" href="/todos" onPress={closeIfOverlay} asChild>
            <NavButton icon="✅">Todos</NavButton>
          </TabTrigger>
        </Sidebar>
      </TabList>

      <ThemedView style={styles.main}>
        <TopBar topInset={insets.top} onToggle={() => setUserOpen(!open)} open={open} />
        <TabSlot style={styles.slot} />
      </ThemedView>
    </Tabs>
  );
}

type SidebarProps = ViewProps & {
  progress: Animated.Value;
  open: boolean;
  isWide: boolean;
  topInset: number;
  onClose: () => void;
};

function Sidebar({ progress, open, isWide, topInset, onClose, children, style, ...rest }: SidebarProps) {
  const theme = useTheme();

  // Breit: Leiste nimmt Platz im Layout ein (Breite animiert).
  // Schmal: Leiste schwebt über dem Inhalt (wird hereingeschoben).
  const animatedStyle = isWide
    ? {
        width: progress.interpolate({ inputRange: [0, 1], outputRange: [0, SidebarWidth] }),
      }
    : {
        position: 'absolute' as const,
        top: 0,
        bottom: 0,
        left: 0,
        width: SidebarWidth,
        transform: [
          {
            translateX: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [-SidebarWidth, 0],
            }),
          },
        ],
      };

  return (
    <>
      {!isWide && open && (
        <Pressable
          accessibilityLabel="Menü schließen"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />
      )}
      <Animated.View
        {...rest}
        style={[
          styles.sidebar,
          { backgroundColor: theme.backgroundElement },
          animatedStyle,
        ]}>
        <View style={[styles.sidebarInner, { paddingTop: topInset + Spacing.three }]}>
          <ThemedText type="smallBold" style={styles.brand}>
            Forge
          </ThemedText>
          {children}
        </View>
      </Animated.View>
    </>
  );
}

function NavButton({
  icon,
  children,
  isFocused,
  ...props
}: Omit<TabTriggerSlotProps, 'ref'> & { icon: string; children: ReactNode }) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.navButton}>
        <ThemedText style={styles.navIcon}>{icon}</ThemedText>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function TopBar({
  topInset,
  open,
  onToggle,
}: {
  topInset: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={[styles.topBar, { paddingTop: topInset + Spacing.two }]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Menü schließen' : 'Menü öffnen'}
        hitSlop={8}
        style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}>
        <ThemedText style={styles.menuIcon}>☰</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  main: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10,
  },
  sidebar: {
    overflow: 'hidden',
    zIndex: 11,
  },
  sidebarInner: {
    width: SidebarWidth,
    flex: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
  brand: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  navIcon: {
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  menuButton: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  menuIcon: {
    fontSize: 22,
    lineHeight: 26,
  },
});
