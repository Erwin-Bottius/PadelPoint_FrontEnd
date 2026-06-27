import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FontSize, Palette, Radius, Spacing } from "@/constants/theme";
import { WeekStrip } from "@/features/common/components/WeekStrip";
import classesService, { type BulkClassInput } from "@/services/classes";
import { addDays, getWeekStart } from "@/utils/date";

// ─── Types ───────────────────────────────────────────────────────────────────

type Slot = {
  id: string;
  hour: number;
  minute: 0 | 30;
  duration: number;
  levelMin: number;
  levelMax: number;
  location: string;
};

type WeekPlan = Record<string, Slot[]>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function keyOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildScheduledAt(dateKey: string, hour: number, minute: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, hour, minute, 0, 0).toISOString();
}

function makeSlot(prev?: Slot, offsetByDuration = false): Slot {
  let hour = prev?.hour ?? 10;
  let minute: 0 | 30 = prev?.minute ?? 0;

  if (prev && offsetByDuration) {
    const totalMinutes = prev.hour * 60 + prev.minute + prev.duration;
    hour = Math.min(23, Math.floor(totalMinutes / 60));
    minute = (totalMinutes % 60) as 0 | 30;
  }

  return {
    id: `${Date.now()}-${Math.random()}`,
    hour,
    minute,
    duration: prev?.duration ?? 90,
    levelMin: prev?.levelMin ?? 3,
    levelMax: prev?.levelMax ?? 4,
    location: prev?.location ?? "",
  };
}

// ─── Stepper ─────────────────────────────────────────────────────────────────

