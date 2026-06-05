import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PassengerBottomNavProps {
    currentScreen: string;
    navigate: (screen: string) => void;
}

export function PassengerBottomNav({ currentScreen, navigate }: PassengerBottomNavProps) {
    const getColor = (screenName: string) => currentScreen === screenName ? '#1A237E' : '#9CA3AF';
    const getTextColor = (screenName: string) => currentScreen === screenName ? 'text-primary' : 'text-surface-muted';

    return (
        <View className="flex-row justify-around items-center bg-background-paper py-3 border-t border-surface-border">

            {/* 1. Início */}
            <TouchableOpacity className="items-center" onPress={() => navigate('PassengerDashboard')}>
                <Ionicons name={currentScreen === 'PassengerDashboard' ? 'home' : 'home-outline'} size={24} color={getColor('PassengerDashboard')} />
                <Text className={`text-[10px] font-bold mt-1 ${getTextColor('PassengerDashboard')}`}>Início</Text>
            </TouchableOpacity>

            {/* 2. Novo Agendamento (Em Destaque) */}
            <TouchableOpacity className="items-center -mt-6" onPress={() => navigate('NewBooking')}>
                <View className="bg-accent w-14 h-14 rounded-full items-center justify-center shadow-lg border-4 border-background-paper">
                    <Ionicons name="add" size={32} color="#1A237E" />
                </View>
                <Text className={`text-[10px] font-bold mt-1 ${getTextColor('NewBooking')}`}>Agendar</Text>
            </TouchableOpacity>

            {/* 3. Minhas Corridas */}
            <TouchableOpacity className="items-center" onPress={() => navigate('PassengerAgenda')}>
                <Ionicons name={currentScreen === 'PassengerAgenda' ? 'calendar' : 'calendar-outline'} size={24} color={getColor('PassengerAgenda')} />
                <Text className={`text-[10px] font-bold mt-1 ${getTextColor('PassengerAgenda')}`}>Viagens</Text>
            </TouchableOpacity>

            {/* 4. Sair */}
            <TouchableOpacity className="items-center" onPress={() => navigate('Login')}>
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                <Text className="text-[10px] font-bold mt-1 text-red-500">Sair</Text>
            </TouchableOpacity>

        </View>
    );
}