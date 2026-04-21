import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    async function load() {
      setIsLoadingSpecialties(true);
      try {
        const data = await listSpecialties();
        setSpecialties(data);
      } catch {
      } finally {
        setIsLoadingSpecialties(false);
      }
    }

    void load();
  }, []);

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
                        <Text style={styles.modalEmpty}>
                          Nenhuma especialidade disponível.
                        </Text>
                      }
                    />
                  )}
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
  modalEmpty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    paddingVertical: 24,
  },
});
