import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HistoryRideCardProps {
    passengerName: string;
    dateTime: string;
    distance: string;
    totalPrice: string;
    netProfit: string;
    status: 'Concluída' | 'Cancelada';
}

export function HistoryRideCard({ passengerName, dateTime, distance, totalPrice, netProfit, status }: HistoryRideCardProps) {
    const isCompleted = status === 'Concluída';

    return (
        <View className="bg-white p-4 rounded-xl shadow-sm border border-surface-border mb-4">
            {/* Cabeçalho do Card */}
            <View className="flex-row justify-between items-center mb-3 border-b border-surface-border pb-3">
                <View>
                    <Text className="text-base font-bold text-primary">{passengerName}</Text>
                    <Text className="text-surface-muted text-xs">{dateTime}</Text>
                </View>
                <View className={`px-2 py-1 rounded-md ${isCompleted ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Text className={`text-xs font-bold ${isCompleted ? 'text-green-700' : 'text-red-700'}`}>
                        {status}
                    </Text>
                </View>
            </View>

            {/* Corpo do Card (Dados da Viagem e Financeiro) */}
            <View className="flex-row justify-between items-end">
                {/* Lado Esquerdo: Distância e Preço Total */}
                <View>
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="analytics-outline" size={16} color="#9CA3AF" />
                        <Text className="text-gray-600 text-sm ml-1">{distance}</Text>
                    </View>
                    <Text className="text-surface-muted text-xs mt-1">Valor Cobrado:</Text>
                    <Text className="text-gray-800 font-medium line-through decoration-gray-400">R$ {totalPrice}</Text>
                </View>

                {/* Lado Direito: Lucro Líquido em Destaque (Estética Fintech) */}
                <View className="items-end bg-gray-50 p-2 rounded-lg border border-surface-border">
                    <Text className="text-xs font-bold text-surface-muted uppercase tracking-wider mb-1">Lucro Líquido</Text>
                    <Text className={`text-2xl font-extrabold ${isCompleted ? 'text-status-success' : 'text-surface-muted'}`}>
                        R$ {netProfit}
                    </Text>
                </View>
            </View>
        </View>
    );
}