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
import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import {
  patientFormSchema,
  type PatientFormData,
} from '@/schemas/patients/patient-form-schema';
import { getPatient } from '@/services/patients/get-patient';
import { updatePatient } from '@/services/patients/update-patient';
import { colors } from '@/styles/colors';
import type { Patient } from '@/types/patient';

export default function EditPatientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: { fullName: '', cpf: '', birthDate: '', phone: '' },
  });

  const loadData = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getPatient(id);
      setPatient(data);
      reset({
        fullName: data.fullName,
        cpf: data.cpf,
        birthDate: data.birthDate.split('T')[0],
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

  void patient;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ProfessionalsHeader
            title="Editar paciente"
            subtitle="Altere os dados do paciente."
            onBackPress={() => router.back()}
          />

          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : loadError ? (
            <PatientsLoadErrorState message={loadError} onRetry={loadData} />
          ) : (
            <ScrollView
              style={styles.scrollContainer}
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
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
