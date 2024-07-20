const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 80;

app.use(cors());
app.use(bodyParser.json());


const calculateWinner = (players) => {
  const playerRolls = players
    .replace(/\[|\]/g, "")
    .split("|")
    .map((player) =>
      player
        .trim()
        .split(",")
        .map((roll) => parseInt(roll.trim(), 10))
    );

  const patterns = [
    {
      name: "5's of a kind",
      score: 6,
      check: (rolls) => new Set(rolls).size === 1,
    },
    {
      name: "4's of a kind",
      score: 5,
      check: (rolls) =>
        new Set(rolls).size === 2 &&
        rolls.some((roll) => rolls.filter((r) => r === roll).length === 4),
    },
    {
      name: "Full House",
      score: 4,
      check: (rolls) =>
        new Set(rolls).size === 2 &&
        rolls.some((roll) => rolls.filter((r) => r === roll).length === 3),
    },
    {
      name: "Straight",
      score: 3,
      check: (rolls) =>
        rolls
          .sort((a, b) => a - b)
          .every(
            (roll, index, arr) => index === 0 || roll === arr[index - 1] + 1
          ),
    },
    {
      name: "3's of a Kind",
      score: 2,
      check: (rolls) =>
        new Set(rolls).size === 3 &&
        rolls.some((roll) => rolls.filter((r) => r === roll).length === 3),
    },
    {
      name: "Two Pairs",
      score: 1,
      check: (rolls) => {
        const counts = rolls.reduce((acc, roll) => {
          acc[roll] = (acc[roll] || 0) + 1;
          return acc;
        }, {});
        const pairs = Object.values(counts).filter(
          (count) => count === 2
        ).length;
        return pairs === 2;
      },
    },
    { name: "One Pair", score: 0, check: (rolls) => new Set(rolls).size === 4 },
  ];

  let bestPattern = { name: "No pattern", score: -1, player: 0, total: 0 };

  playerRolls.forEach((rolls, index) => {
    const total = rolls.reduce((sum, roll) => sum + roll, 0);
    for (let i = 0; i < patterns.length; i++) {
      if (patterns[i].check(rolls)) {
        if (
          patterns[i].score > bestPattern.score ||
          (patterns[i].score === bestPattern.score && total > bestPattern.total)
        ) {
          bestPattern = {
            name: patterns[i].name,
            score: patterns[i].score,
            player: index + 1,
            total,
          };
        }
        break;
      }
    }
  });

  if (bestPattern.player === 0) {
    return "No winner";
  } else {
    return `Winner is player ${bestPattern.player} - ${bestPattern.name}`;
  }
};

app.post("/api/calculate-winner", (req, res) => {
  const { players } = req.body;
  const winner = calculateWinner(players);
  res.json({ winner });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
