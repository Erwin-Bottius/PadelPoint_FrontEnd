import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FontSize, Palette, Spacing } from "@/constants/theme";

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.center}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Bientôt disponible</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Palette.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Palette.textMuted,
  },
});
