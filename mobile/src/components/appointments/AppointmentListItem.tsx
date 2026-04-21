import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import type { Appointment } from '@/types/appointment';
import { colors } from '@/styles/colors';

type AppointmentListItemProps = {
  appointment: Appointment;
  onPress: () => void;
};

function formatStartAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AppointmentListItem({
  appointment,
  onPress,
}: AppointmentListItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.top}>
        <Text style={styles.patient} numberOfLines={1}>
          {appointment.patient.fullName}
        </Text>
        <AppointmentStatusBadge status={appointment.status} />
      </View>

      <Text style={styles.professional} numberOfLines={1}>
        {appointment.professional.fullName} · {appointment.specialty.name}
      </Text>

      <View style={styles.footer}>
        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
        <Text style={styles.date}>{formatStartAt(appointment.startAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  patient: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  professional: {
    color: colors.textMuted,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  date: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
