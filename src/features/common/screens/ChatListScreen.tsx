import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FontSize, Palette, Radius, Spacing } from "@/constants/theme";
import messagesService, { type Chat } from "@/services/messages";
import { formatShortDate } from "@/utils/date";

export function ChatListScreen() {
  const router = useRouter();
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: messagesService.getChats,
  });

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Text style={styles.heading}>Messages</Text>

      {isLoading ? (
        <ActivityIndicator
          color={Palette.primary}
          style={{ marginTop: Spacing.six }}
        />
      ) : chats.length === 0 ? (
        <View style={styles.empty}>
          <SymbolView
            name={{
              ios: "bubble.left.and.bubble.right",
              android: "chat",
              web: "chat",
            }}
            size={40}
            tintColor={Palette.textMuted}
          />
          <Text style={styles.emptyText}>Aucun message pour l'instant</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ChatRow
              item={item}
              onPress={() => router.push(`/chat/${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

function ChatRow({ item, onPress }: { item: Chat; onPress: () => void }) {
  const hasUnread = item.unreadCount > 0;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.avatar}>
        <SymbolView
          name={{ ios: "sportscourt.fill", android: "sports", web: "sports" }}
          size={20}
          tintColor={Palette.primary}
        />
      </View>
      <View style={styles.rowContent}>
        <Text
          style={[styles.rowName, hasUnread && styles.rowNameUnread]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {formatShortDate(new Date(item.scheduledAt))} · {item.location}
        </Text>
      </View>
      {hasUnread ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.unreadCount > 99 ? "99+" : item.unreadCount}
          </Text>
        </View>
      ) : (
        <SymbolView
          name={{
            ios: "chevron.right",
            android: "chevron_right",
            web: "chevron_right",
          }}
          size={14}
          tintColor={Palette.textMuted}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.screenBg,
  },
  heading: {
    fontSize: FontSize["2xl"],
    fontWeight: "800",
    color: Palette.textPrimary,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  list: {
    paddingHorizontal: Spacing.four,
  },
  separator: {
    height: 1,
    backgroundColor: Palette.border,
    marginLeft: 56,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  rowPressed: {
    opacity: 0.6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Palette.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowName: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  rowNameUnread: {
    fontWeight: "800",
  },
  rowMeta: {
    fontSize: FontSize.sm,
    color: Palette.textMuted,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Palette.white,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Palette.textMuted,
  },
});
