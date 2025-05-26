// src/componentes/Perfil.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { auth } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

export default function Perfil() {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cargando, setCargando] = useState(true);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    const traerDatos = async () => {
      const docRef = doc(db, 'usuarios', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNombre(data.nombre || '');
        setFecha(data.fecha || '');
        setTelefono(data.telefono || '');
      } else {
        Alert.alert('Usuario no encontrado');
      }
      setCargando(false);
    };
    traerDatos();
  }, [uid]);

  const actualizarDatos = async () => {
    try {
      const docRef = doc(db, 'usuarios', uid);
      await updateDoc(docRef, {
        nombre,
        fecha,
        telefono,
      });
      Alert.alert('Datos actualizados');
    } catch (error) {
      console.error(error);
      Alert.alert('Error al actualizar');
    }
  };

  if (cargando) return <Text style={styles.cargando}>Cargando...</Text>;

  return (
    <View style={styles.contenedor}>
        
      <Text style={styles.titulo}>Perfil del Usuario</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Fecha de nacimiento (YYYY-MM-DD)"
        value={fecha}
        onChangeText={setFecha}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <Button title="Guardar cambios" onPress={actualizarDatos} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffcc00',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#444',
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    color: '#fff',
  },
  cargando: {
    marginTop: 50,
    textAlign: 'center',
    color: '#ccc',
    fontSize: 16,
  },
});
