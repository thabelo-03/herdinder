import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../constants/Colors';

interface Props {
  color?: string;
  size?: number;
  style?: ViewStyle;
}

export default function BreathingDot({ color = Colors.success, size = 8, style }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 2.5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ])
    ).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Animated Pulse Ring */}
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      {/* Core Dot */}
      <View style={[styles.dot, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
  },
  pulse: {
    position: 'absolute',
  },
});
