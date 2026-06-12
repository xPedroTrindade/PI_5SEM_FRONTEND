import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Option {
    label: string;
    value: string;
}

interface Props {
    iconName?: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    value: string | null;
    options: Option[];
    onSelect: (value: string) => void;
    footerLabel?: string;       // ex.: "Cadastrar novo passageiro"
    onFooterPress?: () => void;
    emptyLabel?: string;
}

export function Dropdown({ iconName, placeholder, value, options, onSelect, footerLabel, onFooterPress, emptyLabel }: Props) {
    const [open, setOpen] = useState(false);
    const selected = options.find(o => o.value === value);

    return (
        <View>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                className="flex-row items-center bg-white w-full p-4 rounded-lg shadow-sm mb-4 border border-surface-border"
                activeOpacity={0.7}
            >
                {iconName && <Ionicons name={iconName} size={20} color="#1A237E" />}
                <Text className={`flex-1 text-base ${iconName ? 'ml-3' : ''} ${selected ? 'text-primary' : 'text-surface-muted'}`} numberOfLines={1}>
                    {selected ? selected.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setOpen(false)}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}
                >
                    <TouchableOpacity activeOpacity={1} onPress={() => {}} className="bg-background-paper rounded-3xl p-2" style={{ maxHeight: 400 }}>
                        <ScrollView>
                            {options.length === 0 ? (
                                <Text className="text-surface-muted text-center p-6">{emptyLabel ?? 'Nenhuma opção disponível.'}</Text>
                            ) : options.map(o => (
                                <TouchableOpacity
                                    key={o.value}
                                    onPress={() => { onSelect(o.value); setOpen(false); }}
                                    className={`flex-row items-center justify-between p-4 rounded-xl ${o.value === value ? 'bg-primary-light' : ''}`}
                                    activeOpacity={0.7}
                                >
                                    <Text className={`text-base flex-1 ${o.value === value ? 'text-white font-bold' : 'text-primary'}`} numberOfLines={1}>{o.label}</Text>
                                    {o.value === value && <Ionicons name="checkmark-circle" size={20} color="#FDD835" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        {footerLabel && onFooterPress && (
                            <TouchableOpacity
                                onPress={() => { setOpen(false); onFooterPress(); }}
                                className="flex-row items-center justify-center p-4 border-t border-surface-border mt-1"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="add-circle-outline" size={20} color="#1A237E" />
                                <Text className="text-primary font-bold ml-2">{footerLabel}</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
