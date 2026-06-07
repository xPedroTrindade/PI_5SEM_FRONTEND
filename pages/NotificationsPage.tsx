import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

interface Props {
    navigate: (screen: string, params?: any) => void;
}

export default function NotificationsPage({ navigate }: Props) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/notifications');
            setNotifications(Array.isArray(data) ? data : []);
        } catch {}
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadNotifications(); }, [loadNotifications]);

    const handleMarkAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
        } catch {}
    };

    const handleMarkRead = async (id: string) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, lida: true } : n));
        } catch {}
    };

    function iconForType(tipo: string) {
        if (tipo === 'nova_corrida') return 'car-outline';
        if (tipo === 'corrida_aceita') return 'checkmark-circle-outline';
        if (tipo === 'corrida_concluida') return 'trophy-outline';
        if (tipo === 'corrida_cancelada') return 'close-circle-outline';
        return 'notifications-outline';
    }

    function timeAgo(dateStr: string) {
        const date = new Date(dateStr);
        const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
        if (diffMin < 1) return 'agora';
        if (diffMin < 60) return `${diffMin}min atrás`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH}h atrás`;
        return `${Math.floor(diffH / 24)}d atrás`;
    }

    const unreadCount = notifications.filter(n => !n.lida).length;

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row items-center justify-between bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px]">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigate('DriverDashboard')} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-2">Notificações</Text>
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={handleMarkAllRead} className="p-2">
                        <Text className="text-accent text-sm font-bold">Marcar todas</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 40 }} />
                ) : notifications.length === 0 ? (
                    <View className="items-center mt-16">
                        <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
                        <Text className="text-surface-muted font-bold text-lg mt-4">Sem notificações</Text>
                        <Text className="text-surface-muted text-center mt-2">Você não tem nenhuma notificação ainda.</Text>
                    </View>
                ) : (
                    notifications.map((notif) => (
                        <TouchableOpacity
                            key={notif._id}
                            onPress={() => handleMarkRead(notif._id)}
                            className={`flex-row p-4 rounded-2xl mb-3 border ${notif.lida ? 'bg-background-paper border-surface-border' : 'bg-blue-50 border-blue-200'}`}
                        >
                            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${notif.lida ? 'bg-gray-100' : 'bg-primary'}`}>
                                <Ionicons name={iconForType(notif.tipo)} size={20} color={notif.lida ? '#9CA3AF' : '#FDD835'} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-bold ${notif.lida ? 'text-surface-muted' : 'text-primary'}`}>{notif.titulo}</Text>
                                <Text className="text-surface-muted text-sm mt-0.5">{notif.corpo}</Text>
                                <Text className="text-gray-400 text-xs mt-1">{timeAgo(notif.criadoEm)}</Text>
                            </View>
                            {!notif.lida && <View className="w-2 h-2 rounded-full bg-primary mt-2 ml-2" />}
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
