import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/styles/colors';

type SpecialtiesHeaderProps = {
  onBackPress: () => void;
};

export function SpecialtiesHeader({ onBackPress }: SpecialtiesHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onBackPress}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.headerTextWrapper}>
        <Text style={styles.title}>Especialidades</Text>
        <Text style={styles.subtitle}>Cadastre e visualize especialidades.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTextWrapper: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
