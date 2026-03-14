function TrainerCardHeader({ tag, type }) {
  return (
    <div className="trainer-header">
      <span className="trainer-tag">{tag}</span>
      <span className="trainer-type">{type}</span>
    </div>
  );
}

export default TrainerCardHeader;
