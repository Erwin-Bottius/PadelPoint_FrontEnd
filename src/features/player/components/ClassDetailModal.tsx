import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
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
import type { User } from "@/context/auth";
import classesService, { type Class } from "@/services/classes";
import { formatTime } from "@/utils/date";
import { getLevelLabel } from "@/utils/level";
import { getInitials } from "@/utils/user";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Props = {
  item: Class | null;
  visible: boolean;
  profile: User | null;
  onClose: () => void;
  onOpenChat?: (classId: string) => void;
};



export function ClassDetailModal({ item, visible, profile, onClose, onOpenChat }: Props) {
  const queryClient = useQueryClient();
  const [joiningSlotKey, setJoiningSlotKey] = useState<string | null>(null);

  function invalidateClasses() {
    queryClient.invalidateQueries({ queryKey: ['classes'] });
  }

  const { mutate: join, isPending: isJoining } = useMutation({
    mutationFn: () => classesService.join(item!.id),
    onSuccess: invalidateClasses,
    onSettled: () => setJoiningSlotKey(null),
  });

  const { mutate: leave, isPending: isLeaving } = useMutation({
    mutationFn: () => classesService.leave(item!.id),
    onSuccess: invalidateClasses,
  });

  if (!item) return null;

  const isEnrolled = !!profile && item.players.some((p) => p.id === profile.id);

  const levelOk =
    (!item.levelMin && !item.levelMax) ||
    (profile?.level != null &&
      (item.levelMin == null || profile.level >= item.levelMin) &&
      (item.levelMax == null || profile.level <= item.levelMax));
  const showLevelWarning = !isEnrolled && !levelOk;

  const slots = Array.from(
    { length: item.maxPlayers },
    (_, i) => item.players[i] ?? null,
  );

  // Group into rows of 2
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
            {/* Handle */}
            <View style={styles.handleWrapper}>
              <View style={styles.handle} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header */}
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

              {/* Meta info */}
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
                    ios: "person.fill",
                    android: "person",
                    web: "person",
                  }}
                  label={`Coach ${item.teacher.firstName} ${item.teacher.lastName}`}
                />
                <InfoChip
                  icon={{
                    ios: "sportscourt",
                    android: "sports_tennis",
                    web: "sports",
                  }}
                  label={getLevelLabel(item.levelMin, item.levelMax)}
                />
              </View>
              <View style={styles.metaRow}>
                <InfoChip
                  icon={{
                    ios: "person.2.fill",
                    android: "group",
                    web: "group",
                  }}
                  label={`${item.maxPlayers} joueurs max`}
                />
              </View>

              <View
                style={[
                  styles.levelWarning,
                  !showLevelWarning && { opacity: 0 },
                ]}
              >
                <SymbolView
                  name={{
                    ios: "info.circle.fill",
                    android: "info",
                    web: "info",
                  }}
                  size={14}
                  tintColor={Palette.warning}
                />
                <Text style={styles.levelWarningText}>
                  Niveau requis : {getLevelLabel(item.levelMin, item.levelMax)}{" "}
                  — votre niveau ne correspond pas
                </Text>
              </View>

              {/* Players grid */}
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

                      const slotKey = `${rowIdx}-${colIdx}`;
                      const canJoin = !isEnrolled && levelOk;
                      const isThisSlotLoading =
                        isJoining && joiningSlotKey === slotKey;
                      return (
                        <Pressable
                          key={slotKey}
                          style={[
                            styles.playerCard,
                            styles.emptySlot,
                            !canJoin && styles.emptySlotDisabled,
                          ]}
                          onPress={
                            canJoin
                              ? () => {
                                  setJoiningSlotKey(slotKey);
                                  join();
                                }
                              : undefined
                          }
                          disabled={!canJoin || isJoining}
                        >
                          <View style={styles.slotIconWrap}>
                            {isThisSlotLoading ? (
                              <ActivityIndicator
                                size="small"
                                color={Palette.primary}
                              />
                            ) : (
                              <SymbolView
                                name={{
                                  ios: "plus.circle.fill",
                                  android: "add_circle",
                                  web: "add_circle",
                                }}
                                size={28}
                                tintColor={
                                  canJoin ? Palette.primary : Palette.textMuted
                                }
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.emptySlotText,
                              !canJoin && styles.emptySlotTextDisabled,
                            ]}
                          >
                            Place libre
                          </Text>
                        </Pressable>
                      );
                    })}
                    {/* Fill row if odd number of maxPlayers */}
                    {row[1] === undefined && (
                      <View style={[styles.playerCard, { opacity: 0 }]} />
                    )}
                  </View>
                ))}
              </View>

              <Pressable
                style={[styles.chatBtn, (!isEnrolled || !onOpenChat) && { opacity: 0 }]}
                onPress={isEnrolled && onOpenChat ? () => onOpenChat(item.id) : undefined}
                disabled={!isEnrolled || !onOpenChat}
              >
                <SymbolView
                  name={{ ios: "bubble.left.and.bubble.right.fill", android: "chat", web: "chat" }}
                  size={16}
                  tintColor={Palette.white}
                />
                <Text style={styles.chatBtnText}>Chat du cours</Text>
              </Pressable>

              <Pressable
                style={[styles.leaveBtn, !isEnrolled && { opacity: 0 }]}
                onPress={isEnrolled ? () => leave() : undefined}
                disabled={!isEnrolled || isLeaving}
              >
                <Text
                  style={[styles.leaveBtnText, { opacity: isLeaving ? 0 : 1 }]}
                >
                  Quitter la session
                </Text>
                {isLeaving && (
                  <ActivityIndicator
                    size="small"
                    color={Palette.error}
                    style={StyleSheet.absoluteFill}
                  />
                )}
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

  slotIconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySlot: {
    borderStyle: "dashed",
    backgroundColor: Palette.white,
  },
  emptySlotDisabled: {
    opacity: 0.4,
  },
  emptySlotText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Palette.primary,
  },
  emptySlotTextDisabled: {
    color: Palette.textMuted,
  },

  levelWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: Palette.warningLight,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radius.md,
    marginBottom: Spacing.two,
  },
  levelWarningText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Palette.warning,
    flex: 1,
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
  leaveBtn: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Palette.error,
    alignItems: "center",
  },
  leaveBtnText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Palette.error,
  },
});
