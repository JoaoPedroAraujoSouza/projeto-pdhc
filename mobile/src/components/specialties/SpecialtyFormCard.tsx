import React from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { FormInput } from '@/components/ui/FormInput';
import { AppButton } from '@/components/ui/AppButton';
import type { CreateSpecialtySchemaData } from '@/schemas/specialties/create-specialty-schema';
import { colors } from '@/styles/colors';

type SpecialtyFormCardProps = {
  control: Control<CreateSpecialtySchemaData>;
  errors: FieldErrors<CreateSpecialtySchemaData>;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function SpecialtyFormCard({
  control,
  errors,
  isSubmitting,
  onSubmit,
}: SpecialtyFormCardProps) {
  return (
    <View style={styles.formCard}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Nome da especialidade"
            placeholder="Ex.: Cardiologia"
            value={value}
            onChangeText={onChange}
            autoCapitalize="words"
            autoCorrect={false}
            errorMessage={errors.name?.message}
          />
        )}
      />

      <AppButton
        title="Cadastrar especialidade"
        isLoading={isSubmitting}
        onPress={onSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
    marginBottom: 18,
  },
});
