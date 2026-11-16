import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];
const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WEEKDAYS_LONG = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
];

type YMD = { year: number; month: number; day: number };

/** Liefert die Zellen des Monats, Woche beginnt am Montag; null = leere Zelle. */
function buildMonthGrid(year: number, month: number): (number | null)[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const sameDay = (a: YMD | null, b: YMD) =>
  !!a && a.year === b.year && a.month === b.month && a.day === b.day;

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();

  const [today] = useState<YMD>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  });
  const [view, setView] = useState({ year: today.year, month: today.month });
  const [selected, setSelected] = useState<YMD | null>(null);

  const shiftMonth = (delta: number) => {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };
  const shiftYear = (delta: number) => setView((v) => ({ ...v, year: v.year + delta }));
  const goToday = () => {
    setView({ year: today.year, month: today.month });
    setSelected(today);
  };

  const cells = buildMonthGrid(view.year, view.month);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const selectedLabel = selected
    ? `${WEEKDAYS_LONG[new Date(selected.year, selected.month, selected.day).getDay()]}, ${selected.day}. ${MONTHS[selected.month]} ${selected.year}`
    : null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.four }]}>
        <View style={styles.content}>
          <ThemedText type="subtitle">Kalender</ThemedText>

          <View style={styles.controls}>
            <Stepper
              label={MONTHS[view.month]}
              onPrev={() => shiftMonth(-1)}
              onNext={() => shiftMonth(1)}
              prevLabel="Vorheriger Monat"
              nextLabel="Nächster Monat"
            />
            <Stepper
              label={String(view.year)}
              onPrev={() => shiftYear(-1)}
              onNext={() => shiftYear(1)}
              prevLabel="Vorheriges Jahr"
              nextLabel="Nächstes Jahr"
            />
            <Pressable
              onPress={goToday}
              accessibilityRole="button"
              style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold" style={styles.todayText}>
                Heute
              </ThemedText>
            </Pressable>
          </View>

          <ThemedView type="backgroundElement" style={styles.calendar}>
            <View style={styles.row}>
              {WEEKDAYS_SHORT.map((wd, i) => (
                <View key={wd} style={styles.headerCell}>
                  <ThemedText type="smallBold" themeColor={i >= 5 ? 'textSecondary' : 'text'}>
                    {wd}
                  </ThemedText>
                </View>
              ))}
            </View>

            {rows.map((row, r) => (
              <View key={r} style={styles.row}>
                {row.map((day, c) => {
                  if (day === null) return <View key={c} style={styles.cell} />;
                  const date = { ...view, day };
                  const isToday = sameDay(today, date);
                  const isSelected = sameDay(selected, date);
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setSelected(date)}
                      accessibilityRole="button"
                      accessibilityLabel={`${day}. ${MONTHS[view.month]} ${view.year}`}
                      accessibilityState={{ selected: isSelected }}
                      style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
                      <View
                        style={[
                          styles.dayCircle,
                          isToday && { borderColor: Accent, borderWidth: 2 },
                          isSelected && { backgroundColor: Accent },
                        ]}>
                        <ThemedText
                          style={isSelected && styles.selectedText}
                          themeColor={c >= 5 ? 'textSecondary' : 'text'}>
                          {day}
                        </ThemedText>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ThemedView>

          <ThemedText type="small" themeColor="textSecondary">
            {selectedLabel ? `Ausgewählt: ${selectedLabel}` : 'Tippe auf einen Tag, um ihn auszuwählen.'}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Stepper({
  label,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.stepper, { backgroundColor: theme.backgroundElement }]}>
      <Pressable
        onPress={onPrev}
        accessibilityRole="button"
        accessibilityLabel={prevLabel}
        hitSlop={6}
        style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}>
        <ThemedText style={styles.arrowText}>‹</ThemedText>
      </Pressable>
      <ThemedText type="smallBold" style={styles.stepperLabel}>
        {label}
      </ThemedText>
      <Pressable
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel={nextLabel}
        hitSlop={6}
        style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}>
        <ThemedText style={styles.arrowText}>›</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
  stepperLabel: {
    minWidth: 96,
    textAlign: 'center',
  },
  arrow: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  arrowText: {
    fontSize: 24,
    lineHeight: 32,
  },
  todayButton: {
    backgroundColor: Accent,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  todayText: {
    color: '#ffffff',
  },
  calendar: {
    borderRadius: Spacing.four,
    padding: Spacing.two,
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  cell: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.6,
  },
});
