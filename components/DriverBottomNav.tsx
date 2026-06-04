import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DriverBottomNavProps {
    currentScreen: string;
    navigate: (screen: string) => void;
}

export function DriverBottomNav({ currentScreen, navigate }: DriverBottomNavProps) {
    // Função auxiliar para mudar a cor se o botão for a tela atual
    const getColor = (screenName: string) => currentScreen === screenName ? '#1A237E' : '#9CA3AF';
    const getTextColor = (screenName: string) => currentScreen === screenName ? 'text-primary' : 'text-surface-muted';

    return (
        <View className="flex-row justify-around items-center bg-background-paper py-3 border-t border-surface-border">

            {/* 1. Início */}
            <TouchableOpacity className="items-center" onPress={() => navigate('DriverDashboard')}>
                <Ionicons name={currentScreen === 'DriverDashboard' ? 'home' : 'home-outline'} size={24} color={getColor('DriverDashboard')} />
                <Text className={`text-[10px] font-bold mt-1 ${getTextColor('DriverDashboard')}`}>Início</Text>
            </TouchableOpacity>

            {/* 2. Agenda */}
            <TouchableOpacity className="items-center" onPress={() => navigate('DriverAgenda')}>
                <Ionicons name={currentScreen === 'DriverAgenda' ? 'calendar' : 'calendar-outline'} size={24} color={getColor('DriverAgenda')} />
                <Text className={`text-[10px] font-bold mt-1 ${getTextColor('DriverAgenda')}`}>Agenda</Text>
            </TouchableOpacity>

            {/* 3. Calculadora (No meio) */}
            <TouchableOpacity className="items-center" onPress={() => navigate('Calculator')}>
                <Ionicons name={currentScreen === 'Calculator' ? 'calculator' : 'calculator-outline'} size={24} color={getColor('Calculator')} />
                <Text className={`text-[10px] font-bold mt-1 ${getTextColor('Calculator')}`}>Calculadora</Text>
            </TouchableOpacity>

            {/* 4. Histórico */}
            <TouchableOpacity className="items-center" onPress={() => navigate('DriverHistory')}>
                <Ionicons name={currentScreen === 'DriverHistory' ? 'time' : 'time-outline'} size={24} color={getColor('DriverHistory')} />
                <Text className={`text-[10px] font-bold mt-1 ${getTextColor('DriverHistory')}`}>Histórico</Text>
            </TouchableOpacity>

            {/* 5. Sair */}
            <TouchableOpacity className="items-center" onPress={() => navigate('Login')}>
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                <Text className="text-[10px] font-bold mt-1 text-red-500">Sair</Text>
            </TouchableOpacity>

        </View>
    );
}