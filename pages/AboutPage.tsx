import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    navigate: (screen: string) => void;
}

export default function AboutPage({ navigate }: Props) {
    return (
        <SafeAreaView className="flex-1 bg-background">

            {/* Cabeçalho */}
            <View className="flex-row items-center bg-primary pt-12 pb-6 px-4 shadow-sm rounded-b-[40px] z-10">
                <TouchableOpacity onPress={() => navigate('Login')} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-2">Sobre o App</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }} showsVerticalScrollIndicator={false}>

                {/* Ícone / Logo do App */}
                <View className="w-28 h-28 bg-primary-light rounded-full items-center justify-center mb-4 mt-8 shadow-md border-4 border-background-paper">
                    <Ionicons name="car-sport" size={56} color="#fff" />
                </View>

                <Text className="text-3xl font-black text-primary mb-1">DriverPro</Text>
                <Text className="text-surface-muted font-bold text-sm mb-8">Versão 1.0.0 (MVP)</Text>

                {/* Descrição */}
                <View className="bg-background-paper w-full p-6 rounded-3xl shadow-sm border border-surface-border mb-6">
                    <Text className="text-primary font-bold text-lg mb-2">O que é o DriverPro?</Text>
                    <Text className="text-surface-muted text-sm leading-5">
                        Um aplicativo inteligente desenvolvido para revolucionar o agendamento de corridas com motoristas particulares.
                        Ele oferece autonomia total para o motorista gerenciar sua margem de lucro e agenda, além de garantir uma experiência segura e personalizada para o passageiro.
                    </Text>
                </View>

                {/* Equipe / Desenvolvedores */}
                <View className="bg-background-paper w-full p-6 rounded-3xl shadow-sm border border-surface-border mb-6">
                    <Text className="text-primary font-bold text-lg mb-4">Equipe de Desenvolvimento:</Text>

                    {/* Edite com os seus nomes */}
                    <View className="flex-row items-center">
                        <Ionicons name="person-circle-outline" size={24} color="#1A237E" />
                        <Text className="text-surface-muted font-medium ml-2">João Pedro Alves</Text>
                    </View>

                    <View className="flex-row items-center">
                        <Ionicons name="person-circle-outline" size={24} color="#1A237E" />
                        <Text className="text-surface-muted font-medium ml-2">Laís Caneschi de Siqueira</Text>
                    </View>

                    <View className="flex-row items-center">
                        <Ionicons name="person-circle-outline" size={24} color="#1A237E" />
                        <Text className="text-surface-muted font-medium ml-2">Leonardo Henrique Trindade</Text>
                    </View>

                    <View className="flex-row items-center">
                        <Ionicons name="person-circle-outline" size={24} color="#1A237E" />
                        <Text className="text-surface-muted font-medium ml-2">Lucas Oliveira Rodrigues</Text>
                    </View>

                    <View className="flex-row items-center">
                        <Ionicons name="person-circle-outline" size={24} color="#1A237E" />
                        <Text className="text-surface-muted font-medium ml-2">Lucas Rodrigues França</Text>
                    </View>

                    <View className="flex-row items-center">
                        <Ionicons name="person-circle-outline" size={24} color="#1A237E" />
                        <Text className="text-surface-muted font-medium ml-2">Pedro Henrique Trindade</Text>
                    </View>
                </View>

                {/* Informações Acadêmicas */}
                <View className="items-center mt-4">
                    <Ionicons name="school-outline" size={32} color="#9CA3AF" />
                    <Text className="text-surface-muted font-bold text-xs mt-2 uppercase tracking-widest text-center">
                        Projeto Integrador{'\n'}5° semestre ADS - FATEC
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}