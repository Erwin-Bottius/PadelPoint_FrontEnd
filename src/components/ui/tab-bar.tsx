import { useQuery } from "@tanstack/react-query";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FontSize, Palette, Radius, Spacing } from "@/constants/theme";
import { PlanningModal } from "@/features/teacher/screens/PlanningModal";
import playersService from "@/services/players";

type Route = { key: string; name: string };

type Props = {
  state: { routes: Route[]; index: number };
  navigation: { navigate: (name: string) => void };
};

type TabConfig = {
  label: string;
  icon: React.ComponentProps<typeof SymbolView>["name"];
};

const TAB_CONFIG: Record<string, TabConfig> = {
  index: {
    label: "Cours",
    icon: { ios: "tennisball.circle.fill", android: "padel", web: "sports" },
  },
  messages: {
    label: "Messages",
    icon: { ios: "message.fill", android: "chat", web: "chat" },
  },
};

export function TabBar({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [planningVisible, setPlanningVisible] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: playersService.getProfile,
  });
  const isTeacher = profile?.role === "teacher";

  const routes = state.routes;
  const indexRoute = routes.find((r) => r.name === "index");
  const messagesRoute = routes.find((r) => r.name === "messages");

  function renderTab(route: Route) {
    const routeIndex = routes.indexOf(route);
    const isActive = state.index === routeIndex;
    const config = TAB_CONFIG[route.name];
    if (!config) return null;

    return (
      <Pressable
        key={route.key}
        onPress={() => navigation.navigate(route.name)}
        style={styles.tab}
        hitSlop={8}
      >
        <View style={[styles.pill, isActive && styles.pillActive]}>
          <SymbolView
            name={config.icon}
            size={20}
            tintColor={isActive ? Palette.textPrimary : Palette.textMuted}
          />
          <Text style={[styles.label, isActive && styles.labelActive]}>
            {config.label}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {indexRoute && renderTab(indexRoute)}

      {isTeacher && (
        <Pressable
          onPress={() => setPlanningVisible(true)}
          style={styles.plusBtn}
          hitSlop={8}
        >
          <SymbolView
            name={{ ios: "plus", android: "add", web: "add" }}
            size={22}
            tintColor={Palette.white}
          />
        </Pressable>
      )}

      {messagesRoute && renderTab(messagesRoute)}

      <PlanningModal
        visible={planningVisible}
        onClose={() => setPlanningVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.white,
    borderTopWidth: 1,
    borderTopColor: Palette.surfaceSubtle,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radius.full,
  },
  pillActive: {
    backgroundColor: Palette.surfaceSubtle,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Palette.textMuted,
  },
  labelActive: {
    color: Palette.textPrimary,
    fontWeight: "700",
  },
  plusBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Palette.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
});
