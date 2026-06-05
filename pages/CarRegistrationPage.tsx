import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { CustomCheckbox } from '../components/CustomCheckbox';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string) => void;
}

export default function CarRegistrationPage({ navigate }: Props) {
    const { driver } = useAuth();
    const [vehicleId, setVehicleId] = useState<string | null>(null);
    const [carModel, setCarModel] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [capacity, setCapacity] = useState('');
    const [fuelConsumption, setFuelConsumption] = useState('');
    const [acceptsPets, setAcceptsPets] = useState(false);
    const [acceptsChildSeat, setAcceptsChildSeat] = useState(false);
    const [acceptsVolume, setAcceptsVolume] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        async function loadVehicle() {
            try {
                const { data } = await api.get(`/api/vehicles/driver/${driver?.driverId}`);
                setVehicleId(data._id);
                setCarModel(data.modelo ?? '');
                setLicensePlate(data.placa ?? '');
                setFuelConsumption(data.consumoMedio?.toString().replace('.', ',') ?? '');
            } catch {}
            finally { setFetching(false); }
        }
        if (driver?.driverId) loadVehicle();
        else setFetching(false);
    }, [driver?.driverId]);

    async function handleSave() {
        if (!carModel.trim() || !licensePlate.trim()) {
            Alert.alert('Atenção', 'Modelo e placa são obrigatórios.');
            return;
        }
        setLoading(true);
        const payload: Record<string, any> = {
            driverId: driver?.driverId,
            modelo: carModel.trim(),
            placa: licensePlate.trim().toUpperCase(),
        };
        if (fuelConsumption.trim()) {
            payload.consumoMedio = parseFloat(fuelConsumption.replace(',', '.'));
        }
        try {
            if (vehicleId) {
                await api.put(`/api/vehicles/${vehicleId}`, payload);
            } else {
                await api.post('/api/vehicles', payload);
            }
            Alert.alert('Sucesso', 'Veículo salvo!', [{ text: 'OK', onPress: () => navigate('DriverSettings') }]);
        } catch (err: any) {
            Alert.alert('Erro', err.response?.data?.error ?? 'Não foi possível salvar.');
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#1A237E" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Cabeçalho com botão de voltar */}
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-3xl z-10">
                <TouchableOpacity onPress={() => navigate('DriverSettings')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Dados do Veículo</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

                    <Text className="text-gray-600 font-medium mb-6">
                        Preencha os detalhes do seu carro para que os passageiros saibam o que você pode transportar.
                    </Text>

                    {/* Informações Básicas */}
                    <Text className="text-primary font-bold text-lg mb-3">Informações Básicas</Text>
                    <CustomInput
                        iconName="car-sport-outline"
                        placeholder="Modelo do Carro (ex: Onix, HB20)"
                        value={carModel}
                        onChangeText={setCarModel}
                    />

                    <CustomInput
                        iconName="barcode-outline"
                        placeholder="Placa do Veículo"
                        autoCapitalize="characters"
                        value={licensePlate}
                        onChangeText={setLicensePlate}
                    />

                    <View className="flex-row justify-between">
                        <View className="flex-1 mr-2">
                            <CustomInput
                                iconName="people-outline"
                                placeholder="Passageiros"
                                keyboardType="numeric"
                                value={capacity}
                                onChangeText={setCapacity}
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <CustomInput
                                iconName="speedometer-outline"
                                placeholder="Consumo (km/L)"
                                keyboardType="numeric"
                                value={fuelConsumption}
                                onChangeText={setFuelConsumption}
                            />
                        </View>
                    </View>

                    {/* Tipos de Carga / Diferenciais */}
                    <Text className="text-primary font-bold text-lg mt-4 mb-3">Diferenciais e Cargas</Text>

                    <CustomCheckbox
                        label="Aceita Pets (Banho e Tosa)"
                        iconName="paw-outline"
                        isChecked={acceptsPets}
                        onToggle={() => setAcceptsPets(!acceptsPets)}
                    />

                    <CustomCheckbox
                        label="Possui Cadeirinha de Criança"
                        iconName="body-outline"
                        isChecked={acceptsChildSeat}
                        onToggle={() => setAcceptsChildSeat(!acceptsChildSeat)}
                    />

                    <CustomCheckbox
                        label="Aceita Pequenos Volumes/Cargas"
                        iconName="cube-outline"
                        isChecked={acceptsVolume}
                        onToggle={() => setAcceptsVolume(!acceptsVolume)}
                    />

                    {/* Botão de Salvar */}
                    <View className="mt-8 mb-6">
                        {loading
                            ? <ActivityIndicator size="large" color="#1A237E" />
                            : <PrimaryButton title="Salvar Dados do Veículo" onPress={handleSave} />}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
