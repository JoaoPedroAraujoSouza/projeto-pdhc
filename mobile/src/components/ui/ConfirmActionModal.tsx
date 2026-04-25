import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/styles/colors';

type ConfirmActionModalProps = {
  visible: boolean;
  title: string;
  message: string;
  highlightText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmActionModal({
  visible,
  title,
  message,
  highlightText,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmActionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>
            {message}
            {highlightText ? (
              <>
                {' '}
                <Text style={styles.highlight}>{highlightText}</Text>?
              </>
            ) : null}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              disabled={isLoading}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                isLoading ? styles.confirmButtonDisabled : null,
              ]}
              activeOpacity={0.8}
              disabled={isLoading}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>
                {isLoading ? 'Processando...' : confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  highlight: {
    color: colors.text,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    minWidth: 100,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBackground,
  },
  cancelText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    minWidth: 100,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
});
