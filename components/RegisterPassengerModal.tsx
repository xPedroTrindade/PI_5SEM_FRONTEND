import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CustomInput } from './CustomInput';
import { PrimaryButton } from './PrimaryButton';
import api from '../config/api';

export interface NewPassenger {
    _id: string;
    nome: string;
    email: string;
    telefone: string;
}

interface Props {
    visible: boolean;
    driverId?: string;
    onClose: () => void;
    onCreated: (passenger: NewPassenger) => void;
}

export function RegisterPassengerModal({ visible, driverId, onClose, onCreated }: Props) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    function reset() {
        setNome(''); setEmail(''); setTelefone(''); setSenha('');
    }

    async function handleSave() {
        if (!nome.trim() || !email.trim() || !telefone.trim() || !senha.trim()) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }
        if (senha.length < 6) {
            Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (!driverId) return;
        setLoading(true);
        try {
            const { data } = await api.post(`/api/drivers/${driverId}/passengers`, {
                nome: nome.trim(),
                email: email.trim().toLowerCase(),
                telefone: telefone.trim(),
                senha,
            });
            reset();
            onCreated(data);
            Alert.alert('Passageiro cadastrado', `${data.nome} já pode entrar no app com este email e senha.`);
        } catch (err: any) {
            Alert.alert('Erro', err.response?.data?.error ?? 'Não foi possível cadastrar.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
                <View className="bg-background-paper rounded-3xl p-6">
                    <Text className="text-primary font-bold text-lg mb-1">Cadastrar Passageiro</Text>
                    <Text className="text-surface-muted text-xs mb-4">
                        Cria uma conta real — o passageiro poderá logar no app com este email e senha.
                    </Text>

                    <CustomInput iconName="person-outline" placeholder="Nome completo" value={nome} onChangeText={setNome} />
                    <CustomInput iconName="mail-outline" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                    <CustomInput iconName="call-outline" placeholder="Telefone" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />
                    <CustomInput iconName="lock-closed-outline" placeholder="Senha (mín. 6 caracteres)" secureTextEntry value={senha} onChangeText={setSenha} />

                    {loading
                        ? <ActivityIndicator size="large" color="#1A237E" />
                        : <PrimaryButton title="Cadastrar" onPress={handleSave} />}

                    <TouchableOpacity className="mt-3 items-center p-2" onPress={onClose}>
                        <Text className="text-surface-muted font-bold">Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
