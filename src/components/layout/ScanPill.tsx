import { motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { Icon } from '@/components/ui/Icon';
import { Drawer } from '@/components/ui/Drawer';
import { TierBadge } from './HeaderBar';
import { formatPoints } from '@/hooks/utils';

/** Deterministic fake QR pattern so the member code looks real without a library. */
function QrPattern({ seed }: { seed: string }) {
  const n = 21;
  let h = [...seed].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5381);
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push(((h >>> 16) & 1) === 1);
  }
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-44 w-44" shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      {cells.map((on, i) => {
        const x = i % n;
        const y = Math.floor(i / n);
        if (finder(x, y)) {
          const fx = x < 7 ? x : x - (n - 7);
          const fy = y < 7 ? y : y - (n - 7);
          const ring = fx === 0 || fy === 0 || fx === 6 || fy === 6;
          const core = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
          return ring || core ? <rect key={i} x={x} y={y} width={1} height={1} fill="#111" /> : null;
        }
        return on ? <rect key={i} x={x} y={y} width={1} height={1} fill="#111" /> : null;
      })}
    </svg>
  );
}

/** The red floating "Scan | Show QR" pill from the live app, plus the member QR sheet. */
export function ScanPill({ compact }: { compact?: boolean }) {
  const { qrOpen, setQrOpen, appUserProfile, points, showToast } = useDemo();
  return (
    <>
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-4 right-4 z-30 flex overflow-hidden rounded-xl bg-primary text-white shadow-float"
      >
        {compact ? (
          <button type="button" onClick={() => setQrOpen(true)} aria-label="Show QR" className="flex h-12 w-12 items-center justify-center">
            <Icon name="qr_code_scanner" className="text-[24px]" />
          </button>
        ) : (
          <>
            <button type="button" onClick={() => showToast('Camera scanner is outside this demo')} className="flex flex-col items-center gap-0.5 px-3.5 py-2">
              <Icon name="qr_code_scanner" className="text-[22px]" />
              <span className="text-[11px] font-semibold">Scan</span>
            </button>
            <span className="my-2 w-px bg-white/50" />
            <button type="button" onClick={() => setQrOpen(true)} className="flex flex-col items-center gap-0.5 px-3.5 py-2">
              <Icon name="qr_code_2" className="text-[22px]" />
              <span className="text-[11px] font-semibold">Show QR</span>
            </button>
          </>
        )}
      </motion.div>

      <Drawer open={qrOpen} onClose={() => setQrOpen(false)} title="My The 1 QR">
        <div className="flex flex-col items-center gap-3 pb-2 text-center">
          <TierBadge />
          <p className="font-heading text-[17px] font-bold text-on-surface">{appUserProfile.name}</p>
          <div className="rounded-2xl border border-surface-container-high p-3">
            <QrPattern seed={`${appUserProfile.id}-${appUserProfile.name}`} />
          </div>
          <p className="text-[13px] text-on-surface-variant">
            Show at checkout to earn and use points · <span className="font-semibold text-on-surface">{formatPoints(points)} pts</span>
          </p>
          <p className="text-[11px] text-on-surface-variant">Collected coupons apply automatically when you scan.</p>
        </div>
      </Drawer>
    </>
  );
}
