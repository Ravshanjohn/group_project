'use client'
import { useState, useEffect } from 'react'
import { auth_store } from '@/src/stores/auth.store'
import { useUIStore } from '@/src/stores/ui.store'
import LoadingSpinner from '@/src/components/LoadingSpinner'
import { Coins, Zap, TrendingUp, Check } from 'lucide-react'

const XP_RATE = 1.19

const packages = [
  { xp: 10,   label: '10 XP',    discount: 0 },
  { xp: 50,   label: '50 XP',    discount: 5 },
  { xp: 100,  label: '100 XP',   discount: 10 },
  { xp: 250,  label: '250 XP',   discount: 15 },
  { xp: 500,  label: '500 XP',   discount: 18 },
  { xp: 1000, label: '1000 XP',  discount: 22 },
]

function getPrice(xp: number, discount: number): number {
  return +(xp * XP_RATE * (1 - discount / 100)).toFixed(2)
}

const BalancePage = () => {
  const { getBalance, topUpBalance } = auth_store()
  const user = auth_store((s) => s.user)
  const isLoading = useUIStore((s) => s.loading.user)
  const [balance, setBalance] = useState<number>(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    const load = async () => {
      const b = await getBalance()
      setBalance(b)
    }
    load()
  }, [getBalance])

  useEffect(() => {
    if (user?.balance !== undefined) {
      setBalance(user.balance)
    }
  }, [user?.balance])

  const handlePurchase = async () => {
    if (selected === null) return
    const pkg = packages[selected]
    setPurchasing(true)
    const newBalance = await topUpBalance(pkg.xp)
    if (newBalance !== null) {
      setBalance(newBalance)
    }
    setPurchasing(false)
    setSelected(null)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-3xl pb-20 cursor-default" style={{ color: 'var(--user-settings-profile-header-text-color)' }}>
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2">Balance</h2>
        <p className="text-sm" style={{ color: 'var(--zinc_500)' }}>
          Purchase XP to unlock premium maps and exercises.
        </p>
      </div>

      {/* Current Balance Card */}
      <div
        className="rounded-xl p-6 mb-10 flex items-center gap-4"
        style={{ backgroundColor: 'var(--zinc_900)', border: '1px solid var(--zinc_800)' }}
      >
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(96, 165, 250, 0.15)' }}>
          <Coins size={24} style={{ color: 'var(--blue_400)' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--zinc_500)' }}>Current Balance</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--white)' }}>
            {balance} <span className="text-lg font-medium" style={{ color: 'var(--zinc_500)' }}>XP</span>
          </p>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={16} style={{ color: 'var(--emerald_400)' }} />
        <p className="text-sm" style={{ color: 'var(--zinc_400)' }}>
          Base rate: <span style={{ color: 'var(--white)' }}>1 XP = ${XP_RATE}</span> — buy more, save more
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {packages.map((pkg, idx) => {
          const price = getPrice(pkg.xp, pkg.discount)
          const perXp = +(price / pkg.xp).toFixed(2)
          const isSelected = selected === idx

          return (
            <button
              key={pkg.xp}
              onClick={() => setSelected(isSelected ? null : idx)}
              className="relative rounded-xl p-5 text-left transition-all duration-200"
              style={{
                backgroundColor: isSelected ? 'var(--zinc_800)' : 'var(--zinc_900)',
                border: isSelected ? '2px solid var(--blue_400)' : '1px solid var(--zinc_800)',
                boxShadow: isSelected ? '0 0 20px rgba(96, 165, 250, 0.1)' : 'none',
              }}
            >
              {pkg.discount > 0 && (
                <span
                  className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'rgba(52, 211, 153, 0.15)',
                    color: 'var(--emerald_400)',
                  }}
                >
                  -{pkg.discount}%
                </span>
              )}

              <div className="flex items-center gap-2 mb-3">
                <Zap size={18} style={{ color: isSelected ? 'var(--blue_400)' : 'var(--zinc_500)' }} />
                <span className="text-lg font-bold" style={{ color: 'var(--white)' }}>
                  {pkg.label}
                </span>
              </div>

              <p className="text-2xl font-bold mb-1" style={{ color: 'var(--white)' }}>
                ${price}
              </p>
              <p className="text-xs" style={{ color: 'var(--zinc_500)' }}>
                ${perXp} per XP
              </p>

              {isSelected && (
                <div className="absolute bottom-3 right-3">
                  <Check size={18} style={{ color: 'var(--blue_400)' }} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={selected === null || purchasing}
        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: selected !== null ? 'var(--blue_600)' : 'var(--zinc_800)',
          color: 'var(--white)',
        }}
      >
        {purchasing
          ? 'Processing...'
          : selected !== null
            ? `Purchase ${packages[selected].label} for $${getPrice(packages[selected].xp, packages[selected].discount)}`
            : 'Select a package'}
      </button>

      <p className="text-xs text-center mt-4" style={{ color: 'var(--zinc_600)' }}>
        XP is added instantly to your balance after purchase.
      </p>
    </div>
  )
}

export default BalancePage
