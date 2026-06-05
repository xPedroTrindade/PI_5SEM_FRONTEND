import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomCheckboxProps {
    label: string;
    isChecked: boolean;
    onToggle: () => void;
    iconName: keyof typeof Ionicons.glyphMap;
}

export function CustomCheckbox({ label, isChecked, onToggle, iconName }: CustomCheckboxProps) {
    return (
        <TouchableOpacity
            className="flex-row items-center bg-white p-4 rounded-lg border border-surface-border shadow-sm mb-3"
            onPress={onToggle}
            activeOpacity={0.7}
        >
            <View className={`w-6 h-6 rounded border items-center justify-center mr-3 ${isChecked ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                {isChecked && <Ionicons name="checkmark" size={16} color="#FDD835" />}
            </View>
            <Ionicons name={iconName} size={20} color={isChecked ? "#1A237E" : "#9CA3AF"} style={{ marginRight: 8 }} />
            <Text className={`font-medium text-base flex-1 ${isChecked ? 'text-primary' : 'text-surface-muted'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}