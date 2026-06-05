import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PassengerBottomNav } from '../components/PassengerBottomNav';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string) => void;
}

export default function PassengerDashboardPage({ navigate }: Props) {
    const { user } = useAuth();
    const [nextRide, setNextRide] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const loadNextRide = useCallback(async () => {
        if (!user?._id) return;
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await api.get(`/api/rides/passenger/${user._id}`);
            const upcoming = (Array.isArray(data) ? data : [])
                .filter((r: any) => r.data >= today && ['pendente', 'em_andamento'].includes(r.status))
                .sort((a: any, b: any) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora));
            setNextRide(upcoming[0] ?? null);
        } catch {}
        finally { setLoading(false); }
    }, [user?._id]);

    useEffect(() => { loadNextRide(); }, [loadNextRide]);

    const driverName = nextRide?.driverId?.userId?.nome ?? 'Motorista';

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho Simples */}
            <View className="bg-primary pt-12 pb-6 px-6 rounded-b-3xl shadow-sm z-10 flex-row justify-between items-center">
                <View>
                    <Text className="text-white text-base">Olá, {user?.nome?.split(' ')[0] ?? ''}</Text>
                    <Text className="text-white text-2xl font-bold mt-1">Para onde vamos?</Text>
                </View>
                <TouchableOpacity onPress={() => navigate('PassengerProfile')} activeOpacity={0.8}>
                    <Avatar size="lg" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

                {/* Acesso Rápido - Agendar Corrida */}
                <TouchableOpacity
                    className="bg-accent p-5 rounded-2xl shadow-sm mb-6 justify-center"
                    onPress={() => navigate('NewBooking')}
                    activeOpacity={0.8}
                >
                    <Text className="text-primary font-extrabold text-xl mb-1">Agendar Corrida</Text>
                    <Text className="text-primary font-medium text-sm">Agende com antecedência e viaje seguro.</Text>
                </TouchableOpacity>

                {/* Próxima Viagem */}
                <Text className="text-lg font-bold text-primary mb-3">Sua Próxima Viagem</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#1A237E" style={{ marginVertical: 20 }} />
                ) : nextRide ? (
                    <View className="bg-background-paper p-5 rounded-xl shadow-sm border border-surface-border mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-gray-200 rounded-full mr-3 items-center justify-center">
                                    <Ionicons name="person" size={20} color="#9CA3AF" />
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-primary">{driverName}</Text>
                                    <Text className="text-surface-muted text-xs">{nextRide.data} às {nextRide.hora}</Text>
                                </View>
                            </View>
                            <View className="bg-green-100 px-2 py-1 rounded">
                                <Text className="text-green-700 text-xs font-bold">{nextRide.hora}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-4">
                            <Ionicons name="location" size={18} color="#FDD835" />
                            <Text className="text-gray-600 ml-2 text-sm">{nextRide.destino}</Text>
                        </View>

                        <TouchableOpacity
                            className="w-full bg-primary py-3 rounded-lg items-center"
                            onPress={() => navigate('PassengerAgenda')}
                        >
                            <Text className="text-white font-bold">Ver Detalhes do Agendamento</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="bg-background-paper p-5 rounded-xl shadow-sm border border-surface-border mb-6">
                        <Text className="text-surface-muted text-center">Nenhuma viagem agendada. Que tal marcar uma?</Text>
                    </View>
                )}

                {/* Botões de Acesso Rápido Secundários */}
                <View className="flex-row justify-between mb-6">
                    <TouchableOpacity
                        className="flex-1 bg-background-paper p-4 rounded-xl shadow-sm border border-surface-border mr-2 items-center"
                        onPress={() => navigate('PassengerAgenda')}
                    >
                        <Ionicons name="calendar" size={28} color="#1A237E" className="mb-2" />
                        <Text className="text-primary font-bold text-sm text-center">Minhas{'\n'}Viagens</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 bg-background-paper p-4 rounded-xl shadow-sm border border-surface-border ml-2 items-center"
                        onPress={() => navigate('PassengerHistory')}
                    >
                        <Ionicons name="time" size={28} color="#1A237E" className="mb-2" />
                        <Text className="text-primary font-bold text-sm text-center">Histórico{'\n'}Passado</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Bottom Navigation */}
            <PassengerBottomNav currentScreen="PassengerDashboard" navigate={navigate} />

        </SafeAreaView>
    );
}
