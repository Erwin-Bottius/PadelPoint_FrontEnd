import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FontSize, Palette, Radius, Spacing } from "@/constants/theme";
import { type Class } from "@/services/classes";
import { formatTime } from "@/utils/date";
import { getLevelColors, getLevelLabel } from "@/utils/level";

type Props = {
  item: Class;
  userId: string | undefined;
  onPress: () => void;
};


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
      {/* Top section: heure + nom + localisation */}
      <View style={styles.topSection}>
        <View style={styles.timeCol}>
          <Text style={styles.time}>{formatTime(item.scheduledAt)}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.name}
            </Text>
            <View
              style={[styles.countBadge, { backgroundColor: countBadge.bg }]}
            >
              <Text
                style={[styles.countBadgeText, { color: countBadge.color }]}
              >
                {enrolled}/{item.maxPlayers}
              </Text>
            </View>
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
      </View>

      {/* Footer: gauche | centre | droite */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.footerChip}>
            <Text style={styles.footerChipText}>{item.duration} min</Text>
          </View>
        </View>

        <View style={[styles.levelChip, { backgroundColor: levelColors.bg }]}>
          <Text style={[styles.levelChipText, { color: levelColors.color }]}>
            {levelLabel}
          </Text>
        </View>

        <View style={styles.footerRight}>
          {item.teacher ? (
            <>
              <View style={styles.coachAvatar}>
                <Text style={styles.coachAvatarText}>
                  {(item.teacher.firstName[0] ?? "").toUpperCase()}
                  {(item.teacher.lastName[0] ?? "").toUpperCase()}
                </Text>
              </View>
              <Text style={styles.coachText} numberOfLines={1}>
                {item.teacher.firstName}
              </Text>
            </>
          ) : null}
          {isEnrolled && (
            <View style={styles.enrolledBadge}>
              <Text style={styles.enrolledText}>Inscrit</Text>
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
    overflow: "hidden",
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    paddingVertical: Spacing.two,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },

  topSection: {
    flexDirection: "row",
  },
  timeCol: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: Palette.surfaceSubtle,
    paddingVertical: Spacing.three,
  },
  time: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Palette.textPrimary,
  },

  content: {
    flex: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.one + 2,
  },
  titleRow: {
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
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: "700",
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

  footer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Palette.surfaceSubtle,
    backgroundColor: Palette.surface,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one + 2,
  },
  footerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  footerRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.one,
  },
  footerChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceSubtle,
  },
  footerChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.textSecondary,
  },
  levelChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  levelChipText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  coachAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Palette.avatarBg,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  coachAvatarText: {
    fontSize: 7,
    fontWeight: "800",
    color: Palette.textSecondary,
  },
  coachText: {
    fontSize: FontSize.xs,
    color: Palette.textSecondary,
    fontWeight: "500",
    flexShrink: 1,
  },
  enrolledBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Palette.primaryLight,
  },
  enrolledText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.primary,
  },
});
