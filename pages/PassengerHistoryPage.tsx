import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PassengerHistoryCard } from '../components/PassengerHistoryCard';
import { PassengerBottomNav } from '../components/PassengerBottomNav';
import { EmptyState } from '../components/EmptyState';
import { SegmentedControl } from '../components/SegmentedControl';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string, params?: Record<string, any>) => void;
}

export default function PassengerHistoryPage({ navigate }: Props) {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todas');
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = useCallback(async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/api/rides/passenger/${user._id}`);
            const past = (Array.isArray(data) ? data : []).filter(
                (r: any) => r.status === 'concluida' || r.status === 'cancelada'
            );
            setRides(past);
        } catch {}
        finally { setLoading(false); }
    }, [user?._id]);

    useEffect(() => { loadHistory(); }, [loadHistory]);

    function driverName(ride: any) {
        return ride.driverId?.userId?.nome ?? 'Motorista';
    }

    function formatDate(dateStr: string) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}`;
    }

    const filteredRides = rides.filter(ride => {
        const matchesSearch =
            driverName(ride).toLowerCase().includes(searchQuery.toLowerCase()) ||
            ride.destino?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'Todas' ? true :
            filterStatus === 'Concluídas' ? ride.status === 'concluida' : ride.status === 'cancelada';

        return matchesSearch && matchesStatus;
    });

    const statusLabel = (s: string): 'Concluída' | 'Cancelada' =>
        s === 'concluida' ? 'Concluída' : 'Cancelada';

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho com Barra de Pesquisa */}
            <View className="bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px] z-10">
                <Text className="text-white text-2xl font-bold mb-4 ml-2">Histórico</Text>

                <View className="flex-row items-center bg-white/20 rounded-2xl px-4 py-3 mx-2">
                    <Ionicons name="search" size={20} color="#ffffff" />
                    <TextInput
                        className="flex-1 text-white ml-2 font-medium"
                        placeholder="Buscar por motorista ou destino..."
                        placeholderTextColor="#E0E0E0"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                <View className="mb-6 mt-2">
                    <SegmentedControl
                        options={['Todas', 'Concluídas', 'Canceladas']}
                        selectedValue={filterStatus}
                        onValueChange={setFilterStatus}
                    />
                </View>

                <Text className="text-surface-muted font-bold mb-4 uppercase tracking-wider text-xs">
                    {filterStatus === 'Todas' ? 'Todas as Viagens' : `Viagens ${filterStatus}`}
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 20 }} />
                ) : filteredRides.length > 0 ? (
                    filteredRides.map((ride) => (
                        <PassengerHistoryCard
                            key={ride._id}
                            driverName={driverName(ride)}
                            date={formatDate(ride.data)}
                            time={ride.hora}
                            pickup={ride.origem}
                            dropoff={ride.destino}
                            price={ride.valor?.toFixed(2).replace('.', ',') ?? '0,00'}
                            status={statusLabel(ride.status)}
                            onPress={() => navigate('PassengerRideDetails', { ride })}
                        />
                    ))
                ) : (
                    <EmptyState
                        iconName="search-outline"
                        title="Nenhuma corrida encontrada"
                        description={searchQuery ? `Não encontramos resultados para "${searchQuery}".` : `Você não tem viagens ${filterStatus.toLowerCase()}.`}
                    />
                )}
            </ScrollView>

            {/* Bottom Nav */}
            <View className="absolute bottom-0 left-0 right-0">
                <PassengerBottomNav currentScreen="PassengerHistory" navigate={navigate} />
            </View>

        </SafeAreaView>
    );
}
