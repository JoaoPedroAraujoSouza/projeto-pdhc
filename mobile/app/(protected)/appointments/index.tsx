import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppointmentListItem } from '@/components/appointments/AppointmentListItem';
import { AppointmentsEmptyState } from '@/components/appointments/AppointmentsEmptyState';
import { AppointmentsLoadErrorState } from '@/components/appointments/AppointmentsLoadErrorState';
import { AppointmentsLoadingState } from '@/components/appointments/AppointmentsLoadingState';
import { FAB } from '@/components/ui/FAB';
import {
  AppointmentsFilterModal,
  type AppointmentsFilterData,
} from '@/components/appointments/AppointmentsFilterModal';
import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import { listAppointments } from '@/services/appointments/list-appointments';
import { colors } from '@/styles/colors';
import type { Appointment, AppointmentStatus } from '@/types/appointment';

const STATUS_OPTIONS: {
  label: string;
  value: AppointmentStatus | undefined;
}[] = [
  { label: 'Todos', value: undefined },
  { label: 'Agendado', value: 'SCHEDULED' },
  { label: 'Confirmado', value: 'CONFIRMED' },
  { label: 'Cancelado', value: 'CANCELLED' },
  { label: 'Concluído', value: 'COMPLETED' },
];

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Filters
  const [activeStatus, setActiveStatus] = useState<
    AppointmentStatus | undefined
  >(undefined);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<AppointmentsFilterData>({
    date: '',
    professionalId: '',
    specialtyId: '',
  });

  const hasAdvancedFilters = Boolean(
    activeFilters.date ||
    activeFilters.professionalId ||
    activeFilters.specialtyId,
  );

  const hasAppointments = appointments.length > 0;

  const shouldShowErrorState = useMemo(
    () => Boolean(listError) && !isLoadingList && !hasAppointments,
    [hasAppointments, isLoadingList, listError],
  );

  const hasContentToRender = !isLoadingList && !shouldShowErrorState;

  const loadAppointments = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshingList(true);
      } else {
        setIsLoadingList(true);
      }
      setListError(null);

      try {
        const parsedDate =
          activeFilters.date.length === 10
            ? activeFilters.date.split('/').reverse().join('-')
            : undefined;

        const data = await listAppointments({
          status: activeStatus,
          date: parsedDate,
          professionalId: activeFilters.professionalId || undefined,
          specialtyId: activeFilters.specialtyId || undefined,
        });
        setAppointments(data);
      } catch {
        setListError('Não foi possível carregar os agendamentos.');
      } finally {
        setIsRefreshingList(false);
        setIsLoadingList(false);
      }
    },
    [activeStatus, activeFilters],
  );

  const isFirstLoad = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        void loadAppointments(false);
        isFirstLoad.current = false;
      } else {
        void loadAppointments(true);
      }
    }, [loadAppointments]),
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ProfessionalsHeader
            title="Agendamentos"
            subtitle="Gerencie as consultas."
            onBackPress={() => router.back()}
          />

          {/* Status filter tabs & Advanced filter button */}
          <View style={styles.filtersWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              style={styles.filterScroll}
            >
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.filterChip,
                    activeStatus === opt.value && styles.filterChipActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setActiveStatus(opt.value);
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeStatus === opt.value && styles.filterChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.filterButton,
                hasAdvancedFilters && styles.filterButtonActive,
              ]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={hasAdvancedFilters ? colors.surface : colors.primary}
              />
            </TouchableOpacity>
          </View>

          <AppointmentsFilterModal
            visible={filterModalVisible}
            filters={activeFilters}
            onApply={(data) => {
              setActiveFilters(data);
              setFilterModalVisible(false);
            }}
            onClear={() => {
              setActiveFilters({
                date: '',
                professionalId: '',
                specialtyId: '',
              });
              setFilterModalVisible(false);
            }}
            onClose={() => setFilterModalVisible(false)}
          />

          {/* List */}
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Lista de agendamentos</Text>
              {hasAppointments ? (
                <Text style={styles.listCount}>
                  {appointments.length}{' '}
                  {appointments.length === 1 ? 'item' : 'itens'}
                </Text>
              ) : null}
            </View>

            {isLoadingList ? <AppointmentsLoadingState /> : null}

            {shouldShowErrorState && listError ? (
              <AppointmentsLoadErrorState
                message={listError}
                onRetry={() => {
                  void loadAppointments();
                }}
              />
            ) : null}

            {hasContentToRender && !hasAppointments ? (
              <AppointmentsEmptyState />
            ) : null}

            {hasContentToRender && hasAppointments ? (
              <FlatList
                data={appointments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <AppointmentListItem
                    appointment={item}
                    onPress={() => router.push(`./appointments/${item.id}`)}
                  />
                )}
                refreshing={isRefreshingList}
                onRefresh={() => {
                  void loadAppointments(true);
                }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            ) : null}
          </View>

          <FAB onPress={() => router.push('/appointments/create')} />
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
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  filtersWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterScroll: {
    flex: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  listSection: { flex: 1 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  listCount: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  listContent: { gap: 10, paddingBottom: 80 },
});
