import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingRequestCard } from '../components/BookingRequestCard';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

export default function BookingRequestsPage({ navigate }: { navigate: (screen: string) => void }) {
    const { driver } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPending = useCallback(async () => {
        if (!driver?.driverId) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/api/rides/driver/${driver.driverId}`);
            const pending = (Array.isArray(data) ? data : []).filter((r: any) => r.status === 'pendente');
            setRequests(pending);
        } catch {}
        finally { setLoading(false); }
    }, [driver?.driverId]);

    useEffect(() => { loadPending(); }, [loadPending]);

    const handleAccept = async (rideId: string) => {
        try {
            await api.put(`/api/rides/${rideId}/status`, { status: 'em_andamento' });
            loadPending();
        } catch {}
    };

    const handleDecline = async (rideId: string) => {
        try {
            await api.put(`/api/rides/${rideId}/status`, { status: 'cancelada' });
            loadPending();
        } catch {}
    };

    function formatDateTime(data: string, hora: string) {
        const [y, m, d] = data.split('-');
        return `${d}/${m} às ${hora}`;
    }

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho */}
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px]">
                <TouchableOpacity onPress={() => navigate('DriverDashboard')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Pedidos Pendentes</Text>
            </View>

            {/* Lista de Pedidos */}
            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                <Text className="text-surface-muted mb-5 font-medium text-sm">
                    Analise os agendamentos abaixo e aceite os que se encaixam na sua agenda.
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 20 }} />
                ) : requests.length > 0 ? (
                    requests.map((req) => (
                        <BookingRequestCard
                            key={req._id}
                            passengerName={req.passageiroNome}
                            time={formatDateTime(req.data, req.hora)}
                            pickup={req.origem}
                            destination={req.destino}
                            distance={`${req.distanciaKm} km`}
                            estimatedPrice={req.valor?.toFixed(2).replace('.', ',') ?? '0,00'}
                            category="Padrão"
                            onAccept={() => handleAccept(req._id)}
                            onDecline={() => handleDecline(req._id)}
                        />
                    ))
                ) : (
                    <EmptyState
                        iconName="checkmark-done-circle-outline"
                        title="Sua lista está zerada"
                        description="Você não tem nenhuma solicitação nova no momento. Fique online para receber pedidos."
                    />
                )}
            </ScrollView>

        </SafeAreaView>
    );
}
