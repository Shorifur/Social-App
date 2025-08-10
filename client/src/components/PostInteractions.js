// Add advanced engagement features
function PostInteractions({ postId }) {
  const [bookmarked, setBookmarked] = useState(false);
  
  return (
    <div className="interactions">
      <BookmarkButton 
        active={bookmarked}
        onClick={() => setBookmarked(!bookmarked)}
      />
      <ShareMenu postId={postId} />
      <RepostButton />
    </div>
  );
}