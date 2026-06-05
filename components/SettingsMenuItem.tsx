import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsMenuItemProps {
    iconName: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    isDestructive?: boolean; // Usado para deixar o botão de Sair vermelho
}

export function SettingsMenuItem({ iconName, title, subtitle, onPress, isDestructive = false }: SettingsMenuItemProps) {
    const color = isDestructive ? '#EF4444' : '#1A237E';

    return (
        <TouchableOpacity
            className="flex-row items-center bg-white p-4 rounded-xl shadow-sm border border-surface-border mb-3"
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isDestructive ? 'bg-red-50' : 'bg-[#E8EAF6]'}`}>
                <Ionicons name={iconName} size={20} color={color} />
            </View>

            <View className="flex-1">
                <Text className={`text-base font-bold ${isDestructive ? 'text-red-500' : 'text-gray-800'}`}>
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-surface-muted text-xs mt-0.5">{subtitle}</Text>
                )}
            </View>

            {!isDestructive && (
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            )}
        </TouchableOpacity>
    );
}