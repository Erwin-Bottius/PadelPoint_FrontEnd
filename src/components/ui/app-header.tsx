import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { FontSize, Palette, Spacing } from '@/constants/theme';

type Props = {
  onProfilePress?: () => void;
  onLogoutPress?: () => void;
};

export function AppHeader({ onProfilePress, onLogoutPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <View style={styles.logoOuter}>
          <View style={styles.logoInner}>
            <Text style={styles.logoText}>PP</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {onLogoutPress && (
          <Pressable onPress={onLogoutPress} style={styles.logoutBtn} hitSlop={8}>
            <SymbolView
              name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
              size={22}
              tintColor={Palette.textMuted}
            />
          </Pressable>
        )}
        <Pressable onPress={onProfilePress} style={styles.profileBtn} hitSlop={8}>
          <SymbolView
            name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
            size={32}
            tintColor={Palette.primary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },

  logo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOuter: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: Palette.logoOuterBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 29,
    height: 29,
    borderRadius: 8,
    backgroundColor: Palette.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: Palette.primary,
    fontWeight: '900',
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
