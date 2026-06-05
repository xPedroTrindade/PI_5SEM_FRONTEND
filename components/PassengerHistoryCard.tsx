import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';

interface PassengerHistoryCardProps {
    driverName: string;
    date: string;
    time: string;
    pickup: string;
    dropoff: string;
    price: string;
    status: 'Concluída' | 'Cancelada';
    onPress: () => void;
}

export function PassengerHistoryCard({ driverName, date, time, pickup, dropoff, price, status, onPress }: PassengerHistoryCardProps) {
    return (
        <TouchableOpacity
            className="bg-background-paper p-4 rounded-2xl shadow-sm border border-surface-border mb-4"
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* 1. Cabeçalho: Data, Hora e Status */}
            <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text className="text-surface-muted font-bold ml-1.5 text-xs">{date} • {time}</Text>
                </View>
                <StatusBadge status={status} />
            </View>

            {/* 2. Informações do Motorista e Preço */}
            <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center flex-1">
                    <Avatar size="md" />
                    <View className="ml-3">
                        <Text className="text-base font-bold text-primary">{driverName}</Text>
                        <View className="flex-row items-center mt-0.5">
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text className="text-surface-muted text-xs ml-1 font-medium">Motorista Parceiro</Text>
                        </View>
                    </View>
                </View>

                {/* Valor da Corrida */}
                <View className="items-end">
                    <Text className="text-xl font-black text-primary">R$ {price}</Text>
                </View>
            </View>

            {/* 3. Trajeto */}
            <View className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <View className="flex-row items-center mb-2">
                    <View className="w-2 h-2 rounded-full bg-status-info mr-3" />
                    <Text className="text-surface-muted text-xs flex-1" numberOfLines={1}>{pickup}</Text>
                </View>
                <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-status-danger mr-3" />
                    <Text className="text-primary font-medium text-xs flex-1" numberOfLines={1}>{dropoff}</Text>
                </View>
            </View>

        </TouchableOpacity>
    );
}