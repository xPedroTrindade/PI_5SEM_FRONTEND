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
    const daysWithRides = [...new Set(monthRides.map(r => parseInt(r.data?.split('-')[2])))];

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(year, month, i + 1);
        return { day: i + 1, weekDay: weekDaysShort[d.getDay()], hasRide: daysWithRides.includes(i + 1) };
    });

    const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const ridesForDay = monthRides.filter(r => r.data === selectedDateStr && ['pendente', 'em_andamento'].includes(r.status));

    const loadRides = useCallback(async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/api/rides/passenger/${user._id}`);
            setAllRides(Array.isArray(data) ? data.filter((r: any) => ['pendente', 'em_andamento'].includes(r.status)) : []);
        } catch {}
        finally { setLoading(false); }
    }, [user?._id]);

    useEffect(() => { loadRides(); }, [loadRides]);

    const handleCancel = async (rideId: string) => {
        try {
            await api.put(`/api/rides/${rideId}/status`, { status: 'cancelada' });
            loadRides();
        } catch {
            // silently fail
        }
    };

    const handleNextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(1); };
    const handlePrevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(1); };

    function driverLabel(ride: any) {
        const nome = ride.driverId?.userId?.nome;
        return nome ?? 'Aguardando motorista';
    }

    function statusLabel(status: string) {
        if (status === 'pendente') return 'Pendente';
        if (status === 'em_andamento') return 'Confirmada';
        return 'Confirmada';
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

            {/* Lista de Agendamentos */}
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
                ) : (
                    <EmptyState
                        iconName="car-sport-outline"
                        title="Nenhuma viagem agendada"
                        description="Você não possui viagens para este dia. Que tal agendar uma nova corrida?"
                        actionTitle="Agendar Agora"
                        onAction={() => navigate('NewBooking')}
                    />
                )}
            </ScrollView>

            {/* Bottom Navigation do Passageiro */}
            <View className="absolute bottom-0 left-0 right-0">
                <PassengerBottomNav currentScreen="PassengerAgenda" navigate={navigate} />
            </View>

        </SafeAreaView>
    );
}
