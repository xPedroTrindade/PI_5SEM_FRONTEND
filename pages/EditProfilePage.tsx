import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string) => void;
}

export default function EditProfilePage({ navigate }: Props) {
    const { user } = useAuth();
    const [name, setName] = useState(user?.nome ?? '');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        if (!name.trim()) { Alert.alert('Atenção', 'O nome não pode ficar vazio.'); return; }
        setLoading(true);
        try {
            await api.put(`/api/users/${user?._id}`, {
                nome: name.trim(),
                ...(phone.trim() && { telefone: phone.trim() }),
            });
            Alert.alert('Sucesso', 'Dados atualizados!', [{ text: 'OK', onPress: () => navigate('DriverSettings') }]);
        } catch (err: any) {
            Alert.alert('Erro', err.response?.data?.error ?? 'Não foi possível salvar.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px]">
                <TouchableOpacity onPress={() => navigate('DriverSettings')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Meus Dados</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text className="text-surface-muted mb-6">Mantenha seus dados de contato atualizados para que os passageiros possam te identificar.</Text>

                <Text className="text-primary font-bold mb-2 ml-1">Nome Completo</Text>
                <CustomInput iconName="person-outline" value={name} onChangeText={setName} placeholder="Seu nome" />

                <Text className="text-primary font-bold mb-2 ml-1 mt-4">E-mail</Text>
                <CustomInput iconName="mail-outline" value={user?.email ?? ''} editable={false} placeholder="Seu e-mail" />

                <Text className="text-primary font-bold mb-2 ml-1 mt-4">Telefone / WhatsApp</Text>
                <CustomInput iconName="call-outline" value={phone} onChangeText={setPhone} placeholder="Seu telefone" keyboardType="phone-pad" />

                <View className="mt-8">
                    {loading
                        ? <ActivityIndicator size="large" color="#1A237E" />
                        : <PrimaryButton title="Salvar Alterações" onPress={handleSave} />}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}