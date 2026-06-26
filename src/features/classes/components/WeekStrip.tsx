import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FontSize, Palette, Spacing } from "@/constants/theme";
import {
  addDays,
  dayAbbr,
  getWeekStart,
  isToday,
  weekRangeLabel,
} from "@/utils/date";

type Props = {
  weekOffset: number;
  onChangeWeek: (delta: -1 | 1) => void;
  classCounts: Record<string, number>;
  selectedDay: string | null;
  onDayPress: (key: string) => void;
};

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function WeekStrip({
  weekOffset,
  onChangeWeek,
  classCounts,
  selectedDay,
  onDayPress,
}: Props) {
  const baseDate = addDays(new Date(), weekOffset * 7);
  const weekStart = getWeekStart(baseDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <View style={styles.container}>
      <View style={styles.weekHeader}>
        <Pressable onPress={() => onChangeWeek(-1)} hitSlop={12}>
          <SymbolView
            name={{ ios: "arrow.left.circle.fill", android: "arrow_back", web: "arrow_back" }}
            size={28}
            tintColor={Palette.textPrimary}
          />
        </Pressable>

        <Text style={styles.weekLabel}>{weekRangeLabel(weekStart)}</Text>

        <Pressable onPress={() => onChangeWeek(1)} hitSlop={12}>
          <SymbolView
            name={{ ios: "arrow.right.circle.fill", android: "arrow_forward", web: "arrow_forward" }}
            size={28}
            tintColor={Palette.textPrimary}
          />
        </Pressable>
      </View>

      <View style={styles.daysRow}>
        {days.map((day) => {
          const key = dayKey(day);
          const today = isToday(day);
          const selected = selectedDay === key;
          const count = classCounts[key] ?? 0;

          return (
            <Pressable
              key={key}
              onPress={() => onDayPress(key)}
              style={[
                styles.dayCell,
                today && styles.dayCellToday,
                selected && styles.dayCellSelected,
              ]}
            >
              <Text
                style={[
                  styles.dayAbbr,
                  today && styles.dayTextToday,
                  selected && styles.dayTextSelected,
                ]}
              >
                {dayAbbr(day)}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  today && styles.dayTextToday,
                  selected && styles.dayTextSelected,
                ]}
              >
                {day.getDate()}
              </Text>
              {count > 0 ? (
                <View
                  style={[
                    styles.countBadge,
                    today && styles.countBadgeToday,
                    selected && styles.countBadgeSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      today && styles.countTextToday,
                      selected && styles.countTextSelected,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              ) : (
                <View style={styles.countBadgePlaceholder} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },

  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weekLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Palette.textSecondary,
    textTransform: "capitalize",
  },

  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 1,
  },
  dayCell: {
    flex: 1,
    height: 68,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.surfaceSubtle,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  dayCellToday: {
    backgroundColor: Palette.primaryLight,
    borderColor: Palette.primary,
  },
  dayCellSelected: {
    backgroundColor: Palette.textPrimary,
    borderColor: Palette.textPrimary,
  },

  dayAbbr: {
    fontSize: 9,
    fontWeight: "700",
    color: Palette.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dayNumber: {
    fontSize: FontSize.md,
    fontWeight: "800",
    color: Palette.textPrimary,
  },
  dayTextToday: {
    color: Palette.primary,
  },
  dayTextSelected: {
    color: Palette.white,
  },

  countBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Palette.border,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeToday: {
    backgroundColor: Palette.primary,
  },
  countBadgeSelected: {
    backgroundColor: Palette.primary,
  },
  countText: {
    fontSize: 8,
    fontWeight: "800",
    color: Palette.textSecondary,
  },
  countTextToday: {
    color: Palette.white,
  },
  countTextSelected: {
    color: Palette.white,
  },
  countBadgePlaceholder: {
    width: 16,
    height: 16,
  },
});
