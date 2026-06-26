import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/components/ui/app-header";
import { FontSize, Palette, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { ClassCard } from "@/features/classes/components/ClassCard";
import { InfoCard } from "@/features/classes/components/InfoCard";
import { WeekStrip } from "@/features/classes/components/WeekStrip";
import classesService from "@/services/classes";
import playersService from "@/services/players";
import {
  addDays,
  formatShortDate,
  getWeekStart,
  isSameDay,
} from "@/utils/date";

import type { Class } from "@/services/classes";

type Section = {
  date: Date;
  data: Class[];
};

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function ClassListScreen() {
  const { signOut } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const weekStart = getWeekStart(addDays(new Date(), weekOffset * 7));
  const weekEnd = addDays(weekStart, 7);
  const startDate = weekStart.toISOString().slice(0, 10);
  const endDate = weekEnd.toISOString().slice(0, 10);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: playersService.getProfile,
  });

  const {
    data: classes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["classes", startDate, endDate],
    queryFn: () => classesService.getAll({ startDate, endDate }),
  });

  const userId = profile?.id;

  const sections: Section[] = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const dayClasses = classes
      .filter((c) => {
        const isFull = c.players.length >= c.maxPlayers;
        const isEnrolled = !!userId && c.players.some((p) => p.id === userId);
        return !isFull || isEnrolled;
      })
      .filter((c) => isSameDay(new Date(c.scheduledAt), day))
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
    return { date: day, data: dayClasses };
  }).filter((s) => s.data.length > 0);

  const classCounts: Record<string, number> = {};
  for (const s of sections) {
    classCounts[dayKey(s.date)] = s.data.length;
  }

  const visibleSections = selectedDay
    ? sections.filter((s) => dayKey(s.date) === selectedDay)
    : sections;

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeTop}>
        <AppHeader onLogoutPress={signOut} />
      </SafeAreaView>

      <SectionList
        sections={visibleSections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <InfoCard
              firstName={profile?.firstName}
              weekClassCount={sections.reduce((acc, s) => acc + s.data.length, 0)}
              isLoading={isLoading}
            />
            <WeekStrip
              weekOffset={weekOffset}
              onChangeWeek={(delta) => {
                setWeekOffset((p) => p + delta);
                setSelectedDay(null);
              }}
              classCounts={classCounts}
              selectedDay={selectedDay}
              onDayPress={(key) => setSelectedDay((prev) => prev === key ? null : key)}
            />
          </>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>
            {formatShortDate(section.date)}
          </Text>
        )}
        renderItem={({ item }) => <ClassCard item={item} userId={userId} onPress={() => {}} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => (
          <View style={styles.sectionSeparator} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Palette.primary} />
            </View>
          ) : isError ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>
                Impossible de charger les cours.
              </Text>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>
                {selectedDay ? "Aucun cours ce jour" : "Aucun cours cette semaine"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {selectedDay ? "Sélectionnez un autre jour." : "Essayez la semaine suivante."}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  safeTop: {
    backgroundColor: Palette.white,
  },

  listContent: {
    paddingBottom: Spacing.six,
    paddingHorizontal: Spacing.three,
  },

  sectionHeader: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Palette.textSecondary,
    textTransform: "capitalize",
    marginBottom: Spacing.two,
  },
  separator: {
    height: Spacing.two,
  },
  sectionSeparator: {
    height: Spacing.three,
  },

  center: {
    paddingTop: 64,
    alignItems: "center",
    gap: Spacing.two,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Palette.error,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Palette.textMuted,
  },
});
