import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FontSize, Palette, Radius, Spacing } from "@/constants/theme";

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

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {state.routes.map((route: Route, index: number) => {
        const isActive = state.index === index;
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
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
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
});
