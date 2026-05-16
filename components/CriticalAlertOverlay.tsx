import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { useAlertStore } from '../store/alertStore';

/**
 * CriticalAlertOverlay - A floating notification that slides in from the top
 * whenever a critical alert is triggered and unread.
 */
export default function CriticalAlertOverlay() {
    const router = useRouter();
    const alerts = useAlertStore((s) => s.alerts);
    const markAsRead = useAlertStore((s) => s.markAsRead);

    // Get the most recent unread critical alert
    const latestCritical = alerts
        .filter(a => !a.read && a.severity === 'critical')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const slideAnim = useRef(new Animated.Value(-150)).current;

    useEffect(() => {
        if (latestCritical) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 40,
                friction: 8,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -150,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [latestCritical, slideAnim]);

    if (!latestCritical) return null;

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="exclamation-triangle" size={18} color="#FFF" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>CRITICAL ALERT</Text>
                    <Text style={styles.message}>{latestCritical.message}</Text>
                </View>
                <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => {
                        markAsRead(latestCritical._id || latestCritical.id);
                        router.push(`/animal/${latestCritical.animalId}`);
                    }}
                >
                    <Text style={styles.viewBtnText}>VIEW</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={() => markAsRead(latestCritical._id || latestCritical.id)}>
                    <FontAwesome name="times" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Positioned below the main header
        left: 15,
        right: 15,
        zIndex: 9999,
        elevation: 10,
    },
    content: {
        backgroundColor: Colors.cardElevated,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.danger,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    iconContainer: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    textContainer: { flex: 1 },
    title: { color: Colors.danger, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
    message: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700', lineHeight: 18 },
    viewBtn: {
        backgroundColor: 'rgba(255,215,0,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    viewBtnText: { color: Colors.primary, fontSize: 11, fontWeight: 'bold' },
    closeBtn: { padding: 6 },
});