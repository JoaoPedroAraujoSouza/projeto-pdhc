import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Specialty } from '@/types/specialty';
import { colors } from '@/styles/colors';

type SpecialtyListItemProps = {
  specialty: Specialty;
};

export function SpecialtyListItem({ specialty }: SpecialtyListItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{specialty.name}</Text>
      <Text style={styles.meta}>
        Criada em {formatDate(specialty.createdAt)}
      </Text>
    </View>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'data indisponivel';
  }

  return date.toLocaleDateString('pt-BR');
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
