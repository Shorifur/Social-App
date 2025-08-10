function FeedPreference() {
  const [weights, setWeights] = useState({
    friends: 0.6,
    trending: 0.3,
    new: 0.1
  });

  return (
    <Slider 
      values={weights}
      onChange={(newWeights) => updateFeedAlgorithm(newWeights)}
    />
  );
}