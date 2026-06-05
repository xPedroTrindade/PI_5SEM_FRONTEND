import React from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvatarProps {
    imageUrl?: string; // Opcional: se não passar, mostra o ícone
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ imageUrl, size = 'md' }: AvatarProps) {
    // Definindo os tamanhos do Tailwind
    const sizeClasses = {
        sm: 'w-8 h-8',    // Para listas
        md: 'w-10 h-10',  // Padrão para Cards
        lg: 'w-12 h-12',  // Para cabeçalhos
        xl: 'w-24 h-24',  // Para a tela de Perfil
    };

    const iconSizes = { sm: 16, md: 20, lg: 24, xl: 40 };

    return (
        <View className={`${sizeClasses[size]} bg-gray-200 rounded-full items-center justify-center overflow-hidden border border-surface-border`}>
            {imageUrl ? (
                <Image
                    source={{ uri: imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
            ) : (
                <Ionicons name="person" size={iconSizes[size]} color="#9CA3AF" />
            )}
        </View>
    );
}