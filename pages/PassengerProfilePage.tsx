import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '../components/Avatar';
import { SettingsMenuItem } from '../components/SettingsMenuItem';
import { PassengerBottomNav } from '../components/PassengerBottomNav';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string) => void;
}

export default function PassengerProfilePage({ navigate }: Props) {
    const { user, signOut, updateUser } = useAuth();
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    async function handleAvatarUpload() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Permita o acesso à galeria para alterar sua foto.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (result.canceled || !result.assets[0]) return;
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('avatar', { uri: asset.uri, name: 'avatar.jpg', type: asset.mimeType ?? 'image/jpeg' } as any);
        setUploadingAvatar(true);
        try {
            const { data } = await api.post(`/api/users/${user?._id}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await updateUser({ avatarUrl: data.avatarUrl });
        } catch {
            Alert.alert('Erro', 'Não foi possível atualizar a foto.');
        } finally {
            setUploadingAvatar(false);
        }
    }

    const handleLogout = () => {
        Alert.alert(
            "Sair da Conta",
            "Tem certeza que deseja desconectar do aplicativo?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", style: "destructive", onPress: async () => { await signOut(); navigate('Login'); } }
            ]
        );
    };

    const handleFeatureInDev = (feature: string) => {
        Alert.alert(
            "Funcionalidade em Desenvolvimento",
            `A área de "${feature}" estará disponível na próxima versão do aplicativo!`
        );
    };

    const avatarUri = user?.avatarUrl ? `${api.defaults.baseURL}${user.avatarUrl}` : undefined;

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho */}
            <View className="bg-primary pt-10 pb-8 px-4 rounded-b-[40px] shadow-sm relative">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigate('PassengerDashboard')} className="p-2 mr-1">
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold">Meu Perfil</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Foto */}
                <View className="items-center mt-5 mb-8">
                    <View className="relative shadow-md">
                        <Avatar size="xl" imageUrl={avatarUri} />

                        <TouchableOpacity
                            className="absolute bottom-0 right-0 bg-accent w-10 h-10 rounded-full items-center justify-center border-4 border-background-paper shadow-sm"
                            onPress={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            activeOpacity={0.8}
                        >
                            {uploadingAvatar
                                ? <ActivityIndicator size="small" color="#1A237E" />
                                : <Ionicons name="camera" size={18} color="#1A237E" />}
                        </TouchableOpacity>
                    </View>

                    <Text className="text-2xl font-bold text-primary mt-3">{user?.nome ?? ''}</Text>

                    <View className="bg-blue-50 px-3 py-1 rounded-full mt-1 flex-row items-center border border-blue-100">
                        <Ionicons name="star" size={14} color="#1D4ED8" />
                        <Text className="text-blue-700 text-xs font-bold ml-1">Passageiro(a) Frequente</Text>
                    </View>
                </View>

                {/* Informações da Conta */}
                <Text className="text-surface-muted font-bold text-xs uppercase tracking-wider mb-2 ml-1">Configurações da Conta</Text>
                <View className="bg-background-paper rounded-3xl shadow-sm border border-surface-border overflow-hidden mb-6">
                    <SettingsMenuItem
                        iconName="person-outline"
                        title="Meus Dados"
                        subtitle={user?.email ?? ''}
                        onPress={() => handleFeatureInDev('Editar Meus Dados')}
                    />
                    <SettingsMenuItem
                        iconName="card-outline"
                        title="Formas de Pagamento"
                        subtitle="Cartão final 1234"
                        onPress={() => handleFeatureInDev('Formas de Pagamento')}
                    />
                    <SettingsMenuItem
                        iconName="location-outline"
                        title="Endereços Favoritos"
                        subtitle="Casa, Trabalho"
                        onPress={() => handleFeatureInDev('Endereços Favoritos')}
                    />
                </View>

                {/* Preferências e Suporte */}
                <Text className="text-surface-muted font-bold text-xs uppercase tracking-wider mb-2 ml-1">Preferências & Suporte</Text>
                <View className="bg-background-paper rounded-3xl shadow-sm border border-surface-border overflow-hidden mb-6">
                    <SettingsMenuItem
                        iconName="notifications-outline"
                        title="Notificações"
                        onPress={() => handleFeatureInDev('Notificações')}
                    />
                    <SettingsMenuItem
                        iconName="help-circle-outline"
                        title="Central de Ajuda"
                        onPress={() => handleFeatureInDev('Central de Ajuda')}
                    />
                    <SettingsMenuItem
                        iconName="document-text-outline"
                        title="Termos de Uso"
                        onPress={() => handleFeatureInDev('Termos de Uso')}
                    />
                </View>

                {/* Botão de Sair */}
                <TouchableOpacity
                    className="flex-row items-center justify-center p-4 bg-red-50 rounded-2xl border border-red-100 mt-2"
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    <Text className="text-status-danger font-bold text-lg ml-2">Sair da Conta</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Bottom Navigation */}
            <View className="absolute bottom-0 left-0 right-0">
                <PassengerBottomNav currentScreen="PassengerProfile" navigate={navigate} />
            </View>

        </SafeAreaView>
    );
}
