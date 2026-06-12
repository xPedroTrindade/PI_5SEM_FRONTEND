import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingRequestCard } from '../components/BookingRequestCard';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

export default function BookingRequestsPage({ navigate }: { navigate: (screen: string) => void }) {
    const { driver } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [quoteFor, setQuoteFor] = useState<any | null>(null);
    const [quoteValue, setQuoteValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadPending = useCallback(async () => {
        if (!driver?.driverId) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/api/rides/driver/${driver.driverId}`);
            const pending = (Array.isArray(data) ? data : []).filter((r: any) => r.status === 'aguardando_orcamento');
            setRequests(pending);
        } catch {}
        finally { setLoading(false); }
    }, [driver?.driverId]);

    useEffect(() => { loadPending(); }, [loadPending]);

    function openQuote(ride: any) {
        // Pré-preenche com a sugestão: seu preço/km configurado × distância (se houver)
        const suggested = driver?.precoKm && driver.precoKm > 0
            ? (driver.precoKm * (ride.distanciaKm ?? 0)).toFixed(2).replace('.', ',')
            : '';
        setQuoteValue(suggested);
        setQuoteFor(ride);
    }

    async function submitQuote() {
        if (!quoteFor) return;
        const valor = parseFloat(quoteValue.replace(',', '.'));
        if (isNaN(valor) || valor <= 0) {
            Alert.alert('Atenção', 'Informe um valor válido maior que zero.');
            return;
        }
        setSubmitting(true);
        try {
            await api.put(`/api/rides/${quoteFor._id}/quote`, { valor });
            setQuoteFor(null);
            setQuoteValue('');
            loadPending();
            Alert.alert('Orçamento enviado', 'O passageiro vai receber o valor para confirmar.');
        } catch (err: any) {
            Alert.alert('Erro', err.response?.data?.error ?? 'Não foi possível enviar o orçamento.');
        } finally {
            setSubmitting(false);
        }
    }

    const handleDecline = async (rideId: string) => {
        try {
            await api.put(`/api/rides/${rideId}/status`, { status: 'cancelada' });
            loadPending();
        } catch {}
    };

    function formatDateTime(data: string, hora: string) {
        const [, m, d] = data.split('-');
        return `${d}/${m} às ${hora}`;
    }

    const suggestedHint = driver?.precoKm && driver.precoKm > 0
        ? `Sugestão pelo seu preço/km (R$ ${driver.precoKm.toFixed(2).replace('.', ',')}/km × distância).`
        : 'Defina seu preço/km nas Configurações para sugestões automáticas.';

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho */}
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px]">
                <TouchableOpacity onPress={() => navigate('DriverDashboard')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Pedidos para Orçar</Text>
            </View>

            {/* Lista de Pedidos */}
            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                <Text className="text-surface-muted mb-5 font-medium text-sm">
                    Envie o orçamento dos pedidos abaixo. O passageiro confirma o valor para fechar a corrida.
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
                            category="Padrão"
                            onQuote={() => openQuote(req)}
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

            {/* Modal de Orçamento */}
            <Modal visible={!!quoteFor} transparent animationType="fade" onRequestClose={() => setQuoteFor(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
                    <View className="bg-background-paper rounded-3xl p-6">
                        <Text className="text-primary font-bold text-lg mb-1">Enviar Orçamento</Text>
                        <Text className="text-surface-muted text-sm mb-1" numberOfLines={2}>
                            {quoteFor?.origem} → {quoteFor?.destino}
                        </Text>
                        <Text className="text-surface-muted text-xs mb-4">
                            Distância: {quoteFor?.distanciaKm} km. {suggestedHint}
                        </Text>

                        <CustomInput
                            iconName="cash-outline"
                            placeholder="Valor da corrida (R$)"
                            keyboardType="numeric"
                            value={quoteValue}
                            onChangeText={setQuoteValue}
                        />

                        {submitting ? (
                            <ActivityIndicator size="large" color="#1A237E" />
                        ) : (
                            <PrimaryButton title="Enviar Orçamento" onPress={submitQuote} />
                        )}

                        <TouchableOpacity className="mt-3 items-center p-2" onPress={() => setQuoteFor(null)}>
                            <Text className="text-surface-muted font-bold">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}
