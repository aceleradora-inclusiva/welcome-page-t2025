import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import styles from "./WelcomePage.module.css";
import clickSoundFile from "./assets/sounds/click.mp3";
import bugSoundFile from "./assets/sounds/bug.mp3";
import winSoundFile from "./assets/sounds/win.mp3";
import TypewriterComponent from "typewriter-effect";

const timelineItems = [
  { label: "Git/GitHub", icon: "🐙" },
  { label: "HTML", icon: "🌐" },
  { label: "CSS", icon: "🎨" },
  { label: "JavaScript", icon: "📜" },
  { label: "React", icon: "⚛️" },
  { label: "Node", icon: "🌿" },
];

const GRID_SIZE = 8;
const BUG_COUNT = 3;

const App = () => {
  const [showTimeline, setShowTimeline] = useState(false);
  const [revealed, setRevealed] = useState([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [bugPositions, setBugPositions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const clickSound = useRef(new Audio(clickSoundFile));
  const bugSound = useRef(new Audio(bugSoundFile));
  const winSound = useRef(new Audio(winSoundFile));

  const initGame = () => {
    const bugs = new Set();
    while (bugs.size < BUG_COUNT) {
      const position = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
      bugs.add(position);
    }
    setBugPositions([...bugs]);
    setRevealed(Array(GRID_SIZE * GRID_SIZE).fill(false));
    setGameOver(false);
    setWin(false);
    setShowConfetti(false);
    setHasInteracted(false);
  };

  const toggleCell = (index) => {
    if (revealed[index] || gameOver || win) return;

    if (!hasInteracted) setHasInteracted(true);

    clickSound.current.play();

    const updated = [...revealed];

    if (bugPositions.includes(index)) {
      bugSound.current.play();
      updated[index] = true;
      setRevealed(updated);
      console.log(revealed);
      setGameOver(true);
      return;
    }

    revealRecursive(index, updated);

    const allSafeRevealed =
      updated.filter(Boolean).length === GRID_SIZE * GRID_SIZE - BUG_COUNT;
    if (allSafeRevealed) {
      winSound.current.play();
      setWin(true);
      setShowConfetti(true);
    }

    setRevealed(updated);
  };

  const revealRecursive = (index, revealedArr) => {
    if (revealedArr[index] || bugPositions.includes(index)) return;

    const neighbors = getNeighbors(index);
    const hasAdjacentBugs = neighbors.some((n) => bugPositions.includes(n));

    revealedArr[index] = true;

    if (!hasAdjacentBugs) {
      neighbors.forEach((n) => revealRecursive(n, revealedArr));
    }
  };

  const getNeighbors = (index) => {
    const neighbors = [];
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          const i = r * GRID_SIZE + c;
          if (i !== index) neighbors.push(i);
        }
      }
    }
    return neighbors;
  };

  const getNumberColor = (number, darkMode) => {
    const lightColors = [
      "#000",
      "#1976d2",
      "#388e3c",
      "#f57c00",
      "#d32f2f",
      "#7b1fa2",
    ];
    const darkColors = [
      "#fff",
      "#90caf9",
      "#a5d6a7",
      "#ffcc80",
      "#ef9a9a",
      "#ce93d8",
    ];
    return (
      (darkMode ? darkColors : lightColors)[number] ||
      (darkMode ? "#fff" : "#000")
    );
  };

  const renderGridCell = (index) => {
    const isBug = bugPositions.includes(index);
    const isRevealed = revealed[index];
    const neighbors = getNeighbors(index);
    const adjacentBugs = neighbors.filter((n) =>
      bugPositions.includes(n)
    ).length;
    const display = isRevealed
      ? isBug
        ? "🐛"
        : adjacentBugs > 0
        ? adjacentBugs
        : "✅"
      : "";

    return (
      <div
        key={index}
        className={`${styles.gridCell} ${isRevealed ? styles.revealed : ""} ${
          gameOver && isBug ? styles.bugFound : ""
        }`}
        onClick={() => toggleCell(index)}
        role="button"
        aria-label={
          isRevealed
            ? isBug
              ? "Bug encontrado"
              : "Área segura"
            : "Campo oculto"
        }
        tabIndex={0}
        style={
          adjacentBugs > 0 && isRevealed
            ? { color: getNumberColor(adjacentBugs, darkMode) }
            : {}
        }
      >
        {display}
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ""}`}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <header className={styles.header}>
        <h1>
          <TypewriterComponent
            options={{
              strings: "Bem-vind@s a Aceleradora Inclusiva - Turma 2025!",
              autoStart: true,
              loop: true,
              delay: 100,
            }}
          />
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={styles.toggleMode}
        >
          {darkMode ? "🌞 Modo Claro" : "🌙 Modo Escuro"}
        </button>
      </header>

      <section
        className={`${styles.card} ${styles.animateCard} ${styles.techstackCard}`}
      >
        <h3>
          Saca só o que a gente vai ver nessa jornada de desenvolvimento web!
        </h3>
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className={styles.ctaButton}
          aria-expanded={showTimeline}
        >
          {showTimeline ? "Ocultar Cronograma" : "Ver Cronograma do Curso"}
        </button>
      </section>

      <AnimatePresence>
        {showTimeline && (
          <motion.section
            className={styles.timelineSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.timelineGrid}>
              {timelineItems.map(({ label, icon }, index) => (
                <motion.div
                  className={styles.timelineCard}
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <span className={styles.icon}>{icon}</span> {label}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className={styles.gameSection}>
        <h3>Mini-game: Campo Minado dos Bugs 🐛</h3>
        <button
          className={styles.gameButton}
          onClick={initGame}
          disabled={!hasInteracted}
        >
          Resetar Jogo
        </button>
        <div className={styles.gridContainer}>
          <div className={styles.gridBackground} />
          <div className={styles.grid}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) =>
              renderGridCell(i)
            )}
          </div>
        </div>
        {gameOver && (
          <p className={styles.gameMessage}>
            💥 Ops! Você clicou em um bug. Debug Mode Ativado!
          </p>
        )}
        {win && (
          <p className={styles.gameMessage}>
            🎉 Você isolou todos os bugs! Mandou bem Dev!
          </p>
        )}
      </section>
    </div>
  );
};

export default App;
