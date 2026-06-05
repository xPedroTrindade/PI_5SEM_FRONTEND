import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SettingsMenuItem } from '../components/SettingsMenuItem';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Props {
    navigate: (screen: string) => void;
}

export default function DriverSettingsPage({ navigate }: Props) {
    const { user, driver, signOut, updateUser } = useAuth();
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

    async function handleSignOut() {
        await signOut();
        navigate('Login');
    }

    const priceLabel = driver?.precoKm != null
        ? `Atualmente: R$ ${driver.precoKm.toFixed(2).replace('.', ',')}/km`
        : 'Configurar valor por km';

    const avatarUri = user?.avatarUrl ? `${api.defaults.baseURL}${user.avatarUrl}` : undefined;

    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Fundo Azul Superior */}
            <View className="bg-primary pt-12 pb-16 px-4 rounded-b-[40px] shadow-sm relative">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => navigate('DriverDashboard')} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Perfil</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            {/* Foto de Perfil */}
            <View className="items-center -mt-12 mb-6">
                <View className="relative">
                    <Avatar size="xl" imageUrl={avatarUri} />
                    <TouchableOpacity
                        className="absolute bottom-0 right-0 bg-accent w-8 h-8 rounded-full items-center justify-center border-2 border-background-paper shadow-sm"
                        onPress={handleAvatarUpload}
                        disabled={uploadingAvatar}
                    >
                        {uploadingAvatar
                            ? <ActivityIndicator size="small" color="#1A237E" />
                            : <Ionicons name="camera" size={16} color="#1A237E" />}
                    </TouchableOpacity>
                </View>
                <Text className="text-2xl font-bold text-primary mt-3">{user?.nome ?? ''}</Text>
                <View className="bg-status-success/20 px-3 py-1 rounded-full mt-1 flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                    <Text className="text-green-700 text-xs font-bold ml-1">Conta Verificada</Text>
                </View>
            </View>

            {/* Menu de Configurações */}
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                <Text className="text-surface-muted font-bold mb-3 uppercase tracking-wider text-xs">Conta e Veículo</Text>

                <SettingsMenuItem
                    iconName="person-outline"
                    title="Meus Dados"
                    subtitle={user?.email ?? ''}
                    onPress={() => navigate('EditProfile')}
                />

                <SettingsMenuItem
                    iconName="car-sport-outline"
                    title="Dados do Veículo"
                    subtitle="Ver e editar veículo"
                    onPress={() => navigate('CarRegistration')}
                />

                <SettingsMenuItem
                    iconName="cash-outline"
                    title="Preço por KM"
                    subtitle={priceLabel}
                    onPress={() => navigate('EditPrice')}
                />

                <Text className="text-surface-muted font-bold mb-3 mt-4 uppercase tracking-wider text-xs">Preferências</Text>

                <SettingsMenuItem
                    iconName="calendar-outline"
                    title="Períodos Indisponíveis"
                    subtitle="Bloqueie datas na sua agenda"
                    onPress={() => navigate('UnavailablePeriods')}
                />

                <SettingsMenuItem
                    iconName="notifications-outline"
                    title="Notificações"
                    subtitle="Sons e vibração"
                    onPress={() => console.log('Configurar Notificações')}
                />

                <SettingsMenuItem
                    iconName="information-circle-outline"
                    title="Sobre o Sistema"
                    subtitle="Versão 1.0.0"
                    onPress={() => console.log('Sobre o App')}
                />

                <View className="mt-6">
                    <SettingsMenuItem
                        iconName="log-out-outline"
                        title="Sair da Conta"
                        isDestructive={true}
                        onPress={handleSignOut}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
