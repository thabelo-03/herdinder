import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import Colors from '../constants/Colors';
import { useAnimalStore } from '../store/animalStore';

// Simple debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ assets: any[], alerts: any[], zones: any[] }>({ assets: [], alerts: [], zones: [] });
  
  const debouncedQuery = useDebounce(query, 300);

  // localhost = web, LAN IP = physical Android device
  const API_URL = Platform.OS === 'web' ? 'http://localhost:5000/api/search' : 'http://192.168.3.64:5000/api/search';

  const localAnimals = useAnimalStore((s) => s.animals);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ assets: [], alerts: [], zones: [] });
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      
      // Search local frontend state (mock data)
      const localMatches = localAnimals.filter(a => 
        a.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
        a.tagId.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        a.plateNumber?.toLowerCase().includes(debouncedQuery.toLowerCase())
      );

      try {
        const response = await fetch(`${API_URL}?q=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const data = await response.json();
          
          // Combine local frontend data with database data (avoid duplicates)
          const combinedAssets = [...localMatches];
          data.assets.forEach((dbAsset: any) => {
            if (!combinedAssets.some(a => a.tagId === dbAsset.tagId)) {
              combinedAssets.push(dbAsset);
            }
          });

          setResults({ ...data, assets: combinedAssets });
        } else {
          setResults({ assets: localMatches, alerts: [], zones: [] });
        }
      } catch (error) {
        console.error('Search API Error:', error);
        setResults({ assets: localMatches, alerts: [], zones: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, localAnimals]);

  const handleResultPress = (assetId: string) => {
    setIsFocused(false);
    setQuery('');
    router.push(`/animal/${assetId}`);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
        <FontAwesome name="search" size={16} color={Colors.textMuted} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search assets, herds, tags..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay blur so taps register
        />
        {isLoading && <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <FontAwesome name="times-circle" size={16} color={Colors.textMuted} style={styles.icon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Floating Results Modal */}
      {isFocused && query.length >= 2 && (
        <BlurView intensity={30} tint="dark" style={styles.resultsContainer}>
          {results.assets.length === 0 && !isLoading ? (
            <Text style={styles.noResults}>No assets found for "{query}"</Text>
          ) : (
            <>
              {results.assets.length > 0 && <Text style={styles.sectionTitle}>ASSETS</Text>}
                <FlatList
                  data={results.assets}
                  keyExtractor={(item) => item._id || item.id || item.tagId}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.resultItem} onPress={() => handleResultPress(item._id || item.id)}>
                    <View style={styles.resultIcon}>
                      <FontAwesome name={item.category === 'vehicle' ? 'truck' : 'paw'} size={14} color={Colors.background} />
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{item.name || item.plateNumber}</Text>
                      <Text style={styles.resultSub}>Tag: {item.tagId} • {item.herdName || 'Unassigned'}</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 999,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#0B0B13',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchBarFocused: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  loader: {
    marginLeft: 8,
  },
  resultsContainer: {
    position: 'absolute',
    top: 55,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(15, 15, 26, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxHeight: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  noResults: {
    color: Colors.textMuted,
    textAlign: 'center',
    padding: 20,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  resultSub: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
