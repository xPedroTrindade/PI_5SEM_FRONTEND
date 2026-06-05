import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SegmentedControlProps {
    options: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
}

export function SegmentedControl({ options, selectedValue, onValueChange }: SegmentedControlProps) {
    return (
        <View className="flex-row bg-gray-200 rounded-lg p-1 w-full">
            {options.map((option) => {
                const isSelected = selectedValue === option;

                return (
                    <TouchableOpacity
                        key={option}
                        onPress={() => onValueChange(option)}
                        activeOpacity={0.8}
                        className={`flex-1 py-3 rounded-md items-center ${isSelected ? 'bg-background-paper shadow-sm border border-surface-border' : ''
                            }`}
                    >
                        <Text className={`font-bold ${isSelected ? 'text-primary' : 'text-surface-muted'
                            }`}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}