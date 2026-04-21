import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Professional } from '@/types/professional';
import { colors } from '@/styles/colors';

type ProfessionalListItemProps = {
  professional: Professional;
  onEditPress: () => void;
};

export function ProfessionalListItem({
  professional,
  onEditPress,
}: ProfessionalListItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>{professional.fullName}</Text>
        <Text style={styles.specialty}>{professional.specialty.name}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onEditPress}
        style={styles.editButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="pencil-outline" size={18} color={colors.primary} />
      </TouchableOpacity>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  specialty: {
    color: colors.textMuted,
    fontSize: 13,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
