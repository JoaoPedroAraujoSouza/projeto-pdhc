import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpecialtiesEmptyState } from '@/components/specialties/SpecialtiesEmptyState';
import { SpecialtiesHeader } from '@/components/specialties/SpecialtiesHeader';
import { SpecialtiesInlineError } from '@/components/specialties/SpecialtiesInlineError';
import { SpecialtiesLoadErrorState } from '@/components/specialties/SpecialtiesLoadErrorState';
import { SpecialtiesLoadingState } from '@/components/specialties/SpecialtiesLoadingState';
import { SpecialtyFormCard } from '@/components/specialties/SpecialtyFormCard';
import { SpecialtyListItem } from '@/components/specialties/SpecialtyListItem';
import {
  createSpecialtySchema,
  type CreateSpecialtySchemaData,
} from '@/schemas/specialties/create-specialty-schema';
import { createSpecialty } from '@/services/specialties/create-specialty';
import { listSpecialties } from '@/services/specialties/list-specialties';
import { colors } from '@/styles/colors';
import type { Specialty } from '@/types/specialty';

export default function SpecialtiesScreen() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSpecialtySchemaData>({
    resolver: zodResolver(createSpecialtySchema),
    defaultValues: {
      name: '',
    },
  });

  const hasSpecialties = specialties.length > 0;

  const shouldShowErrorState = useMemo(
    () => Boolean(listError) && !isLoadingList && !hasSpecialties,
    [hasSpecialties, isLoadingList, listError],
  );

  const shouldShowInlineError = useMemo(
    () => Boolean(listError) && !isLoadingList && hasSpecialties,
    [hasSpecialties, isLoadingList, listError],
  );

  const hasContentToRender = !isLoadingList && !shouldShowErrorState;

  const loadSpecialties = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshingList(true);
    } else {
      setIsLoadingList(true);
    }

    setListError(null);

    try {
      const response = await listSpecialties();
      setSpecialties(response);
    } catch (error) {
      setListError(getErrorMessage(error, 'Nao foi possivel carregar especialidades.'));
    } finally {
      if (refresh) {
        setIsRefreshingList(false);
      } else {
        setIsLoadingList(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadSpecialties();
  }, [loadSpecialties]);

  async function handleCreateSpecialty(data: CreateSpecialtySchemaData) {
    try {
      setIsSubmitting(true);

      await createSpecialty({
        name: data.name,
      });

      reset({
        name: '',
      });

      Toast.show({
        type: 'success',
        text1: 'Especialidade cadastrada',
        text2: 'A especialidade foi salva com sucesso.',
      });

      await loadSpecialties(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Nao foi possivel cadastrar',
        text2: getErrorMessage(error, 'Tente novamente em instantes.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <SpecialtiesHeader onBackPress={() => router.back()} />

          <SpecialtyFormCard
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(handleCreateSpecialty)}
          />

          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Lista de especialidades</Text>

              {hasSpecialties ? (
                <Text style={styles.listCount}>
                  {specialties.length}{' '}
                  {specialties.length === 1 ? 'item' : 'itens'}
                </Text>
              ) : null}
            </View>

            {shouldShowInlineError && listError ? (
              <SpecialtiesInlineError
                message={listError}
                onRetry={() => {
                  void loadSpecialties(true);
                }}
              />
            ) : null}

            {isLoadingList ? <SpecialtiesLoadingState /> : null}

            {shouldShowErrorState && listError ? (
              <SpecialtiesLoadErrorState
                message={listError}
                onRetry={() => {
                  void loadSpecialties();
                }}
              />
            ) : null}

            {hasContentToRender && !hasSpecialties ? <SpecialtiesEmptyState /> : null}

            {hasContentToRender && hasSpecialties ? (
              <FlatList
                data={specialties}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <SpecialtyListItem specialty={item} />}
                refreshing={isRefreshingList}
                onRefresh={() => {
                  void loadSpecialties(true);
                }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  listSection: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  listCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    gap: 10,
    paddingBottom: 8,
  },
});
