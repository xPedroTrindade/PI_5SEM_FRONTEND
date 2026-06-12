import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { Dropdown } from '../components/Dropdown';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { RegisterPassengerModal } from '../components/RegisterPassengerModal';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import { GeoLocation, getRoute } from '../utils/geo';

interface Props {
    navigate: (screen: string) => void;
}

// Encurta o endereco completo do OpenStreetMap para algo legivel
function shortLabel(loc: GeoLocation) {
    return loc.displayName.split(',').slice(0, 3).join(',').trim();
}

export default function DriverAddRidePage({ navigate }: Props) {
    const { driver } = useAuth();
    const [passengers, setPassengers] = useState<any[]>([]);
    const [selectedPassengerId, setSelectedPassengerId] = useState<string | null>(null);
    const [showAddPassenger, setShowAddPassenger] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [originLoc, setOriginLoc] = useState<GeoLocation | null>(null);
    const [destLoc, setDestLoc] = useState<GeoLocation | null>(null);
    const [distance, setDistance] = useState('');
    const [calcDist, setCalcDist] = useState(false);
    const [distMsg, setDistMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const loadPassengers = useCallback(async () => {
        if (!driver?.driverId) return;
        try {
            const { data } = await api.get(`/api/drivers/${driver.driverId}/passengers`);
            setPassengers(Array.isArray(data) ? data : []);
        } catch {}
    }, [driver?.driverId]);

    useEffect(() => { loadPassengers(); }, [loadPassengers]);

    // Calcula a distancia automaticamente ao escolher origem e destino
    useEffect(() => {
        if (!originLoc || !destLoc) {
            setDistMsg(null);
            return;
        }
        let active = true;
        setCalcDist(true);
        setDistMsg(null);
        getRoute(originLoc.lat, originLoc.lon, destLoc.lat, destLoc.lon)
            .then((r) => {
                if (!active) return;
                setDistance(r.distanceKm.toFixed(1).replace('.', ','));
                setDistMsg({ type: 'ok', text: `Rota: ${r.distanceKm.toFixed(1).replace('.', ',')} km` });
            })
            .catch(() => {
                if (active) setDistMsg({ type: 'err', text: 'Não foi possível calcular a distância.' });
            })
            .finally(() => {
                if (active) setCalcDist(false);
            });
        return () => { active = false; };
    }, [originLoc, destLoc]);

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

    async function handleSaveRide() {
        const passenger = passengers.find(p => p._id === selectedPassengerId);
        if (!passenger) {
            Alert.alert('Atenção', 'Selecione um passageiro (ou cadastre um novo).');
            return;
        }
        if (!originLoc || !destLoc) {
            Alert.alert('Atenção', 'Selecione a origem e o destino na lista de sugestões.');
            return;
        }
        if (!date.trim() || !time.trim()) {
            Alert.alert('Atenção', 'Preencha a data e o horário.');
            return;
        }
        const parsedDate = parseDate(date);
        if (!parsedDate) {
            Alert.alert('Atenção', 'Informe a data no formato DD/MM ou DD/MM/AAAA.');
            return;
        }
        const distValue = parseFloat(distance.replace(',', '.'));
        const priceValue = parseFloat(price.replace(',', '.'));
        if (!distance.trim() || isNaN(distValue) || distValue <= 0) {
            Alert.alert('Atenção', 'Informe a distância em km.');
            return;
        }
        if (!price.trim() || isNaN(priceValue) || priceValue <= 0) {
            Alert.alert('Atenção', 'Informe o valor combinado.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/rides', {
                driverId: driver?.driverId,
                passageiroId: passenger._id,
                passageiroNome: passenger.nome,
                data: parsedDate,
                hora: time.trim(),
                origem: shortLabel(originLoc),
                destino: shortLabel(destLoc),
                distanciaKm: distValue,
                valor: priceValue,
            });
            Alert.alert('Sucesso', 'Corrida adicionada à agenda!', [{ text: 'OK', onPress: () => navigate('DriverAgenda') }]);
        } catch (err: any) {
            Alert.alert('Erro', err.response?.data?.error ?? 'Não foi possível salvar.');
        } finally {
            setLoading(false);
        }
    }

    const passengerOptions = passengers.map(p => ({ label: p.nome, value: p._id }));

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho */}
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px] z-10">
                <TouchableOpacity onPress={() => navigate('DriverAgenda')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Nova Corrida Manual</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    <Text className="text-surface-muted mb-6 font-medium text-sm">
                        Use esta tela para registrar corridas combinadas por fora do app (telefone, WhatsApp, etc) e manter sua agenda organizada.
                    </Text>

                    <Text className="text-primary font-bold text-lg mb-3">1. Passageiro</Text>
                    <Dropdown
                        iconName="person-outline"
                        placeholder="Selecione o passageiro"
                        value={selectedPassengerId}
                        options={passengerOptions}
                        onSelect={setSelectedPassengerId}
                        emptyLabel="Você ainda não tem passageiros. Cadastre um abaixo."
                        footerLabel="Cadastrar novo passageiro"
                        onFooterPress={() => setShowAddPassenger(true)}
                    />

                    <Text className="text-primary font-bold text-lg mt-4 mb-3">2. Data e Horário</Text>
                    <View className="flex-row justify-between mb-2">
                        <View className="flex-1 mr-2">
                            <CustomInput
                                iconName="calendar-outline"
                                placeholder="Ex: 15/10"
                                value={date}
                                onChangeText={setDate}
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <CustomInput
                                iconName="time-outline"
                                placeholder="Ex: 14:30"
                                value={time}
                                onChangeText={setTime}
                            />
                        </View>
                    </View>

                    <Text className="text-primary font-bold text-lg mt-4 mb-3">3. Trajeto e Valor</Text>
                    <AddressAutocomplete
                        iconName="location-outline"
                        placeholder="Endereço de Origem"
                        onLocationSelect={setOriginLoc}
                        onClear={() => setOriginLoc(null)}
                    />
                    <AddressAutocomplete
                        iconName="flag-outline"
                        placeholder="Endereço de Destino"
                        onLocationSelect={setDestLoc}
                        onClear={() => setDestLoc(null)}
                    />

                    {calcDist && (
                        <View className="flex-row items-center mb-3 ml-1">
                            <ActivityIndicator size="small" color="#1A237E" />
                            <Text className="text-primary text-xs font-bold ml-2">Calculando distância...</Text>
                        </View>
                    )}
                    {!calcDist && distMsg && (
                        <Text className={`text-xs mb-3 ml-1 font-bold ${distMsg.type === 'ok' ? 'text-status-success' : 'text-status-danger'}`}>
                            {distMsg.text}
                        </Text>
                    )}

                    <CustomInput
                        iconName="map-outline"
                        placeholder="Distância (km)"
                        keyboardType="numeric"
                        value={distance}
                        onChangeText={setDistance}
                    />
                    <CustomInput
                        iconName="cash-outline"
                        placeholder="Valor Combinado (R$)"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />

                    <View className="mt-8 mb-6">
                        {loading
                            ? <ActivityIndicator size="large" color="#1A237E" />
                            : <PrimaryButton title="Adicionar à Agenda" onPress={handleSaveRide} />}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <RegisterPassengerModal
                visible={showAddPassenger}
                driverId={driver?.driverId}
                onClose={() => setShowAddPassenger(false)}
                onCreated={(p) => {
                    setShowAddPassenger(false);
                    setPassengers(prev => [p, ...prev]);
                    setSelectedPassengerId(p._id);
                }}
            />
        </SafeAreaView>
    );
}
