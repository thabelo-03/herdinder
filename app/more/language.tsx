import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '../../constants/Colors';

const LANGUAGES = [
  { id: 'en', name: 'English', sub: 'English' },
  { id: 'nd', name: 'isiNdebele', sub: 'Ndebele' },
  { id: 'sn', name: 'chiShona', sub: 'Shona' },
  { id: 'af', name: 'Afrikaans', sub: 'Afrikaans' },
];

export default function LanguageScreen() {
  const [selected, setSelected] = useState('en');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {LANGUAGES.map((lang, index) => {
            const isSelected = selected === lang.id;
            return (
              <React.Fragment key={lang.id}>
                <TouchableOpacity style={styles.row} onPress={() => setSelected(lang.id)}>
                  <View>
                    <Text style={[styles.langName, isSelected && { color: Colors.primary }]}>{lang.name}</Text>
                    <Text style={styles.langSub}>{lang.sub}</Text>
                  </View>
                  {isSelected && <FontAwesome name="check" size={20} color={Colors.primary} />}
                </TouchableOpacity>
                {index < LANGUAGES.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  langName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  langSub: { color: Colors.textSecondary, fontSize: 13 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 16 },
});
