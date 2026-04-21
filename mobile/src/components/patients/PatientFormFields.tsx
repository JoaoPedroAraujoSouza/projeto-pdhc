import React from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import MaskInput from 'react-native-mask-input';
import { BIRTH_DATE_MASK, CPF_MASK, PHONE_MASK } from '@/lib/masks';
import type { PatientFormRawValues } from '@/schemas/patients/patient-form-schema';
import { colors } from '@/styles/colors';

type PatientFormFieldsProps = {
  control: Control<PatientFormRawValues>;
  errors: FieldErrors<PatientFormRawValues>;
};

export function PatientFormFields({ control, errors }: PatientFormFieldsProps) {
  return (
    <View style={styles.fields}>
      {/* Full name — plain text, no mask */}
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Nome completo</Text>
            <View
              style={[
                styles.inputContainer,
                errors.fullName ? styles.inputError : null,
              ]}
            >
              <MaskInput
                style={styles.input}
                placeholder="Ex.: Maria Souza"
                placeholderTextColor={colors.textMuted}
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            {errors.fullName ? (
              <Text style={styles.errorText}>{errors.fullName.message}</Text>
            ) : null}
          </View>
        )}
      />

      {/* CPF — 000.000.000-00 */}
      <Controller
        control={control}
        name="cpf"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>CPF</Text>
            <View
              style={[
                styles.inputContainer,
                errors.cpf ? styles.inputError : null,
              ]}
            >
              <MaskInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor={colors.textMuted}
                value={value}
                mask={CPF_MASK}
                onChangeText={(masked) => onChange(masked)}
                keyboardType="numeric"
              />
            </View>
            {errors.cpf ? (
              <Text style={styles.errorText}>{errors.cpf.message}</Text>
            ) : null}
          </View>
        )}
      />

      {/* Birth date — DD/MM/AAAA */}
      <Controller
        control={control}
        name="birthDate"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Data de nascimento</Text>
            <View
              style={[
                styles.inputContainer,
                errors.birthDate ? styles.inputError : null,
              ]}
            >
              <MaskInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.textMuted}
                value={value}
                mask={BIRTH_DATE_MASK}
                onChangeText={(masked) => onChange(masked)}
                keyboardType="numeric"
              />
            </View>
            {errors.birthDate ? (
              <Text style={styles.errorText}>{errors.birthDate.message}</Text>
            ) : null}
          </View>
        )}
      />

      {/* Phone — (00) 00000-0000 */}
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Telefone</Text>
            <View
              style={[
                styles.inputContainer,
                errors.phone ? styles.inputError : null,
              ]}
            >
              <MaskInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.textMuted}
                value={value}
                mask={PHONE_MASK}
                onChangeText={(masked) => onChange(masked)}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 14,
  },
  inputWrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 2,
  },
  inputContainer: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginLeft: 2,
  },
});
