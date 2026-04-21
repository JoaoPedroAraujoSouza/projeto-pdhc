import React from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { FormInput } from '@/components/ui/FormInput';
import type { PatientFormData } from '@/schemas/patients/patient-form-schema';

type PatientFormFieldsProps = {
  control: Control<PatientFormData>;
  errors: FieldErrors<PatientFormData>;
};

export function PatientFormFields({ control, errors }: PatientFormFieldsProps) {
  return (
    <View style={styles.fields}>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Nome completo"
            placeholder="Ex.: Maria Souza"
            value={value}
            onChangeText={onChange}
            autoCapitalize="words"
            autoCorrect={false}
            errorMessage={errors.fullName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="cpf"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="CPF"
            placeholder="Ex.: 12345678901"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            maxLength={14}
            autoCorrect={false}
            errorMessage={errors.cpf?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="birthDate"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Data de nascimento"
            placeholder="AAAA-MM-DD"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            maxLength={10}
            autoCorrect={false}
            errorMessage={errors.birthDate?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <FormInput
            label="Telefone"
            placeholder="Ex.: 11987654321"
            value={value}
            onChangeText={onChange}
            keyboardType="phone-pad"
            maxLength={15}
            autoCorrect={false}
            errorMessage={errors.phone?.message}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 14,
  },
});
