import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/styles/colors';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível sair da conta.',
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>
        Usuário autenticado: {user?.email ?? 'Não identificado'}
      </Text>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('./specialties')}
      >
        <Text style={styles.secondaryButtonText}>Especialidades</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  secondaryButton: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  button: {
    marginTop: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 15,
  },
});
