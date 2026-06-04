import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

interface User {
  _id: string;
  nome: string;
  email: string;
  tipo: 'motorista' | 'passageiro';
  avatarUrl?: string;
}

interface DriverInfo {
  driverId: string;
  precoKm: number;
  disponivel: boolean;
}

interface AuthContextData {
  user: User | null;
  driver: DriverInfo | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshDriver: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

interface SignUpData {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  tipo: 'motorista' | 'passageiro';
  precoKm?: number;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredSession() {
      try {
        const [[, token], [, storedUser], [, storedDriver]] = await AsyncStorage.multiGet([
          '@driverpro:token',
          '@driverpro:user',
          '@driverpro:driver',
        ]);
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          if (storedDriver) setDriver(JSON.parse(storedDriver));
        }
      } finally {
        setLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  async function persistSession(data: any) {
    const items: [string, string][] = [
      ['@driverpro:token', data.token],
      ['@driverpro:user', JSON.stringify(data.user)],
    ];
    if (data.driver) items.push(['@driverpro:driver', JSON.stringify(data.driver)]);
    await AsyncStorage.multiSet(items);
    setUser(data.user);
    setDriver(data.driver ?? null);
  }

  async function signIn(email: string, senha: string) {
    const { data } = await api.post('/auth/login', { email, senha });
    await persistSession(data);
  }

  async function signUp(payload: SignUpData) {
    const { data } = await api.post('/auth/register', payload);
    await persistSession(data);
  }

  async function signOut() {
    await AsyncStorage.multiRemove(['@driverpro:token', '@driverpro:user', '@driverpro:driver']);
    setUser(null);
    setDriver(null);
  }

  async function updateUser(updates: Partial<User>) {
    if (!user) return;
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem('@driverpro:user', JSON.stringify(updated));
    setUser(updated);
  }

  async function refreshDriver() {
    if (!driver?.driverId) return;
    try {
      const { data } = await api.get(`/api/drivers/${driver.driverId}`);
      const updated: DriverInfo = { driverId: driver.driverId, precoKm: data.precoKm, disponivel: data.disponivel };
      await AsyncStorage.setItem('@driverpro:driver', JSON.stringify(updated));
      setDriver(updated);
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, driver, loading, signIn, signUp, signOut, refreshDriver, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
