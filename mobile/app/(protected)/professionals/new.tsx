import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfessionalFormFields } from '@/components/professionals/ProfessionalFormFields';
import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import { AppButton } from '@/components/ui/AppButton';
import {
  professionalFormSchema,
  type ProfessionalFormData,
} from '@/schemas/professionals/professional-form-schema';
import { createProfessional } from '@/services/professionals/create-professional';
import { colors } from '@/styles/colors';

export default function NewProfessionalScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      fullName: '',
      specialtyId: '',
    },
  });

  async function onSubmit(data: ProfessionalFormData) {
    try {
      setIsSubmitting(true);

      await createProfessional({
        fullName: data.fullName,
        specialtyId: data.specialtyId,
      });

      Toast.show({
        type: 'success',
        text1: 'Profissional cadastrado',
        text2: 'O profissional foi salvo com sucesso.',
      });

      router.back();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível cadastrar',
        text2: 'Tente novamente em instantes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ProfessionalsHeader
            title="Novo profissional"
            subtitle="Preencha os dados do profissional."
            onBackPress={() => router.back()}
          />

          <View style={styles.formContainer}>
            <ProfessionalFormFields
              control={control}
              errors={errors}
              selectedSpecialtyName={
                watch('specialtyId') ? 'Especialidade selecionada' : undefined
              }
            />

            <View style={styles.buttonContainer}>
              <AppButton
                title="Cadastrar profissional"
                isLoading={isSubmitting}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
