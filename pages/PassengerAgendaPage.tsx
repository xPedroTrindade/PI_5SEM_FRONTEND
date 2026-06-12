import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PassengerAgendaCard } from '../components/PassengerAgendaCard';
import { PassengerBottomNav } from '../components/PassengerBottomNav';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string) => void;
}

// Corridas "ativas" que carregamos; e as que aparecem na agenda do dia
const ACTIVE = ['aguardando_orcamento', 'aguardando_confirmacao', 'confirmada', 'pendente', 'em_andamento'];
const AGENDA = ['confirmada', 'pendente', 'em_andamento'];

export default function PassengerAgendaPage({ navigate }: Props) {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [allRides, setAllRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthRides = allRides.filter(r => r.data?.startsWith(monthPrefix));
    const daysWithRides = [...new Set(monthRides.filter(r => AGENDA.includes(r.status)).map(r => parseInt(r.data?.split('-')[2])))];

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(year, month, i + 1);
        return { day: i + 1, weekDay: weekDaysShort[d.getDay()], hasRide: daysWithRides.includes(i + 1) };
    });

    const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const ridesForDay = monthRides.filter(r => r.data === selectedDateStr && AGENDA.includes(r.status));

    // Orçamentos (aguardando motorista orçar OU aguardando confirmação) — independente do dia
    const pendingQuotes = allRides.filter(r => ['aguardando_orcamento', 'aguardando_confirmacao'].includes(r.status));

    const loadRides = useCallback(async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/api/rides/passenger/${user._id}`);
            setAllRides(Array.isArray(data) ? data.filter((r: any) => ACTIVE.includes(r.status)) : []);
        } catch {}
        finally { setLoading(false); }
    }, [user?._id]);

    useEffect(() => { loadRides(); }, [loadRides]);

    const handleConfirm = async (rideId: string) => {
        try {
            await api.put(`/api/rides/${rideId}/confirm`);
            loadRides();
        } catch {}
    };

    const handleCancel = async (rideId: string) => {
        try {
            await api.put(`/api/rides/${rideId}/status`, { status: 'cancelada' });
            loadRides();
        } catch {}
    };

    const handleNextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(1); };
    const handlePrevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(1); };

    function driverLabel(ride: any) {
        return ride.driverId?.userId?.nome ?? 'Aguardando motorista';
    }

    function statusLabel(status: string) {
        if (status === 'pendente') return 'Pendente';
        return 'Confirmada';
    }

    function formatBRL(v: number) {
        return `R$ ${(v ?? 0).toFixed(2).replace('.', ',')}`;
    }

    function formatDate(data?: string) {
        if (!data) return '';
        const [y, m, d] = data.split('-');
        return `${d}/${m}/${y}`;
    }

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho Fixo e Seletor de Mês */}
            <View className="bg-primary pt-12 pb-4 shadow-sm rounded-b-[40px] z-10">
                <View className="flex-row items-center px-4 mb-2">
                    <TouchableOpacity onPress={() => navigate('PassengerDashboard')} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-2">Minhas Viagens</Text>
                </View>

                <View className="flex-row justify-between items-center px-6 mb-4">
                    <TouchableOpacity onPress={handlePrevMonth} className="p-2 bg-primary-light rounded-full">
                        <Ionicons name="chevron-back" size={20} color="#FDD835" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">{monthNames[month]} {year}</Text>
                    <TouchableOpacity onPress={handleNextMonth} className="p-2 bg-primary-light rounded-full">
                        <Ionicons name="chevron-forward" size={20} color="#FDD835" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {daysArray.map((item) => {
                        const isSelected = selectedDay === item.day;
                        return (
                            <TouchableOpacity
                                key={item.day}
                                onPress={() => setSelectedDay(item.day)}
                                className={`items-center justify-center w-14 h-16 rounded-xl mr-3 ${isSelected ? 'bg-accent' : 'bg-primary-light'}`}
                            >
                                <Text className={`text-[10px] font-bold uppercase ${isSelected ? 'text-primary' : 'text-surface-muted'}`}>{item.weekDay}</Text>
                                <Text className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-white'}`}>{item.day}</Text>
                                {item.hasRide && (
                                    <View className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-primary' : 'bg-accent'}`} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Conteúdo */}
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Seção de Orçamentos */}
                {pendingQuotes.length > 0 && (
                    <View className="mb-5">
                        <Text className="text-surface-muted font-bold mb-3 uppercase tracking-wider text-xs">Orçamentos</Text>
                        {pendingQuotes.map((ride) => (
                            <View key={ride._id} className="bg-background-paper p-4 rounded-2xl shadow-sm border border-surface-border mb-3">
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-primary font-bold flex-1" numberOfLines={1}>{driverLabel(ride)}</Text>
                                    <Text className="text-surface-muted text-xs ml-2">{formatDate(ride.data)} {ride.hora}</Text>
                                </View>
                                <View className="flex-row items-center mb-1">
                                    <View className="w-2 h-2 rounded-full bg-status-info mr-2" />
                                    <Text className="text-surface-muted text-xs flex-1" numberOfLines={1}>{ride.origem}</Text>
                                </View>
                                <View className="flex-row items-center mb-3">
                                    <View className="w-2 h-2 rounded-full bg-status-danger mr-2" />
                                    <Text className="text-primary text-sm flex-1" numberOfLines={1}>{ride.destino}</Text>
                                </View>

                                {ride.status === 'aguardando_confirmacao' ? (
                                    <>
                                        <View className="flex-row justify-between items-center bg-gray-50 rounded-xl p-3 mb-3">
                                            <Text className="text-surface-muted text-xs font-bold uppercase tracking-wider">Orçamento</Text>
                                            <Text className="text-status-success font-black text-xl">{formatBRL(ride.valor)}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <TouchableOpacity
                                                className="flex-1 items-center justify-center py-3 bg-red-50 rounded-xl border border-red-100 mr-2"
                                                onPress={() => handleCancel(ride._id)}
                                                activeOpacity={0.7}
                                            >
                                                <Text className="text-status-danger font-bold text-sm">Recusar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                className="flex-1 flex-row items-center justify-center py-3 bg-primary rounded-xl shadow-sm ml-2"
                                                onPress={() => handleConfirm(ride._id)}
                                                activeOpacity={0.8}
                                            >
                                                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                                                <Text className="text-white font-bold ml-2 text-sm">Confirmar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ) : (
                                    <View className="flex-row items-center bg-yellow-50 rounded-xl p-3">
                                        <ActivityIndicator size="small" color="#F59E0B" />
                                        <Text className="text-yellow-700 text-xs font-bold ml-2 flex-1">Aguardando o motorista enviar o orçamento...</Text>
                                        <TouchableOpacity onPress={() => handleCancel(ride._id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                            <Text className="text-status-danger text-xs font-bold">Cancelar</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Agenda do dia */}
                <Text className="text-surface-muted font-bold mb-4 uppercase tracking-wider text-xs">
                    Agendamentos para {selectedDay} de {monthNames[month]}
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 20 }} />
                ) : ridesForDay.length > 0 ? (
                    ridesForDay.map((ride) => (
                        <PassengerAgendaCard
                            key={ride._id}
                            time={ride.hora}
                            driverName={driverLabel(ride)}
                            status={statusLabel(ride.status)}
                            onCancel={() => handleCancel(ride._id)}
                            onReschedule={() => navigate('NewBooking')}
                        />
                    ))
                ) : pendingQuotes.length === 0 ? (
                    <EmptyState
                        iconName="car-sport-outline"
                        title="Nenhuma viagem agendada"
                        description="Você não possui viagens para este dia. Que tal agendar uma nova corrida?"
                        actionTitle="Agendar Agora"
                        onAction={() => navigate('NewBooking')}
                    />
                ) : (
                    <Text className="text-surface-muted text-center text-sm py-6">Nenhuma viagem confirmada para este dia.</Text>
                )}
            </ScrollView>

            {/* Bottom Navigation do Passageiro */}
            <View className="absolute bottom-0 left-0 right-0">
                <PassengerBottomNav currentScreen="PassengerAgenda" navigate={navigate} />
            </View>

        </SafeAreaView>
    );
}
