import React, { forwardRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';

type FormInputProps = TextInputProps & {
  label: string;
  errorMessage?: string;
};

export const FormInput = forwardRef<TextInput, FormInputProps>(
  ({ label, errorMessage, ...rest }, ref) => {
    const isPasswordField = Boolean(rest.secureTextEntry);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const secureTextEntry = useMemo(() => {
      if (!isPasswordField) {
        return false;
      }

      return !isPasswordVisible;
    }, [isPasswordField, isPasswordVisible]);

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>

        <View
          style={[styles.inputWrapper, errorMessage ? styles.inputError : null]}
        >
          <TextInput
            ref={ref}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            {...rest}
            secureTextEntry={secureTextEntry}
          />

          {isPasswordField ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setIsPasswordVisible((currentValue) => !currentValue)
              }
              style={styles.iconButton}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 2,
  },
  inputWrapper: {
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
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
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
