import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SummaryCard } from '../components/SummaryCard';
import { RideCard } from '../components/RideCard';
import { DriverHeader } from '../components/DriverHeader';
import { DriverBottomNav } from '../components/DriverBottomNav';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string, params?: Record<string, any>) => void;
}

export default function DriverDashboardPage({ navigate }: Props) {
    const { driver, refreshDriver } = useAuth();
    const [isAvailable, setIsAvailable] = useState(driver?.disponivel ?? false);
    const [summary, setSummary] = useState<{ corridas: number; ganhosEstimados: number } | null>(null);
    const [nextRide, setNextRide] = useState<any | null>(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [toggling, setToggling] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadDashboard = useCallback(async () => {
        if (!driver?.driverId) return;
        try {
            const [s, n, p, notif] = await Promise.all([
                api.get(`/api/drivers/${driver.driverId}/summary`),
                api.get(`/api/drivers/${driver.driverId}/next-ride`),
                api.get(`/api/drivers/${driver.driverId}/pending-count`),
                api.get('/api/notifications/unread-count'),
            ]);
            setSummary(s.data);
            setNextRide(n.data);
            setPendingCount(p.data.pendentes ?? 0);
            setUnreadCount(notif.data.count ?? 0);
        } catch {}
    }, [driver?.driverId]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        setIsAvailable(driver?.disponivel ?? false);
    }, [driver?.disponivel]);

    async function handleToggle() {
        if (toggling || !driver?.driverId) return;
        setToggling(true);
        try {
            await api.put(`/api/drivers/${driver.driverId}/availability`);
            await refreshDriver();
        } catch {}
        finally { setToggling(false); }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* 1. Header Componentizado */}
            <DriverHeader
                subtitle="Olá, Motorista"
                title="Bem-vindo!"
                notifCount={unreadCount}
                onNotifPress={() => navigate('Notifications')}
                rightIcon="settings-outline"
                onRightPress={() => navigate('DriverSettings')}
            />

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

                {/* Toggle de Disponibilidade */}
                <View className="flex-row items-center justify-between bg-background-paper p-4 rounded-lg shadow-sm border border-surface-border mb-6">
                    <View className="flex-row items-center">
                        <Ionicons name={isAvailable ? "checkmark-circle" : "close-circle"} size={24} color={isAvailable ? "#4CAF50" : "#F44336"} />
                        <Text className="text-lg font-bold text-primary ml-2">
                            {isAvailable ? "Disponível para corridas" : "Indisponível"}
                        </Text>
                    </View>
                    {toggling
                        ? <ActivityIndicator size="small" color="#1A237E" />
                        : <Switch
                            trackColor={{ false: "#E0E0E0", true: "#FDD835" }}
                            thumbColor={isAvailable ? "#1A237E" : "#f4f3f4"}
                            onValueChange={handleToggle}
                            value={isAvailable}
                        />}
                </View>

                {/* Resumo do Dia */}
                <Text className="text-lg font-bold text-primary mb-3">Resumo de Hoje</Text>
                <View className="flex-row justify-between mb-6 -mx-1">
                    <SummaryCard
                        title="Corridas"
                        value={summary ? String(summary.corridas) : '-'}
                        iconName="car-outline"
                    />
                    <SummaryCard
                        title="Ganhos (Est.)"
                        value={summary ? `R$ ${summary.ganhosEstimados.toFixed(2).replace('.', ',')}` : '-'}
                        iconName="cash-outline"
                    />
                </View>

                {/* Próxima Corrida */}
                <Text className="text-lg font-bold text-primary mb-3">Próxima Agendada</Text>
                {nextRide ? (
                    <RideCard
                        passengerName={nextRide.passageiroNome}
                        time={nextRide.hora}
                        distance={`${nextRide.distanciaKm} km`}
                        destination={nextRide.destino}
                        onPressDetails={() => navigate('RideDetails', { ride: nextRide })}
                    />
                ) : (
                    <View className="bg-background-paper p-4 rounded-lg border border-surface-border mb-6">
                        <Text className="text-surface-muted text-center">Nenhuma corrida agendada.</Text>
                    </View>
                )}

                {/* Botão de Solicitações Pendentes */}
                <TouchableOpacity
                    className="bg-primary flex-row items-center justify-between p-4 rounded-lg shadow-sm mb-6 mt-4"
                    onPress={() => navigate('BookingRequests')}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="notifications" size={24} color="#FDD835" />
                        <Text className="text-white font-bold text-base ml-3">Pedidos Pendentes</Text>
                    </View>
                    {pendingCount > 0 && (
                        <View className="bg-red-500 w-6 h-6 rounded-full items-center justify-center">
                            <Text className="text-white text-xs font-bold">{pendingCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

            </ScrollView>

            {/* 2. Bottom Nav Componentizada */}
            <DriverBottomNav currentScreen="DriverDashboard" navigate={navigate} />

        </SafeAreaView>
    );
}
