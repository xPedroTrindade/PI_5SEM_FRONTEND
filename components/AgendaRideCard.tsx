import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AgendaRideCardProps {
    time: string;
    passengerName: string;
    location: string;
    rideType: string;
    status: 'Confirmada' | 'Pagamento Pendente' | 'Concluída' | 'Cancelada';
}

export function AgendaRideCard({ time, passengerName, location, rideType, status }: AgendaRideCardProps) {
    // Lógica para definir a cor da tag de status
    let statusColor = 'bg-gray-200 text-gray-700';
    if (status === 'Confirmada') statusColor = 'bg-green-100 text-green-800 border-green-200';
    if (status === 'Pagamento Pendente') statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'Concluída') statusColor = 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'Cancelada') statusColor = 'bg-red-100 text-red-800 border-red-200';

    const isCanceled = status === 'Cancelada';
    const isCompleted = status === 'Concluída';

    return (
        <View className={`bg-white p-4 rounded-lg shadow-sm border border-surface-border mb-4 ${isCanceled ? 'opacity-60' : ''}`}>

            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center">
                    <View className="bg-primary px-3 py-1.5 rounded-md mr-3">
                        <Text className="text-white font-bold text-lg">{time}</Text>
                    </View>
                    <View>
                        <Text className="text-lg font-bold text-primary">{passengerName}</Text>
                        <Text className="text-surface-muted text-xs">Tipo: {rideType}</Text>
                    </View>
                </View>

                <View className={`px-2 py-1 rounded border ${statusColor}`}>
                    <Text className="text-xs font-bold">{status}</Text>
                </View>
            </View>

            <View className="flex-row items-center mb-4">
                <Ionicons name="location" size={16} color="#FDD835" />
                <Text className="text-gray-600 ml-2 text-sm flex-1" numberOfLines={1}>{location}</Text>
            </View>

            {/* Esconde os botões se a corrida já foi concluída ou cancelada */}
            {!isCanceled && !isCompleted && (
                <View className="flex-row justify-end pt-3 border-t border-surface-border">
                    <TouchableOpacity className="flex-row items-center px-3 py-2 mr-2">
                        <Ionicons name="create-outline" size={18} color="#1A237E" />
                        <Text className="text-primary font-medium ml-1">Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center px-3 py-2 bg-red-50 rounded-md">
                        <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                        <Text className="text-red-500 font-medium ml-1">Cancelar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}