import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/styles/colors';

type ProfessionalsInlineErrorProps = {
  message: string;
  onRetry: () => void;
};

export function ProfessionalsInlineError({
  message,
  onRetry,
}: ProfessionalsInlineErrorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity
        style={styles.actionButton}
        activeOpacity={0.85}
        onPress={onRetry}
      >
        <Text style={styles.actionText}>Atualizar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FCEDEC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F7C7C2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    paddingRight: 10,
  },
  actionButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
