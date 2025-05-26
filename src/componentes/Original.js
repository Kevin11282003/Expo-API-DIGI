import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';

export default function MemoryGame() {
  const [todos, setTodos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [difficulty, setDifficulty] = useState(8); // 8, 16, or 32 images
  const [flippedCards, setFlippedCards] = useState([]); // Stores flipped card indices
  const [matchedPairs, setMatchedPairs] = useState([]); // Stores matched pair indices
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null); // To track game start time
  const [elapsedTime, setElapsedTime] = useState(0); // To track elapsed time
  const [showVictoryMessage, setShowVictoryMessage] = useState(false); // To control the display of victory message

  // Load Digimon data from the API
  useEffect(() => {
    const cargarDigimons = async () => {
      setCargando(true);
      try {
        let ids = [];
        for (let page = 0; page < 10; page++) {
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
      } catch (error) {
        console.error("Error obteniendo Digimons:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDigimons();
  }, []);

  // Select images based on difficulty
  const gameImages = useMemo(() => {
    if (todos.length > 0) {
      const totalCards = difficulty;
      let selectedImages = [];
      for (let i = 0; i < totalCards / 2; i++) {
        selectedImages.push(todos[i % todos.length]); // Loop over available Digimons
      }

      // Create pairs and shuffle them
      let allCards = [...selectedImages, ...selectedImages];
      allCards = allCards.sort(() => Math.random() - 0.5); // Shuffle the images

      return allCards;
    }
    return [];
  }, [todos, difficulty]);

  // Handle card flip
  const handleCardFlip = (index) => {
    if (flippedCards.length < 2 && !flippedCards.includes(index)) {
      const newFlippedCards = [...flippedCards, index];
      setFlippedCards(newFlippedCards);

      if (newFlippedCards.length === 2) {
        // Check if the two flipped cards match
        const [firstCard, secondCard] = newFlippedCards;
        if (gameImages[firstCard] === gameImages[secondCard]) {
          setMatchedPairs((prev) => [...prev, gameImages[firstCard]]);
        }
        setTimeout(() => setFlippedCards([]), 1000); // Delay to reset flipped cards
      }
    }
  };

  // Reset game
  const resetGame = () => {
    setMatchedPairs([]);
    setFlippedCards([]);
    setGameOver(false);
    setStartTime(new Date()); // Record the start time when resetting
    setElapsedTime(0); // Reset elapsed time
    setShowVictoryMessage(false); // Hide victory message
  };

  // Start the game when difficulty is changed
  useEffect(() => {
    resetGame();
  }, [difficulty]);

  // Check if all pairs are matched
  useEffect(() => {
    if (matchedPairs.length === gameImages.length / 2) {
      setGameOver(true);
      setShowVictoryMessage(true); // Show victory message when game is over
    }
  }, [matchedPairs, gameImages]);

  // Calculate elapsed time and stop it if the game is over
  useEffect(() => {
    if (startTime && !gameOver) {
      const interval = setInterval(() => {
        const currentTime = new Date();
        const timeDifference = Math.floor((currentTime - startTime) / 1000); // Elapsed time in seconds
        setElapsedTime(timeDifference);
      }, 1000);

      return () => clearInterval(interval); // Clean up interval on unmount or when game ends
    }
  }, [startTime, gameOver]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Juego de Memoria</Text>

      <View style={styles.difficultyContainer}>
        <Text style={styles.difficultyText}>Dificultad:</Text>
        <TouchableOpacity style={styles.difficultyButton} onPress={() => setDifficulty(8)}>
          <Text style={styles.difficultyButtonText}>Fácil (8)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.difficultyButton} onPress={() => setDifficulty(16)}>
          <Text style={styles.difficultyButtonText}>Intermedio (16)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.difficultyButton} onPress={() => setDifficulty(32)}>
          <Text style={styles.difficultyButtonText}>Difícil (32)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Juego: {gameOver ? 'Terminado' : 'En Curso'}</Text>
        <Text style={styles.statsText}>Pares encontrados: {matchedPairs.length}/{gameImages.length / 2}</Text>
        <Text style={styles.statsText}>Tiempo: {elapsedTime}s</Text>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={gameImages}
          numColumns={4}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            const isFlipped = flippedCards.includes(index);
            const isMatched = matchedPairs.includes(item);

            return (
              <TouchableOpacity
                style={[styles.card, isFlipped || isMatched ? styles.flippedCard : styles.hiddenCard]}
                onPress={() => handleCardFlip(index)}
                disabled={isFlipped || isMatched || gameOver}
              >
                <Image
                  source={{
                    uri: isFlipped || isMatched
                      ? item.images?.[0]?.href || 'https://via.placeholder.com/70?text=No+Img'
                      : 'https://via.placeholder.com/70x70.png?text=Carta+Oculta'
                  }}
                  style={styles.cardImage}
                />
                {(isFlipped || isMatched) && (
                  <Text style={styles.cardText}>{item.name}</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetButtonText}>Reiniciar Juego</Text>
      </TouchableOpacity>

      {showVictoryMessage && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>¡Ganaste!</Text>
          <Text style={styles.gameOverText}>Tiempo total: {elapsedTime} segundos</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#121212',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffcc00', // Amarillo dorado
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  difficultyText: {
    fontSize: 16,
    marginRight: 10,
    color: '#ddd',
    alignSelf: 'center',
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    margin: 5,
    borderWidth: 1,
    borderColor: '#555',
  },
  difficultyButtonText: {
    color: '#ffcc00',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ccc',
    marginBottom: 4,
  },
  card: {
    width: 70,
    height: 90,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  hiddenCard: {
    backgroundColor: '#1f1f1f',
    borderColor: '#444',
    borderWidth: 1,
  },
  flippedCard: {
    backgroundColor: '#2d2d2d',
    borderColor: '#777',
    borderWidth: 1,
  },
  cardImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  cardText: {
    position: 'absolute',
    bottom: 5,
    color: '#ffcc00',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#28a745',
    borderRadius: 6,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gameOverContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00e676',
    marginBottom: 5,
  },
});
