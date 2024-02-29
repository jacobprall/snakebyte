export async function getGlobalHighScores() {
  return (await (
    await fetch(
      "https://airbyte-snake-backend-JacobPrall.replit.app/highScores",
      {
        method: "GET",
      }
    )
  ).json()) as [string, number][];
}

export async function handleHighScoreSubmit(username: string, score: number, localScore: number) {
  await fetch(
    "https://airbyte-snake-backend-JacobPrall.replit.app/highScores",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, score, localScore }),
    }
  );
}
