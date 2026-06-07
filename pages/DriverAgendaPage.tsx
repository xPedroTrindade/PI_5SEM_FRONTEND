import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgendaRideCard } from '../components/AgendaRideCard';
import { DriverBottomNav } from '../components/DriverBottomNav';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string) => void;
}

export default function DriverAgendaPage({ navigate }: Props) {
    const { driver } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [daysWithRides, setDaysWithRides] = useState<number[]>([]);
    const [rides, setRides] = useState<any[]>([]);
    const [loadingRides, setLoadingRides] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(year, month, i + 1);
        return {
            day: i + 1,
            weekDay: weekDaysShort[d.getDay()],
            hasRide: daysWithRides.includes(i + 1),
        };
    });

    const loadSchedule = useCallback(async () => {
        if (!driver?.driverId) return;
        try {
            const { data } = await api.get(`/api/drivers/${driver.driverId}/schedule`, {
                params: { year, month: month + 1 },
            });
            const days: number[] = (data.dias ?? []).map((d: { dia: number }) => d.dia);
            setDaysWithRides(days);
        } catch {}
    }, [driver?.driverId, year, month]);

    const loadRidesForDay = useCallback(async (day: number) => {
        if (!driver?.driverId) return;
        setLoadingRides(true);
        try {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const { data } = await api.get(`/api/rides/driver/${driver.driverId}`, {
                params: { date: dateStr },
            });
            setRides(Array.isArray(data) ? data : []);
        } catch {
            setRides([]);
        } finally {
            setLoadingRides(false);
        }
    }, [driver?.driverId, year, month]);

    useEffect(() => { loadSchedule(); }, [loadSchedule]);
    useEffect(() => { loadRidesForDay(selectedDay); }, [loadRidesForDay, selectedDay]);

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDay(1);
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDay(1);
    };

    function statusLabel(status: string) {
        if (status === 'concluida') return 'Concluída';
        if (status === 'em_andamento') return 'Em andamento';
        if (status === 'cancelada') return 'Cancelada';
        return 'Confirmada';
    }

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho Fixo e Seletor de Mês */}
            <View className="bg-primary pt-12 pb-4 shadow-sm rounded-b-[40px] z-10">
                <View className="flex-row items-center px-4 mb-2">
                    <TouchableOpacity onPress={() => navigate('DriverDashboard')} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-2">Minha Agenda</Text>
                </View>

                {/* Seletor de Mês/Ano */}
                <View className="flex-row justify-between items-center px-6 mb-4">
                    <TouchableOpacity onPress={handlePrevMonth} className="p-2 bg-primary-light rounded-full">
                        <Ionicons name="chevron-back" size={20} color="#FDD835" />
                    </TouchableOpacity>

                    <Text className="text-white text-lg font-bold">
                        {monthNames[month]} {year}
                    </Text>

                    <TouchableOpacity onPress={handleNextMonth} className="p-2 bg-primary-light rounded-full">
                        <Ionicons name="chevron-forward" size={20} color="#FDD835" />
                    </TouchableOpacity>
                </View>

                {/* Calendário Semanal Horizontal Dinâmico */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {daysArray.map((item) => {
                        const isSelected = selectedDay === item.day;
                        return (
                            <TouchableOpacity
                                key={item.day}
                                onPress={() => setSelectedDay(item.day)}
                                className={`items-center justify-center w-14 h-16 rounded-xl mr-3 ${isSelected ? 'bg-accent' : 'bg-primary-light'}`}
                            >
                                <Text className={`text-[10px] font-bold uppercase ${isSelected ? 'text-primary' : 'text-surface-muted'}`}>
                                    {item.weekDay}
                                </Text>
                                <Text className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-white'}`}>
                                    {item.day}
                                </Text>

                                {item.hasRide && (
                                    <View className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-primary' : 'bg-accent'}`} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Lista de Corridas do Dia */}
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Text className="text-surface-muted font-bold mb-4 uppercase tracking-wider text-xs">
                    Corridas para {selectedDay} de {monthNames[month]}
                </Text>

                {loadingRides ? (
                    <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 20 }} />
                ) : rides.length > 0 ? (
                    rides.map((ride) => (
                        <AgendaRideCard
                            key={ride._id}
                            time={ride.hora}
                            passengerName={ride.passageiroNome}
                            rideType="Padrão"
                            location={ride.origem}
                            status={statusLabel(ride.status)}
                        />
                    ))
                ) : (
                    <EmptyState
                        iconName="calendar-clear-outline"
                        title="Dia Livre"
                        description="Você não possui corridas agendadas para este dia."
                    />
                )}
            </ScrollView>

            {/* Floating Action Button (+) */}
            <TouchableOpacity
                className="absolute bottom-20 right-6 w-16 h-16 bg-accent rounded-full items-center justify-center shadow-lg border border-accent-light"
                onPress={() => navigate('DriverAddRide')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#1A237E" />
            </TouchableOpacity>

            {/* Bottom Nav */}
            <View className="absolute bottom-0 left-0 right-0">
                <DriverBottomNav currentScreen="DriverAgenda" navigate={navigate} />
            </View>

        </SafeAreaView>
    );
}
