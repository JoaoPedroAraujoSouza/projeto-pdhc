import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
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
import { router, useFocusEffect } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PatientFormFields } from '@/components/patients/PatientFormFields';
import { PatientListItem } from '@/components/patients/PatientListItem';
import { PatientsEmptyState } from '@/components/patients/PatientsEmptyState';
import { PatientsInlineError } from '@/components/patients/PatientsInlineError';
import { PatientsLoadErrorState } from '@/components/patients/PatientsLoadErrorState';
import { PatientsLoadingState } from '@/components/patients/PatientsLoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { ConfirmActionModal } from '@/components/ui/ConfirmActionModal';
import { FAB } from '@/components/ui/FAB';
import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import {
  patientFormSchema,
  type PatientFormData,
  type PatientFormRawValues,
} from '@/schemas/patients/patient-form-schema';
import { createPatient } from '@/services/patients/create-patient';
import { deletePatient } from '@/services/patients/delete-patient';
import { listPatients } from '@/services/patients/list-patients';
import { colors } from '@/styles/colors';
import type { Patient } from '@/types/patient';

export default function PatientsScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeletingPatient, setIsDeletingPatient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormRawValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: { fullName: '', cpf: '', birthDate: '', phone: '' },
  });

  async function handleCreatePatient(data: PatientFormData) {
    try {
      setIsSubmitting(true);

      await createPatient({
        fullName: data.fullName,
        cpf: data.cpf,
        birthDate: data.birthDate,
        phone: data.phone,
      });

      reset({ fullName: '', cpf: '', birthDate: '', phone: '' });

      Toast.show({
        type: 'success',
        text1: 'Paciente cadastrado',
        text2: 'O paciente foi salvo com sucesso.',
      });

      setIsModalVisible(false);
      await loadPatients(true);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível cadastrar',
        text2: 'Verifique os dados e tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeletePatient = useCallback((patient: Patient) => {
    setPatientToDelete(patient);
  }, []);

  const handleCancelDelete = useCallback(() => {
    if (isDeletingPatient) {
      return;
    }

    setPatientToDelete(null);
  }, [isDeletingPatient]);

  const handleConfirmDelete = useCallback(async () => {
    if (!patientToDelete) {
      return;
    }

    try {
      setIsDeletingPatient(true);
      await deletePatient(patientToDelete.id);

      Toast.show({
        type: 'success',
        text1: 'Paciente excluído',
        text2: 'O paciente foi removido com sucesso.',
      });

      setPatients((current) =>
        current.filter((item) => item.id !== patientToDelete.id),
      );
      setPatientToDelete(null);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível excluir',
        text2: getErrorMessage(
          error,
          'Verifique se não há consulta agendada ou confirmada.',
        ),
      });
    } finally {
      setIsDeletingPatient(false);
    }
  }, [patientToDelete]);

  const hasPatients = patients.length > 0;

  const shouldShowErrorState = useMemo(
    () => Boolean(listError) && !isLoadingList && !hasPatients,
    [hasPatients, isLoadingList, listError],
  );

  const shouldShowInlineError = useMemo(
    () => Boolean(listError) && !isLoadingList && hasPatients,
    [hasPatients, isLoadingList, listError],
  );

  const hasContentToRender = !isLoadingList && !shouldShowErrorState;

  const loadPatients = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshingList(true);
    } else {
      setIsLoadingList(true);
    }

    setListError(null);

    try {
      const data = await listPatients();
      setPatients(data);
    } catch (error) {
      setListError(
        getErrorMessage(error, 'Não foi possível carregar pacientes.'),
      );
    } finally {
      setIsRefreshingList(false);
      setIsLoadingList(false);
    }
  }, []);

  const isFirstLoad = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        void loadPatients(false);
        isFirstLoad.current = false;
      } else {
        void loadPatients(true);
      }
    }, [loadPatients]),
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ProfessionalsHeader
            title="Pacientes"
            subtitle="Cadastre e gerencie pacientes."
            onBackPress={() => router.back()}
          />

          <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Novo Paciente</Text>
                  <TouchableOpacity
                    onPress={() => setIsModalVisible(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalScrollContent}
                >
                  <View style={styles.formContainer}>
                    <PatientFormFields control={control} errors={errors} />
                    <View style={styles.buttonContainer}>
                      <AppButton
                        title="Cadastrar paciente"
                        isLoading={isSubmitting}
                        onPress={handleSubmit(handleCreatePatient)}
                      />
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>

          <ConfirmActionModal
            visible={Boolean(patientToDelete)}
            title="Excluir paciente"
            message="Tem certeza que deseja excluir"
            highlightText={patientToDelete?.fullName}
            cancelLabel="Cancelar"
            confirmLabel="Excluir"
            isLoading={isDeletingPatient}
            onCancel={handleCancelDelete}
            onConfirm={() => {
              void handleConfirmDelete();
            }}
          />

          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Lista de pacientes</Text>

              {hasPatients ? (
                <Text style={styles.listCount}>
                  {patients.length} {patients.length === 1 ? 'item' : 'itens'}
                </Text>
              ) : null}
            </View>

            {shouldShowInlineError && listError ? (
              <PatientsInlineError
                message={listError}
                onRetry={() => {
                  void loadPatients(true);
                }}
              />
            ) : null}

            {isLoadingList ? <PatientsLoadingState /> : null}

            {shouldShowErrorState && listError ? (
              <PatientsLoadErrorState
                message={listError}
                onRetry={() => {
                  void loadPatients();
                }}
              />
            ) : null}

            {hasContentToRender && !hasPatients ? <PatientsEmptyState /> : null}

            {hasContentToRender && hasPatients ? (
              <FlatList
                data={patients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <PatientListItem
                    patient={item}
                    onEditPress={() =>
                      router.push(`./patients/${item.id}/edit`)
                    }
                    onDeletePress={() => handleDeletePatient(item)}
                  />
                )}
                refreshing={isRefreshingList}
                onRefresh={() => {
                  void loadPatients(true);
                }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            ) : null}
          </View>

          <FAB onPress={() => setIsModalVisible(true)} />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
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
    paddingBottom: 20,
  },
  listSection: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  listCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    gap: 10,
    paddingBottom: 80,
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
    maxHeight: '90%',
    paddingBottom: 24,
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
