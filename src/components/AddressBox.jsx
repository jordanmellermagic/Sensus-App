// src/components/AddressBox.jsx

export default function AddressBox({ address }) {
  if (!address) return null;
  return (
    <div className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm text-neutral-100">
      {address}
    </div>
  );
}
