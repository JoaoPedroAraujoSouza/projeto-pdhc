import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppointmentFormFields } from '@/components/appointments/AppointmentFormFields';
import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import { AppButton } from '@/components/ui/AppButton';
import {
  appointmentFormSchema,
  toISOStartAt,
  type AppointmentFormData,
} from '@/schemas/appointments/appointment-form-schema';
import { createAppointment } from '@/services/appointments/create-appointment';
import { colors } from '@/styles/colors';
import type { Patient } from '@/types/patient';
import type { Professional } from '@/types/professional';

export default function CreateAppointmentScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: '',
      professionalId: '',
      specialtyId: '',
      date: '',
      time: '',
      notes: '',
    },
  });

  function handleProfessionalChange(professional: Professional) {
    setSelectedProfessional(professional);
    setValue('specialtyId', professional.specialtyId);
  }

  async function handleCreate(data: AppointmentFormData) {
    try {
      setIsSubmitting(true);
      setCreateError(null);

      await createAppointment({
        patientId: data.patientId,
        professionalId: data.professionalId,
        specialtyId: data.specialtyId,
        startAt: toISOStartAt(data.date, data.time),
        notes: data.notes ? data.notes : undefined,
      });

      reset({
        patientId: '',
        professionalId: '',
        specialtyId: '',
        date: '',
        time: '',
        notes: '',
      });

      setSelectedPatient(null);
      setSelectedProfessional(null);

      Toast.show({
        type: 'success',
        text1: 'Agendamento criado',
        text2: 'O agendamento foi salvo com sucesso.',
      });

      router.back();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível criar o agendamento.';
      setCreateError(message);
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
            title="Novo agendamento"
            subtitle="Preencha os dados da consulta."
            onBackPress={() => router.back()}
          />

          <ScrollView
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.formContainer}>
              {createError ? (
                <View style={styles.errorBanner}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color={colors.danger}
                  />
                  <Text style={styles.errorBannerText}>{createError}</Text>
                </View>
              ) : null}

              <AppointmentFormFields
                control={control}
                errors={errors}
                selectedPatientName={selectedPatient?.fullName}
                selectedProfessionalName={selectedProfessional?.fullName}
                selectedSpecialtyName={selectedProfessional?.specialty.name}
                onPatientChange={(patient) => setSelectedPatient(patient)}
                onProfessionalChange={handleProfessionalChange}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              title="Criar agendamento"
              isLoading={isSubmitting}
              onPress={handleSubmit(handleCreate)}
            />
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
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
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
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FDECEA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F5B7B1',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.danger,
    lineHeight: 18,
    fontWeight: '500',
  },
});
