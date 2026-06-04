import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SummaryCardProps {
    title: string;
    value: string;
    iconName: keyof typeof Ionicons.glyphMap;
}

export function SummaryCard({ title, value, iconName }: SummaryCardProps) {
    return (
        <View className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-surface-border mx-1">
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-surface-muted text-sm font-medium">{title}</Text>
                <Ionicons name={iconName} size={20} color="#1A237E" />
            </View>
            <Text className="text-2xl font-bold text-primary">{value}</Text>
        </View>
    );
}