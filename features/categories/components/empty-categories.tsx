export function EmptyCategories({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-center text-sm text-white/40">{message}</p>
    </div>
  );
}
