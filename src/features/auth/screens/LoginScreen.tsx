import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontSize, Palette, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { ApiError } from '@/lib/api';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const { mutate: login, isPending, error } = useMutation({
    mutationFn: () => signIn(email, password),
  });

  function handleSubmit() {
    if (!email || !password) {
      setValidationError('Veuillez remplir tous les champs.');
      return;
    }
    setValidationError('');
    login();
  }

  const errorMessage = validationError || (error instanceof ApiError ? error.message : error ? 'Une erreur est survenue.' : '');

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <View style={styles.card}>
              <View style={styles.logoWrapper}>
                <View style={styles.logoOuter}>
                  <View style={styles.logoInner}>
                    <Text style={styles.logoText}>PP</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.title}>Bienvenue</Text>
              <Text style={styles.subtitle}>Connectez-vous pour accéder à vos cours</Text>

              <View style={styles.form}>
                <Input
                  label="Email"
                  iconName={{ ios: 'envelope', android: 'email', web: 'mail' }}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="jean@exemple.com"
                />
                <Input
                  label="Mot de passe"
                  iconName={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="current-password"
                  placeholder="••••••••"
                />

                {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

                <Button onPress={handleSubmit} loading={isPending} style={styles.btn}>
                  Se connecter
                </Button>
              </View>

              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Pas encore de compte ?</Text>
                <Pressable onPress={() => router.push('/(auth)/signup')}>
                  <Text style={styles.toggleLink}>S'inscrire</Text>
                </Pressable>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.screenBg,
  },
  flex: { flex: 1 },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.five,
  },

  card: {
    backgroundColor: Palette.cardBg,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: Palette.primaryLight,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
  },

  logoWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  logoOuter: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    color: Palette.white,
    fontWeight: '900',
    fontSize: FontSize.xl,
    letterSpacing: 1.5,
  },

  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.one,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.four,
  },

  form: { gap: Spacing.three },

  errorBanner: {
    fontSize: FontSize.sm,
    color: Palette.error,
    backgroundColor: Palette.errorLight,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    textAlign: 'center',
  },
  btn: { marginTop: Spacing.one },

  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginVertical: Spacing.four,
  },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
  toggleLabel: {
    fontSize: FontSize.sm,
    color: Palette.textSecondary,
  },
  toggleLink: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Palette.link,
  },
});
