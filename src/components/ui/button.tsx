import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';

import { FontSize, Palette, Radius, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';

type ButtonProps = Omit<PressableProps, 'style'> & {
  variant?: Variant;
  loading?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
};

const config: Record<Variant, { bg: string; pressedBg: string; text: string; border?: string }> = {
  primary: { bg: Palette.primary, pressedBg: Palette.primaryPressed, text: Palette.white },
  accent: { bg: Palette.accent, pressedBg: Palette.accentPressed, text: Palette.white },
  outline: { bg: 'transparent', pressedBg: Palette.screenBg, text: Palette.primary, border: Palette.border },
  ghost: { bg: 'transparent', pressedBg: Palette.screenBg, text: Palette.textSecondary },
};

export function Button({ variant = 'primary', loading, disabled, children, style, ...props }: ButtonProps) {
  const c = config[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? c.pressedBg : c.bg,
          borderWidth: c.border ? 1 : 0,
          borderColor: c.border,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={c.text} size="small" />
      ) : (
        <Text style={[styles.label, { color: c.text }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
