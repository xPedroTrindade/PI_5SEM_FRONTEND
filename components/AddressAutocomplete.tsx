import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchAddress, GeoLocation } from '../utils/geo';

interface Props {
    placeholder: string;
    iconName: keyof typeof Ionicons.glyphMap;
    initialValue?: string;
    onLocationSelect: (location: GeoLocation) => void;
    onClear?: () => void;
}

export function AddressAutocomplete({ placeholder, iconName, initialValue = '', onLocationSelect, onClear }: Props) {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setQuery(initialValue); }, [initialValue]);

    function handleChange(text: string) {
        setQuery(text);
        setConfirmed(false);
        if (debounce.current) clearTimeout(debounce.current);
        if (text.length < 3) { setSuggestions([]); return; }
        debounce.current = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await searchAddress(text);
                setSuggestions(results);
            } catch { }
            finally { setLoading(false); }
        }, 500);
    }

    function handleSelect(loc: GeoLocation) {
        Keyboard.dismiss();
        const short = loc.displayName.split(',').slice(0, 3).join(',').trim();
        setQuery(short);
        setSuggestions([]);
        setConfirmed(true);
        onLocationSelect(loc);
    }

    function handleClear() {
        setQuery('');
        setSuggestions([]);
        setConfirmed(false);
        onClear?.();
    }

    return (
        <View className="mb-2">
            {/* Input */}
            <View className={`flex-row items-center bg-white border rounded-xl px-4 py-3 ${confirmed ? 'border-status-success' : 'border-surface-border'}`}>
                <Ionicons name={iconName} size={20} color={confirmed ? '#15803D' : '#1A237E'} />
                <TextInput
                    className="flex-1 ml-3 text-primary text-sm"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={handleChange}
                    returnKeyType="search"
                />
                {loading
                    ? <ActivityIndicator size="small" color="#1A237E" />
                    : confirmed
                        ? <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                        : query.length > 0
                            ? <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                              </TouchableOpacity>
                            : null
                }
            </View>

            {/* Sugestões inline */}
            {suggestions.length > 0 && (
                <View className="bg-white border border-surface-border rounded-xl mt-1 overflow-hidden">
                    {suggestions.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => handleSelect(item)}
                            className={`px-4 py-3 flex-row items-start ${i < suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="location-outline" size={16} color="#9CA3AF" style={{ marginTop: 2, marginRight: 8, flexShrink: 0 }} />
                            <Text className="text-primary text-sm flex-1" numberOfLines={2}>{item.displayName}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}
