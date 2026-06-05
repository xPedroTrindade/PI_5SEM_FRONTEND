import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/Avatar';
import { StatusBadge } from '../components/StatusBadge';
import { PrimaryButton } from '../components/PrimaryButton';

interface Props {
    navigate: (screen: string, params?: any) => void;
    ride?: any;
}

export default function PassengerRideDetailsPage({ navigate, ride }: Props) {
    function statusLabel(s: string) {
        if (s === 'pendente') return 'Pendente';
        if (s === 'em_andamento') return 'Confirmada';
        if (s === 'concluida') return 'Concluída';
        return 'Cancelada';
    }

    const driverName = ride?.driverId?.userId?.nome ?? 'Motorista';

    if (!ride) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px]">
                    <TouchableOpacity onPress={() => navigate('PassengerHistory')} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-2">Detalhes da Viagem</Text>
                </View>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-surface-muted">Nenhuma viagem selecionada.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho */}
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px]">
                <TouchableOpacity onPress={() => navigate('PassengerHistory')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Detalhes da Viagem</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                {/* Info do Motorista */}
                <View className="flex-row items-center bg-background-paper p-4 rounded-2xl shadow-sm border border-surface-border mb-6">
                    <Avatar size="lg" />
                    <View className="ml-4 flex-1">
                        <Text className="text-xl font-bold text-primary">{driverName}</Text>
                        <Text className="text-surface-muted text-sm">{ride.data} às {ride.hora}</Text>
                    </View>
                    <StatusBadge status={statusLabel(ride.status)} />
                </View>

                {/* Detalhes da Rota */}
                <View className="bg-background-paper p-5 rounded-2xl shadow-sm border border-surface-border mb-6">
                    <Text className="text-primary font-bold mb-4 uppercase text-xs tracking-widest">Resumo da Rota</Text>

                    <View className="flex-row mb-2">
                        <View className="items-center mr-4">
                            <View className="w-3 h-3 rounded-full bg-status-info" />
                            <View className="w-0.5 h-10 bg-gray-200 my-1" />
                            <View className="w-3 h-3 rounded-full bg-status-danger" />
                        </View>
                        <View className="flex-1 justify-between">
                            <View>
                                <Text className="text-surface-muted text-xs">Origem</Text>
                                <Text className="text-primary font-bold">{ride.origem}</Text>
                            </View>
                            <View className="mt-4">
                                <Text className="text-surface-muted text-xs">Destino</Text>
                                <Text className="text-primary font-bold">{ride.destino}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Recibo e Valores */}
                <View className="bg-background-paper p-5 rounded-2xl shadow-sm border border-surface-border mb-6">
                    <Text className="text-primary font-bold mb-4 uppercase text-xs tracking-widest">Recibo</Text>
                    <View className="flex-row justify-between mb-3">
                        <Text className="text-surface-muted font-medium">Distância</Text>
                        <Text className="text-primary font-bold">{ride.distanciaKm} km</Text>
                    </View>
                    <View className="flex-row justify-between mb-4 border-b border-gray-100 pb-4">
                        <Text className="text-surface-muted font-medium">Valor da Corrida</Text>
                        <Text className="text-primary font-bold">R$ {ride.valor?.toFixed(2).replace('.', ',')}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-primary font-black text-lg">Total</Text>
                        <Text className="text-status-success font-black text-lg">
                            R$ {ride.valor?.toFixed(2).replace('.', ',')}
                        </Text>
                    </View>
                </View>

                <PrimaryButton title="Agendar com este Motorista" onPress={() => navigate('NewBooking')} />

                <TouchableOpacity className="mt-4 items-center p-2">
                    <Text className="text-status-danger font-bold">Relatar um Problema</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
