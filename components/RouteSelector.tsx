import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeoLocation, RouteResult, getRouteAlternatives } from '../utils/geo';
import { RouteMapView } from './RouteMapView';

interface RouteInfo {
    distanceKm: number;
    durationMin: number;
}

interface Props {
    origin: GeoLocation | null;
    destination: GeoLocation | null;
    onRouteChange: (info: RouteInfo | null) => void;
}

export function RouteSelector({ origin, destination, onRouteChange }: Props) {
    const [routes, setRoutes] = useState<RouteResult[]>([]);
    const [selected, setSelected] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!origin || !destination) {
            setRoutes([]);
            onRouteChange(null);
            return;
        }
        let active = true;
        setLoading(true);
        setError(false);
        getRouteAlternatives(origin.lat, origin.lon, destination.lat, destination.lon)
            .then((rs) => {
                if (!active) return;
                setRoutes(rs);
                setSelected(0);
                onRouteChange({ distanceKm: rs[0].distanceKm, durationMin: rs[0].durationMin });
            })
            .catch(() => {
                if (!active) return;
                setError(true);
                setRoutes([]);
                onRouteChange(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [origin, destination]);

    function pick(i: number) {
        setSelected(i);
        onRouteChange({ distanceKm: routes[i].distanceKm, durationMin: routes[i].durationMin });
    }

    if (!origin || !destination) return null;

    if (loading) {
        return (
            <View className="flex-row items-center mt-1 mb-4 ml-1">
                <ActivityIndicator size="small" color="#1A237E" />
                <Text className="text-primary text-xs font-bold ml-2">Buscando rotas...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <Text className="text-status-danger text-xs mt-1 mb-4 ml-1">
                Não foi possível calcular a rota entre esses endereços.
            </Text>
        );
    }

    if (routes.length === 0) return null;

    const sel = routes[selected];

    return (
        <View className="mt-1 mb-4">
            {/* Mapa da rota selecionada */}
            <View className="rounded-2xl overflow-hidden border border-surface-border mb-3">
                <RouteMapView
                    coordinates={sel.coordinates}
                    oLat={origin.lat}
                    oLon={origin.lon}
                    dLat={destination.lat}
                    dLon={destination.lon}
                    height={200}
                />
            </View>

            {/* Lista de rotas para escolher */}
            <Text className="text-surface-muted text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                {routes.length > 1 ? `Escolha a rota (${routes.length} opções)` : 'Rota'}
            </Text>
            {routes.map((r, i) => (
                <TouchableOpacity
                    key={i}
                    onPress={() => pick(i)}
                    className={`flex-row items-center justify-between p-3 rounded-xl border mb-2 ${i === selected ? 'bg-primary-light border-primary-dark' : 'bg-background-paper border-surface-border'}`}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center">
                        <Ionicons name={i === selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={i === selected ? '#FDD835' : '#9CA3AF'} />
                        <Text className={`ml-2 font-bold ${i === selected ? 'text-white' : 'text-primary'}`}>Rota {i + 1}</Text>
                    </View>
                    <View className="items-end">
                        <Text className={`text-sm font-bold ${i === selected ? 'text-accent' : 'text-surface-muted'}`}>
                            {r.distanceKm.toFixed(1).replace('.', ',')} km · {r.durationMin} min
                        </Text>
                        {r.tollBRL != null ? (
                            <Text className={`text-xs font-bold ${i === selected ? 'text-white' : 'text-status-danger'}`}>
                                Pedágio R$ {r.tollBRL.toFixed(2).replace('.', ',')}
                            </Text>
                        ) : (
                            <Text className={`text-xs ${i === selected ? 'text-accent' : 'text-status-success'}`}>
                                Sem pedágio
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}
