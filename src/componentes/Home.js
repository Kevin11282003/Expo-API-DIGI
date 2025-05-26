import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function Listar() {
  const [todos, setTodos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarTodos = async () => {
      setCargando(true);
      try {
        let ids = [];
        for (let page = 0; page < 292; page++) {
          const res = await fetch(`https://digi-api.com/api/v1/digimon?page=${page}`);
          const json = await res.json();
          ids = ids.concat(json.content.map(d => d.id));
        }

        const peticiones = ids.map(id =>
          fetch(`https://digi-api.com/api/v1/digimon/${id}`)
            .then(res => res.json())
            .catch(() => null)
        );

        const resultados = await Promise.all(peticiones);
        const datosCompletos = resultados.filter(d => d !== null && d.name);

        setTodos(datosCompletos);
      } catch (e) {
        console.error("Error cargando Digimon:", e);
      } finally {
        setCargando(false);
      }
    };

    cargarTodos();
  }, []);

  const resultadosFiltrados = useMemo(() => {
    let resultados = todos;

    if (busqueda.length >= 3 && isNaN(busqueda)) {
      resultados = resultados.filter(d =>
        d.name.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (!isNaN(busqueda)) {
      resultados = resultados.filter(d =>
        d.id.toString().includes(busqueda)
      );
    }

    return resultados;
  }, [todos, busqueda]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.buscador}
        placeholder="Buscar Digimon"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <FlatList
        data={resultadosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Text style={styles.idText}>ID: {item.id}</Text>
            <Image
              source={{
                uri: item.images?.[0]?.href || 'https://via.placeholder.com/60?text=No+Img'
              }}
              style={styles.imagen}
            />
            <Text style={styles.nameText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.loadingText}>Cargando...</Text>}
      />

      {cargando && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#121212', // fondo oscuro profundo
  },
  buscador: {
    height: 40,
    borderColor: '#444', // borde tenue
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
    color: '#fff', // texto blanco
    backgroundColor: '#9c9c9c', // fondo gris oscuro
  },
  item: {
    backgroundColor: '#1f1f1f', // gris oscuro para tarjetas
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  imagen: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginVertical: 8,
  },
  idText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#bbbbbb',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffcc00',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#aaa',
  },
});
