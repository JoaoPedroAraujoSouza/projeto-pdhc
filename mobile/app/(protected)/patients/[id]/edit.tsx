import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PatientFormFields } from '@/components/patients/PatientFormFields';
import { PatientsLoadErrorState } from '@/components/patients/PatientsLoadErrorState';
import { AppButton } from '@/components/ui/AppButton';
import { BottomSheetScaffold } from '@/components/ui/BottomSheetScaffold';
import {
  patientFormSchema,
  type PatientFormData,
  type PatientFormRawValues,
} from '@/schemas/patients/patient-form-schema';
import { getPatient } from '@/services/patients/get-patient';
import { updatePatient } from '@/services/patients/update-patient';
import { colors } from '@/styles/colors';

export default function EditPatientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormRawValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: { fullName: '', cpf: '', birthDate: '', phone: '' },
  });

  const loadData = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getPatient(id);
      reset({
        fullName: data.fullName,
        cpf: data.cpf,
        // Convert YYYY-MM-DD (API) → DD/MM/AAAA (display)
        birthDate: data.birthDate.split('T')[0].split('-').reverse().join('/'),
        phone: data.phone,
      });
    } catch {
      setLoadError('Não foi possível carregar os dados do paciente.');
    } finally {
      setIsLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function onSubmit(data: PatientFormData) {
    if (!id) return;

    try {
      setIsSubmitting(true);

      await updatePatient(id, {
        fullName: data.fullName,
        cpf: data.cpf,
        birthDate: data.birthDate,
        phone: data.phone,
      });

      Toast.show({
        type: 'success',
        text1: 'Paciente atualizado',
        text2: 'As alterações foram salvas com sucesso.',
      });

      router.back();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível atualizar',
        text2: 'Verifique os dados e tente novamente.',
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
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <BottomSheetScaffold
          title="Editar paciente"
          onClose={() => router.back()}
        >
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : loadError ? (
            <PatientsLoadErrorState message={loadError} onRetry={loadData} />
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formContainer}>
                <PatientFormFields control={control} errors={errors} />
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
  scrollContent: {
    paddingBottom: 8,
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
