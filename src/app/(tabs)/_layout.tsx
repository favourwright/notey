import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: '#ffffff80',
      tabBarLabelStyle: { fontSize: 12 },
      headerTitleAlign: 'center',
      // tabBarShowLabel: false,
      tabBarStyle: {
        paddingTop: 8,
        backgroundColor:'#031931',
        height: Platform.OS === 'ios' ? 90 : 60,
      },
      tabBarLabel: (props) =>
      <View style={{
        paddingVertical:1,
        paddingHorizontal:6,
        backgroundColor:'#F2A81160',
        borderRadius:10,
      }}>
        <Text {...props} style={{color: props.color}}>
          {props.children}
        </Text>
      </View>
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'All notes',
          tabBarIcon: ({ color }) => <MaterialIcons name="space-dashboard" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
