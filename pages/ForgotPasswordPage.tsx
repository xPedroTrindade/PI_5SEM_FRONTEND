import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

interface Props {
    navigate: (screen: any) => void;
}

export default function ForgotPasswordPage({ navigate }: Props) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleEnviar() {
        if (!email) {
            Alert.alert('Atenção', 'Informe seu email.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
            Alert.alert('Email enviado', 'Verifique sua caixa de entrada para redefinir a senha.', [
                { text: 'OK', onPress: () => navigate('Login') },
            ]);
        } catch (err: any) {
            const msg = err.response?.data?.error ?? 'Não foi possível enviar o email.';
            Alert.alert('Erro', msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 px-6 justify-center">

                <Text className="text-3xl font-bold text-primary mb-2 text-center mt-10">Recuperar Senha</Text>
                <Text className="text-gray-600 text-center mb-8 px-4">
                    Digite seu endereço de e-mail para receber um link de redefinição de senha.
                </Text>

                <CustomInput
                    iconName="mail-outline"
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#1A237E" />
                ) : (
                    <PrimaryButton title="Enviar Link" onPress={handleEnviar} />
                )}

                <TouchableOpacity
                    className="w-full items-center mt-6 flex-row justify-center"
                    onPress={() => navigate('Login')}
                >
                    <Ionicons name="arrow-back" size={16} color="#1A237E" />
                    <Text className="text-primary font-bold ml-2">Voltar para o Login</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}
