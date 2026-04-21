import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskInput from 'react-native-mask-input';
import { BIRTH_DATE_MASK, TIME_MASK } from '@/lib/masks';

import { AppointmentStatusBadge } from '@/components/appointments/AppointmentStatusBadge';
import { AppointmentsLoadErrorState } from '@/components/appointments/AppointmentsLoadErrorState';
import { AppButton } from '@/components/ui/AppButton';
import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import {
  appointmentFormSchema,
  toISOStartAt,
  type AppointmentFormData,
} from '@/schemas/appointments/appointment-form-schema';
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  rescheduleAppointment,
} from '@/services/appointments/appointment-actions';
import { getAppointment } from '@/services/appointments/get-appointment';
import { colors } from '@/styles/colors';
import type { Appointment } from '@/types/appointment';

function formatStartAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [isRescheduleModalVisible, setIsRescheduleModalVisible] =
    useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Pick<AppointmentFormData, 'date' | 'time'>>({
    resolver: zodResolver(
      appointmentFormSchema.pick({ date: true, time: true }),
    ),
    defaultValues: { date: '', time: '' },
  });

  const rescheduleDate = watch('date');
  const rescheduleTime = watch('time');

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getAppointment(id);
      setAppointment(data);
    } catch {
      setLoadError('Não foi possível carregar o agendamento.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleAction(
    action: () => Promise<Appointment>,
    successMessage: string,
  ) {
    try {
      setIsActioning(true);
      const updated = await action();
      setAppointment(updated);
      Toast.show({ type: 'success', text1: successMessage });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Tente novamente em instantes.';
      Alert.alert('Operação falhou', message);
    } finally {
      setIsActioning(false);
    }
  }

  function handleConfirm() {
    void handleAction(() => confirmAppointment(id!), 'Agendamento confirmado.');
  }

  function handleCancel() {
    Alert.alert(
      'Cancelar agendamento',
      'Tem certeza que deseja cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: () =>
            void handleAction(
              () => cancelAppointment(id!),
              'Agendamento cancelado.',
            ),
        },
      ],
    );
  }

  function handleComplete() {
    void handleAction(() => completeAppointment(id!), 'Agendamento concluído.');
  }

  async function handleReschedule(
    data: Pick<AppointmentFormData, 'date' | 'time'>,
  ) {
    try {
      setIsActioning(true);
      setRescheduleError(null);
      const updated = await rescheduleAppointment(
        id!,
        toISOStartAt(data.date, data.time),
      );
      setAppointment(updated);
      setIsRescheduleModalVisible(false);
      setValue('date', '');
      setValue('time', '');
      Toast.show({ type: 'success', text1: 'Agendamento remarcado.' });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível remarcar.';
      setRescheduleError(message);
    } finally {
      setIsActioning(false);
    }
  }

  const isActive =
    appointment?.status === 'SCHEDULED' || appointment?.status === 'CONFIRMED';

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ProfessionalsHeader
            title="Detalhe"
            subtitle="Informações do agendamento."
            onBackPress={() => router.back()}
          />

          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : loadError ? (
            <AppointmentsLoadErrorState message={loadError} onRetry={load} />
          ) : appointment ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Status */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Status</Text>
                  <AppointmentStatusBadge status={appointment.status} />
                </View>
              </View>

              {/* Info */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Detalhes</Text>
                <View style={styles.detailList}>
                  <DetailRow
                    icon="person-outline"
                    label="Paciente"
                    value={appointment.patient.fullName}
                  />
                  <DetailRow
                    icon="medical-outline"
                    label="Profissional"
                    value={appointment.professional.fullName}
                  />
                  <DetailRow
                    icon="ribbon-outline"
                    label="Especialidade"
                    value={appointment.specialty.name}
                  />
                  <DetailRow
                    icon="time-outline"
                    label="Data e horário"
                    value={formatStartAt(appointment.startAt)}
                  />
                  {appointment.notes ? (
                    <DetailRow
                      icon="document-text-outline"
                      label="Observações"
                      value={appointment.notes}
                    />
                  ) : null}
                </View>
              </View>

              {/* Actions */}
              {isActive ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Ações</Text>
                  <View style={styles.actionsGrid}>
                    {appointment.status === 'SCHEDULED' ? (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionConfirm]}
                        activeOpacity={0.8}
                        disabled={isActioning}
                        onPress={handleConfirm}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color={colors.success}
                        />
                        <Text
                          style={[styles.actionText, { color: colors.success }]}
                        >
                          Confirmar
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionReschedule]}
                      activeOpacity={0.8}
                      disabled={isActioning}
                      onPress={() => setIsRescheduleModalVisible(true)}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={colors.primary}
                      />
                      <Text
                        style={[styles.actionText, { color: colors.primary }]}
                      >
                        Remarcar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionComplete]}
                      activeOpacity={0.8}
                      disabled={isActioning}
                      onPress={handleComplete}
                    >
                      <Ionicons
                        name="checkmark-done-outline"
                        size={20}
                        color="#1A7A45"
                      />
                      <Text style={[styles.actionText, { color: '#1A7A45' }]}>
                        Concluir
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionCancel]}
                      activeOpacity={0.8}
                      disabled={isActioning}
                      onPress={handleCancel}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={20}
                        color={colors.danger}
                      />
                      <Text
                        style={[styles.actionText, { color: colors.danger }]}
                      >
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </ScrollView>
          ) : null}

          {/* Reschedule modal */}
          <Modal
            visible={isRescheduleModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => {
              setIsRescheduleModalVisible(false);
              setRescheduleError(null);
            }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Remarcar agendamento</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsRescheduleModalVisible(false);
                      setRescheduleError(null);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                  {rescheduleError ? (
                    <View style={styles.errorBanner}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={colors.danger}
                      />
                      <Text style={styles.errorBannerText}>
                        {rescheduleError}
                      </Text>
                    </View>
                  ) : null}
                  {/* Date + Time row */}
                  <View style={styles.rescheduleRow}>
                    <View style={styles.rescheduleDateField}>
                      <Text style={styles.rescheduleLabel}>Data</Text>
                      <View
                        style={[
                          styles.inputContainer,
                          errors.date ? styles.inputError : null,
                        ]}
                      >
                        <MaskInput
                          style={styles.maskInput}
                          placeholder="DD/MM/AAAA"
                          placeholderTextColor={colors.textMuted}
                          value={rescheduleDate}
                          mask={BIRTH_DATE_MASK}
                          onChangeText={(m) => setValue('date', m)}
                          keyboardType="numeric"
                        />
                      </View>
                      {errors.date ? (
                        <Text style={styles.inputErrorText}>
                          {errors.date.message}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.rescheduleTimeField}>
                      <Text style={styles.rescheduleLabel}>Horário</Text>
                      <View
                        style={[
                          styles.inputContainer,
                          errors.time ? styles.inputError : null,
                        ]}
                      >
                        <MaskInput
                          style={styles.maskInput}
                          placeholder="HH:MM"
                          placeholderTextColor={colors.textMuted}
                          value={rescheduleTime}
                          mask={TIME_MASK}
                          onChangeText={(m) => setValue('time', m)}
                          keyboardType="numeric"
                        />
                      </View>
                      {errors.time ? (
                        <Text style={styles.inputErrorText}>
                          {errors.time.message}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.rescheduleButtonWrapper}>
                    <AppButton
                      title="Confirmar remarcação"
                      isLoading={isActioning}
                      onPress={handleSubmit(handleReschedule)}
                    />
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { gap: 12, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  detailList: { gap: 12 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailContent: { flex: 1, gap: 1 },
  detailLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  actionConfirm: {
    backgroundColor: '#EAF7EE',
    borderColor: '#B2DFC0',
  },
  actionReschedule: {
    backgroundColor: '#EBF2FA',
    borderColor: '#B2CCE8',
  },
  actionComplete: {
    backgroundColor: '#E8F5ED',
    borderColor: '#A8D5B5',
  },
  actionCancel: {
    backgroundColor: '#FDECEA',
    borderColor: '#F5B7B1',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  modalContent: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  rescheduleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 2,
  },
  inputContainer: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputError: { borderColor: colors.danger },
  maskInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  inputErrorText: { fontSize: 12, color: colors.danger, marginLeft: 2 },
  rescheduleButtonWrapper: { marginTop: 4 },
  rescheduleRow: { flexDirection: 'row', gap: 10 },
  rescheduleDateField: { flex: 3, gap: 6 },
  rescheduleTimeField: { flex: 2, gap: 6 },
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
