import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

import { ProfessionalFormFields } from '@/components/professionals/ProfessionalFormFields';
import { ProfessionalListItem } from '@/components/professionals/ProfessionalListItem';
import { ProfessionalsEmptyState } from '@/components/professionals/ProfessionalsEmptyState';
import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import { ProfessionalsInlineError } from '@/components/professionals/ProfessionalsInlineError';
import { ProfessionalsLoadErrorState } from '@/components/professionals/ProfessionalsLoadErrorState';
import { ProfessionalsLoadingState } from '@/components/professionals/ProfessionalsLoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { FAB } from '@/components/ui/FAB';
import {
  professionalFormSchema,
  type ProfessionalFormData,
} from '@/schemas/professionals/professional-form-schema';
import { createProfessional } from '@/services/professionals/create-professional';
import { listProfessionals } from '@/services/professionals/list-professionals';
import { colors } from '@/styles/colors';
import type { Professional } from '@/types/professional';

export default function ProfessionalsScreen() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

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

  async function handleCreateProfessional(data: ProfessionalFormData) {
    try {
      setIsSubmitting(true);

      await createProfessional({
        fullName: data.fullName,
        specialtyId: data.specialtyId,
      });

      reset({
        fullName: '',
        specialtyId: '',
      });

      Toast.show({
        type: 'success',
        text1: 'Profissional cadastrado',
        text2: 'O profissional foi salvo com sucesso.',
      });

      setIsModalVisible(false);
      await loadProfessionals(true);
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

  const hasProfessionals = professionals.length > 0;

  const shouldShowErrorState = useMemo(
    () => Boolean(listError) && !isLoadingList && !hasProfessionals,
    [hasProfessionals, isLoadingList, listError],
  );

  const shouldShowInlineError = useMemo(
    () => Boolean(listError) && !isLoadingList && hasProfessionals,
    [hasProfessionals, isLoadingList, listError],
  );

  const hasContentToRender = !isLoadingList && !shouldShowErrorState;

  const loadProfessionals = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshingList(true);
    } else {
      setIsLoadingList(true);
    }

    setListError(null);

    try {
      const data = await listProfessionals();
      setProfessionals(data);
    } catch (error) {
      setListError(
        getErrorMessage(error, 'Não foi possível carregar profissionais.'),
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
        void loadProfessionals(false);
        isFirstLoad.current = false;
      } else {
        void loadProfessionals(true);
      }
    }, [loadProfessionals]),
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ProfessionalsHeader
            title="Profissionais"
            subtitle="Cadastre e gerencie profissionais."
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
                  <Text style={styles.modalTitle}>Novo Profissional</Text>
                  <TouchableOpacity
                    onPress={() => setIsModalVisible(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.formContainer}>
                    <ProfessionalFormFields
                      control={control}
                      errors={errors}
                      selectedSpecialtyName={
                        watch('specialtyId')
                          ? 'Especialidade selecionada'
                          : undefined
                      }
                    />
                    <View style={styles.buttonContainer}>
                      <AppButton
                        title="Cadastrar profissional"
                        isLoading={isSubmitting}
                        onPress={handleSubmit(handleCreateProfessional)}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Modal>

          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Lista de profissionais</Text>

              {hasProfessionals ? (
                <Text style={styles.listCount}>
                  {professionals.length}{' '}
                  {professionals.length === 1 ? 'item' : 'itens'}
                </Text>
              ) : null}
            </View>

            {shouldShowInlineError && listError ? (
              <ProfessionalsInlineError
                message={listError}
                onRetry={() => {
                  void loadProfessionals(true);
                }}
              />
            ) : null}

            {isLoadingList ? <ProfessionalsLoadingState /> : null}

            {shouldShowErrorState && listError ? (
              <ProfessionalsLoadErrorState
                message={listError}
                onRetry={() => {
                  void loadProfessionals();
                }}
              />
            ) : null}

            {hasContentToRender && !hasProfessionals ? (
              <ProfessionalsEmptyState />
            ) : null}

            {hasContentToRender && hasProfessionals ? (
              <FlatList
                data={professionals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ProfessionalListItem
                    professional={item}
                    onEditPress={() =>
                      router.push(`./professionals/${item.id}/edit`)
                    }
                  />
                )}
                refreshing={isRefreshingList}
                onRefresh={() => {
                  void loadProfessionals(true);
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
    paddingBottom: 8,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
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
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
