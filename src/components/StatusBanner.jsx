export default function StatusBanner({ error, isOffline }) {
  if (error) {
    return (
      <div className="w-full bg-red-600 text-white text-center text-sm py-1">
        Unable to reach server — retrying...
      </div>
    );
  }
  if (isOffline) {
    return (
      <div className="w-full bg-yellow-600 text-white text-center text-sm py-1">
        Reconnecting...
      </div>
    );
  }
  return null;
}
