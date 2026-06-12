import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    visible: boolean;
    value: Date | null;
    onSelect: (date: Date) => void;
    onClose: () => void;
    minDate?: Date;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DatePickerModal({ visible, value, onSelect, onClose, minDate }: Props) {
    const today = startOfDay(new Date());
    const [viewDate, setViewDate] = useState(() => {
        const base = value ?? today;
        return new Date(base.getFullYear(), base.getMonth(), 1);
    });

    // Ao reabrir, mostra o mês da data selecionada (ou o mês atual)
    useEffect(() => {
        if (visible) {
            const base = value ?? today;
            setViewDate(new Date(base.getFullYear(), base.getMonth(), 1));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const min = minDate ? startOfDay(minDate) : null;

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}
            >
                <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width: '100%', maxWidth: 360 }} className="bg-background-paper rounded-3xl p-5 shadow-lg">

                    {/* Cabeçalho: mês/ano + navegação */}
                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity onPress={() => setViewDate(new Date(year, month - 1, 1))} className="p-2">
                            <Ionicons name="chevron-back" size={22} color="#1A237E" />
                        </TouchableOpacity>
                        <Text className="text-primary font-bold text-base">{MONTHS[month]} {year}</Text>
                        <TouchableOpacity onPress={() => setViewDate(new Date(year, month + 1, 1))} className="p-2">
                            <Ionicons name="chevron-forward" size={22} color="#1A237E" />
                        </TouchableOpacity>
                    </View>

                    {/* Dias da semana */}
                    <View className="flex-row mb-1">
                        {WEEKDAYS.map((w, i) => (
                            <View key={i} style={{ width: `${100 / 7}%` }} className="items-center">
                                <Text className="text-surface-muted text-[11px] font-bold">{w}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Grade de dias */}
                    <View className="flex-row flex-wrap">
                        {cells.map((cell, idx) => {
                            const disabled = !!(cell && min && cell < min);
                            const selected = !!(cell && value && isSameDay(cell, value));
                            const todayCell = !!(cell && isSameDay(cell, today));
                            return (
                                <View key={idx} style={{ width: `${100 / 7}%`, height: 44 }} className="items-center justify-center">
                                    {cell && (
                                        <TouchableOpacity
                                            disabled={disabled}
                                            onPress={() => { onSelect(cell); onClose(); }}
                                            className="w-9 h-9 rounded-full items-center justify-center"
                                            style={selected ? { backgroundColor: '#1A237E' } : todayCell ? { borderWidth: 1, borderColor: '#1A237E' } : undefined}
                                        >
                                            <Text style={{ fontSize: 14, color: disabled ? '#D1D5DB' : selected ? '#FFFFFF' : '#1A237E', fontWeight: selected ? '700' : '400' }}>
                                                {cell.getDate()}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    {/* Rodapé */}
                    <View className="flex-row justify-end mt-3">
                        <TouchableOpacity onPress={onClose} className="px-4 py-2">
                            <Text className="text-surface-muted font-bold">Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
