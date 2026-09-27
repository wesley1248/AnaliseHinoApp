import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/presentation/components/HapticTab';
import TabBarBackground from '@/presentation/components/ui/TabBarBackground';
import { Colors } from '@/core/constants/Colors';
import { useColorScheme } from '@/presentation/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB', // Blue 600
        tabBarInactiveTintColor: '#94A3B8', // Slate 400
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {
            backgroundColor: colorScheme === 'dark' ? '#0F172A' : '#FFFFFF',
            borderTopColor: colorScheme === 'dark' ? '#1E293B' : '#E2E8F0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }),
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
  );
}
