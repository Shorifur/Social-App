// Fake moderation service (replace with real API later)
const moderateText = async (text) => {
  // Simulate basic flagging logic
  const toxicWords = ['badword', 'hate', 'toxic'];
  const lowerText = text.toLowerCase();

  const toxicity = toxicWords.some(word => lowerText.includes(word)) ? 0.8 : 0.1;

  return {
    toxicity,
    profanity: lowerText.includes('badword') ? 0.9 : 0.1,
    hateSpeech: lowerText.includes('hate') ? 0.8 : 0.1
  };
};

// Legacy-style default export for direct checking
const moderateContent = async (text) => {
  const scores = await moderateText(text);
  return {
    isToxic: scores.toxicity > 0.7,
    flags: scores
  };
};

// Named export for safer/more descriptive checking
const checkPost = async (text) => {
  const result = await moderateText(text);
  return {
    isSafe: result.toxicity < 0.7,
    flags: result
  };
};

module.exports = {
  moderateContent,
  checkPost
};
