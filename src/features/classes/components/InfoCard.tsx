import { StyleSheet, Text, View } from "react-native";

import { FontSize, Palette, Spacing } from "@/constants/theme";
import { formatShortDate } from "@/utils/date";

type Props = {
  firstName?: string;
  weekClassCount: number;
  isLoading?: boolean;
};

export function InfoCard({ firstName, weekClassCount, isLoading }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.date}>{formatShortDate(new Date())}</Text>

      <View style={styles.bottomRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit>
            {firstName ?? "..."} 👋
          </Text>
        </View>

        <View style={styles.statBlock}>
          <Text style={[styles.statCount, isLoading && { opacity: 0 }]}>
            {weekClassCount}
          </Text>
          <Text style={styles.statLabel}>cours dispos{"\n"}cette semaine</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
    backgroundColor: Palette.textPrimary,
    borderRadius: 20,
    padding: 20,
    gap: Spacing.three,
    shadowColor: Palette.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },

  date: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Palette.whiteSubtle,
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  greetingBlock: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Palette.white,
    letterSpacing: -0.5,
  },

  statBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
  statCount: {
    fontSize: FontSize["3xl"],
    fontWeight: "900",
    color: Palette.white,
    lineHeight: 32,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Palette.whiteSubtle,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    textAlign: "right",
  },
});
