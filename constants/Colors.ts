/**
 * HerdFinder Color System
 * Dark theme matching the dashboard mockup images
 */

const Colors = {
  // Core backgrounds
  background: '#0F0F1A',
  backgroundSecondary: '#1A1A2E',
  card: '#1E1E30',
  cardElevated: '#252540',
  
  // Brand
  primary: '#FFD700',       // HerdFinder yellow
  primaryDark: '#B8960F',
  primaryLight: '#FFE44D',
  
  // Status colors
  success: '#00C853',       // Online, normal temp
  danger: '#FF3D00',        // High temp, critical alerts
  warning: '#FF9100',       // Left zone, warnings
  info: '#2196F3',          // Info, links
  
  // Temperature color coding
  tempNormal: '#00C853',    // ≤38°C
  tempMild: '#FFD700',      // 38-39°C
  tempHigh: '#FF3D00',      // >39°C
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#9E9E9E',
  textMuted: '#666680',
  textOnPrimary: '#0F0F1A',
  
  // Borders & Dividers
  border: '#2A2A45',
  divider: '#1E1E35',
  
  // Safe Zone
  safeZoneBorder: '#FFD700',
  safeZoneFill: 'rgba(255, 215, 0, 0.12)',
  
  // Tab bar
  tabBarBackground: '#141425',
  tabBarActive: '#FFD700',
  tabBarInactive: '#666680',
  
  // Alert badges
  badgeRed: '#FF3D00',
  badgeOrange: '#FF9100',
  badgeGreen: '#00C853',
  
  // Shadows & overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  // Gradient stops
  gradientStart: '#1A1A2E',
  gradientEnd: '#0F0F1A',
  
  // Chart colors
  chartLine: '#FF3D00',
  chartGrid: '#2A2A45',
  chartLabel: '#9E9E9E',
};

export default Colors;

/**
 * Get temperature color based on value
 */
export function getTempColor(temp: number): string {
  if (temp > 39) return Colors.danger;
  if (temp > 38) return Colors.primary;
  return Colors.success;
}

/**
 * Get temperature status label
 */
export function getTempStatus(temp: number): { label: string; color: string } {
  if (temp > 39.5) return { label: 'HIGH', color: Colors.danger };
  if (temp > 39) return { label: 'ELEVATED', color: Colors.warning };
  if (temp > 38) return { label: 'WARM', color: Colors.primary };
  return { label: 'NORMAL', color: Colors.success };
}
