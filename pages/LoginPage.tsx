import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    navigate: (screen: any) => void;
}

export default function LoginPage({ navigate }: Props) {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!email || !senha) {
            Alert.alert('Atenção', 'Preencha email e senha.');
            return;
        }

        setLoading(true);
        try {
            await signIn(email.trim().toLowerCase(), senha);
            // AuthContext atualiza user → App.tsx redireciona automaticamente
        } catch (err: any) {
            const msg = err.response?.data?.error ?? 'Não foi possível conectar ao servidor.';
            Alert.alert('Erro ao entrar', msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 justify-center items-center px-6">

                <View className="items-center mb-10 mt-10">
                    <Ionicons name="car-sport" size={80} color="#1A237E" />
                    <Text className="text-3xl font-bold text-primary mt-2">DriverPro</Text>
                </View>

                <CustomInput
                    iconName="mail-outline"
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <CustomInput
                    iconName="lock-closed-outline"
                    placeholder="Senha"
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                />

                <TouchableOpacity
                    className="w-full items-end mb-6"
                    onPress={() => navigate('Forgot')}
                >
                    <Text className="text-primary font-medium">Esqueceu a senha?</Text>
                </TouchableOpacity>

                {loading ? (
                    <ActivityIndicator size="large" color="#1A237E" />
                ) : (
                    <PrimaryButton title="Entrar" onPress={handleLogin} />
                )}

                <TouchableOpacity
                    className="mt-auto mb-10"
                    onPress={() => navigate('Register')}
                >
                    <Text className="text-gray-600">
                        Não tem uma conta? <Text className="text-primary font-bold">Cadastre-se</Text>
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-8 mb-4 flex-row items-center justify-center opacity-70"
                    onPress={() => navigate('About')}
                >
                    <Ionicons name="information-circle-outline" size={18} color="#1A237E" />
                    <Text className="text-primary font-bold ml-1 text-sm">Sobre o Aplicativo</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
