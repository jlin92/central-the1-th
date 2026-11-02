import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import type { MuseMessage, MuseReply } from '@/types';
import { commonPromptsFor, intentAffinity, musePromptsByUser, proactiveNudgeByUser, replyForIntent, replyForText, type MuseContext } from '@/mock-data/muse';
import { offers } from '@/mock-data/offers';
import { OfferCard } from '@/components/offers/OfferCard';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/hooks/utils';

let msgSeq = 0;
const nextId = () => `m-${++msgSeq}`;

/** Chapter 9 — The 1 assistant (Shopping Muse): support + guided offer discovery. */
export function MuseScreen() {
  const { appUser, appUserProfile, goToChapter, openBrand, trackAffinity, musePrefill, clearMusePrefill, rankContext, joined } = useDemo();
  const prompts = musePromptsByUser[appUser];
  const nudge = proactiveNudgeByUser[appUser];
  const museCtx: MuseContext = {
    points: rankContext.points,
    tier: appUserProfile.tier,
    walletIds: rankContext.walletIds,
    redeemedIds: rankContext.redeemedIds,
    joinedIds: rankContext.joinedIds,
    joined,
    hasRedzCard: appUserProfile.hasRedzCard,
    affinities: appUserProfile.affinities,
  };
  const commonPrompts = commonPromptsFor(appUser, museCtx);
  const [messages, setMessages] = useState<MuseMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [fromSearch, setFromSearch] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // Fresh conversation whenever the persona changes.
  useEffect(() => {
    setMessages([]);
    setTyping(false);
    setInput('');
    setFromSearch(null);
  }, [appUser]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string, reply: MuseReply, intent?: string) => {
    if (intent && intentAffinity[intent]) trackAffinity(intentAffinity[intent], 1);
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
    setInput('');
    setTyping(true);
    const t = window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', ...reply }]);
    }, 1000);
    timers.current.push(t);
  };

  // Search hand-off: the typed query arrives as the first message.
  useEffect(() => {
    if (!musePrefill) return;
    const q = musePrefill;
    clearMusePrefill();
    setFromSearch(q);
    const isGift = /(gift|present|birthday|anniversary|ของขวัญ)/i.test(q);
    const text = isGift ? `Help me find a gift — I searched “${q}”` : /^(is|what|how|show|find|use|which|i |any)/i.test(q) ? q : `Best ${q} deal for me today?`;
    const { reply, intent } = replyForText(appUser, isGift ? 'gift' : q, museCtx);
    send(text, reply, intent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musePrefill]);

  const onPrompt = (label: string, intent: string) => send(label, replyForIntent(appUser, intent), intent);
  const onText = (q: string) => {
    const { reply, intent } = replyForText(appUser, q, museCtx);
    send(q, reply, intent);
  };
  const onSubmit = () => {
    const q = input.trim();
    if (q) onText(q);
  };

  const empty = messages.length === 0 && !typing;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-4 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full muse-gradient text-white shadow-float">
            <Icon name="auto_awesome" filled className="text-[28px]" />
          </span>
          <h2 className="mt-2 font-heading text-[20px] font-bold text-on-surface">The 1 assistant</h2>
          <p className="mt-0.5 max-w-[17rem] text-xs text-on-surface-variant">Ask about points, coupons or what to do this weekend — in your own words.</p>
          <span className="mt-1.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-on-surface-variant shadow-card">Powered by Dynamic Yield Shopping Muse</span>
          {fromSearch && (
            <span className="mt-1.5 flex items-center gap-1 rounded-full bg-primary-fixed px-2.5 py-0.5 text-[10px] font-semibold text-primary">
              <Icon name="search" className="text-[12px]" />
              Continued from search: “{fromSearch}”
            </span>
          )}
        </div>

        {empty && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full muse-gradient text-white">
                <Icon name="auto_awesome" filled className="text-[15px]" />
              </span>
              <div className="flex flex-col items-start gap-2 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-card">
                <p className="text-sm text-on-surface">{nudge.text}</p>
                <button type="button" onClick={() => onPrompt(nudge.cta, nudge.intent)} className="rounded-md bg-the1-black px-3.5 py-2 text-[12px] font-semibold text-white">
                  {nudge.cta}
                </button>
              </div>
            </div>

            <p className="text-center text-xs font-semibold text-on-surface-variant">Or try one of these</p>
            <div className="grid grid-cols-2 gap-2.5">
              {prompts.map((p) => (
                <button key={p.id} type="button" onClick={() => onPrompt(p.label, p.intent)} className="flex flex-col gap-2 rounded-xl bg-white p-3 text-left shadow-card transition-transform active:scale-[0.98]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                    <Icon name={p.icon} className="text-[20px]" />
                  </span>
                  <span className="text-xs font-semibold leading-tight text-on-surface">{p.label}</span>
                </button>
              ))}
            </div>

            <p className="text-center text-xs font-semibold text-on-surface-variant">Or ask anything, like…</p>
            <div className="no-scrollbar -mx-4 flex flex-col gap-2 overflow-x-auto px-4 pb-1">
              {[commonPrompts.filter((_, i) => i % 2 === 0), commonPrompts.filter((_, i) => i % 2 === 1)].map((row, r) => (
                <div key={r} className="flex w-max gap-2">
                  {row.map((p) => (
                    <button key={p.label} type="button" onClick={() => onText(p.label)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-outline-variant bg-white px-3 py-1.5 text-[11px] font-semibold text-on-surface shadow-card">
                      <Icon name={p.icon} className="text-[14px] text-primary" />
                      {p.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-the1-black px-4 py-2.5 text-sm font-medium text-white">{m.text}</div>
              </div>
            ) : (
              <div key={m.id} className="flex flex-col gap-2.5">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full muse-gradient text-white">
                    <Icon name="auto_awesome" filled className="text-[15px]" />
                  </span>
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-sm text-on-surface shadow-card">
                    {m.kind === 'support' && (
                      <span className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                        <Icon name="school" className="text-[13px]" />
                        The 1 help
                      </span>
                    )}
                    {m.text}
                    {m.bullets && (
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {m.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-1.5 text-[13px] text-on-surface-variant">
                            <Icon name="check_circle" filled className="mt-0.5 text-[14px] text-success" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {m.chips && (
                  <div className="ml-9 flex flex-wrap gap-1.5">
                    {m.chips.map((c) => (
                      <span key={c} className="flex items-center gap-1 rounded-full bg-primary-fixed px-2.5 py-1 text-[10px] font-semibold text-primary">
                        <Icon name="insights" className="text-[12px]" />
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {m.results && (
                  <div className="ml-9 flex flex-col gap-2">
                    {offers(m.results).map((o, i) => (
                      <OfferCard key={o.id} offer={o} index={i} variant="row" reason={m.reasons?.[i]} />
                    ))}
                  </div>
                )}

                {m.action && (
                  <div className="ml-9">
                    <button
                      type="button"
                      onClick={() => (m.action!.brandId ? openBrand(m.action!.brandId) : goToChapter(m.action!.chapter))}
                      className="flex items-center gap-1.5 rounded-md border border-on-surface bg-white px-3.5 py-2 text-[12px] font-semibold text-on-surface"
                    >
                      {m.action.label}
                      <Icon name="arrow_forward" className="text-[15px]" />
                    </button>
                  </div>
                )}

                {m.followups && (
                  <div className="ml-9 flex flex-wrap gap-2">
                    {m.followups.map((f) => (
                      <button key={f} type="button" onClick={() => onText(f)} className="rounded-full border border-outline-variant bg-white px-3 py-1.5 text-[11px] font-semibold text-on-surface shadow-card">
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}

          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full muse-gradient text-white">
                  <Icon name="auto_awesome" filled className="text-[15px]" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-card">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-on-surface-variant" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-on-surface-variant" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-on-surface-variant" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-surface-container-high bg-white px-3 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about coupons, points or plans…"
            aria-label="Message The 1 assistant"
            className="flex-1 rounded-full border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary"
          />
          <button type="submit" aria-label="Send" className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95', input.trim() ? 'bg-the1-black text-white' : 'bg-surface-container-high text-on-surface-variant')}>
            <Icon name="arrow_upward" className="text-[22px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
