import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaskInput from 'react-native-mask-input';
import { BIRTH_DATE_MASK } from '@/lib/masks';
import { SelectorField, SelectorSheet } from './AppointmentFormFields';
import { AppButton } from '@/components/ui/AppButton';
import { listProfessionals } from '@/services/professionals/list-professionals';
import { listSpecialties } from '@/services/specialties/list-specialties';
import type { Professional } from '@/types/professional';
import type { Specialty } from '@/types/specialty';
import { colors } from '@/styles/colors';

export type AppointmentsFilterData = {
  date: string;
  professionalId: string;
  specialtyId: string;
};

type AppointmentsFilterModalProps = {
  visible: boolean;
  filters: AppointmentsFilterData;
  onApply: (data: AppointmentsFilterData) => void;
  onClear: () => void;
  onClose: () => void;
};

export function AppointmentsFilterModal({
  visible,
  filters,
  onApply,
  onClear,
  onClose,
}: AppointmentsFilterModalProps) {
  const [localDate, setLocalDate] = useState(filters.date);
  const [localProfessional, setLocalProfessional] =
    useState<Professional | null>(null);
  const [localSpecialty, setLocalSpecialty] = useState<Specialty | null>(null);

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profModalVisible, setProfModalVisible] = useState(false);
  const [specModalVisible, setSpecModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profs, specs] = await Promise.all([
        listProfessionals(),
        listSpecialties(),
      ]);
      setProfessionals(profs);
      setSpecialties(specs);

      if (filters.professionalId) {
        setLocalProfessional(
          profs.find((p) => p.id === filters.professionalId) ?? null,
        );
      }
      if (filters.specialtyId) {
        setLocalSpecialty(
          specs.find((s) => s.id === filters.specialtyId) ?? null,
        );
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [filters.professionalId, filters.specialtyId]);

  useEffect(() => {
    if (visible) {
      setLocalDate(filters.date);
      void loadData();
    }
  }, [visible, filters, loadData]);

  function handleApply() {
    onApply({
      date: localDate,
      professionalId: localProfessional?.id ?? '',
      specialtyId: localSpecialty?.id ?? '',
    });
  }

  function handleClear() {
    setLocalDate('');
    setLocalProfessional(null);
    setLocalSpecialty(null);
    onClear();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* Date Filter */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Data da consulta</Text>
              <View style={styles.inputContainer}>
                <MaskInput
                  style={styles.maskInput}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={colors.textMuted}
                  value={localDate}
                  mask={BIRTH_DATE_MASK}
                  onChangeText={setLocalDate}
                  keyboardType="numeric"
                />
                {localDate ? (
                  <TouchableOpacity
                    onPress={() => setLocalDate('')}
                    style={styles.clearIcon}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Professional Filter */}
            <SelectorField
              label="Profissional"
              value={localProfessional?.fullName}
              placeholder="Todos os profissionais"
              hasError={false}
              onPress={() => setProfModalVisible(true)}
            />

            <SelectorSheet
              visible={profModalVisible}
              title="Filtrar por Profissional"
              items={professionals}
              isLoading={isLoading}
              emptyMessage="Nenhum profissional cadastrado."
              keyExtractor={(p) => p.id}
              labelExtractor={(p) => p.fullName}
              sublabelExtractor={(p) => p.specialty.name}
              onSelect={(p) => {
                setLocalProfessional(p);
                // @ts-expect-error - Prisma include returns partial specialty, missing dates
                setLocalSpecialty(p.specialty); // Auto-fill specialty
                setProfModalVisible(false);
              }}
              onClose={() => setProfModalVisible(false)}
            />

            {/* Specialty Filter */}
            <SelectorField
              label="Especialidade"
              value={localSpecialty?.name}
              placeholder="Todas as especialidades"
              hasError={false}
              onPress={() => setSpecModalVisible(true)}
            />

            <SelectorSheet
              visible={specModalVisible}
              title="Filtrar por Especialidade"
              items={specialties}
              isLoading={isLoading}
              emptyMessage="Nenhuma especialidade cadastrada."
              keyExtractor={(s) => s.id}
              labelExtractor={(s) => s.name}
              onSelect={(s) => {
                setLocalSpecialty(s);
                // Clear professional if the specialty changes and no longer matches
                if (
                  localProfessional &&
                  localProfessional.specialtyId !== s.id
                ) {
                  setLocalProfessional(null);
                }
                setSpecModalVisible(false);
              }}
              onClose={() => setSpecModalVisible(false)}
            />

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
              >
                <Text style={styles.clearButtonText}>Limpar</Text>
              </TouchableOpacity>
              <View style={styles.applyButtonWrapper}>
                <AppButton title="Aplicar" onPress={handleApply} />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
  },
  fieldWrapper: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginLeft: 2 },
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
  clearIcon: {
    padding: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 16,
  },
  clearButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
  },
  applyButtonWrapper: {
    flex: 1,
  },
});
