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
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/styles/colors';
import { getDashboardToday } from '@/services/dashboard/get-dashboard-today';
import type { DashboardTodayResponse } from '@/types/dashboard';
import { AppointmentListItem } from '@/components/appointments/AppointmentListItem';
import { AppointmentsEmptyState } from '@/components/appointments/AppointmentsEmptyState';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();

  const [data, setData] = useState<DashboardTodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await getDashboardToday();
      setData(response);
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
      Toast.show({
        type: 'error',
        text1: 'Erro ao sair',
        text2: 'Não foi possível sair da conta agora.',
      });
    }
  }

  const displayName =
    user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Usuário';

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorTitle}>Ops!</Text>
        <Text style={styles.errorText}>
          Não foi possível carregar o dashboard de hoje.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDashboard} />
        }
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Ionicons
              name="person-circle-outline"
              size={44}
              color={colors.primary}
            />
            <View style={styles.userTextContainer}>
              <Text style={styles.greeting}>Bem-vindo,</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSignOut}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Visão Geral de Hoje</Text>

        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard, styles.metricCardPrimary]}>
            <Text style={styles.metricPrimaryValue}>
              {data?.metrics.total ?? 0}
            </Text>
            <Text style={styles.metricPrimaryLabel}>Total de Consultas</Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.smallMetricCard}>
              <Text
                style={[styles.smallMetricValue, { color: colors.warning }]}
              >
                {data?.metrics.SCHEDULED ?? 0}
              </Text>
              <Text style={styles.smallMetricLabel}>Agendadas</Text>
            </View>
            <View style={styles.smallMetricCard}>
              <Text
                style={[styles.smallMetricValue, { color: colors.primary }]}
              >
                {data?.metrics.CONFIRMED ?? 0}
              </Text>
              <Text style={styles.smallMetricLabel}>Confirmadas</Text>
            </View>
            <View style={styles.smallMetricCard}>
              <Text
                style={[styles.smallMetricValue, { color: colors.success }]}
              >
                {data?.metrics.COMPLETED ?? 0}
              </Text>
              <Text style={styles.smallMetricLabel}>Concluídas</Text>
            </View>
            <View style={styles.smallMetricCard}>
              <Text style={[styles.smallMetricValue, { color: colors.danger }]}>
                {data?.metrics.CANCELLED ?? 0}
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
            data.upcomingAppointments.map((appointment) => (
              <AppointmentListItem
                key={appointment.id}
                appointment={appointment}
                onPress={() => router.push(`/appointments/${appointment.id}`)}
              />
            ))
          ) : (
            <AppointmentsEmptyState />
          )}
        </View>

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

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/appointments')}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  logoutButton: {
    padding: 8,
    marginLeft: 8,
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
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  metricCardPrimary: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricPrimaryValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.surface,
  },
  metricPrimaryLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
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
    marginTop: 8,
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
});
