import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/Avatar';
import { StatusBadge } from '../components/StatusBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import api from '../config/api';
import { Alert } from 'react-native';

interface Props {
    navigate: (screen: string, params?: any) => void;
    ride?: any;
}

export default function RideDetailsPage({ navigate, ride }: Props) {
    async function handleStart() {
        if (!ride?._id) return;
        try {
            await api.put(`/api/rides/${ride._id}/status`, { status: 'em_andamento' });
            Alert.alert('Corrida iniciada!', 'Status atualizado para Em andamento.', [
                { text: 'OK', onPress: () => navigate('DriverDashboard') }
            ]);
        } catch {
            Alert.alert('Erro', 'Não foi possível atualizar o status.');
        }
    }

    async function handleCancel() {
        if (!ride?._id) return;
        Alert.alert('Cancelar', 'Tem certeza que deseja cancelar esta corrida?', [
            { text: 'Voltar', style: 'cancel' },
            {
                text: 'Cancelar', style: 'destructive', onPress: async () => {
                    try {
                        await api.put(`/api/rides/${ride._id}/status`, { status: 'cancelada' });
                        navigate('DriverDashboard');
                    } catch {
                        Alert.alert('Erro', 'Não foi possível cancelar.');
                    }
                }
            }
        ]);
    }

    function statusLabel(s: string) {
        if (s === 'pendente') return 'Pendente';
        if (s === 'em_andamento') return 'Em andamento';
        if (s === 'concluida') return 'Concluída';
        return 'Cancelada';
    }

    if (!ride) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px]">
                    <TouchableOpacity onPress={() => navigate('DriverDashboard')} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-2">Detalhes da Corrida</Text>
                </View>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-surface-muted">Nenhuma corrida selecionada.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px]">
                <TouchableOpacity onPress={() => navigate('DriverDashboard')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Detalhes da Corrida</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                {/* Info do Passageiro */}
                <View className="flex-row items-center bg-background-paper p-4 rounded-2xl shadow-sm border border-surface-border mb-6">
                    <Avatar size="lg" />
                    <View className="ml-4 flex-1">
                        <Text className="text-xl font-bold text-primary">{ride.passageiroNome}</Text>
                        <Text className="text-surface-muted">{ride.data} às {ride.hora}</Text>
                    </View>
                    <StatusBadge status={statusLabel(ride.status)} />
                </View>

                {/* Detalhes da Rota */}
                <View className="bg-background-paper p-5 rounded-2xl shadow-sm border border-surface-border mb-6">
                    <Text className="text-primary font-bold mb-4 uppercase text-xs tracking-widest">Trajeto</Text>

                    <View className="flex-row mb-6">
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

                    <View className="flex-row justify-between border-t border-gray-100 pt-4">
                        <View>
                            <Text className="text-surface-muted text-xs">Distância</Text>
                            <Text className="text-lg font-bold text-primary">{ride.distanciaKm} km</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-surface-muted text-xs">Valor</Text>
                            <Text className="text-lg font-bold text-primary">
                                R$ {ride.valor?.toFixed(2).replace('.', ',')}
                            </Text>
                        </View>
                    </View>
                </View>

                {ride.status === 'pendente' && (
                    <PrimaryButton title="Iniciar Corrida" onPress={handleStart} />
                )}
                {ride.status === 'em_andamento' && (
                    <PrimaryButton title="Concluir Corrida" onPress={async () => {
                        try {
                            await api.put(`/api/rides/${ride._id}/status`, { status: 'concluida' });
                            Alert.alert('Concluída!', 'Corrida finalizada com sucesso.', [
                                { text: 'OK', onPress: () => navigate('DriverDashboard') }
                            ]);
                        } catch { Alert.alert('Erro', 'Não foi possível concluir.'); }
                    }} />
                )}

                {(ride.status === 'pendente' || ride.status === 'em_andamento') && (
                    <TouchableOpacity className="mt-4 items-center p-2" onPress={handleCancel}>
                        <Text className="text-status-danger font-bold">Cancelar Agendamento</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
