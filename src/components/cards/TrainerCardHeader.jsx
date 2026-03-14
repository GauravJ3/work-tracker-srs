function TrainerCardHeader({ tag, type }) {
  return (
    <div className="trainer-header">
      <span>{tag}</span>
      <span>{type}</span>
    </div>
  );
}

export default TrainerCardHeader;
