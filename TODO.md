# TODO

Ideas for later.

## Start the clock automatically

- Letters: when the last letter is drawn. Numbers: when the target appears.
- Needs figuring out: on the show there's a pause of a few seconds while the
  presenter talks before the clock starts. Maybe a short "get ready" delay
  (3-5 seconds, configurable), or keep GO manual for game nights.

## Scoring

- Player names and a running scoreboard.
- Letters: points for word length (9 letters scores 18, as on the show).
- Numbers: 10 points for exact, 7 if within 5, 5 if within 10
  (`numbers_points` in `numbers.js` is a start on this).
- Conundrum: 10 points.

## Full game mode

- Run a whole game in order: letters and numbers rounds, then a conundrum to finish.
- Tracks whose turn it is to pick, and keeps the score (needs scoring above).
