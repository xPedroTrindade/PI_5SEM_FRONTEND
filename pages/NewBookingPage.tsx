import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { CustomCheckbox } from '../components/CustomCheckbox';
import { PrimaryButton } from '../components/PrimaryButton';
import { SegmentedControl } from '../components/SegmentedControl';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { DatePickerModal } from '../components/DatePickerModal';
import { RouteSelector } from '../components/RouteSelector';
import api from '../config/api';
import { GeoLocation } from '../utils/geo';

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

function pad(n: number) {
    return n.toString().padStart(2, '0');
}
function formatBR(d: Date) {
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function toISODate(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
// Encurta o endereco completo para algo legivel.
function shortLabel(loc: GeoLocation) {
    return loc.displayName.split(',').slice(0, 3).join(',').trim();
}

export default function NewBookingPage({ navigate }: Props) {
    const [originLoc, setOriginLoc] = useState<GeoLocation | null>(null);
    const [destLoc, setDestLoc] = useState<GeoLocation | null>(null);
    const [distance, setDistance] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
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

    const distValue = parseFloat(distance.replace(',', '.')) || 0;

    // Máscara de horário: formata os dígitos como HH:MM e valida 00-23 / 00-59
    function handleTimeChange(text: string) {
        const digits = text.replace(/\D/g, '').slice(0, 4);
        if (digits.length <= 2) {
            let hh = digits;
            if (digits.length === 2 && parseInt(digits, 10) > 23) hh = '23';
            setTime(hh);
        } else {
            let hh = digits.slice(0, 2);
            let mm = digits.slice(2);
            if (parseInt(hh, 10) > 23) hh = '23';
            if (parseInt(mm, 10) > 59) mm = '59';
            setTime(`${hh}:${mm}`);
        }
    }

    async function handleConfirm() {
        if (!originLoc || !destLoc) {
            Alert.alert('Atenção', 'Selecione a origem e o destino na lista de sugestões.');
            return;
        }
        if (distValue <= 0) {
            Alert.alert('Atenção', 'Aguarde o cálculo da distância da rota.');
            return;
        }
        if (!selectedDriver) {
            Alert.alert('Atenção', 'Selecione um motorista.');
            return;
        }
        if (!selectedDate) {
            Alert.alert('Atenção', 'Selecione a data da corrida.');
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
                origem: shortLabel(originLoc),
                destino: shortLabel(destLoc),
                distanciaKm: distValue,
                data: toISODate(selectedDate),
                hora: time.trim(),
            });
            Alert.alert('Solicitação enviada', 'O motorista vai enviar o orçamento. Acompanhe em "Minhas Viagens" para confirmar o valor.', [
                { text: 'OK', onPress: () => navigate('PassengerAgenda') }
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
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    <Text className="text-primary font-bold text-lg mb-3">1. Qual a rota?</Text>
                    <AddressAutocomplete
                        iconName="location-outline"
                        placeholder="Local de Partida (Origem)"
                        onLocationSelect={setOriginLoc}
                        onClear={() => setOriginLoc(null)}
                    />
                    <AddressAutocomplete
                        iconName="location"
                        placeholder="Para onde vamos? (Destino)"
                        onLocationSelect={setDestLoc}
                        onClear={() => setDestLoc(null)}
                    />

                    {/* Mapa + escolha de rotas via Google Maps */}
                    <RouteSelector
                        origin={originLoc}
                        destination={destLoc}
                        onRouteChange={(info) => setDistance(info ? info.distanceKm.toFixed(1).replace('.', ',') : '')}
                    />

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
                                                {d.vehicle ? `${d.vehicle.modelo} - ${d.vehicle.placa}` : 'Veículo não cadastrado'}
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
                            <TouchableOpacity
                                onPress={() => setShowCalendar(true)}
                                className="flex-row items-center bg-white w-full p-4 rounded-lg shadow-sm mb-4 border border-surface-border"
                            >
                                <Ionicons name="calendar-outline" size={20} color="#1A237E" />
                                <Text className={`text-base ml-3 ${selectedDate ? 'text-primary' : 'text-surface-muted'}`}>
                                    {selectedDate ? formatBR(selectedDate) : 'Data'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-1 ml-2">
                            <CustomInput iconName="time-outline" placeholder="Hora (HH:MM)" keyboardType="numeric" maxLength={5} value={time} onChangeText={handleTimeChange} />
                        </View>
                    </View>

                </ScrollView>

                {/* Footer Fixo */}
                <View className="bg-background-paper p-5 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-surface-border mt-auto">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="information-circle-outline" size={16} color="#1A237E" />
                        <Text className="text-surface-muted text-xs ml-2 flex-1">
                            O motorista vai enviar o orçamento. Você confirma o valor depois.
                        </Text>
                    </View>
                    {loading
                        ? <ActivityIndicator size="large" color="#1A237E" />
                        : <PrimaryButton title="Solicitar Orçamento" onPress={handleConfirm} />}
                </View>

            </KeyboardAvoidingView>

            <DatePickerModal
                visible={showCalendar}
                value={selectedDate}
                minDate={new Date()}
                onSelect={(d) => setSelectedDate(d)}
                onClose={() => setShowCalendar(false)}
            />
        </SafeAreaView>
    );
}
