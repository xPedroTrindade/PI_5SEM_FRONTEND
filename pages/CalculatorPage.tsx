import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string) => void;
}

export default function CalculatorPage({ navigate }: Props) {
    const { driver } = useAuth();

    const [distance, setDistance] = useState('');
    const [consumption, setConsumption] = useState('');
    const [fuelPrice, setFuelPrice] = useState('5.80');
    const [pricePerKm, setPricePerKm] = useState('');
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [results, setResults] = useState<{ cost: string; profit: string; total: string } | null>(null);

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

    const handleCalculate = () => {
        Keyboard.dismiss();

        const dist = parseFloat(distance.replace(',', '.')) || 0;
        const cons = parseFloat(consumption.replace(',', '.')) || 1;
        const fPrice = parseFloat(fuelPrice.replace(',', '.')) || 0;
        const pKm = parseFloat(pricePerKm.replace(',', '.')) || 0;

        const totalDist = isRoundTrip ? dist * 2 : dist;
        const fuelUsedLiters = totalDist / cons;

        const estimatedCost = fuelUsedLiters * fPrice;
        const totalPrice = totalDist * pKm;
        const netProfit = totalPrice - estimatedCost;

        setResults({
            cost: estimatedCost.toFixed(2).replace('.', ','),
            profit: netProfit.toFixed(2).replace('.', ','),
            total: totalPrice.toFixed(2).replace('.', ',')
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho */}
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px]">
                <TouchableOpacity onPress={() => navigate('DriverDashboard')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Calculadora de Lucro</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

                <Text className="text-surface-muted mb-4 font-medium">
                    Os dados abaixo foram preenchidos automaticamente com base no seu perfil.
                </Text>

                <Text className="text-primary font-bold text-lg mb-3">Distância</Text>
                <CustomInput
                    iconName="map-outline"
                    placeholder="Distância da corrida (km)"
                    keyboardType="numeric"
                    value={distance}
                    onChangeText={setDistance}
                />

                <Text className="text-primary font-bold text-lg mb-3">Consumo do Carro</Text>
                <CustomInput
                    iconName="speedometer-outline"
                    placeholder="Consumo do seu carro (km/L)"
                    keyboardType="numeric"
                    value={consumption}
                    onChangeText={setConsumption}
                />

                <Text className="text-primary font-bold text-lg mb-3">Preço do Combustível</Text>
                <CustomInput
                    iconName="water-outline"
                    placeholder="Preço médio do combustível (R$)"
                    keyboardType="numeric"
                    value={fuelPrice}
                    onChangeText={setFuelPrice}
                />

                <Text className="text-primary font-bold text-lg mb-3">Preço por KM</Text>
                <CustomInput
                    iconName="cash-outline"
                    placeholder="Seu preço cobrado por km (R$)"
                    keyboardType="numeric"
                    value={pricePerKm}
                    onChangeText={setPricePerKm}
                />

                <View className="flex-row items-center justify-between bg-background-paper p-4 rounded-lg shadow-sm border border-surface-border mb-6 mt-2">
                    <View className="flex-row items-center">
                        <Ionicons name="swap-horizontal" size={24} color="#1A237E" />
                        <Text className="text-base font-bold text-primary ml-2">Viagem de Ida e Volta?</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#E0E0E0", true: "#FDD835" }}
                        thumbColor={isRoundTrip ? "#1A237E" : "#f4f3f4"}
                        onValueChange={setIsRoundTrip}
                        value={isRoundTrip}
                    />
                </View>

                <PrimaryButton title="Calcular Valores" onPress={handleCalculate} />

                {/* Resultados */}
                {results && (
                    <View className="mt-8 mb-6">
                        <Text className="text-xl font-bold text-primary mb-4">Resultado</Text>

                        <View className="flex-row justify-between mb-4">
                            <View className="flex-1 bg-background-paper p-4 rounded-lg shadow-sm border border-surface-border mr-2 items-center">
                                <Text className="text-surface-muted text-xs font-medium mb-1">Custo Estimado</Text>
                                <Text className="text-lg font-bold text-status-danger">R$ {results.cost}</Text>
                            </View>

                            <View className="flex-1 bg-primary p-4 rounded-lg shadow-sm ml-2 items-center">
                                <Text className="text-accent text-xs font-medium mb-1">Lucro Líquido</Text>
                                <Text className="text-xl font-bold text-white">R$ {results.profit}</Text>
                            </View>
                        </View>

                        <View className="bg-background-paper p-5 rounded-lg shadow-sm border border-dashed border-accent items-center">
                            <Text className="text-surface-muted font-medium mb-1">Preço Sugerido ao Passageiro</Text>
                            <Text className="text-3xl font-bold text-primary">R$ {results.total}</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
