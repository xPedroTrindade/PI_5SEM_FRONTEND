import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/Avatar';

interface PassengerAgendaCardProps {
    time: string;
    driverName: string;
    carInfo?: string;
    status: 'Confirmada' | 'Pendente' | 'Concluída' | 'Cancelada';
    onCancel: () => void;
    onReschedule: () => void;
}

export function PassengerAgendaCard({ time, driverName, carInfo, status, onCancel, onReschedule }: PassengerAgendaCardProps) {
    // Cores dinâmicas baseadas no status
    let statusColor = 'bg-gray-200 text-gray-700';
    if (status === 'Confirmada') statusColor = 'bg-green-100 text-green-800 border-green-200';
    if (status === 'Pendente') statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'Concluída') statusColor = 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'Cancelada') statusColor = 'bg-red-100 text-red-800 border-red-200';

    const isEditable = status === 'Confirmada' || status === 'Pendente';

    return (
        <View className={`bg-background-paper p-4 rounded-xl shadow-sm border border-surface-border mb-4 ${status === 'Cancelada' ? 'opacity-60' : ''}`}>

            {/* Topo: Horário e Status */}
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={18} color="#1A237E" />
                    <Text className="text-lg font-bold text-primary ml-1">{time}</Text>
                </View>
                <View className={`px-2 py-1 rounded border ${statusColor}`}>
                    <Text className="text-xs font-bold uppercase">{status}</Text>
                </View>
            </View>

            {/* Info do Motorista */}
            <View className="flex-row items-center mb-4 bg-gray-50 p-3 rounded-lg border border-surface-border">
                <View className="mr-3">
                    <Avatar size="md" />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-bold text-primary">{driverName}</Text>
                    <Text className="text-surface-muted text-xs">{carInfo || "Aguardando confirmação..."}</Text>
                </View>
                {status === 'Confirmada' && (
                    <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                )}
            </View>

            {/* Botões de Ação (Só aparecem se a corrida não foi concluída/cancelada) */}
            {isEditable && (
                <View className="flex-row justify-between pt-3 border-t border-surface-border">
                    <TouchableOpacity
                        className="flex-1 flex-row justify-center items-center py-2 mr-2 bg-red-50 rounded-lg border border-red-100"
                        onPress={onCancel}
                    >
                        <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                        <Text className="text-red-500 font-bold ml-1 text-sm">Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 flex-row justify-center items-center py-2 ml-2 bg-blue-50 rounded-lg border border-blue-100"
                        onPress={onReschedule}
                    >
                        <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
                        <Text className="text-blue-600 font-bold ml-1 text-sm">Reagendar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}