import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { colors } from '@/styles/colors';

type AppointmentsLoadErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function AppointmentsLoadErrorState({
  message,
  onRetry,
}: AppointmentsLoadErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Erro ao carregar</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.retryButtonWrapper}>
        <AppButton title="Tentar novamente" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 10,
    alignItems: 'stretch',
  },
  title: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  retryButtonWrapper: {
    marginTop: 4,
  },
});
