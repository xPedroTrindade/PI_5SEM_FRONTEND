import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { CustomCheckbox } from '../components/CustomCheckbox';
import { PrimaryButton } from '../components/PrimaryButton';
import { SegmentedControl } from '../components/SegmentedControl';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string) => void;
}

interface DriverOption {
    _id: string;
    precoKm: number;
    disponivel: boolean;
    userId: { nome: string };
    vehicle: { modelo: string; placa: string } | null;
}

export default function NewBookingPage({ navigate }: Props) {
    const { user } = useAuth();
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [distance, setDistance] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [category, setCategory] = useState<'Padrão' | 'VIP'>('Padrão');
    const [hasPets, setHasPets] = useState(false);
    const [hasChild, setHasChild] = useState(false);
    const [hasVolume, setHasVolume] = useState(false);
    const [drivers, setDrivers] = useState<DriverOption[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<DriverOption | null>(null);
    const [loadingDrivers, setLoadingDrivers] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/api/drivers')
            .then(({ data }) => setDrivers(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoadingDrivers(false));
    }, []);

    function parseDate(input: string): string | null {
        const parts = input.trim().split('/');
        if (parts.length === 2) {
            const year = new Date().getFullYear();
            return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return null;
    }

    const distValue = parseFloat(distance.replace(',', '.')) || 0;
    const estimatedPrice = selectedDriver ? (selectedDriver.precoKm * distValue).toFixed(2).replace('.', ',') : '0,00';

    async function handleConfirm() {
        if (!origin.trim() || !destination.trim()) {
            Alert.alert('Atenção', 'Informe a origem e o destino.');
            return;
        }
        if (!distance.trim() || distValue <= 0) {
            Alert.alert('Atenção', 'Informe a distância estimada em km.');
            return;
        }
        if (!selectedDriver) {
            Alert.alert('Atenção', 'Selecione um motorista.');
            return;
        }
        const parsedDate = parseDate(date);
        if (!parsedDate) {
            Alert.alert('Atenção', 'Informe a data no formato DD/MM ou DD/MM/AAAA.');
            return;
        }
        if (!time.trim() || !/^\d{2}:\d{2}$/.test(time.trim())) {
            Alert.alert('Atenção', 'Informe o horário no formato HH:MM.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/rides/request', {
                driverId: selectedDriver._id,
                origem: origin.trim(),
                destino: destination.trim(),
                distanciaKm: distValue,
                data: parsedDate,
                hora: time.trim(),
            });
            Alert.alert('Sucesso', 'Corrida agendada! O motorista receberá sua solicitação.', [
                { text: 'OK', onPress: () => navigate('PassengerDashboard') }
            ]);
        } catch (err: any) {
            Alert.alert('Erro', err.response?.data?.error ?? 'Não foi possível agendar.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho */}
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px] z-10">
                <TouchableOpacity onPress={() => navigate('PassengerDashboard')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Agendar Corrida</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>

                    <Text className="text-primary font-bold text-lg mb-3">1. Qual a rota?</Text>
                    <CustomInput iconName="location-outline" placeholder="Local de Partida (Origem)" value={origin} onChangeText={setOrigin} />
                    <CustomInput iconName="location" placeholder="Para onde vamos? (Destino)" value={destination} onChangeText={setDestination} />
                    <CustomInput iconName="map-outline" placeholder="Distância estimada (km)" keyboardType="numeric" value={distance} onChangeText={setDistance} />

                    <Text className="text-primary font-bold text-lg mt-4 mb-3">2. Preferências da Viagem</Text>
                    <View className="mb-4">
                        <SegmentedControl
                            options={['Padrão', 'VIP']}
                            selectedValue={category}
                            onValueChange={(val) => setCategory(val as 'Padrão' | 'VIP')}
                        />
                    </View>
                    <CustomCheckbox label="Vou levar Pets (Banho/Tosa)" iconName="paw-outline" isChecked={hasPets} onToggle={() => setHasPets(!hasPets)} />
                    <CustomCheckbox label="Preciso de Cadeirinha Infantil" iconName="body-outline" isChecked={hasChild} onToggle={() => setHasChild(!hasChild)} />
                    <CustomCheckbox label="Tenho volume/carga extra" iconName="cube-outline" isChecked={hasVolume} onToggle={() => setHasVolume(!hasVolume)} />

                    <Text className="text-primary font-bold text-lg mt-4 mb-3">3. Motorista e Horário</Text>

                    {loadingDrivers ? (
                        <ActivityIndicator size="small" color="#1A237E" style={{ marginBottom: 16 }} />
                    ) : (
                        <View className="mb-4">
                            <Text className="text-surface-muted text-xs mb-2 ml-1 uppercase font-bold">Selecione o Motorista:</Text>
                            {drivers.length === 0 ? (
                                <Text className="text-surface-muted text-center p-4">Nenhum motorista disponível.</Text>
                            ) : (
                                drivers.map((d) => (
                                    <TouchableOpacity
                                        key={d._id}
                                        onPress={() => setSelectedDriver(d)}
                                        className={`p-4 rounded-lg border mb-2 flex-row justify-between items-center ${selectedDriver?._id === d._id ? 'bg-primary-light border-primary-dark' : 'bg-background-paper border-surface-border'}`}
                                    >
                                        <View>
                                            <Text className={`font-bold ${selectedDriver?._id === d._id ? 'text-white' : 'text-primary'}`}>
                                                {d.userId?.nome ?? 'Motorista'}
                                            </Text>
                                            <Text className={`text-xs mt-0.5 ${selectedDriver?._id === d._id ? 'text-accent' : 'text-surface-muted'}`}>
                                                {d.vehicle ? `${d.vehicle.modelo} - ${d.vehicle.placa}` : 'Veículo não cadastrado'} • R$ {d.precoKm.toFixed(2).replace('.', ',')}/km
                                            </Text>
                                        </View>
                                        {selectedDriver?._id === d._id && <Ionicons name="checkmark-circle" size={20} color="#FDD835" />}
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    )}

                    <View className="flex-row justify-between mb-4">
                        <View className="flex-1 mr-2">
                            <CustomInput iconName="calendar-outline" placeholder="Data (DD/MM)" value={date} onChangeText={setDate} />
                        </View>
                        <View className="flex-1 ml-2">
                            <CustomInput iconName="time-outline" placeholder="Hora (HH:MM)" value={time} onChangeText={setTime} />
                        </View>
                    </View>

                </ScrollView>

                {/* Footer Fixo */}
                <View className="bg-background-paper p-5 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-surface-border mt-auto">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-surface-muted font-bold text-xs uppercase tracking-wider">Estimativa de Preço</Text>
                        <Text className="text-3xl font-extrabold text-primary">R$ {estimatedPrice}</Text>
                    </View>
                    {loading
                        ? <ActivityIndicator size="large" color="#1A237E" />
                        : <PrimaryButton title="Confirmar Agendamento" onPress={handleConfirm} />}
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
