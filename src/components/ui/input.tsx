import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { FontSize, Palette, Radius, Spacing } from '@/constants/theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  iconName?: SymbolViewProps['name'];
};

export function Input({ label, error, iconName, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? Palette.error : focused ? Palette.borderFocus : Palette.border;
  const iconColor = focused ? Palette.borderFocus : Palette.textMuted;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, { borderColor }]}>
        {iconName && (
          <SymbolView
            name={iconName}
            size={18}
            tintColor={iconColor}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, iconName && styles.inputWithIcon, style]}
          placeholderTextColor={Palette.textMuted}
          selectionColor={Palette.primary}
          cursorColor={Palette.primary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.three,
    height: 52,
  },
  icon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Palette.textPrimary,
    height: '100%',
  },
  inputWithIcon: {
    // no extra style needed, flex:1 handles it
  },
  error: {
    fontSize: FontSize.xs,
    color: Palette.error,
    marginTop: 2,
  },
});
