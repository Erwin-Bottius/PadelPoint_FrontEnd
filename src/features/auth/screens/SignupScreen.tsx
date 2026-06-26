import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontSize, Palette, Radius, Spacing } from "@/constants/theme";
import { useAuth, type UserRole } from "@/context/auth";
import { ApiError } from "@/lib/api";

type Step = 0 | 1 | 2;

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type FieldErrors = Partial<Fields>;

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function getLevelCategory(level: number): string {
  if (level > 7) return "Elite";
  if (level > 5) return "Avancé";
  if (level > 3) return "Intermédiaire";
  return "Débutant";
}

function getLevelCategoryColor(level: number): string {
  if (level > 7) return Palette.levelElite;
  if (level > 5) return Palette.levelAdvanced;
  if (level > 3) return Palette.levelIntermediate;
  return Palette.levelBeginner;
}

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(0);

  const [fields, setFields] = useState<Fields>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [role, setRole] = useState<UserRole | null>(null);
  const [level, setLevel] = useState<number | null>(null);

  function set(key: keyof Fields) {
    return (value: string) => {
      setFields((f) => ({ ...f, [key]: value }));
      setFieldErrors((e) => ({ ...e, [key]: undefined }));
    };
  }

  function validateStep0(): boolean {
    const errors: FieldErrors = {};
    if (!fields.firstName.trim()) errors.firstName = "Requis";
    if (!fields.lastName.trim()) errors.lastName = "Requis";
    if (!fields.email.trim()) errors.email = "Requis";
    if (!fields.password) errors.password = "Requis";
    else if (fields.password.length < 8)
      errors.password = "Minimum 8 caractères";
    if (!fields.passwordConfirmation) errors.passwordConfirmation = "Requis";
    else if (fields.password !== fields.passwordConfirmation)
      errors.passwordConfirmation = "Les mots de passe ne correspondent pas";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const {
    mutate: submit,
    isPending,
    error,
  } = useMutation({
    mutationFn: () => signUp({ ...fields, role: role!, level: level! }),
    onError: (e) => {
      if (e instanceof ApiError && e.errors?.length) {
        const fErrors: FieldErrors = {};
        e.errors.forEach(({ field, message }) => {
          if (field in fields) fErrors[field as keyof Fields] = message;
        });
        if (Object.keys(fErrors).length) {
          setFieldErrors(fErrors);
          setStep(0);
        }
      }
    },
  });

  const errorMessage =
    error instanceof ApiError
      ? error.errors?.length
        ? null
        : error.message
      : error
        ? "Une erreur est survenue."
        : null;

  function handleContinue() {
    if (validateStep0()) setStep(1);
  }

  function handleContinueRole() {
    if (!role) return;
    setStep(2);
  }

  function handleSubmit() {
    if (!level) return;
    submit();
  }

  function handleBack() {
    if (step === 2) setStep(1);
    else if (step === 1) setStep(0);
    else router.back();
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backBtn}>
                  <SymbolView
                    name={{
                      ios: "chevron.left",
                      android: "chevron_left",
                      web: "chevron_left",
                    }}
                    size={18}
                    tintColor={Palette.textPrimary}
                  />
                  <Text style={styles.backText}>Retour</Text>
                </Pressable>

                <View style={styles.steps}>
                  <View style={[styles.step, styles.stepActive]} />
                  <View style={[styles.step, step >= 1 && styles.stepActive]} />
                  <View
                    style={[styles.step, step === 2 && styles.stepActive]}
                  />
                </View>
              </View>

              {step === 0 && (
                <>
                  <Text style={styles.title}>Créer un compte</Text>
                  <Text style={styles.subtitle}>
                    Rejoignez la communauté PadelPoint
                  </Text>

                  <View style={styles.form}>
                    <View style={styles.row}>
                      <View style={styles.flex}>
                        <Input
                          label="Prénom"
                          value={fields.firstName}
                          onChangeText={set("firstName")}
                          autoCapitalize="words"
                          autoComplete="given-name"
                          placeholder="Jean"
                          error={fieldErrors.firstName}
                        />
                      </View>
                      <View style={styles.flex}>
                        <Input
                          label="Nom"
                          value={fields.lastName}
                          onChangeText={set("lastName")}
                          autoCapitalize="words"
                          autoComplete="family-name"
                          placeholder="Dupont"
                          error={fieldErrors.lastName}
                        />
                      </View>
                    </View>

                    <Input
                      label="Email"
                      iconName={{
                        ios: "envelope",
                        android: "email",
                        web: "mail",
                      }}
                      value={fields.email}
                      onChangeText={set("email")}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      placeholder="jean@exemple.com"
                      error={fieldErrors.email}
                    />
                    <Input
                      label="Mot de passe"
                      iconName={{
                        ios: "lock.fill",
                        android: "lock",
                        web: "lock",
                      }}
                      value={fields.password}
                      onChangeText={set("password")}
                      secureTextEntry
                      autoComplete="new-password"
                      placeholder="Minimum 8 caractères"
                      error={fieldErrors.password}
                    />
                    <Input
                      label="Confirmer le mot de passe"
                      iconName={{
                        ios: "lock.fill",
                        android: "lock",
                        web: "lock",
                      }}
                      value={fields.passwordConfirmation}
                      onChangeText={set("passwordConfirmation")}
                      secureTextEntry
                      autoComplete="new-password"
                      placeholder="••••••••"
                      error={fieldErrors.passwordConfirmation}
                    />

                    <Button onPress={handleContinue} style={styles.btn}>
                      Continuer
                    </Button>
                  </View>
                </>
              )}

              {step === 1 && (
                <>
                  <Text style={styles.title}>Votre rôle ?</Text>
                  <Text style={styles.subtitle}>
                    Choisissez comment vous souhaitez utiliser PadelPoint
                  </Text>

                  <View style={styles.roleRow}>
                    <RoleCard
                      label="Joueur"
                      description="Rejoignez des cours et progressez"
                      iconName={{
                        ios: "figure.tennis",
                        android: "sports_tennis",
                        web: "sports_tennis",
                      }}
                      selected={role === "player"}
                      onPress={() => setRole("player")}
                    />
                    <RoleCard
                      label="Professeur"
                      description="Créez et gérez vos cours"
                      iconName={{
                        ios: "trophy.fill",
                        android: "emoji_events",
                        web: "emoji_events",
                      }}
                      selected={role === "teacher"}
                      onPress={() => setRole("teacher")}
                    />
                  </View>

                  <Button
                    onPress={handleContinueRole}
                    variant="primary"
                    disabled={!role}
                    style={styles.btn}
                  >
                    Continuer
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Text style={styles.title}>Votre niveau ?</Text>
                  <Text style={styles.subtitle}>
                    Sélectionnez votre niveau de padel de 1 (débutant) à 10
                    (élite)
                  </Text>

                  <View style={styles.levelGrid}>
                    {LEVELS.map((n) => (
                      <Pressable
                        key={n}
                        onPress={() => setLevel(n)}
                        style={[
                          styles.levelCell,
                          level === n && {
                            backgroundColor: getLevelCategoryColor(n),
                            borderColor: getLevelCategoryColor(n),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.levelCellNumber,
                            level === n && styles.levelCellNumberSelected,
                          ]}
                        >
                          {n}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <View
                    style={[
                      styles.levelCategoryBadge,
                      {
                        borderColor:
                          level !== null
                            ? getLevelCategoryColor(level)
                            : "transparent",
                      },
                      level === null && { opacity: 0 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.levelCategoryText,
                        {
                          color:
                            level !== null
                              ? getLevelCategoryColor(level)
                              : "transparent",
                        },
                      ]}
                    >
                      {level !== null ? getLevelCategory(level) : "Placeholder"}
                    </Text>
                  </View>

                  {errorMessage ? (
                    <Text style={styles.errorBanner}>{errorMessage}</Text>
                  ) : null}

                  <Button
                    onPress={handleSubmit}
                    variant="primary"
                    loading={isPending}
                    disabled={!level}
                    style={styles.btn}
                  >
                    Créer mon compte
                  </Button>
                </>
              )}

              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Déjà un compte ?</Text>
                <Pressable onPress={() => router.replace("/(auth)/login")}>
                  <Text style={styles.toggleLink}>Se connecter</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type RoleCardProps = {
  label: string;
  description: string;
  iconName: import("expo-symbols").SymbolViewProps["name"];
  selected: boolean;
  onPress: () => void;
};

function RoleCard({
  label,
  description,
  iconName,
  selected,
  onPress,
}: RoleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roleCard, selected && styles.roleCardSelected]}
    >
      <View
        style={[styles.roleIconWrap, selected && styles.roleIconWrapSelected]}
      >
        <SymbolView
          name={iconName}
          size={30}
          tintColor={selected ? Palette.link : Palette.textMuted}
        />
      </View>
      <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>
        {label}
      </Text>
      <Text style={styles.roleDesc}>{description}</Text>
    </Pressable>
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
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.five,
  },

  card: {
    backgroundColor: Palette.cardBg,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: Palette.primaryLight,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  steps: {
    flexDirection: "row",
    gap: Spacing.one,
  },
  step: {
    width: 28,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Palette.border,
  },
  stepActive: {
    backgroundColor: Palette.link,
  },

  title: {
    fontSize: FontSize["2xl"],
    fontWeight: "800",
    color: Palette.textPrimary,
    marginBottom: Spacing.one,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Palette.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.four,
  },

  form: { gap: Spacing.three },
  row: { flexDirection: "row", gap: Spacing.two },
  btn: { marginTop: Spacing.one },

  errorBanner: {
    fontSize: FontSize.sm,
    color: Palette.error,
    backgroundColor: Palette.errorLight,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    textAlign: "center",
    marginBottom: Spacing.two,
  },

  roleRow: {
    flexDirection: "row",
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  roleCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: Palette.border,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Palette.white,
  },
  roleCardSelected: {
    borderColor: Palette.link,
    backgroundColor: Palette.primaryLight,
  },
  roleIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Palette.surfaceMid,
    alignItems: "center",
    justifyContent: "center",
  },
  roleIconWrapSelected: {
    backgroundColor: Palette.white,
    shadowColor: Palette.link,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  roleLabel: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Palette.textSecondary,
  },
  roleLabelSelected: {
    color: Palette.link,
  },
  roleDesc: {
    fontSize: FontSize.xs,
    color: Palette.textMuted,
    textAlign: "center",
    lineHeight: 16,
  },

  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  levelCell: {
    display: "flex",
    width: "17%",
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.two,
  },
  levelCellNumber: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Palette.textSecondary,
  },
  levelCellNumberSelected: {
    color: Palette.white,
  },
  levelCategoryBadge: {
    alignSelf: "center",
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    marginBottom: Spacing.three,
  },
  levelCategoryText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginVertical: Spacing.four,
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.one,
  },
  toggleLabel: {
    fontSize: FontSize.sm,
    color: Palette.textSecondary,
  },
  toggleLink: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Palette.link,
  },
});
