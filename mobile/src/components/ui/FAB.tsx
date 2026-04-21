import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/colors';

type FABProps = {
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
};

export function FAB({ onPress, iconName = 'add' }: FABProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.fab} onPress={onPress}>
      <Ionicons name={iconName} size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
