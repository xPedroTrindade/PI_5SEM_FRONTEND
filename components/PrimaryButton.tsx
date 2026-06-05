import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface PrimaryButtonProps extends TouchableOpacityProps {
    title: string;
}

export function PrimaryButton({ title, ...rest }: PrimaryButtonProps) {
    return (
        <TouchableOpacity
            className="bg-accent w-full py-4 rounded-lg shadow-sm items-center mt-2"
            activeOpacity={0.8}
            {...rest}
        >
            <Text className="text-primary font-bold text-lg">{title}</Text>
        </TouchableOpacity>
    );
}