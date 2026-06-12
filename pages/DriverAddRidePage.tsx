import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { Dropdown } from '../components/Dropdown';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { DatePickerModal } from '../components/DatePickerModal';
import { RegisterPassengerModal } from '../components/RegisterPassengerModal';
import { RouteSelector } from '../components/RouteSelector';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import { GeoLocation } from '../utils/geo';

interface Props {
    navigate: (screen: string) => void;
}

interface PricingResult {
    totalDistance: number;
    fuelCost: number;
    tollCost: number;
    waitFee: number;
    totalCost: number;
    totalPrice: number;
    netProfit: number;
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

function shortLabel(loc: GeoLocation) {
    return loc.displayName.split(',').slice(0, 3).join(',').trim();
}

function parseBRL(value: string) {
    return parseFloat(value.replace(',', '.'));
}

function formatNumber(value: number, decimals: number) {
    return value.toFixed(decimals).replace('.', ',');
}

export default function DriverAddRidePage({ navigate }: Props) {
    const { driver } = useAuth();
    const [passengers, setPassengers] = useState<any[]>([]);
    const [selectedPassengerId, setSelectedPassengerId] = useState<string | null>(null);
    const [showAddPassenger, setShowAddPassenger] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [time, setTime] = useState('');
    const [originLoc, setOriginLoc] = useState<GeoLocation | null>(null);
    const [destLoc, setDestLoc] = useState<GeoLocation | null>(null);
    const [routeDistance, setRouteDistance] = useState<number | null>(null);
    const [routeToll, setRouteToll] = useState<number | null>(null);
    const [distance, setDistance] = useState('');
    const [price, setPrice] = useState('');
    const [consumption, setConsumption] = useState('');
    const [fuelPrice, setFuelPrice] = useState('5,80');
    const [pricePerKm, setPricePerKm] = useState('');
    const [waitFee, setWaitFee] = useState('');
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [pricing, setPricing] = useState<PricingResult | null>(null);
    const [loading, setLoading] = useState(false);

    const loadPassengers = useCallback(async () => {
        if (!driver?.driverId) return;
        try {
            const { data } = await api.get(`/api/drivers/${driver.driverId}/passengers`);
            setPassengers(Array.isArray(data) ? data : []);
        } catch {}
    }, [driver?.driverId]);

    useEffect(() => {
        loadPassengers();
    }, [loadPassengers]);

    useEffect(() => {
        if (driver?.precoKm) {
            setPricePerKm(driver.precoKm.toString().replace('.', ','));
        }
        if (driver?.driverId) {
            api.get(`/api/vehicles/driver/${driver.driverId}`)
                .then(({ data }) => {
                    if (data?.consumoMedio) {
                        setConsumption(String(data.consumoMedio).replace('.', ','));
                    }
                })
                .catch(() => {});
        }
    }, [driver?.driverId, driver?.precoKm]);

    useEffect(() => {
        if (routeDistance == null) {
            setDistance('');
            setPrice('');
            setPricing(null);
            return;
        }

        const cons = parseBRL(consumption) || 0;
        const fPrice = parseBRL(fuelPrice) || 0;
        const pKm = parseBRL(pricePerKm) || 0;
        const waiting = parseBRL(waitFee) || 0;
        const multiplier = isRoundTrip ? 2 : 1;
        const totalDistance = routeDistance * multiplier;
        const tollCost = (routeToll ?? 0) * multiplier;
        const fuelCost = cons > 0 ? (totalDistance / cons) * fPrice : 0;
        const totalCost = fuelCost + tollCost;
        const totalPrice = (totalDistance * pKm) + waiting;
        const netProfit = totalPrice - totalCost;

        setDistance(formatNumber(totalDistance, 1));
        setPrice(formatNumber(totalPrice, 2));
        setPricing({ totalDistance, fuelCost, tollCost, waitFee: waiting, totalCost, totalPrice, netProfit });
    }, [routeDistance, routeToll, consumption, fuelPrice, pricePerKm, waitFee, isRoundTrip]);

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

    async function handleSaveRide() {
        const passenger = passengers.find(p => p._id === selectedPassengerId);
        if (!passenger) {
            Alert.alert('Atenção', 'Selecione um passageiro ou cadastre um novo.');
            return;
        }
        if (!originLoc || !destLoc) {
            Alert.alert('Atenção', 'Selecione a origem e o destino na lista de sugestões.');
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

        const distValue = parseBRL(distance);
        const priceValue = parseBRL(price);
        if (!distance.trim() || isNaN(distValue) || distValue <= 0) {
            Alert.alert('Atenção', 'Escolha uma rota válida para calcular a distância.');
            return;
        }
        if (!price.trim() || isNaN(priceValue) || priceValue <= 0) {
            Alert.alert('Atenção', 'Informe um valor final válido.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/rides', {
                driverId: driver?.driverId,
                passageiroId: passenger._id,
                passageiroNome: passenger.nome,
                data: toISODate(selectedDate),
                hora: time.trim(),
                origem: shortLabel(originLoc),
                destino: shortLabel(destLoc),
                distanciaKm: distValue,
                valor: priceValue,
                idaVolta: isRoundTrip,
                taxaEspera: parseBRL(waitFee) || 0,
                pedagio: pricing?.tollCost ?? 0,
                consumoMedio: parseBRL(consumption) || undefined,
                combustivelPreco: parseBRL(fuelPrice) || 0,
                precoKm: parseBRL(pricePerKm) || 0,
                custoCombustivel: pricing?.fuelCost ?? 0,
                custoTotal: pricing?.totalCost ?? 0,
                lucroLiquido: pricing ? priceValue - pricing.totalCost : priceValue,
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
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px] z-10">
                <TouchableOpacity onPress={() => navigate('DriverAgenda')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Nova Corrida Manual</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <Text className="text-surface-muted mb-6 font-medium text-sm">
                        Registre a corrida com rota, pedágio, custos, taxa de espera e lucro estimado antes de adicionar à agenda.
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
                            <CustomInput
                                iconName="time-outline"
                                placeholder="Hora (HH:MM)"
                                keyboardType="numeric"
                                maxLength={5}
                                value={time}
                                onChangeText={handleTimeChange}
                            />
                        </View>
                    </View>

                    <Text className="text-primary font-bold text-lg mt-4 mb-3">3. Trajeto e Valor</Text>
                    <AddressAutocomplete
                        iconName="location-outline"
                        placeholder="Endereço de Origem"
                        onLocationSelect={setOriginLoc}
                        onClear={() => {
                            setOriginLoc(null);
                            setRouteDistance(null);
                            setRouteToll(null);
                        }}
                    />
                    <AddressAutocomplete
                        iconName="flag-outline"
                        placeholder="Endereço de Destino"
                        onLocationSelect={setDestLoc}
                        onClear={() => {
                            setDestLoc(null);
                            setRouteDistance(null);
                            setRouteToll(null);
                        }}
                    />

                    <RouteSelector
                        origin={originLoc}
                        destination={destLoc}
                        onRouteChange={(info) => {
                            setRouteDistance(info ? info.distanceKm : null);
                            setRouteToll(info ? info.tollBRL : null);
                        }}
                    />

                    <CustomInput
                        iconName="map-outline"
                        placeholder="Distância total (km)"
                        keyboardType="numeric"
                        value={distance}
                        onChangeText={setDistance}
                    />

                    <View className="flex-row items-center justify-between bg-background-paper p-4 rounded-lg shadow-sm border border-surface-border mb-4">
                        <View className="flex-row items-center flex-1">
                            <Ionicons name="swap-horizontal" size={22} color="#1A237E" />
                            <Text className="text-base font-bold text-primary ml-2">Cobrar ida e volta</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E0E0E0', true: '#FDD835' }}
                            thumbColor={isRoundTrip ? '#1A237E' : '#f4f3f4'}
                            onValueChange={setIsRoundTrip}
                            value={isRoundTrip}
                        />
                    </View>

                    <View className="flex-row">
                        <View className="flex-1 mr-2">
                            <CustomInput
                                iconName="speedometer-outline"
                                placeholder="Consumo (km/L)"
                                keyboardType="numeric"
                                value={consumption}
                                onChangeText={setConsumption}
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <CustomInput
                                iconName="water-outline"
                                placeholder="Combustível (R$)"
                                keyboardType="numeric"
                                value={fuelPrice}
                                onChangeText={setFuelPrice}
                            />
                        </View>
                    </View>

                    <View className="flex-row">
                        <View className="flex-1 mr-2">
                            <CustomInput
                                iconName="cash-outline"
                                placeholder="Preço/km (R$)"
                                keyboardType="numeric"
                                value={pricePerKm}
                                onChangeText={setPricePerKm}
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <CustomInput
                                iconName="hourglass-outline"
                                placeholder="Taxa espera (R$)"
                                keyboardType="numeric"
                                value={waitFee}
                                onChangeText={setWaitFee}
                            />
                        </View>
                    </View>

                    {pricing && (
                        <View className="bg-background-paper p-4 rounded-lg shadow-sm border border-surface-border mb-4">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-surface-muted">Distância cobrada</Text>
                                <Text className="text-primary font-bold">{formatNumber(pricing.totalDistance, 1)} km</Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-surface-muted">Combustível</Text>
                                <Text className="text-primary font-bold">R$ {formatNumber(pricing.fuelCost, 2)}</Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-surface-muted">Pedágio</Text>
                                <Text className="text-primary font-bold">R$ {formatNumber(pricing.tollCost, 2)}</Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-surface-muted">Custo estimado</Text>
                                <Text className="text-status-danger font-bold">R$ {formatNumber(pricing.totalCost, 2)}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-surface-muted">Lucro real estimado</Text>
                                <Text className="text-status-success font-bold">R$ {formatNumber(pricing.netProfit, 2)}</Text>
                            </View>
                        </View>
                    )}

                    <CustomInput
                        iconName="cash-outline"
                        placeholder="Valor final da corrida (R$)"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={(text) => {
                            setPrice(text);
                            const manualPrice = parseBRL(text);
                            setPricing(prev => prev && !isNaN(manualPrice)
                                ? { ...prev, totalPrice: manualPrice, netProfit: manualPrice - prev.totalCost }
                                : prev);
                        }}
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
