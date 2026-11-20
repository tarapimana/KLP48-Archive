import { MoreVertical } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, useState } from 'react';
import type { MemberItem } from '../data/klp48Data';
import { Lang, TRANSLATIONS } from '../i18n/translations';
import { downloadMemberBirthdayCalendar } from '../lib/scheduleCalendar';

interface BirthdayCalendarMenuProps {
  member: MemberItem;
  date: Date;
  lang: Lang;
}

const MENU_HEIGHT = 48;
const MENU_WIDTH = 192;

export function BirthdayCalendarMenu({ member, date, lang }: BirthdayCalendarMenuProps) {
  const t = TRANSLATIONS[lang];
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 8 });

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    const closeOnScroll = () => setIsOpen(false);

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', closeOnScroll);
    menuRef.current?.querySelector<HTMLButtonElement>('[data-birthday-menu-item]')?.focus();

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', closeOnScroll);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const triggerRect = triggerRef.current?.getBoundingClientRect();
    if (triggerRect) {
      const opensBelow = triggerRect.bottom + MENU_HEIGHT + 8 <= window.innerHeight;
      const top = opensBelow
        ? triggerRect.bottom + 8
        : Math.max(8, triggerRect.top - MENU_HEIGHT - 8);
      const right = Math.min(
        Math.max(8, window.innerWidth - triggerRect.right),
        Math.max(8, window.innerWidth - MENU_WIDTH - 8)
      );
      setMenuPosition({ top, right });
    }
    setIsOpen(true);
  };

  return (
    <div ref={rootRef} className="shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${t.j_more_options}: ${member.nama}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={toggleMenu}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dce6d7] bg-white/80 text-[#278500] transition-colors hover:border-[#278500] hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278500] dark:border-[#2b4523] dark:bg-[#142111] dark:text-[#7ce043] dark:hover:border-[#6fd43a] dark:hover:bg-[#1d3314] dark:focus-visible:outline-[#6fd43a]"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="group"
            aria-label={t.j_more_options}
            style={{ position: 'fixed', top: menuPosition.top, right: menuPosition.right }}
            className="z-[100] w-48 rounded-xl border border-[#dce6d7] bg-white p-1 shadow-xl dark:border-[#2b4523] dark:bg-[#142111]"
          >
            <button
              type="button"
              data-birthday-menu-item
              onClick={() => {
                const title = t.bd_calendar_event.replace('%n', member.nama);
                downloadMemberBirthdayCalendar(member, date, title);
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-semibold text-[#278500] transition-colors hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#278500] dark:text-[#7ce043] dark:hover:bg-[#1d3314] dark:focus-visible:outline-[#6fd43a]"
            >
              {t.j_add_calendar}
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
