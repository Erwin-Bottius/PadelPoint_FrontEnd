import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FontSize, Palette, Radius, Spacing } from "@/constants/theme";
import { type Class, type ClassPlayer } from "@/services/classes";
import { formatTime } from "@/utils/date";
import { getLevelColors, getLevelLabel } from "@/utils/level";
import { getInitials } from "@/utils/user";

type Props = {
  item: Class;
  onPress: () => void;
};


function getCountBadge(
  enrolled: number,
  max: number,
): { bg: string; color: string } {
  const spotsLeft = max - enrolled;
  if (spotsLeft <= 0)
    return { bg: Palette.successLight, color: Palette.success };
  return { bg: Palette.warningLight, color: Palette.warning };
}


function PlayerSlot({ player }: { player: ClassPlayer | null }) {
  if (player) {
    return (
      <View style={styles.slot}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(player.firstName, player.lastName)}
          </Text>
        </View>
        <Text style={styles.slotName} numberOfLines={1}>
          {player.firstName}
        </Text>
      </View>
    );
  }
  return (
    <View style={[styles.slot, styles.slotEmpty]}>
      <View style={styles.avatarEmpty}>
        <SymbolView
          name={{ ios: "person.fill", android: "person", web: "person" }}
          size={14}
          tintColor={Palette.textSecondary}
        />
      </View>
      <Text style={styles.slotNameEmpty}>Place libre</Text>
    </View>
  );
}

export function TeacherClassCard({ item, onPress }: Props) {
  const enrolled = item.players.length;
  const countBadge = getCountBadge(enrolled, item.maxPlayers);
  const levelColors = getLevelColors(item.levelMax);
  const levelLabel = getLevelLabel(item.levelMin, item.levelMax);

  const slots = Array.from(
    { length: item.maxPlayers },
    (_, i) => item.players[i] ?? null,
  );

  const rows: (ClassPlayer | null)[][] = [];
  for (let i = 0; i < slots.length; i += 2) {
    rows.push([slots[i], slots[i + 1] ?? null]);
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Top section: heure + nom + location + grille */}
      <View style={styles.topSection}>
        <View style={styles.timeCol}>
          <Text style={styles.time}>{formatTime(item.scheduledAt)}</Text>
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

          <View style={styles.grid}>
            {rows.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.gridRow}>
                {row.map((player, colIdx) => (
                  <PlayerSlot
                    key={player ? player.id : `empty-${rowIdx}-${colIdx}`}
                    player={player}
                  />
                ))}
                {row.length === 1 && (
                  <View style={[styles.slot, { opacity: 0 }]} />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Footer: durée | location | niveau */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.footerChip}>
            <Text style={styles.footerChipText}>{item.duration} min</Text>
          </View>
        </View>

        <View style={styles.footerLocation}>
          <SymbolView
            name={{ ios: "mappin", android: "location_on", web: "location_on" }}
            size={10}
            tintColor={Palette.textMuted}
          />
          <Text style={styles.footerLocationText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.footerRight}>
          <View style={[styles.levelChip, { backgroundColor: levelColors.bg }]}>
            <Text style={[styles.levelChipText, { color: levelColors.color }]}>
              {levelLabel}
            </Text>
          </View>
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
    gap: Spacing.two,
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

  grid: {
    gap: Spacing.one,
  },
  gridRow: {
    flexDirection: "row",
    gap: Spacing.one + 2,
  },
  slot: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.surfaceSubtle,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one + 2,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.primary,
  },
  slotEmpty: {
    borderStyle: "dashed",
  },
  avatarEmpty: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  slotName: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Palette.textPrimary,
    flex: 1,
  },
  slotNameEmpty: {
    fontSize: FontSize.xs,
    fontWeight: "500",
    color: Palette.textSecondary,
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
  footerLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerLocationText: {
    fontSize: FontSize.xs,
    color: Palette.textMuted,
    fontWeight: "500",
  },
  footerRight: {
    flex: 1,
    alignItems: "flex-end",
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
});
