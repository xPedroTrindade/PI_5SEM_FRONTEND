import React from 'react';
import { View, Text } from 'react-native';

interface StatusBadgeProps {
    status: 'Concluída' | 'Confirmada' | 'Pendente' | 'Pagamento Pendente' | 'Cancelada' | 'Reembolsada';
}

export function StatusBadge({ status }: StatusBadgeProps) {
    // Configuração padrão (Cinza)
    let bgColor = 'bg-gray-100 border-surface-border';
    let textColor = 'text-gray-600';

    // Lógica de Cores baseada no Tailwind Padrão
    if (status === 'Concluída' || status === 'Confirmada') {
        bgColor = 'bg-green-100 border-green-200';
        textColor = 'text-green-700';
    } else if (status === 'Pendente' || status === 'Pagamento Pendente') {
        bgColor = 'bg-yellow-100 border-yellow-200';
        textColor = 'text-yellow-700';
    } else if (status === 'Cancelada') {
        bgColor = 'bg-red-100 border-red-200';
        textColor = 'text-red-700';
    }

    return (
        <View className={`px-2 py-1 rounded-md border ${bgColor}`}>
            <Text className={`text-[10px] font-bold uppercase tracking-wider ${textColor}`}>
                {status}
            </Text>
        </View>
    );
}