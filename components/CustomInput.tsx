import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomInputProps extends TextInputProps {
    iconName: keyof typeof Ionicons.glyphMap;
}

export function CustomInput({ iconName, ...rest }: CustomInputProps) {
    return (
        <View className="flex-row items-center bg-white w-full p-4 rounded-lg shadow-sm mb-4 border border-surface-border">
            <Ionicons name={iconName} size={20} color="#1A237E" />
            <TextInput
                className="flex-1 text-base text-primary ml-3"
                placeholderTextColor="#9CA3AF"
                {...rest}
            />
        </View>
    );
}