function Stepper({
  value,
  step,
  min,
  max,
  format,
  onChange,
}: {
  value: number;
  step: number;
  min: number;
  max: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const dec = () => {
    const next = Math.round((value - step) * 10) / 10;
    if (next >= min) onChange(next);
  };
  const inc = () => {
    const next = Math.round((value + step) * 10) / 10;
    if (next <= max) onChange(next);
  };

  return (
    <View style={ss.stepper}>
      <Pressable onPress={dec} style={ss.btn} hitSlop={10}>
        <Text style={ss.btnText}>−</Text>
      </Pressable>
      <Text style={ss.value}>{format ? format(value) : value}</Text>
      <Pressable onPress={inc} style={ss.btn} hitSlop={10}>
        <Text style={ss.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const ss = StyleSheet.create({
  stepper: { flexDirection: "row", alignItems: "center", gap: 3 },
  btn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Palette.textPrimary,
    lineHeight: 16,
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Palette.textPrimary,
    minWidth: 30,
    textAlign: "center",
  },
});

// ─── SlotCard ────────────────────────────────────────────────────────────────

const DURATION_PRESETS = [60, 90, 120];

function SlotCard({
  slot,
  onChange,
  onDelete,
  hasLocationError,
  onMeasureY,
}: {
  slot: Slot;
  onChange: (s: Slot) => void;
  onDelete: () => void;
  hasLocationError: boolean;
  onMeasureY: (y: number) => void;
}) {
  const u = (partial: Partial<Slot>) => onChange({ ...slot, ...partial });
  const [editingCustom, setEditingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const isCustom = !DURATION_PRESETS.includes(slot.duration);

  function confirmCustom() {
    const parsed = parseInt(customInput, 10);
    if (parsed > 0) u({ duration: parsed });
    setEditingCustom(false);
  }

  return (
    <View style={sc.card} onLayout={(e) => onMeasureY(e.nativeEvent.layout.y)}>
      {/* Row 1: Time · Duration · Delete */}
      <View style={sc.row}>
        <View style={sc.timeBlock}>
          <Stepper
            value={slot.hour}
            step={1}
            min={0}
            max={23}
            format={(v) => String(v).padStart(2, "0")}
            onChange={(hour) => u({ hour })}
          />
          <Text style={sc.colon}>:</Text>
          <Pressable
            onPress={() => u({ minute: slot.minute === 0 ? 30 : 0 })}
            style={sc.minToggle}
            hitSlop={8}
          >
            <Text style={sc.minText}>{String(slot.minute).padStart(2, "0")}</Text>
          </Pressable>
        </View>

        <View style={sc.durationGroup}>
          {DURATION_PRESETS.map((d) => (
            <Pressable
              key={d}
              onPress={() => { u({ duration: d }); setEditingCustom(false); }}
              style={[sc.durChip, slot.duration === d && sc.durChipOn]}
            >
              <Text style={[sc.durText, slot.duration === d && sc.durTextOn]}>
                {d}'
              </Text>
            </Pressable>
          ))}

          {editingCustom ? (
            <TextInput
              style={sc.customInput}
              value={customInput}
              onChangeText={setCustomInput}
              keyboardType="number-pad"
              autoFocus
              onBlur={confirmCustom}
              onSubmitEditing={confirmCustom}
              returnKeyType="done"
              maxLength={3}
              placeholder="min"
              placeholderTextColor={Palette.white}
            />
          ) : (
            <Pressable
              onPress={() => {
                setCustomInput(isCustom ? String(slot.duration) : "");
                setEditingCustom(true);
              }}
              style={[sc.durChip, isCustom && sc.durChipOn]}
            >
              <Text style={[sc.durText, isCustom && sc.durTextOn]}>
                {isCustom ? `${slot.duration}'` : "···"}
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable onPress={onDelete} hitSlop={10}>
          <SymbolView
            name={{ ios: "xmark.circle.fill", android: "cancel", web: "cancel" }}
            size={22}
            tintColor={Palette.border}
          />
        </Pressable>
      </View>

      {/* Row 2: Level range */}
      <View style={sc.row}>
        <Text style={sc.rowLabel}>Niv.</Text>
        <Stepper
          value={slot.levelMin}
          step={0.5}
          min={1}
          max={10}
          onChange={(newMin) => {
            if (newMin > slot.levelMax) {
              u({ levelMin: newMin, levelMax: newMin });
            } else {
              u({ levelMin: newMin });
            }
          }}
        />
        <Text style={sc.arrow}>→</Text>
        <Stepper
          value={slot.levelMax}
          step={0.5}
          min={slot.levelMin}
          max={10}
          onChange={(levelMax) => u({ levelMax })}
        />
      </View>

      {/* Row 3: Location */}
      <View style={[sc.locationRow, hasLocationError && sc.locationRowError]}>
        <SymbolView
          name={{ ios: "mappin", android: "location_on", web: "location_on" }}
          size={11}
          tintColor={hasLocationError ? Palette.error : Palette.textMuted}
          style={{ pointerEvents: "none" } as object}
        />
        <TextInput
          style={sc.locationInput}
          value={slot.location}
          onChangeText={(location) => u({ location })}
          placeholder="Lieu *"
          placeholderTextColor={hasLocationError ? Palette.error : Palette.border}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.surfaceSubtle,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  timeBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  colon: {
    fontSize: FontSize.md,
    fontWeight: "800",
    color: Palette.textPrimary,
    marginHorizontal: 1,
  },
  minToggle: {
    backgroundColor: Palette.surfaceSubtle,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    minWidth: 36,
    alignItems: "center",
  },
  minText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  durationGroup: {
    flexDirection: "row",
    gap: Spacing.one,
    flex: 1,
  },
  durChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceSubtle,
  },
  durChipOn: { backgroundColor: Palette.textPrimary },
  customInput: {
    width: 44,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Palette.textPrimary,
    color: Palette.white,
    fontSize: FontSize.xs,
    fontWeight: "700",
    textAlign: "center",
  },
  durText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Palette.textSecondary,
  },
  durTextOn: { color: Palette.white },
  rowLabel: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Palette.textMuted,
    minWidth: 24,
  },
  arrow: {
    fontSize: FontSize.sm,
    color: Palette.textMuted,
    marginHorizontal: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: Palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
  },
  locationInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Palette.textPrimary,
    fontWeight: "500",
    paddingVertical: 0,
  },
  locationRowError: {
    borderColor: Palette.error,
    backgroundColor: Palette.errorLight,
  },
});

// ─── PlanningModal ────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function PlanningModal({ visible, onClose }: Props) {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => keyOf(new Date()));
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({});

  const [showWeekWarning, setShowWeekWarning] = useState(false);
  const weekWarningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const slotPositions = useRef<Record<string, number>>({});
  const pendingScrollId = useRef<string | null>(null);
  const [slotErrors, setSlotErrors] = useState<Set<string>>(new Set());
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);
  const submittedSlotOrder = useRef<Array<{ id: string; day: string }>>([]);

  const slots = weekPlan[selectedDay] ?? [];
  const totalSlots = Object.values(weekPlan).reduce((n, s) => n + s.length, 0);
  const atLimit = totalSlots >= 40;

  const classCounts: Record<string, number> = {};
  Object.entries(weekPlan).forEach(([day, s]) => {
    if (s.length > 0) classCounts[day] = s.length;
  });

  useEffect(() => {
    return () => {
      if (weekWarningTimer.current) clearTimeout(weekWarningTimer.current);
    };
  }, []);

  function handleWeekChange(delta: -1 | 1) {
    if (totalSlots > 0) {
      setShowWeekWarning(true);
      if (weekWarningTimer.current) clearTimeout(weekWarningTimer.current);
      weekWarningTimer.current = setTimeout(() => setShowWeekWarning(false), 3500);
      return;
    }
    const newOffset = weekOffset + delta;
    setWeekOffset(newOffset);
    if (newOffset === 0) {
      setSelectedDay(keyOf(new Date()));
    } else {
      const newWeekStart = getWeekStart(addDays(new Date(), newOffset * 7));
      setSelectedDay(keyOf(newWeekStart));
    }
  }

  function addSlot() {
    const sameDayPrev = slots.at(-1);
    if (sameDayPrev && !sameDayPrev.location.trim()) {
      const newErrors = new Set([...slotErrors, sameDayPrev.id]);
      setSlotErrors(newErrors);
      setTimeout(() => scrollToSlot(sameDayPrev.id), 50);
      return;
    }
    const anyPrev = Object.values(weekPlan).flat().at(-1);
    const newSlot = sameDayPrev
      ? makeSlot(sameDayPrev, true)
      : makeSlot(anyPrev, false);
    setWeekPlan((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] ?? []), newSlot],
    }));
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }

  function updateSlot(id: string, updated: Slot) {
    if (updated.location.trim() && slotErrors.has(id)) {
      setSlotErrors((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    setWeekPlan((prev) => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] ?? []).map((s) =>
        s.id === id ? updated : s,
      ),
    }));
  }

  function deleteSlot(id: string) {
    if (slotErrors.has(id)) {
      setSlotErrors((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    setWeekPlan((prev) => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] ?? []).filter((s) => s.id !== id),
    }));
  }

  function weekOffsetForDay(dayKey: string): number {
    const target = getWeekStart(new Date(dayKey + "T12:00:00"));
    const current = getWeekStart(new Date());
    return Math.round((target.getTime() - current.getTime()) / (7 * 24 * 60 * 60 * 1000));
  }

  function scrollToSlot(slotId: string) {
    const y = slotPositions.current[slotId];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
    }
  }

  function goToErrorDay(dayKey: string, errorIds: Set<string>) {
    const firstErrorSlot = (weekPlan[dayKey] ?? []).find((s) => errorIds.has(s.id));
    if (!firstErrorSlot) return;
    if (dayKey === selectedDay) {
      setTimeout(() => scrollToSlot(firstErrorSlot.id), 50);
    } else {
      pendingScrollId.current = firstErrorSlot.id;
      setWeekOffset(weekOffsetForDay(dayKey));
      setSelectedDay(dayKey);
    }
  }

  function validateAll(): boolean {
    const errorIds = new Set<string>();
    let firstErrorDay: string | null = null;
    for (const [day, daySlots] of Object.entries(weekPlan)) {
      for (const slot of daySlots) {
        if (!slot.location.trim()) {
          errorIds.add(slot.id);
          if (!firstErrorDay) firstErrorDay = day;
        }
      }
    }
    setSlotErrors(errorIds);
    if (firstErrorDay) goToErrorDay(firstErrorDay, errorIds);
    return errorIds.size === 0;
  }

  function handleSubmit() {
    setApiErrorMsg(null);
    if (!validateAll()) return;
    const ordered: Array<{ id: string; day: string }> = [];
    Object.entries(weekPlan).forEach(([day, daySlots]) =>
      daySlots.forEach((slot) => ordered.push({ id: slot.id, day })),
    );
    submittedSlotOrder.current = ordered;
    submit();
  }

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => {
      const classes: BulkClassInput[] = submittedSlotOrder.current.map(({ id, day }) => {
        const slot = weekPlan[day]!.find((s) => s.id === id)!;
        return {
          scheduledAt: buildScheduledAt(day, slot.hour, slot.minute),
          duration: slot.duration,
          location: slot.location,
          levelMin: slot.levelMin,
          levelMax: slot.levelMax,
        };
      });
      return classesService.createBulk(classes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setWeekPlan({});
      setSlotErrors(new Set());
      setApiErrorMsg(null);
      setWeekOffset(0);
      setSelectedDay(keyOf(new Date()));
      onClose();
    },
    onError: (error: unknown) => {
      const apiErrors =
        (error as { response?: { data?: { errors?: Array<{ message: string; field: string }> } } })
          ?.response?.data?.errors ?? [];
      if (apiErrors.length > 0) {
        const newErrors = new Set<string>();
        let firstErrorDay: string | null = null;
        apiErrors.forEach((err) => {
          const match = err.field.match(/classes\.(\d+)/);
          if (match) {
            const slotInfo = submittedSlotOrder.current[parseInt(match[1], 10)];
            if (slotInfo) {
              newErrors.add(slotInfo.id);
              if (!firstErrorDay) firstErrorDay = slotInfo.day;
            }
          }
        });
        setSlotErrors(newErrors);
        if (firstErrorDay) goToErrorDay(firstErrorDay, newErrors);
        setApiErrorMsg(apiErrors[0]?.message ?? "Une erreur est survenue");
      } else {
        setApiErrorMsg("Une erreur est survenue. Réessayez.");
      }
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[pm.screen, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={pm.flex}
        >
          {/* Header */}
          <View style={pm.header}>
            <Pressable onPress={onClose} hitSlop={16} style={pm.cancelBtn}>
              <Text style={pm.cancelText}>Annuler</Text>
            </Pressable>
            <Text style={pm.headerTitle}>Planification</Text>
            <View style={pm.headerSpacer} />
          </View>

          {/* Week strip */}
          <WeekStrip
            weekOffset={weekOffset}
            onChangeWeek={handleWeekChange}
            classCounts={classCounts}
            selectedDay={selectedDay}
            onDayPress={(day) => {
              const newErrors = new Set(slotErrors);
              let firstErrorSlot: Slot | undefined;
              for (const slot of slots) {
                if (!slot.location.trim()) {
                  newErrors.add(slot.id);
                  if (!firstErrorSlot) firstErrorSlot = slot;
                }
              }
              if (firstErrorSlot) {
                setSlotErrors(newErrors);
                setTimeout(() => scrollToSlot(firstErrorSlot!.id), 50);
                return;
              }
              setSelectedDay(day);
            }}
          />

          {/* Week lock warning */}
          <View style={[pm.weekWarning, { opacity: showWeekWarning ? 1 : 0 }]}>
            <SymbolView
              name={{ ios: "lock.fill", android: "lock", web: "lock" }}
              size={12}
              tintColor={Palette.warning}
              style={{ pointerEvents: "none" } as object}
            />
            <Text style={pm.weekWarningText}>
              Publiez d'abord cette semaine avant d'en changer
            </Text>
          </View>

          {/* Slots for selected day */}
          <ScrollView
            ref={scrollRef}
            style={pm.flex}
            contentContainerStyle={pm.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {slots.length === 0 && (
              <View style={pm.empty}>
                <Text style={pm.emptyText}>Aucun créneau pour ce jour</Text>
              </View>
            )}

            {slots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                hasLocationError={slotErrors.has(slot.id)}
                onChange={(updated) => updateSlot(slot.id, updated)}
                onDelete={() => deleteSlot(slot.id)}
                onMeasureY={(y) => {
                  slotPositions.current[slot.id] = y;
                  if (pendingScrollId.current === slot.id) {
                    pendingScrollId.current = null;
                    scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
                  }
                }}
              />
            ))}

            <Pressable
              onPress={atLimit ? undefined : addSlot}
              style={[pm.addBtn, atLimit && pm.addBtnDisabled]}
            >
              <SymbolView
                name={{
                  ios: "plus.circle.fill",
                  android: "add_circle",
                  web: "add_circle",
                }}
                size={18}
                tintColor={atLimit ? Palette.textMuted : Palette.primary}
                style={{ pointerEvents: "none" } as object}
              />
              <Text style={[pm.addBtnText, atLimit && pm.addBtnTextDisabled]}>
                {atLimit ? "40 cours max par envoi" : "Ajouter un créneau"}
              </Text>
            </Pressable>
            {atLimit && (
              <Text style={pm.limitHint}>Publiez pour continuer</Text>
            )}
          </ScrollView>

          {/* Submit */}
          <View style={[pm.footer, { paddingBottom: insets.bottom + Spacing.two }]}>
            {apiErrorMsg && (
              <View style={pm.apiError}>
                <Text style={pm.apiErrorText}>{apiErrorMsg}</Text>
              </View>
            )}
            <Pressable
              style={[
                pm.submitBtn,
                (totalSlots === 0 || isPending) && pm.submitBtnOff,
              ]}
              onPress={handleSubmit}
              disabled={totalSlots === 0 || isPending}
            >
              <Text style={pm.submitText}>
                {isPending
                  ? "Création en cours…"
                  : totalSlots === 0
                    ? "Aucun cours à créer"
                    : `Créer ${totalSlots} cours`}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const pm = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.white },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Palette.surfaceSubtle,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: "800",
    color: Palette.textPrimary,
  },
  cancelBtn: {
    minWidth: 70,
  },
  cancelText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  headerSpacer: {
    minWidth: 70,
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.four,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Palette.textMuted,
  },
  weekWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: Palette.warningLight,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  weekWarningText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Palette.warning,
    flex: 1,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Palette.border,
    marginTop: Spacing.one,
  },
  addBtnDisabled: {
    borderColor: Palette.surfaceSubtle,
    backgroundColor: Palette.surfaceSubtle,
  },
  addBtnText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Palette.primary,
  },
  addBtnTextDisabled: {
    color: Palette.textMuted,
  },
  limitHint: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Palette.textMuted,
    textAlign: "center",
    marginTop: Spacing.one,
  },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Palette.surfaceSubtle,
    backgroundColor: Palette.white,
  },
  submitBtn: {
    backgroundColor: Palette.textPrimary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  submitBtnOff: { opacity: 0.35 },
  apiError: {
    backgroundColor: Palette.errorLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
    marginBottom: Spacing.two,
  },
  apiErrorText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Palette.error,
  },
  submitText: {
    fontSize: FontSize.md,
    fontWeight: "800",
    color: Palette.white,
  },
});
