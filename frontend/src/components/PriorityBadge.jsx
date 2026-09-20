const styles = {
  low: "bg-teal-light text-teal-dark",
  medium: "bg-amber-light text-amber",
  high: "bg-rust-light text-rust",
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${styles[priority] || styles.medium}`}>
      {priority}
    </span>
  );
}
