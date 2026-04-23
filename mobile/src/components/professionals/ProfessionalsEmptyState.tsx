import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/styles/colors';

export function ProfessionalsEmptyState() {
  return (
    <View style={styles.container}>
      <Ionicons name="people-outline" size={32} color={colors.textMuted} />
      <Text style={styles.title}>Nenhum profissional cadastrado</Text>
      <Text style={styles.subtitle}>
        Toque no botão + abaixo para começar o cadastro.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
