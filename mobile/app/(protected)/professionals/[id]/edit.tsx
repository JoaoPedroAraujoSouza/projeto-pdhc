import React, { useEffect, useState, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfessionalFormFields } from '@/components/professionals/ProfessionalFormFields';
import { ProfessionalsLoadErrorState } from '@/components/professionals/ProfessionalsLoadErrorState';
import { AppButton } from '@/components/ui/AppButton';
import { BottomSheetScaffold } from '@/components/ui/BottomSheetScaffold';
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
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <BottomSheetScaffold
          title="Editar profissional"
          onClose={() => router.back()}
        >
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
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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
            </ScrollView>
          )}
        </BottomSheetScaffold>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerContainer: {
    minHeight: 220,
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
  scrollContent: {
    paddingBottom: 8,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
