import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import MaskInput from 'react-native-mask-input';
import { BIRTH_DATE_MASK, TIME_MASK } from '@/lib/masks';
import { FormInput } from '@/components/ui/FormInput';
import { listPatients } from '@/services/patients/list-patients';
import { listProfessionals } from '@/services/professionals/list-professionals';
import type { AppointmentFormData } from '@/schemas/appointments/appointment-form-schema';
import type { Patient } from '@/types/patient';
import type { Professional } from '@/types/professional';
import { colors } from '@/styles/colors';

// ─── Generic Searchable Selector Sheet ───────────────────────────────────────

type SelectorSheetProps<T> = {
  visible: boolean;
  title: string;
  items: T[];
  isLoading: boolean;
  emptyMessage: string;
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  sublabelExtractor?: (item: T) => string;
  onSelect: (item: T) => void;
  onClose: () => void;
};

export function SelectorSheet<T>({
  visible,
  title,
  items,
  isLoading,
  emptyMessage,
  keyExtractor,
  labelExtractor,
  sublabelExtractor,
  onSelect,
  onClose,
}: SelectorSheetProps<T>) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter((item) =>
      labelExtractor(item).toLowerCase().includes(lower),
    );
  }, [items, query, labelExtractor]);

  function handleClose() {
    setQuery('');
    onClose();
  }

  function handleSelect(item: T) {
    setQuery('');
    onSelect(item);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={16}
              color={colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          {/* List */}
          {isLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.modalLoadingText}>Carregando...</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.modalList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={styles.modalItemText}>
                      {labelExtractor(item)}
                    </Text>
                    {sublabelExtractor ? (
                      <Text style={styles.modalItemSubtext}>
                        {sublabelExtractor(item)}
                      </Text>
                    ) : null}
                  </View>
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
                    {query.trim()
                      ? `Nenhum resultado para "${query}".`
                      : emptyMessage}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Selector Field (read-only trigger) ──────────────────────────────────────

type SelectorFieldProps = {
  label: string;
  value: string | undefined;
  placeholder: string;
  hasError: boolean;
  errorMessage?: string;
  readOnly?: boolean;
  onPress?: () => void;
};

export function SelectorField({
  label,
  value,
  placeholder,
  hasError,
  errorMessage,
  readOnly = false,
  onPress,
}: SelectorFieldProps) {
  return (
    <View style={styles.selectorWrapper}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <TouchableOpacity
        activeOpacity={readOnly ? 1 : 0.8}
        style={[
          styles.selectorButton,
          readOnly && styles.selectorReadOnly,
          hasError ? styles.selectorButtonError : null,
        ]}
        onPress={readOnly ? undefined : onPress}
      >
        <Text
          style={[styles.selectorText, !value && styles.selectorPlaceholder]}
          numberOfLines={1}
        >
          {value ?? placeholder}
        </Text>
        <Ionicons
          name={readOnly ? 'lock-closed-outline' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {errorMessage ? (
        <Text style={styles.selectorErrorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

// ─── Main Form Component ──────────────────────────────────────────────────────

type AppointmentFormFieldsProps = {
  control: Control<AppointmentFormData>;
  errors: FieldErrors<AppointmentFormData>;
  selectedPatientName?: string;
  selectedProfessionalName?: string;
  selectedSpecialtyName?: string;
  onPatientChange: (patient: Patient) => void;
  onProfessionalChange: (professional: Professional) => void;
};

export function AppointmentFormFields({
  control,
  errors,
  selectedPatientName,
  selectedProfessionalName,
  selectedSpecialtyName,
  onPatientChange,
  onProfessionalChange,
}: AppointmentFormFieldsProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  const [patientModalVisible, setPatientModalVisible] = useState(false);
  const [professionalModalVisible, setProfessionalModalVisible] =
    useState(false);

  const loadPatients = useCallback(async () => {
    setIsLoadingPatients(true);
    try {
      setPatients(await listPatients());
    } catch {
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  const loadProfessionals = useCallback(async () => {
    setIsLoadingProfessionals(true);
    try {
      setProfessionals(await listProfessionals());
    } catch {
    } finally {
      setIsLoadingProfessionals(false);
    }
  }, []);

  useEffect(() => {
    void loadPatients();
    void loadProfessionals();
  }, [loadPatients, loadProfessionals]);

  return (
    <View style={styles.fields}>
      {/* Patient */}
      <Controller
        control={control}
        name="patientId"
        render={({ field: { onChange } }) => (
          <>
            <SelectorField
              label="Paciente"
              value={selectedPatientName}
              placeholder="Selecione um paciente"
              hasError={Boolean(errors.patientId)}
              errorMessage={errors.patientId?.message}
              onPress={() => setPatientModalVisible(true)}
            />
            <SelectorSheet
              visible={patientModalVisible}
              title="Selecionar Paciente"
              items={patients}
              isLoading={isLoadingPatients}
              emptyMessage="Nenhum paciente cadastrado."
              keyExtractor={(p) => p.id}
              labelExtractor={(p) => p.fullName}
              sublabelExtractor={(p) => p.cpf}
              onSelect={(p) => {
                onChange(p.id);
                onPatientChange(p);
                setPatientModalVisible(false);
              }}
              onClose={() => setPatientModalVisible(false)}
            />
          </>
        )}
      />

      {/* Professional */}
      <Controller
        control={control}
        name="professionalId"
        render={({ field: { onChange } }) => (
          <>
            <SelectorField
              label="Profissional"
              value={selectedProfessionalName}
              placeholder="Selecione um profissional"
              hasError={Boolean(errors.professionalId)}
              errorMessage={errors.professionalId?.message}
              onPress={() => setProfessionalModalVisible(true)}
            />
            <SelectorSheet
              visible={professionalModalVisible}
              title="Selecionar Profissional"
              items={professionals}
              isLoading={isLoadingProfessionals}
              emptyMessage="Nenhum profissional cadastrado."
              keyExtractor={(p) => p.id}
              labelExtractor={(p) => p.fullName}
              sublabelExtractor={(p) => p.specialty.name}
              onSelect={(p) => {
                onChange(p.id);
                onProfessionalChange(p);
                setProfessionalModalVisible(false);
              }}
              onClose={() => setProfessionalModalVisible(false)}
            />
          </>
        )}
      />

      {/* Specialty (auto-filled) */}
      <SelectorField
        label="Especialidade"
        value={selectedSpecialtyName}
        placeholder="Preenchida pelo profissional"
        hasError={Boolean(errors.specialtyId)}
        errorMessage={errors.specialtyId?.message}
        readOnly
      />

      {/* Date + Time side by side */}
      <View style={styles.dateTimeRow}>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.selectorWrapper, styles.dateField]}>
              <Text style={styles.selectorLabel}>Data</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.date ? styles.selectorButtonError : null,
                ]}
              >
                <MaskInput
                  style={styles.maskInput}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={colors.textMuted}
                  value={value}
                  mask={BIRTH_DATE_MASK}
                  onChangeText={(masked) => onChange(masked)}
                  keyboardType="numeric"
                />
              </View>
              {errors.date ? (
                <Text style={styles.selectorErrorText}>
                  {errors.date.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="time"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.selectorWrapper, styles.timeField]}>
              <Text style={styles.selectorLabel}>Horário</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.time ? styles.selectorButtonError : null,
                ]}
              >
                <MaskInput
                  style={styles.maskInput}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={value}
                  mask={TIME_MASK}
                  onChangeText={(masked) => onChange(masked)}
                  keyboardType="numeric"
                />
              </View>
              {errors.time ? (
                <Text style={styles.selectorErrorText}>
                  {errors.time.message}
                </Text>
              ) : null}
            </View>
          )}
        />
      </View>

      {/* Notes */}
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Observações (opcional)"
            placeholder="Ex.: Paciente relata dor de cabeça frequente."
            value={value ?? ''}
            onChangeText={onChange}
            multiline
            numberOfLines={3}
            autoCorrect={false}
            errorMessage={errors.notes?.message}
          />
        )}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fields: { gap: 14 },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateField: { flex: 3 },
  timeField: { flex: 2 },
  selectorWrapper: { gap: 6 },
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
  selectorReadOnly: { opacity: 0.65 },
  selectorButtonError: { borderColor: colors.danger },
  selectorText: { flex: 1, fontSize: 15, color: colors.text },
  selectorPlaceholder: { color: colors.textMuted },
  selectorErrorText: { fontSize: 12, color: colors.danger, marginLeft: 2 },
  inputContainer: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  maskInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: '100%',
  },
  modalLoading: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 32,
  },
  modalLoadingText: { color: colors.textMuted, fontSize: 14 },
  modalList: { paddingHorizontal: 16, paddingTop: 8, gap: 4 },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemContent: { flex: 1, gap: 2 },
  modalItemText: { fontSize: 15, color: colors.text },
  modalItemSubtext: { fontSize: 12, color: colors.textMuted },
  modalEmptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  modalEmpty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
  },
});
