import React, { useEffect, useState, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfessionalFormFields } from '@/components/professionals/ProfessionalFormFields';
import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import { ProfessionalsLoadErrorState } from '@/components/professionals/ProfessionalsLoadErrorState';
import { AppButton } from '@/components/ui/AppButton';
import {
  professionalFormSchema,
  type ProfessionalFormData,
} from '@/schemas/professionals/professional-form-schema';
import { getProfessional } from '@/services/professionals/get-professional';
import { updateProfessional } from '@/services/professionals/update-professional';
import { colors } from '@/styles/colors';
import type { Professional } from '@/types/professional';

export default function EditProfessionalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      fullName: '',
      specialtyId: '',
    },
  });

  const loadData = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getProfessional(id);
      setProfessional(data);
      reset({
        fullName: data.fullName,
        specialtyId: data.specialtyId,
      });
    } catch {
      setLoadError('Não foi possível carregar os dados do profissional.');
    } finally {
      setIsLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function onSubmit(data: ProfessionalFormData) {
    if (!id) return;

    try {
      setIsSubmitting(true);

      await updateProfessional(id, {
        fullName: data.fullName,
        specialtyId: data.specialtyId,
      });

      Toast.show({
        type: 'success',
        text1: 'Profissional atualizado',
        text2: 'As alterações foram salvas com sucesso.',
      });

      router.back();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível atualizar',
        text2: 'Tente novamente em instantes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Lógica simples para exibir a especialidade.
  // Em um app real complexo, buscaríamos a especialidade pelo id no FormFields.
  const selectedSpecialtyName =
    watch('specialtyId') === professional?.specialtyId
      ? professional.specialty.name
      : watch('specialtyId')
        ? 'Especialidade selecionada'
        : undefined;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ProfessionalsHeader
            title="Editar profissional"
            subtitle="Altere os dados do profissional."
            onBackPress={() => router.back()}
          />

          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : loadError ? (
            <ProfessionalsLoadErrorState
              message={loadError}
              onRetry={loadData}
            />
          ) : (
            <View style={styles.formContainer}>
              <ProfessionalFormFields
                control={control}
                errors={errors}
                selectedSpecialtyName={selectedSpecialtyName}
              />

              <View style={styles.buttonContainer}>
                <AppButton
                  title="Salvar alterações"
                  isLoading={isSubmitting}
                  onPress={handleSubmit(onSubmit)}
                />
              </View>
            </View>
          )}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
