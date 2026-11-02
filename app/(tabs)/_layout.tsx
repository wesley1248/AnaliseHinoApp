import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/presentation/components/HapticTab';
import TabBarBackground from '@/presentation/components/ui/TabBarBackground';
import { TourProvider } from '@/presentation/context/TourContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <TourProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2563EB', // Blue 600
          tabBarInactiveTintColor: '#94A3B8', // Slate 400
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            backgroundColor: '#0F172A',
            borderTopColor: '#1E293B',
            height: 60 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Lançar',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'musical-notes' : 'musical-notes-outline'}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'stats-chart' : 'stats-chart-outline'}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="relatorio"
          options={{
            title: 'Relatórios',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'document-text' : 'document-text-outline'}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="importar"
          options={{
            title: 'Importar',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'cloud-upload' : 'cloud-upload-outline'}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </TourProvider>
  );
}
