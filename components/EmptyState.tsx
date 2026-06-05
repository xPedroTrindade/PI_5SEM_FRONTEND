import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
    iconName: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    actionTitle?: string;
    onAction?: () => void;
}

export function EmptyState({ iconName, title, description, actionTitle, onAction }: EmptyStateProps) {
    return (
        <View className="flex-1 items-center justify-center p-6 mt-10">
            <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm">
                <Ionicons name={iconName} size={48} className="text-surface-muted" />
            </View>

            <Text className="text-xl font-bold text-primary text-center mb-2">
                {title}
            </Text>

            <Text className="text-surface-muted text-center text-sm mb-6 px-4">
                {description}
            </Text>

            {actionTitle && onAction && (
                <View className="w-full max-w-[200px]">
                    <PrimaryButton title={actionTitle} onPress={onAction} />
                </View>
            )}
        </View>
    );
}