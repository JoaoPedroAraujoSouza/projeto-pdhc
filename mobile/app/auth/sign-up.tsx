import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { AppButton } from "@/components/ui/AppButton";
import { FormInput } from "@/components/ui/FormInput";
import { signUpSchema, SignUpSchemaData } from "@/schemas/auth/sign-up-schema";
import { signUpWithEmail } from "@/services/auth/sign-up";
import { colors } from "@/styles/colors";

export default function SignUpScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchemaData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  async function handleSignUp(data: SignUpSchemaData) {
    try {
      setIsSubmitting(true);

      await signUpWithEmail(data);

      Toast.show({
        type: "success",
        text1: "Cadastro realizado",
        text2: "Sua conta foi criada com sucesso. Faça login para continuar.",
      });

      setTimeout(() => {
        router.replace("/auth/sign-in");
      }, 1200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível concluir o cadastro.";

      Toast.show({
        type: "error",
        text1: "Erro no cadastro",
        text2: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <AuthHeader
            title="Criar conta"
            subtitle="Cadastre um usuário administrativo para acessar o sistema de agendamentos."
          />

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Nome completo"
                  placeholder="Digite seu nome"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  errorMessage={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="E-mail"
                  placeholder="Digite seu e-mail"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  errorMessage={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Senha"
                  placeholder="Crie uma senha"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  autoCapitalize="none"
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Confirmar senha"
                  placeholder="Repita a senha"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  autoCapitalize="none"
                  errorMessage={errors.confirmPassword?.message}
                />
              )}
            />

            <AppButton
              title="Cadastrar"
              isLoading={isSubmitting}
              onPress={handleSubmit(handleSignUp)}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já possui uma conta?</Text>

            <Link href="/auth/sign-in" asChild>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.footerLink}>Entrar</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    shadowColor: "#102030",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  form: {
    gap: 16,
  },
  footer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});