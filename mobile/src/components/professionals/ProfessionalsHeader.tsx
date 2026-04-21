import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/styles/colors';

type RightAction = {
  label: string;
  onPress: () => void;
};

type ProfessionalsHeaderProps = {
  title: string;
  subtitle: string;
  onBackPress: () => void;
  rightAction?: RightAction;
};

export function ProfessionalsHeader({
  title,
  subtitle,
  onBackPress,
  rightAction,
}: ProfessionalsHeaderProps) {
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
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {rightAction ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={rightAction.onPress}
          style={styles.rightButton}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
          <Text style={styles.rightButtonText}>{rightAction.label}</Text>
        </TouchableOpacity>
      ) : null}
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
  rightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  rightButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
