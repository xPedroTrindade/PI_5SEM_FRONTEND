import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RegisterPassengerModal } from '../components/RegisterPassengerModal';
import { EmptyState } from '../components/EmptyState';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string) => void;
}

export default function DriverPassengersPage({ navigate }: Props) {
    const { driver } = useAuth();
    const [passengers, setPassengers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    const load = useCallback(async () => {
        if (!driver?.driverId) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/api/drivers/${driver.driverId}/passengers`);
            setPassengers(Array.isArray(data) ? data : []);
        } catch {}
        finally { setLoading(false); }
    }, [driver?.driverId]);

    useEffect(() => { load(); }, [load]);

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho */}
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px]">
                <TouchableOpacity onPress={() => navigate('DriverSettings')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Meus Passageiros</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Text className="text-surface-muted mb-5 font-medium text-sm">
                    Cadastre seus passageiros frequentes. Eles viram contas reais (podem logar no app) e aparecem no dropdown ao adicionar uma corrida.
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 20 }} />
                ) : passengers.length > 0 ? (
                    passengers.map((p) => (
                        <View key={p._id} className="flex-row items-center bg-background-paper p-4 rounded-2xl border border-surface-border mb-3">
                            <Avatar size="md" />
                            <View className="ml-3 flex-1">
                                <Text className="text-primary font-bold">{p.nome}</Text>
                                <Text className="text-surface-muted text-xs">{p.email}</Text>
                                {p.telefone ? <Text className="text-surface-muted text-xs">{p.telefone}</Text> : null}
                            </View>
                        </View>
                    ))
                ) : (
                    <EmptyState
                        iconName="people-outline"
                        title="Nenhum passageiro ainda"
                        description="Cadastre seu primeiro passageiro para agilizar o agendamento das corridas."
                    />
                )}
            </ScrollView>

            {/* FAB Cadastrar */}
            <TouchableOpacity
                onPress={() => setShowAdd(true)}
                className="absolute bottom-6 right-6 bg-accent w-14 h-14 rounded-full items-center justify-center shadow-lg"
                activeOpacity={0.85}
            >
                <Ionicons name="add" size={32} color="#1A237E" />
            </TouchableOpacity>

            <RegisterPassengerModal
                visible={showAdd}
                driverId={driver?.driverId}
                onClose={() => setShowAdd(false)}
                onCreated={() => { setShowAdd(false); load(); }}
            />
        </SafeAreaView>
    );
}
