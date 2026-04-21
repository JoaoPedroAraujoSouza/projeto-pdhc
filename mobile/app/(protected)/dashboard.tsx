import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/styles/colors';
import { getDashboardToday } from '@/services/dashboard/get-dashboard-today';
import { DashboardTodayResponse } from '@/types/dashboard';
import { AppointmentListItem } from '@/components/appointments/AppointmentListItem';
import { AppointmentsEmptyState } from '@/components/appointments/AppointmentsEmptyState';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const [data, setData] = useState<DashboardTodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setError(false);
      const res = await getDashboardToday();
      setData(res);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      // ignore
    }
  }

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorTitle}>Ops!</Text>
        <Text style={styles.errorText}>
          Não foi possível carregar o dashboard de hoje.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDashboard} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá,</Text>
            <Text style={styles.email}>{user?.email ?? 'Usuário'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Visão Geral de Hoje</Text>

        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard, styles.metricCardPrimary]}>
            <Text style={styles.metricPrimaryValue}>{data?.metrics.total}</Text>
            <Text style={styles.metricPrimaryLabel}>Total de Consultas</Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.smallMetricCard}>
              <Text
                style={[styles.smallMetricValue, { color: colors.warning }]}
              >
                {data?.metrics.SCHEDULED}
              </Text>
              <Text style={styles.smallMetricLabel}>Agendadas</Text>
            </View>
            <View style={styles.smallMetricCard}>
              <Text
                style={[styles.smallMetricValue, { color: colors.primary }]}
              >
                {data?.metrics.CONFIRMED}
              </Text>
              <Text style={styles.smallMetricLabel}>Confirmadas</Text>
            </View>
            <View style={styles.smallMetricCard}>
              <Text
                style={[styles.smallMetricValue, { color: colors.success }]}
              >
                {data?.metrics.COMPLETED}
              </Text>
              <Text style={styles.smallMetricLabel}>Concluídas</Text>
            </View>
            <View style={styles.smallMetricCard}>
              <Text style={[styles.smallMetricValue, { color: colors.danger }]}>
                {data?.metrics.CANCELLED}
              </Text>
              <Text style={styles.smallMetricLabel}>Canceladas</Text>
            </View>
          </View>
        </View>

        <View style={styles.agendaHeader}>
          <Text style={styles.sectionTitle}>Agenda do Dia</Text>
        </View>

        <View style={styles.agendaContainer}>
          {data?.upcomingAppointments &&
          data.upcomingAppointments.length > 0 ? (
            data.upcomingAppointments.map((app) => (
              <AppointmentListItem
                key={app.id}
                appointment={app as any}
                onPress={() => router.push(`/appointments/${app.id}`)}
              />
            ))
          ) : (
            <AppointmentsEmptyState />
          )}
        </View>

        {/* Menu Secundário */}
        <View style={styles.quickMenu}>
          <Text style={styles.quickMenuTitle}>Menu Rápido</Text>
          <View style={styles.quickMenuGrid}>
            <TouchableOpacity
              style={styles.quickMenuItem}
              onPress={() => router.push('/specialties')}
            >
              <Ionicons
                name="medkit-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.quickMenuItemText}>Especialidades</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickMenuItem}
              onPress={() => router.push('/professionals')}
            >
              <Ionicons
                name="people-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.quickMenuItemText}>Profissionais</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickMenuItem}
              onPress={() => router.push('/patients')}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.quickMenuItemText}>Pacientes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickMenuItem}
              onPress={() => router.push('/appointments')}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.quickMenuItemText}>Agendamentos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* FAB para Novo Agendamento */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/appointments')}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: colors.textMuted,
  },
  email: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  metricsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  metricCardPrimary: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  metricPrimaryValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.surface,
  },
  metricPrimaryLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  smallMetricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  smallMetricValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  smallMetricLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agendaContainer: {
    gap: 12,
    marginBottom: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  errorText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  quickMenu: {
    marginTop: 16,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 16,
  },
  quickMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickMenuItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 8,
  },
  quickMenuItemText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
});
