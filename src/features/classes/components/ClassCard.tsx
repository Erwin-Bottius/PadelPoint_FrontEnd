import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FontSize, Palette, Radius, Spacing } from "@/constants/theme";
import { type Class } from "@/services/classes";
import { formatTime } from "@/utils/date";

type Props = {
  item: Class;
  userId: string | undefined;
  onPress: () => void;
};

function getLevelLabel(
  levelMin: number | null,
  levelMax: number | null,
): string {
  if (!levelMin && !levelMax) return "Ouvert à tous";
  if (levelMin && levelMax) return `Niv. ${levelMin}–${levelMax}`;
  return `Niv. ${levelMin ?? levelMax}`;
}

function getLevelColors(levelMax: number | null): {
  bg: string;
  color: string;
} {
  if (!levelMax) return { bg: Palette.successLight, color: Palette.success };
  if (levelMax > 7)
    return { bg: Palette.levelEliteLight, color: Palette.levelElite };
  if (levelMax > 5)
    return { bg: Palette.levelAdvancedLight, color: Palette.levelAdvanced };
  if (levelMax > 3)
    return {
      bg: Palette.levelIntermediateLight,
      color: Palette.levelIntermediate,
    };
  return { bg: Palette.levelBeginnerLight, color: Palette.levelBeginner };
}

function getCountBadge(
  enrolled: number,
  max: number,
): { bg: string; color: string } {
  const spotsLeft = max - enrolled;
  if (spotsLeft === 1)
    return { bg: Palette.warningLight, color: Palette.warning };
  if (spotsLeft <= 0)
    return { bg: Palette.surfaceSubtle, color: Palette.textSecondary };
  return { bg: Palette.successLight, color: Palette.success };
}

export function ClassCard({ item, userId, onPress }: Props) {
  const enrolled = item.players.length;
  const isEnrolled = !!userId && item.players.some((p) => p.id === userId);
  const levelLabel = getLevelLabel(item.levelMin, item.levelMax);
  const countBadge = getCountBadge(enrolled, item.maxPlayers);
  const levelColors = getLevelColors(item.levelMax);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.timeCol}>
        <Text style={styles.time}>{formatTime(item.scheduledAt)}</Text>
        <Text style={styles.duration}>{item.duration}m</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: countBadge.bg }]}>
            <Text style={[styles.badgeText, { color: countBadge.color }]}>
              {enrolled}/{item.maxPlayers}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.coachRow}>
            {item.teacher ? (
              <Text style={styles.coachName}>
                Coach {item.teacher.firstName} {item.teacher.lastName}
              </Text>
            ) : null}
          </View>
          <View style={styles.locationRow}>
            <SymbolView
              name={{
                ios: "mappin",
                android: "location_on",
                web: "location_on",
              }}
              size={10}
              tintColor={Palette.textMuted}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          <View style={[styles.levelTag, { backgroundColor: levelColors.bg }]}>
            <Text style={[styles.levelTagText, { color: levelColors.color }]}>
              {levelLabel}
            </Text>
          </View>
          {isEnrolled && (
            <View style={styles.enrolledBadge}>
              <Text style={styles.enrolledBadgeText}>Inscrit</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.surfaceSubtle,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },

  timeCol: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: Palette.surfaceSubtle,
    paddingVertical: Spacing.three,
    marginVertical: Spacing.one,
    gap: 4,
  },
  time: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  duration: {
    fontSize: 10,
    color: Palette.textMuted,
    fontWeight: "500",
  },

  content: {
    flex: 1,
    paddingVertical: Spacing.three + 2,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two + 2,
  },

  metaRow: {
    gap: Spacing.one + 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: FontSize.xs,
    color: Palette.textMuted,
    fontWeight: "500",
    flex: 1,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  coachRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one + 2,
  },
  coachAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Palette.avatarBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Palette.white,
  },
  coachAvatarText: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.textSecondary,
  },
  coachName: {
    fontSize: FontSize.xs,
    color: Palette.textSecondary,
    fontWeight: "500",
  },

  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.one,
  },
  levelTag: {
    backgroundColor: Palette.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  enrolledBadge: {
    backgroundColor: Palette.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  enrolledBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
});
