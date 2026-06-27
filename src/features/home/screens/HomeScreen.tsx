import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Palette } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import PlayerClassListScreen from "@/features/player/screens/ClassListScreen";
import TeacherClassListScreen from "@/features/teacher/screens/TeacherClassListScreen";
import playersService from "@/services/players";

export default function HomeScreen() {
  const { token } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: playersService.getProfile,
    enabled: !!token,
  });

  if (isLoading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  if (profile.role === "teacher") return <TeacherClassListScreen />;
  return <PlayerClassListScreen />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Palette.white,
  },
});
