import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';

interface BookingRequestCardProps {
    passengerName: string;
    time: string; // Ex: "Hoje, 14:30"
    pickup: string; // origem
    destination: string;
    distance: string;
    estimatedPrice: string;
    category?: string; // Padrão ou VIP
    onAccept: () => void;
    onDecline: () => void;
}

export function BookingRequestCard({
    passengerName,
    time,
    pickup,
    destination,
    distance,
    estimatedPrice,
    category = 'Padrão',
    onAccept,
    onDecline
}: BookingRequestCardProps) {
    return (
        <View className="bg-background-paper p-4 rounded-2xl shadow-sm border border-surface-border mb-5">

            {/* 1. Cabeçalho: Horário do Agendamento */}
            <View className="flex-row items-center justify-between mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="#1A237E" />
                    <Text className="text-primary font-bold ml-2 text-xs uppercase tracking-wider">Agendado para</Text>
                </View>
                <Text className="text-primary font-extrabold text-sm">{time}</Text>
            </View>

            {/* 2. Info do Passageiro e Preço */}
            <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center flex-1">
                    <Avatar size="md" />
                    <View className="ml-3">
                        <Text className="text-base font-bold text-primary">{passengerName}</Text>
                        <View className="flex-row items-center mt-0.5">
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text className="text-surface-muted text-xs ml-1 font-medium">4.9 • {category}</Text>
                        </View>
                    </View>
                </View>

                {/* Destaque do Lucro */}
                <View className="items-end">
                    <Text className="text-surface-muted text-[10px] font-bold uppercase mb-0.5">Ganhos (Est.)</Text>
                    <Text className="text-xl font-black text-status-success">R$ {estimatedPrice}</Text>
                </View>
            </View>

            {/* 3. Trajeto Completo */}
            <View className="mb-5 pl-1">
                <View className="flex-row items-center mb-2">
                    <View className="w-2 h-2 rounded-full bg-status-info mr-3" />
                    <Text className="text-surface-muted text-xs flex-1" numberOfLines={1}>{pickup}</Text>
                </View>
                <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-status-danger mr-3" />
                    <Text className="text-primary font-medium text-sm flex-1" numberOfLines={1}>{destination}</Text>
                    <Text className="text-surface-muted text-xs font-bold bg-gray-100 px-2 py-1 rounded-md">{distance}</Text>
                </View>
            </View>

            {/* 4. Botões de Ação */}
            <View className="flex-row justify-between border-t border-gray-100 pt-4">
                <TouchableOpacity
                    className="flex-1 items-center justify-center py-3 bg-red-50 rounded-xl border border-red-100 mr-2"
                    onPress={onDecline}
                    activeOpacity={0.7}
                >
                    <Text className="text-status-danger font-bold text-sm">Recusar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-3 bg-primary rounded-xl shadow-sm ml-2"
                    onPress={onAccept}
                    activeOpacity={0.8}
                >
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    <Text className="text-white font-bold ml-2 text-sm">Aceitar Corrida</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}