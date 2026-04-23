import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { FormInput } from '@/components/ui/FormInput';
import { listSpecialties } from '@/services/specialties/list-specialties';
import type { ProfessionalFormData } from '@/schemas/professionals/professional-form-schema';
import type { Specialty } from '@/types/specialty';
import { colors } from '@/styles/colors';

type ProfessionalFormFieldsProps = {
  control: Control<ProfessionalFormData>;
  errors: FieldErrors<ProfessionalFormData>;
  selectedSpecialtyName?: string;
};

export function ProfessionalFormFields({
  control,
  errors,
  selectedSpecialtyName,
}: ProfessionalFormFieldsProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(false);

  const load = useCallback(async () => {
    setIsLoadingSpecialties(true);
    try {
      const data = await listSpecialties();
      setSpecialties(data);
    } catch {
    } finally {
      setIsLoadingSpecialties(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <View style={styles.fields}>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Nome completo"
            placeholder="Ex.: Dr. João da Silva"
            value={value}
            onChangeText={onChange}
            autoCapitalize="words"
            autoCorrect={false}
            errorMessage={errors.fullName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="specialtyId"
        render={({ field: { onChange } }) => (
          <View style={styles.selectorWrapper}>
            <Text style={styles.selectorLabel}>Especialidade</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.selectorButton,
                errors.specialtyId ? styles.selectorButtonError : null,
              ]}
              onPress={() => setIsModalVisible(true)}
            >
              <Text
                style={[
                  styles.selectorText,
                  !selectedSpecialtyName && styles.selectorPlaceholder,
                ]}
              >
                {selectedSpecialtyName ?? 'Selecione uma especialidade'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {errors.specialtyId ? (
              <Text style={styles.selectorErrorText}>
                {errors.specialtyId.message}
              </Text>
            ) : null}

            <Modal
              visible={isModalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setIsModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Especialidade</Text>
                    <TouchableOpacity
                      onPress={() => setIsModalVisible(false)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="close"
                        size={22}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>

                  {isLoadingSpecialties ? (
                    <View style={styles.modalLoading}>
                      <ActivityIndicator color={colors.primary} />
                      <Text style={styles.modalLoadingText}>
                        Carregando especialidades...
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={specialties}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={styles.modalList}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.modalItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            onChange(item.id);
                            setIsModalVisible(false);
                          }}
                        >
                          <Text style={styles.modalItemText}>{item.name}</Text>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={colors.textMuted}
                          />
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        <View style={styles.modalEmptyContainer}>
                          <Text style={styles.modalEmpty}>
                            Nenhuma especialidade disponível.
                          </Text>
                          <Text style={styles.modalEmptySubtitle}>
                            Você precisa cadastrar uma especialidade antes de
                            continuar.
                          </Text>
                        </View>
                      }
                    />
                  )}

                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.modalFooterButton}
                      onPress={() => {
                        setIsModalVisible(false);
                        router.push('/(protected)/specialties');
                      }}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color={colors.primary}
                      />
                      <Text style={styles.modalFooterButtonText}>
                        Cadastrar Especialidade
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 14,
  },
  selectorWrapper: {
    gap: 6,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 2,
  },
  selectorButton: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectorButtonError: {
    borderColor: colors.danger,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  selectorPlaceholder: {
    color: colors.textMuted,
  },
  selectorErrorText: {
    fontSize: 12,
    color: colors.danger,
    marginLeft: 2,
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
    maxHeight: '60%',
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
  modalLoading: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 32,
  },
  modalLoadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  modalList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 4,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  modalEmptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  modalEmpty: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalEmptySubtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  modalFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.inputBackground,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalFooterButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
