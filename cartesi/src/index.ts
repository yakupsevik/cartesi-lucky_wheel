// Import necessary modules
import { createApp } from "@deroll/app";

// Create the application
const app = createApp({
  url: "http://127.0.0.1:5004",
});

// Helper function for random selection based on probabilities
function randomSelection(options: any) {
  const totalProbability = options.reduce((acc: any, option: any) => acc + option.probability, 0);
  const random = Math.random() * totalProbability;
  let cumulativeProbability = 0;

  for (const option of options) {
    cumulativeProbability += option.probability;
    if (random <= cumulativeProbability) {
      return option;
    }
  }
  return null;
}

// Handle input encoded in hex and select winner
app.addAdvanceHandler(async ({ payload }: any) => {
  try {

    // Parse the decoded payload as JSON
    const { selectedMultiplier, multipliers } = JSON.parse(payload);

    // Find the user's selected multiplier option
    const userChoice = multipliers.find((option: any) => option.multiplier === selectedMultiplier);

    if (!userChoice) {
      throw new Error('Selected multiplier not found in options.');
    }

    // Check if user wins based on the probability of their selection
    if (Math.random() * 100 <= userChoice.probability) {
      // Use createReport to record the win
      await app.createReport({
        payload: JSON.stringify({
          message: "Won!",
          resId: "won-spin",
          multiplier: selectedMultiplier,
        })
      });

      return "accept";
    }

    // If the user loses, select another option randomly based on adjusted probabilities
    const remainingOptions = multipliers.filter((option: any) => option.multiplier !== selectedMultiplier);
    const totalRemainingProbability = remainingOptions.reduce((acc: any, opt: any) => acc + opt.probability, 0);
    const newOptions = remainingOptions.map((option: any) => ({
      ...option,
      probability: (option.probability / totalRemainingProbability) * 100,
    }));

    const lossResult = randomSelection(newOptions);

    // Use createReport to record the loss
    await app.createReport({
      payload: JSON.stringify({
        message: "Lose!",
        resId: "lose-spin",
        multiplier: lossResult.multiplier,
      })
    });

    return "accept";
  } catch (error) {
    console.error("Error processing advanceHandler:", error);
    return "reject";  // Reject if there's an error
  }
});

// Start the application
app.start().catch((e) => {
  console.error(e);
  process.exit(1);
});
