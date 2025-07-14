interface ClaimSupProps {
  onClaimSup: () => void;
}

export default function ClaimSup({ onClaimSup }: ClaimSupProps) {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Claim SUP</h2>
      <div className="mb-6">
        <p className="text-black">Claim your SUP tokens from the pool.</p>
      </div>
      <button
        className="w-full px-4 py-3 rounded-lg bg-secondary-800 text-white font-medium hover:bg-secondary-700 transition-colors"
        onClick={onClaimSup}
      >
        Claim SUP
      </button>
    </>
  );
}
