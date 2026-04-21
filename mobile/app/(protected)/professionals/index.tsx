import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfessionalListItem } from '@/components/professionals/ProfessionalListItem';
import { ProfessionalsEmptyState } from '@/components/professionals/ProfessionalsEmptyState';
import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import { ProfessionalsInlineError } from '@/components/professionals/ProfessionalsInlineError';
import { ProfessionalsLoadErrorState } from '@/components/professionals/ProfessionalsLoadErrorState';
import { ProfessionalsLoadingState } from '@/components/professionals/ProfessionalsLoadingState';
import { listProfessionals } from '@/services/professionals/list-professionals';
import { colors } from '@/styles/colors';
import type { Professional } from '@/types/professional';

export default function ProfessionalsScreen() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const hasProfessionals = professionals.length > 0;

  const shouldShowErrorState = useMemo(
    () => Boolean(listError) && !isLoadingList && !hasProfessionals,
    [hasProfessionals, isLoadingList, listError],
  );

  const shouldShowInlineError = useMemo(
    () => Boolean(listError) && !isLoadingList && hasProfessionals,
    [hasProfessionals, isLoadingList, listError],
  );

  const hasContentToRender = !isLoadingList && !shouldShowErrorState;

  const loadProfessionals = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshingList(true);
    } else {
      setIsLoadingList(true);
    }

    setListError(null);

    try {
      const data = await listProfessionals();
      setProfessionals(data);
    } catch (error) {
      setListError(
        getErrorMessage(error, 'Não foi possível carregar profissionais.'),
      );
    } finally {
      setIsRefreshingList(false);
      setIsLoadingList(false);
    }
  }, []);

  const isFirstLoad = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        void loadProfessionals(false);
        isFirstLoad.current = false;
      } else {
        // Nas próximas vezes que a tela ganhar foco, faz um recarregamento via refresh
        // para não piscar a tela inteira com o ActivityIndicator principal
        void loadProfessionals(true);
      }
    }, [loadProfessionals]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ProfessionalsHeader
          title="Profissionais"
          subtitle="Cadastre e gerencie profissionais."
          onBackPress={() => router.back()}
          rightAction={{
            label: 'Novo',
            onPress: () => router.push('./professionals/new'),
          }}
        />

        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Lista de profissionais</Text>

            {hasProfessionals ? (
              <Text style={styles.listCount}>
                {professionals.length}{' '}
                {professionals.length === 1 ? 'item' : 'itens'}
              </Text>
            ) : null}
          </View>

          {shouldShowInlineError && listError ? (
            <ProfessionalsInlineError
              message={listError}
              onRetry={() => {
                void loadProfessionals(true);
              }}
            />
          ) : null}

          {isLoadingList ? <ProfessionalsLoadingState /> : null}

          {shouldShowErrorState && listError ? (
            <ProfessionalsLoadErrorState
              message={listError}
              onRetry={() => {
                void loadProfessionals();
              }}
            />
          ) : null}

          {hasContentToRender && !hasProfessionals ? (
            <ProfessionalsEmptyState />
          ) : null}

          {hasContentToRender && hasProfessionals ? (
            <FlatList
              data={professionals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProfessionalListItem
                  professional={item}
                  onEditPress={() =>
                    router.push(`./professionals/${item.id}/edit`)
                  }
                />
              )}
              refreshing={isRefreshingList}
              onRefresh={() => {
                void loadProfessionals(true);
              }}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
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
