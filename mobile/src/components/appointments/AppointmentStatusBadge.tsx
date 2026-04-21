import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AppointmentStatus } from '@/types/appointment';
import { colors } from '@/styles/colors';

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; bg: string; text: string }
> = {
  SCHEDULED: { label: 'Agendado', bg: '#EBF2FA', text: colors.primary },
  CONFIRMED: { label: 'Confirmado', bg: '#EAF7EE', text: colors.success },
  CANCELLED: { label: 'Cancelado', bg: '#FDECEA', text: colors.danger },
  COMPLETED: { label: 'Concluído', bg: '#F0F0F0', text: '#555' },
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
};

export function AppointmentStatusBadge({
  status,
}: AppointmentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
