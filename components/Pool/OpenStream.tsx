import { useState } from "react";

interface OpenStreamProps {
  onOpenStream: () => void;
}

export default function OpenStream({ onOpenStream }: OpenStreamProps) {
  const [monthlyDonation, setMonthlyDonation] = useState<string>("");
  const [wrapAmount, setWrapAmount] = useState<string>("");
  const [donateToDevs, setDonateToDevs] = useState<boolean>(false);
  const [devDonationPercent, setDevDonationPercent] = useState<number>(5);

  // Dummy data for balances
  const userBalance = 1250.5;
  const usdcBalance = 850.25;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    onOpenStream();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <p className="text-black">
          Configure your stream settings and start streaming to the pool.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Monthly Donation Stream */}
        <div>
          <label
            htmlFor="monthlyDonation"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Monthly Donation Stream
          </label>
          <div className="relative">
            <input
              type="number"
              id="monthlyDonation"
              value={monthlyDonation}
              onChange={(e) => setMonthlyDonation(e.target.value)}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-4 py-3 pr-20 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 text-sm font-medium">USDCx</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Connected wallet balance: {userBalance.toFixed(2)} USDCx
          </p>
        </div>

        {/* Wrap for USDCx */}
        <div>
          <label
            htmlFor="wrapAmount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Wrap for USDCx
          </label>
          <div className="relative">
            <input
              type="number"
              id="wrapAmount"
              value={wrapAmount}
              onChange={(e) => setWrapAmount(e.target.value)}
              step="0.01"
              min="0"
              max={usdcBalance}
              placeholder="0.00"
              className="w-full px-4 py-3 pr-20 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 text-sm font-medium">USDC</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            USDC balance: {usdcBalance.toFixed(2)} USDC
          </p>
        </div>

        {/* Donate to Flow Caster devs */}
        <div>
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="donateToDevs"
              checked={donateToDevs}
              onChange={(e) => setDonateToDevs(e.target.checked)}
              className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="donateToDevs"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              Donate to Flow Caster devs
            </label>
          </div>

          {donateToDevs && (
            <div className="ml-6 space-y-3">
              <p className="text-sm text-gray-600">
                Select donation percentage:
              </p>
              <div className="flex space-x-3">
                {[5, 10, 15].map((percent) => (
                  <label key={percent} className="flex items-center">
                    <input
                      type="radio"
                      name="devDonationPercent"
                      value={percent}
                      checked={devDonationPercent === percent}
                      onChange={(e) =>
                        setDevDonationPercent(Number(e.target.value))
                      }
                      className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {percent}%
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-3 rounded-lg bg-secondary-800 text-white font-medium hover:bg-secondary-700 transition-colors"
        >
          Open Stream
        </button>
      </form>
    </div>
  );
}
