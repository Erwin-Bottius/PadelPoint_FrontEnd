import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FontSize, Palette, Radius, Spacing } from "@/constants/theme";
import { useSocket } from "@/context/socket";
import classesService from "@/services/classes";
import messagesService, {
  type Message,
  type SocketMessage,
} from "@/services/messages";
import playersService from "@/services/players";

type Props = {
  classId: string;
  className?: string;
};

export function ChatScreen({ classId, className: initialName }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const socket = useSocket();
  const queryClient = useQueryClient();

  const { data: classInfo } = useQuery({
    queryKey: ["classes", classId],
    queryFn: () => classesService.getById(classId),
    enabled: !initialName,
  });
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: playersService.getProfile,
  });

  const className = initialName ?? classInfo?.name ?? "Chat";

  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [text, setText] = useState("");
  const loadingLock = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        const result = await messagesService.getMessages(classId, 1);
        if (!cancelled) {
          setMessages([...result.data].reverse());
          setHasMore(result.meta.currentPage < result.meta.lastPage);
          setHistoryLoaded(true);
        }
      } catch {
        if (!cancelled) setHistoryLoaded(true);
      }
    }
    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  useEffect(() => {
    if (!socket || !historyLoaded) return;

    const handleNewMessage = (msg: SocketMessage) => {
      if (msg.classId === classId) setMessages((prev) => [msg, ...prev]);
    };

    socket.emit("join_class", classId);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.emit("leave_class", classId);
      socket.off("new_message", handleNewMessage);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    };
  }, [socket, historyLoaded, classId]);

  const loadMore = useCallback(async () => {
    if (loadingLock.current || !hasMore) return;
    loadingLock.current = true;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await messagesService.getMessages(classId, nextPage);
      setMessages((prev) => [...prev, ...result.data.reverse()]);
      setPage(nextPage);
      setHasMore(nextPage < result.meta.lastPage);
    } finally {
      loadingLock.current = false;
      setIsLoadingMore(false);
    }
  }, [classId, page, hasMore]);

  function handleSend() {
    const content = text.trim();
    if (!content || !socket) return;
    socket.emit("send_message", { classId, content });
    setText("");
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={insets.top}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <SymbolView
            name={{
              ios: "chevron.left",
              android: "arrow_back",
              web: "arrow_back",
            }}
            size={22}
            tintColor={Palette.textPrimary}
          />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {className}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {!historyLoaded ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Palette.primary} />
        </View>
      ) : (
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.author.id === profile?.id}
            />
          )}
          contentContainerStyle={styles.messagesList}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                color={Palette.textMuted}
                style={{ padding: Spacing.three }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Aucun message · soyez le premier !
              </Text>
            </View>
          }
        />
      )}

      <View
        style={[
          styles.inputRow,
          { paddingBottom: insets.bottom + Spacing.two },
        ]}
      >
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          placeholderTextColor={Palette.textMuted}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />
        <Pressable
          onPress={handleSend}
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          disabled={!text.trim()}
          hitSlop={8}
        >
          <SymbolView
            name={{ ios: "paperplane.fill", android: "send", web: "send" }}
            size={18}
            tintColor={Palette.white}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  if (message.type === "user_left") {
    return (
      <View style={styles.systemRow}>
        <Text style={styles.systemText}>
          {message.author.firstName} a quitté le cours
        </Text>
      </View>
    );
  }

  const time = new Date(message.createdAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
      {!isOwn && (
        <Text style={styles.authorName}>
          {message.author.firstName} {message.author.lastName}
        </Text>
      )}
      <View style={[styles.bubble, isOwn && styles.bubbleOwn]}>
        <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>
          {message.content}
        </Text>
      </View>
      <Text style={styles.bubbleTime}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Palette.screenBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  backBtn: {
    width: 36,
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Palette.textPrimary,
    textAlign: "center",
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  empty: {
    alignItems: "center",
    paddingTop: Spacing.six,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Palette.textMuted,
  },
  systemRow: {
    alignItems: "flex-start",
    marginVertical: Spacing.one,
  },
  systemText: {
    fontSize: FontSize.md,
    color: Palette.textMuted,
    fontStyle: "italic",
  },
  msgRow: {
    alignSelf: "flex-start",
    maxWidth: "78%",
    gap: 3,
    marginBottom: Spacing.two,
  },
  msgRowOwn: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  authorName: {
    fontSize: FontSize.xs,
    color: Palette.textMuted,
    paddingHorizontal: Spacing.two,
  },
  bubble: {
    backgroundColor: Palette.surfaceSubtle,
    borderRadius: Radius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  bubbleOwn: {
    backgroundColor: Palette.primary,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: FontSize.md,
    color: Palette.textPrimary,
    lineHeight: 20,
  },
  bubbleTextOwn: {
    color: Palette.white,
  },
  bubbleTime: {
    fontSize: FontSize.xs,
    color: Palette.textMuted,
    paddingHorizontal: Spacing.two,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    backgroundColor: Palette.white,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: Palette.surfaceSubtle,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === "ios" ? Spacing.two + 2 : Spacing.two,
    fontSize: FontSize.md,
    color: Palette.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: Palette.textMuted,
  },
});
