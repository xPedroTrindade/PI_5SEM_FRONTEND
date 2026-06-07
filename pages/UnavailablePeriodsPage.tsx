import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string, params?: any) => void;
}

export default function UnavailablePeriodsPage({ navigate }: Props) {
    const { driver } = useAuth();
    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [motivo, setMotivo] = useState('');

    const loadPeriods = useCallback(async () => {
        if (!driver?.driverId) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/api/unavailable-periods/driver/${driver.driverId}`);
            setPeriods(Array.isArray(data) ? data : []);
        } catch {}
        finally { setLoading(false); }
    }, [driver?.driverId]);

    useEffect(() => { loadPeriods(); }, [loadPeriods]);

    function parseDate(input: string): string | null {
        const parts = input.trim().split('/');
        if (parts.length === 2) return `${new Date().getFullYear()}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        return null;
    }

    function formatDate(isoStr: string) {
        const d = new Date(isoStr);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    async function handleAdd() {
        const inicio = parseDate(dataInicio);
        const fim = parseDate(dataFim);
        if (!inicio || !fim) {
            Alert.alert('Atenção', 'Informe as datas no formato DD/MM ou DD/MM/AAAA.');
            return;
        }
        if (inicio > fim) {
            Alert.alert('Atenção', 'A data de início deve ser anterior à data de fim.');
            return;
        }
        setSaving(true);
        try {
            await api.post('/api/unavailable-periods', {
                driverId: driver?.driverId,
                dataInicio: inicio,
                dataFim: fim,
                ...(motivo.trim() && { motivo: motivo.trim() }),
            });
            setDataInicio('');
            setDataFim('');
            setMotivo('');
            loadPeriods();
        } catch (err: any) {
            Alert.alert('Erro', err.response?.data?.error ?? 'Não foi possível salvar.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(periodId: string) {
        try {
            await api.delete(`/api/unavailable-periods/${periodId}`);
            loadPeriods();
        } catch (err: any) {
            Alert.alert('Erro', err.response?.data?.error ?? 'Não foi possível remover.');
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px]">
                <TouchableOpacity onPress={() => navigate('DriverSettings')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Períodos Indisponíveis</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

                {/* Formulário para adicionar */}
                <View className="bg-background-paper p-5 rounded-2xl shadow-sm border border-surface-border mb-6">
                    <Text className="text-primary font-bold text-base mb-4">Bloquear Novo Período</Text>

                    <View className="flex-row justify-between">
                        <View className="flex-1 mr-2">
                            <Text className="text-surface-muted text-xs font-bold uppercase mb-1">Início</Text>
                            <CustomInput iconName="calendar-outline" placeholder="DD/MM" value={dataInicio} onChangeText={setDataInicio} />
                        </View>
                        <View className="flex-1 ml-2">
                            <Text className="text-surface-muted text-xs font-bold uppercase mb-1">Fim</Text>
                            <CustomInput iconName="calendar-outline" placeholder="DD/MM" value={dataFim} onChangeText={setDataFim} />
                        </View>
                    </View>

                    <CustomInput iconName="chatbubble-outline" placeholder="Motivo (opcional)" value={motivo} onChangeText={setMotivo} />

                    <View className="mt-2">
                        {saving
                            ? <ActivityIndicator size="small" color="#1A237E" />
                            : <PrimaryButton title="Adicionar Período" onPress={handleAdd} />}
                    </View>
                </View>

                {/* Lista de períodos */}
                <Text className="text-surface-muted font-bold mb-3 uppercase tracking-wider text-xs">Períodos Bloqueados</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 20 }} />
                ) : periods.length === 0 ? (
                    <View className="bg-background-paper p-5 rounded-xl border border-surface-border items-center">
                        <Ionicons name="calendar-clear-outline" size={40} color="#D1D5DB" />
                        <Text className="text-surface-muted mt-3 text-center">Nenhum período bloqueado. Adicione acima para bloquear datas na sua agenda.</Text>
                    </View>
                ) : (
                    periods.map((p) => (
                        <View key={p._id} className="flex-row items-center bg-background-paper p-4 rounded-xl border border-surface-border mb-3">
                            <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-3">
                                <Ionicons name="ban-outline" size={20} color="#EF4444" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-primary font-bold">
                                    {formatDate(p.dataInicio)} → {formatDate(p.dataFim)}
                                </Text>
                                {p.motivo && <Text className="text-surface-muted text-xs mt-0.5">{p.motivo}</Text>}
                            </View>
                            <TouchableOpacity
                                onPress={() => Alert.alert('Remover', 'Deseja remover este período?', [
                                    { text: 'Cancelar', style: 'cancel' },
                                    { text: 'Remover', style: 'destructive', onPress: () => handleDelete(p._id) },
                                ])}
                                className="p-2"
                            >
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
