import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { SegmentedControl } from '../components/SegmentedControl';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    navigate: (screen: any) => void;
}

export default function RegisterPage({ navigate }: Props) {
    const { signUp } = useAuth();
    const [profileType, setProfileType] = useState<'driver' | 'passenger'>('passenger');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [telefone, setTelefone] = useState('');
    const [precoKm, setPrecoKm] = useState('');
    const [loading, setLoading] = useState(false);

    function handleTipoChange(val: string) {
        setProfileType(val === 'Motorista' ? 'driver' : 'passenger');
        if (val !== 'Motorista') setPrecoKm(''); // 2.5 — limpa preço ao trocar pra passageiro
    }

    async function handleCadastrar() {
        if (!nome || !email || !senha || !telefone) {
            Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
            return;
        }
        if (profileType === 'driver' && !precoKm) {
            Alert.alert('Atenção', 'Informe o preço por km.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nome: nome.trim(),
                email: email.trim().toLowerCase(),
                senha,
                telefone: telefone.trim(),
                tipo: profileType === 'driver' ? 'motorista' : 'passageiro',
                precoKm: profileType === 'driver' ? parseFloat(precoKm.replace(',', '.')) : undefined,
            };
            console.log('[Register] enviando payload:', JSON.stringify(payload));
            await signUp(payload);
        } catch (err: any) {
            console.log('[Register] erro:', err?.message, '| code:', err?.code, '| status:', err?.response?.status, '| data:', JSON.stringify(err?.response?.data));
            const msg = err.response?.data?.error ?? `Erro: ${err?.message ?? 'sem conexão'}`;
            Alert.alert('Erro no cadastro', msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>

                <Text className="text-3xl font-bold text-primary mb-8 text-center mt-10">Criar Conta</Text>

                <View className="items-center mb-6">
                    <TouchableOpacity className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center border-2 border-dashed border-gray-400">
                        <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <CustomInput iconName="person-outline" placeholder="Nome Completo" value={nome} onChangeText={setNome} />
                <CustomInput iconName="mail-outline" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                <CustomInput iconName="lock-closed-outline" placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
                <CustomInput iconName="call-outline" placeholder="Telefone" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />

                <View className="mt-4 mb-4">
                    <Text className="text-primary font-medium mb-2">Eu sou um:</Text>
                    <SegmentedControl
                        options={['Motorista', 'Passageiro']}
                        selectedValue={profileType === 'driver' ? 'Motorista' : 'Passageiro'}
                        onValueChange={handleTipoChange}
                    />
                </View>

                {/* 2.5 — Campo só aparece para motoristas */}
                {profileType === 'driver' && (
                    <View className="mb-6">
                        <CustomInput
                            iconName="cash-outline"
                            placeholder="Preço cobrado por km (R$)"
                            keyboardType="decimal-pad"
                            value={precoKm}
                            onChangeText={setPrecoKm}
                        />
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#1A237E" style={{ marginVertical: 16 }} />
                ) : (
                    <PrimaryButton title="Cadastrar" onPress={handleCadastrar} />
                )}

                <TouchableOpacity
                    className="mt-8 mb-10 items-center"
                    onPress={() => navigate('Login')}
                >
                    <Text className="text-gray-600">
                        Já tem uma conta? <Text className="text-primary font-bold">Faça Login</Text>
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
