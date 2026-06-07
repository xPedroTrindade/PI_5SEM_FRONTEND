import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoryRideCard } from '../components/HistoryRideCard';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string) => void;
}

export default function DriverHistoryPage({ navigate }: Props) {
    const { driver } = useAuth();
    const [rides, setRides] = useState<any[]>([]);
    const [lucroTotal, setLucroTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadHistory = useCallback(async () => {
        if (!driver?.driverId) return;
        setLoading(true);
        try {
            const [ridesRes, driverRes] = await Promise.all([
                api.get(`/api/rides/driver/${driver.driverId}`),
                api.get(`/api/drivers/${driver.driverId}`),
            ]);
            const past = (Array.isArray(ridesRes.data) ? ridesRes.data : []).filter(
                (r: any) => r.status === 'concluida' || r.status === 'cancelada'
            );
            setRides(past);
            setLucroTotal(driverRes.data?.lucroTotal ?? 0);
        } catch {}
        finally { setLoading(false); }
    }, [driver?.driverId]);

    useEffect(() => { loadHistory(); }, [loadHistory]);

    function formatDate(dateStr: string, hora: string) {
        const [, m, d] = dateStr.split('-');
        return `${d}/${m} - ${hora}`;
    }

    const concluded = rides.filter(r => r.status === 'concluida');

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho e Resumo Financeiro */}
            <View className="bg-primary pt-12 pb-6 px-6 rounded-b-3xl shadow-md z-10">
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigate('DriverDashboard')} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color="#ffffff" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">Histórico</Text>
                    </View>
                </View>

                <View className="flex-row justify-between">
                    <View className="flex-1 bg-primary-light p-4 rounded-xl mr-2">
                        <Text className="text-accent text-xs font-medium uppercase mb-1">Lucro Total</Text>
                        <Text className="text-white text-2xl font-extrabold">
                            {loading ? '...' : `R$ ${lucroTotal.toFixed(2).replace('.', ',')}`}
                        </Text>
                    </View>

                    <View className="flex-1 bg-primary-light p-4 rounded-xl ml-2">
                        <Text className="text-gray-300 text-xs font-medium uppercase mb-1">Corridas</Text>
                        <Text className="text-white text-2xl font-extrabold">
                            {loading ? '...' : String(concluded.length)}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

                <Text className="text-surface-muted font-bold mb-4 uppercase tracking-wider text-xs">Mais Recentes</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 20 }} />
                ) : rides.length > 0 ? (
                    rides.map((ride) => (
                        <HistoryRideCard
                            key={ride._id}
                            passengerName={ride.passageiroNome}
                            dateTime={formatDate(ride.data, ride.hora)}
                            distance={`${ride.distanciaKm} km`}
                            totalPrice={ride.valor?.toFixed(2).replace('.', ',') ?? '0,00'}
                            netProfit={ride.valor?.toFixed(2).replace('.', ',') ?? '0,00'}
                            status={ride.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                        />
                    ))
                ) : (
                    <Text className="text-surface-muted text-center mt-8">Nenhuma corrida registrada ainda.</Text>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}
