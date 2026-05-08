/**
 * TempChart - 24h Temperature History Line Chart
 * Matches the chart at the bottom of the animal detail card in the mockup
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import Colors from '../constants/Colors';
import { TempReading } from '../types';

interface Props {
  data: TempReading[];
  height?: number;
}

const CHART_PADDING = { top: 20, right: 15, bottom: 25, left: 35 };

export default function TempChart({ data, height = 140 }: Props) {
  const width = Dimensions.get('window').width - 40;
  const chartWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const chartHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;

  if (!data || data.length === 0) return null;

  const temps = data.map((d) => d.temperature);
  const minTemp = Math.floor(Math.min(...temps) - 0.5);
  const maxTemp = Math.ceil(Math.max(...temps) + 0.5);
  const tempRange = maxTemp - minTemp || 1;

  const getX = (i: number) =>
    CHART_PADDING.left + (i / (data.length - 1)) * chartWidth;
  const getY = (temp: number) =>
    CHART_PADDING.top + chartHeight - ((temp - minTemp) / tempRange) * chartHeight;

  // Build path
  const pathPoints = data.map((d, i) => `${getX(i)},${getY(d.temperature)}`);
  const pathD = `M${pathPoints.join(' L')}`;

  // Y-axis labels (temperature)
  const yLabels = [];
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const temp = minTemp + (tempRange * i) / ySteps;
    yLabels.push({ value: Math.round(temp * 10) / 10, y: getY(temp) });
  }

  // X-axis labels (time)
  const xLabels = ['12AM', '6AM', '12PM', '6PM', '12AM'];
  const lastTemp = data[data.length - 1];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TEMPERATURE HISTORY (Last 24 Hours)</Text>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {yLabels.map((label, i) => (
          <React.Fragment key={`grid-${i}`}>
            <Line
              x1={CHART_PADDING.left}
              y1={label.y}
              x2={width - CHART_PADDING.right}
              y2={label.y}
              stroke={Colors.chartGrid}
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
            <SvgText
              x={CHART_PADDING.left - 5}
              y={label.y + 4}
              textAnchor="end"
              fill={Colors.chartLabel}
              fontSize={9}
            >
              {label.value}°C
            </SvgText>
          </React.Fragment>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, i) => (
          <SvgText
            key={`x-${i}`}
            x={CHART_PADDING.left + (i / (xLabels.length - 1)) * chartWidth}
            y={height - 5}
            textAnchor="middle"
            fill={Colors.chartLabel}
            fontSize={9}
          >
            {label}
          </SvgText>
        ))}

        {/* Temperature line */}
        <Path
          d={pathD}
          fill="none"
          stroke={Colors.chartLine}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current temp dot + label */}
        {lastTemp && (
          <>
            <Circle
              cx={getX(data.length - 1)}
              cy={getY(lastTemp.temperature)}
              r={4}
              fill={Colors.chartLine}
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
            <SvgText
              x={getX(data.length - 1) - 5}
              y={getY(lastTemp.temperature) - 10}
              textAnchor="end"
              fill={Colors.chartLine}
              fontSize={11}
              fontWeight="bold"
            >
              {lastTemp.temperature}°C
            </SvgText>
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
});
