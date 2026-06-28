import { SymbolView } from "expo-symbols";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FontSize, Palette, Radius, Spacing } from "@/constants/theme";
import { type Class } from "@/services/classes";
import { formatTime } from "@/utils/date";
import { getLevelLabel } from "@/utils/level";
import { getInitials } from "@/utils/user";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Props = {
  item: Class | null;
  visible: boolean;
  onClose: () => void;
  onOpenChat?: (classId: string) => void;
};



export function TeacherDetailModal({ item, visible, onClose, onOpenChat }: Props) {
  if (!item) return null;

  const slots = Array.from(
    { length: item.maxPlayers },
    (_, i) => item.players[i] ?? null,
  );

  const rows: (typeof slots)[number][][] = [];
  for (let i = 0; i < slots.length; i += 2) {
    rows.push([slots[i], slots[i + 1] ?? null]);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <SafeAreaView edges={["bottom"]}>
            <View style={styles.handleWrapper}>
              <View style={styles.handle} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.header}>
                <Text style={styles.className}>{item.name}</Text>
                <Pressable onPress={onClose} hitSlop={12}>
                  <SymbolView
                    name={{
                      ios: "xmark.circle.fill",
                      android: "cancel",
                      web: "cancel",
                    }}
                    size={28}
                    tintColor={Palette.textMuted}
                  />
                </Pressable>
              </View>

              <View style={styles.metaRow}>
                <InfoChip
                  icon={{ ios: "clock", android: "schedule", web: "schedule" }}
                  label={`${formatTime(item.scheduledAt)} · ${item.duration}min`}
                />
                <InfoChip
                  icon={{
                    ios: "mappin",
                    android: "location_on",
                    web: "location_on",
                  }}
                  label={item.location}
                />
              </View>
              <View style={styles.metaRow}>
                <InfoChip
                  icon={{
                    ios: "sportscourt",
                    android: "sports_tennis",
                    web: "sports",
                  }}
                  label={getLevelLabel(item.levelMin, item.levelMax)}
                />
                <InfoChip
                  icon={{
                    ios: "person.2.fill",
                    android: "group",
                    web: "group",
                  }}
                  label={`${item.players.length}/${item.maxPlayers} inscrits`}
                />
              </View>

              <Text style={styles.sectionTitle}>Participants</Text>
              <View style={styles.grid}>
                {rows.map((row, rowIdx) => (
                  <View key={rowIdx} style={styles.gridRow}>
                    {row.map((slot, colIdx) => {
                      if (slot) {
                        return (
                          <View key={slot.id} style={styles.playerCard}>
                            <View style={styles.playerAvatar}>
                              <Text style={styles.playerAvatarText}>
                                {getInitials(slot.firstName, slot.lastName)}
                              </Text>
                            </View>
                            <Text style={styles.playerName} numberOfLines={1}>
                              {slot.firstName} {slot.lastName}
                            </Text>
                            <Text style={styles.playerLevel}>
                              Niv. {slot.level}
                            </Text>
                          </View>
                        );
                      }

                      return (
                        <View
                          key={`empty-${rowIdx}-${colIdx}`}
                          style={[styles.playerCard, styles.emptySlot]}
                        >
                          <View style={styles.emptyAvatar}>
                            <SymbolView
                              name={{
                                ios: "person.fill",
                                android: "person",
                                web: "person",
                              }}
                              size={20}
                              tintColor={Palette.border}
                            />
                          </View>
                          <Text style={styles.emptySlotText}>Place libre</Text>
                        </View>
                      );
                    })}
                    {row[1] === undefined && (
                      <View style={[styles.playerCard, { opacity: 0 }]} />
                    )}
                  </View>
                ))}
              </View>

              <Pressable
                style={[styles.chatBtn, !onOpenChat && { opacity: 0 }]}
                onPress={onOpenChat ? () => onOpenChat(item.id) : undefined}
                disabled={!onOpenChat}
              >
                <SymbolView
                  name={{ ios: "bubble.left.and.bubble.right.fill", android: "chat", web: "chat" }}
                  size={16}
                  tintColor={Palette.white}
                />
                <Text style={styles.chatBtnText}>Chat du cours</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

function InfoChip({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof SymbolView>["name"];
  label: string;
}) {
  return (
    <View style={styles.chip}>
      <SymbolView name={icon} size={13} tintColor={Palette.textSecondary} />
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backdrop: {
    flex: 10,
  },
  sheet: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.65,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 20,
  },
  handleWrapper: {
    alignItems: "center",
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.surfaceSubtle,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.two,
  },
  className: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Palette.textPrimary,
    flex: 1,
    paddingRight: Spacing.two,
  },

  metaRow: {
    flexDirection: "row",
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: Palette.surfaceSubtle,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radius.md,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Palette.textSecondary,
    flex: 1,
  },

  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Palette.textPrimary,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },

  grid: {
    gap: Spacing.two,
  },
  gridRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  playerCard: {
    flex: 1,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.surfaceSubtle,
    padding: Spacing.two,
    alignItems: "center",
    gap: Spacing.one,
    minHeight: 90,
    justifyContent: "center",
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  playerAvatarText: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Palette.primary,
  },
  playerName: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Palette.textPrimary,
    textAlign: "center",
  },
  playerLevel: {
    fontSize: 10,
    fontWeight: "600",
    color: Palette.textMuted,
  },

  emptySlot: {
    borderStyle: "dashed",
    backgroundColor: Palette.white,
  },
  emptyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySlotText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Palette.border,
  },
  chatBtn: {
    marginTop: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
  },
  chatBtnText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Palette.white,
  },
});
